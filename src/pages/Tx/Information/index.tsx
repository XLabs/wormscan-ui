import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ethers } from "ethers";
import { ChainId, isEVMChain, parseVaa } from "@certusone/wormhole-sdk";
import {
  DeliveryInstruction,
  parseEVMExecutionInfoV1,
} from "@certusone/wormhole-sdk/lib/cjs/relayer";

import { useEnvironment } from "src/context/EnvironmentContext";
import { txType } from "src/consts";
import { Alert, Loader } from "src/components/atoms";
import { useLocalStorage } from "src/utils/hooks/useLocalStorage";
import { formatUnits, parseAddress, parseTx } from "src/utils/crypto";
import { formatDate } from "src/utils/date";
import { formatNumber } from "src/utils/number";
import { getChainName, getExplorerLink } from "src/utils/wormhole";
import analytics from "src/analytics";
import {
  DeliveryLifecycleRecord,
  isRedelivery,
  parseGenericRelayerVaa,
  populateDeliveryLifecycleRecordByVaa,
} from "src/utils/genericRelayerVaaUtils";
import { GetBlockData, GetTransactionsOutput } from "src/api/search/types";
import { GlobalTxOutput, VAADetail } from "src/api/guardian-network/types";

import Tabs from "./Tabs";
import Summary from "./Summary";
import Overview from "./Overview/index";
import Details from "./Details";
import RawData from "./RawData";
import RelayerOverview from "./Overview/RelayerOverview";
import RelayerDetails from "./Details/RelayerDetails";

import "./styles.scss";
import { tryGetRedeemTxn } from "src/utils/cryptoToolkit";

interface Props {
  extraRawInfo: any;
  VAAData: VAADetail & { vaa: any; decodedVaa: any };
  txData: GetTransactionsOutput;
  blockData: GetBlockData;
  setTxData: (x: any) => void;
}

const UNKNOWN_APP_ID = "UNKNOWN";
const CCTP_APP_ID = "CCTP_WORMHOLE_INTEGRATION";
const CONNECT_APP_ID = "CONNECT";
const PORTAL_APP_ID = "PORTAL_TOKEN_BRIDGE";

const Information = ({ extraRawInfo, VAAData, txData, blockData, setTxData }: Props) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [showOverview, setShowOverviewState] = useState(searchParams.get("view") !== "rawdata");
  const setShowOverview = (show: boolean) => {
    setShowOverviewState(show);
    setSearchParams(prev => {
      prev.set("view", show ? "overview" : "rawdata");
      return prev;
    });
  };

  const [showOverviewDetail, setShowOverviewDetail] = useLocalStorage<boolean>(
    "showOverviewDetail",
    false,
  );
  const { environment } = useEnvironment();
  const currentNetwork = environment.network;

  const totalGuardiansNeeded = currentNetwork === "MAINNET" ? 13 : 1;
  const { decodedVaa, vaa } = VAAData || {};
  const { guardianSignatures } = decodedVaa || {};
  const guardianSignaturesCount = guardianSignatures?.length || 0;
  const hasVAA = !!vaa;

  const { currentBlock, lastFinalizedBlock } = blockData || {};

  const {
    id: VAAId,
    timestamp,
    tokenAmount,
    usdAmount,
    symbol,
    emitterChain,
    emitterAddress,
    emitterNativeAddress,
    standardizedProperties,
    globalTx,
    payload,
  } = txData || {};

  const {
    callerAppId,
    parsedPayload,
    payloadType,
    tokenAddress: payloadTokenAddress,
    tokenChain: payloadTokenChain,
  } = payload || {};

  const { originTx, destinationTx } = globalTx || {};

  const {
    amount,
    appIds,
    fee,
    fromAddress: stdFromAddress,
    fromChain: stdFromChain,
    toAddress: stdToAddress,
    toChain: stdToChain,
    tokenAddress: stdTokenAddress,
    tokenChain: stdTokenChain,
    wrappedTokenAddress,
    wrappedTokenSymbol,
  } = standardizedProperties || {};

  const { from: globalFrom, timestamp: globalFromTimestamp } = originTx || {};

  const {
    chainId: globalToChainId,
    from: globalTo,
    timestamp: globalToTimestamp,
    txHash: globalToRedeemTx,
  } = destinationTx || {};

  const fromChainOrig = emitterChain || stdFromChain;
  const fromAddress = globalFrom || stdFromAddress;
  const toAddress = stdToAddress || globalTo;
  const startDate = timestamp || globalFromTimestamp;
  const endDate = globalToTimestamp;
  const tokenChain = stdTokenChain || payloadTokenChain;
  const tokenAddress = stdTokenAddress || payloadTokenAddress;

  const isUnknownApp = callerAppId === UNKNOWN_APP_ID || appIds?.includes(UNKNOWN_APP_ID);
  const isCCTP = callerAppId === CCTP_APP_ID || appIds?.includes(CCTP_APP_ID);
  const isConnect = callerAppId === CONNECT_APP_ID || appIds?.includes(CONNECT_APP_ID);
  const isPortal = callerAppId === PORTAL_APP_ID || appIds?.includes(PORTAL_APP_ID);
  const isTBTC =
    callerAppId?.toLowerCase().includes("tbtc") ||
    !!appIds?.find(appId => appId.toLowerCase().includes("tbtc"));
  const isTransferWithPayload = payloadType === 3;
  const hasAnotherApp = !!(
    appIds &&
    appIds.filter(
      appId =>
        appId !== CONNECT_APP_ID &&
        appId !== PORTAL_APP_ID &&
        appId !== UNKNOWN_APP_ID &&
        !appId.toLowerCase().includes("tbtc"),
    )?.length
  );

  const isAttestation = txType[payloadType] === "Attestation";
  const isUnknownPayloadType = !txType[payloadType];

  const parsedEmitterAddress = parseAddress({
    value: emitterNativeAddress ? emitterNativeAddress : emitterAddress,
    chainId: emitterChain as ChainId,
  });
  const isGatewaySource = originTx?.attribute?.type === "wormchain-gateway";

  // Gateway Transfers
  const fromChain = isGatewaySource ? originTx?.attribute?.value?.originChainId : fromChainOrig;
  const toChain = parsedPayload?.["gateway_transfer"]?.chain
    ? parsedPayload?.["gateway_transfer"].chain
    : stdToChain || globalToChainId;

  const parsedOriginAddress = isGatewaySource
    ? originTx?.attribute?.value?.originAddress
    : parseAddress({
        value: fromAddress,
        chainId: fromChainOrig as ChainId,
      });
  const parsedDestinationAddress = parsedPayload?.["gateway_transfer"]?.recipient
    ? parsedPayload?.["gateway_transfer"].recipient
    : parseAddress({
        value: toAddress,
        chainId: toChain as ChainId,
      });
  // --- x ---

  const parsedRedeemTx = parseTx({ value: globalToRedeemTx, chainId: toChain as ChainId });

  const amountSent = formatNumber(Number(tokenAmount));
  const amountSentUSD = +usdAmount ? formatNumber(+usdAmount, 2) : "";
  const redeemedAmount = hasVAA
    ? formatNumber(formatUnits(+amount - +fee))
    : formatNumber(+amount - +fee);

  const originDateParsed = formatDate(startDate);
  const destinationDateParsed = formatDate(endDate);

  let sourceTokenLink = getExplorerLink({
    network: currentNetwork,
    chainId: tokenChain,
    value: tokenAddress,
    base: "token",
  });
  let targetTokenLink = getExplorerLink({
    network: currentNetwork,
    chainId: tokenChain,
    value: tokenAddress,
    base: "token",
  });
  let sourceSymbol = symbol;
  let targetSymbol = symbol;
  let targetTokenChain = tokenChain;
  const wrappedSide = tokenChain !== toChain ? "target" : "source";

  if (wrappedTokenAddress) {
    if (wrappedSide === "target") {
      targetTokenChain = toChain;
      targetTokenLink = getExplorerLink({
        network: currentNetwork,
        chainId: toChain,
        value: wrappedTokenAddress,
        base: "token",
      });
      if (wrappedTokenSymbol) {
        targetSymbol = wrappedTokenSymbol;
      }
    } else {
      sourceTokenLink = getExplorerLink({
        network: currentNetwork,
        chainId: fromChain,
        value: wrappedTokenAddress,
        base: "token",
      });
      if (wrappedTokenSymbol) {
        sourceSymbol = wrappedTokenSymbol;
      }
    }
  }

  const overviewAndDetailProps = {
    showSignatures: !(appIds && appIds.includes("CCTP_MANUAL")),
    amountSent,
    amountSentUSD,
    currentNetwork,
    destinationDateParsed,
    fee,
    fromChain,
    fromChainOrig,
    guardianSignaturesCount,
    isGatewaySource,
    isUnknownApp,
    originDateParsed,
    parsedDestinationAddress,
    parsedEmitterAddress,
    parsedOriginAddress,
    parsedPayload,
    parsedRedeemTx,
    redeemedAmount,
    sourceSymbol,
    sourceTokenLink,
    targetSymbol,
    targetTokenLink,
    toChain,
    tokenAmount,
    totalGuardiansNeeded,
    VAAId,
  };

  // --- Automatic Relayer Detection and handling ---
  const [genericRelayerInfo, setGenericRelayerInfo] = useState<DeliveryLifecycleRecord>(null);
  const [loadingRelayers, setLoadingRelayers] = useState(false);
  const getRelayerInfo = useCallback(async () => {
    setLoadingRelayers(true);
    populateDeliveryLifecycleRecordByVaa(environment, vaa)
      .then((result: DeliveryLifecycleRecord) => {
        analytics.track("txDetail", {
          appIds: ["GENERIC_RELAYER"].join(", "),
          chain: getChainName({
            chainId: (result?.sourceChainId as any)
              ? (result.sourceChainId as any)
              : txData?.standardizedProperties?.fromChain
              ? txData.standardizedProperties.fromChain
              : 0,
            network: currentNetwork,
          }),
          toChain: getChainName({
            chainId: result?.targetTransaction?.targetChainId
              ? result.targetTransaction?.targetChainId
              : txData?.standardizedProperties?.toChain
              ? txData.standardizedProperties.toChain
              : 0,
            network: currentNetwork,
          }),
        });

        setGenericRelayerInfo(result);
        setLoadingRelayers(false);
      })
      .catch((e: any) => {
        setLoadingRelayers(false);
        console.error("automatic relayer tx errored:", e);
        setIsGenericRelayerTx(false);
      });
  }, [
    environment,
    vaa,
    txData?.standardizedProperties?.fromChain,
    txData?.standardizedProperties?.toChain,
    currentNetwork,
  ]);

  const targetContract = environment.chainInfos.find(
    a => a.chainId === fromChain,
  )?.relayerContractAddress;

  const [isGenericRelayerTx, setIsGenericRelayerTx] = useState(null);

  useEffect(() => {
    if (targetContract || parsedEmitterAddress) {
      const isGeneric = targetContract?.toUpperCase() === parsedEmitterAddress?.toUpperCase();
      setIsGenericRelayerTx(isGeneric);
      if (isGeneric) {
        console.log("isGenericRelayerTx!!!");
        getRelayerInfo();
      }
    }
  }, [targetContract, parsedEmitterAddress, getRelayerInfo]);
  // --- x ---

  const OverviewContent = () => {
    if (isGenericRelayerTx === null) {
      return <Loader />;
    }

    if (isGenericRelayerTx) {
      if (loadingRelayers) return <Loader />;
      if (!genericRelayerInfo?.vaa) return <div>No VAA was found</div>;

      const vaa = genericRelayerInfo.vaa;
      const parsedVaa = parseVaa(vaa);
      const sourceTxHash = genericRelayerInfo.sourceTxHash;
      const deliveryStatus = genericRelayerInfo?.DeliveryStatus;

      const gasUsed = Number(deliveryStatus?.data?.delivery?.execution?.gasUsed);
      const targetTxTimestamp = genericRelayerInfo?.targetTransaction?.targetTxTimestamp;

      const { emitterAddress, emitterChain, guardianSignatures } = parsedVaa || {};

      const bufferEmitterAddress = Buffer.from(emitterAddress).toString("hex");
      const parsedEmitterAddress = parseAddress({
        value: bufferEmitterAddress,
        chainId: emitterChain as ChainId,
      });

      const totalGuardiansNeeded = currentNetwork === "MAINNET" ? 13 : 1;
      const guardianSignaturesCount = Array.isArray(guardianSignatures)
        ? guardianSignatures?.length || 0
        : 0;

      const fromChain = emitterChain;

      const instruction = parseGenericRelayerVaa(parsedVaa);
      const deliveryInstruction = instruction as DeliveryInstruction | null;
      const isDelivery = deliveryInstruction && !isRedelivery(deliveryInstruction);

      const decodeExecution = deliveryInstruction.encodedExecutionInfo
        ? parseEVMExecutionInfoV1(deliveryInstruction.encodedExecutionInfo, 0)[0]
        : null;
      const gasLimit = decodeExecution ? decodeExecution.gasLimit : null;

      if (!deliveryInstruction?.targetAddress) {
        return (
          <div className="tx-information-errored-info">
            This is either not an Automatic Relayer VAA or something&apos;s wrong with it
          </div>
        );
      }

      const trunkStringsDecimal = (num: string, decimals: number) => {
        const [whole, fraction] = num.split(".");
        if (!fraction) return whole;
        return `${whole}.${fraction.slice(0, decimals)}`;
      };

      const maxRefund = deliveryStatus?.data?.delivery?.maxRefund
        ? Number(
            trunkStringsDecimal(
              ethers.utils.formatUnits(
                deliveryStatus?.data?.delivery?.maxRefund,
                deliveryStatus?.data?.delivery?.targetChainDecimals || 18,
              ),
              3,
            ),
          )
        : 0;

      const deliveryParsedTargetAddress = parseAddress({
        value: Buffer.from(deliveryInstruction?.targetAddress).toString("hex"),
        chainId: deliveryInstruction?.targetChainId as ChainId,
      });

      const deliveryParsedRefundAddress = parseAddress({
        value: Buffer.from(deliveryInstruction?.refundAddress).toString("hex"),
        chainId: deliveryInstruction?.refundChainId as ChainId,
      });

      const deliveryParsedRefundProviderAddress = parseAddress({
        value: Buffer.from(deliveryInstruction?.refundDeliveryProvider).toString("hex"),
        chainId: deliveryInstruction?.refundChainId as ChainId,
      });

      const deliveryParsedSenderAddress = parseAddress({
        value: Buffer.from(deliveryInstruction?.senderAddress).toString("hex"),
        chainId: fromChain as ChainId,
      });

      const deliveryParsedSourceProviderAddress = parseAddress({
        value: Buffer.from(deliveryInstruction?.sourceDeliveryProvider).toString("hex"),
        chainId: fromChain as ChainId,
      });

      const maxRefundText = () => {
        return `${maxRefund} ${
          environment.chainInfos.find(chain => chain.chainId === deliveryInstruction.targetChainId)
            .nativeCurrencyName
        }`;
      };

      const gasUsedText = () => {
        return isNaN(gasUsed) ? `${gasLimit}` : `${gasUsed}/${gasLimit}`;
      };

      const receiverValueText = () => {
        const receiverValue = trunkStringsDecimal(
          ethers.utils.formatUnits(
            deliveryStatus?.data?.instructions?.requestedReceiverValue,
            deliveryStatus?.data?.delivery?.targetChainDecimals || 18,
          ),
          3,
        );

        return `${receiverValue} ${
          environment.chainInfos.find(chain => chain.chainId === deliveryInstruction.targetChainId)
            .nativeCurrencyName
        }`;
      };

      const budgetText = () => {
        if (deliveryStatus?.data?.delivery?.budget) {
          return `${trunkStringsDecimal(
            ethers.utils.formatUnits(
              deliveryStatus?.data?.delivery?.budget,
              deliveryStatus?.data?.delivery?.targetChainDecimals || 18,
            ),
            3,
          )} ${
            environment.chainInfos.find(
              chain => chain.chainId === deliveryInstruction.targetChainId,
            ).nativeCurrencyName
          }`;
        }

        return "N/A";
      };

      const refundText = () => {
        const refundAmountRegex = deliveryStatus?.data?.delivery?.execution?.detail.match(
          /Refund amount:\s*([0-9.]+)/,
        );
        const refundAmount = refundAmountRegex ? refundAmountRegex?.[1] : null;

        if (refundAmount)
          return `${refundAmount} ${
            environment.chainInfos.find(
              chain => chain.chainId === deliveryInstruction.targetChainId,
            ).nativeCurrencyName
          }`;

        return "";
      };

      const copyBudgetText = () => {
        return `Budget: ${budgetText()}\n\nMax Refund:\n${maxRefundText()}\n\n${
          !isNaN(gasUsed) ? "Gas Used/" : ""
        }Gas limit\n${gasUsedText()}\n\n${
          !isNaN(gasUsed) ? "Refund Amount\n" + refundText() : ""
        }\n\nReceiver Value: ${receiverValueText()}`
          .replaceAll("  ", "")
          .replaceAll("\n\n\n\n", "\n\n");
      };

      const resultLogRegex =
        deliveryStatus?.data?.delivery?.execution?.detail.match(/Status: ([^\r\n]+)/);
      const resultLog = resultLogRegex ? resultLogRegex?.[1] : null;

      const refundStatusRegex =
        deliveryStatus?.data?.delivery?.execution?.detail.match(/Refund status: ([^\r\n]+)/);
      const refundStatus = refundStatusRegex ? refundStatusRegex?.[1] : null;

      const deliveryAttemptRegex = deliveryStatus?.data?.delivery?.execution?.detail.match(
        /Delivery attempt \s*([0-9.]+)/,
      );
      const deliveryAttempt = deliveryAttemptRegex ? deliveryAttemptRegex?.[1] : null;

      const genericRelayerProps = {
        budgetText,
        copyBudgetText,
        currentNetwork,
        decodeExecution,
        deliveryAttempt,
        deliveryInstruction,
        deliveryParsedRefundAddress,
        deliveryParsedRefundProviderAddress,
        deliveryParsedSenderAddress,
        deliveryParsedSourceProviderAddress,
        deliveryParsedTargetAddress,
        deliveryStatus,
        fromChain,
        gasUsed,
        gasUsedText,
        guardianSignaturesCount,
        isDelivery,
        maxRefundText,
        parsedEmitterAddress,
        parsedVaa,
        receiverValueText,
        refundStatus,
        refundText,
        resultLog,
        sourceTxHash,
        targetTxTimestamp,
        totalGuardiansNeeded,
        VAAId,
      };

      if (showOverviewDetail) {
        return (
          <>
            <RelayerDetails {...genericRelayerProps} />
            <AlertsContent />
          </>
        );
      }

      return (
        <>
          <RelayerOverview {...genericRelayerProps} />
          <AlertsContent />
        </>
      );
    }

    if (!isGenericRelayerTx) {
      if (showOverviewDetail) {
        return (
          <>
            <Details {...overviewAndDetailProps} />
            <AlertsContent />
          </>
        );
      }

      return (
        <>
          <Overview
            {...overviewAndDetailProps}
            globalToRedeemTx={globalToRedeemTx}
            isAttestation={isAttestation}
          />
          <AlertsContent />
        </>
      );
    }
  };

  const RawDataContent = () => {
    if (isGenericRelayerTx === null || (isGenericRelayerTx && loadingRelayers)) return <Loader />;

    return (
      <RawData
        extraRawInfo={extraRawInfo}
        lifecycleRecord={genericRelayerInfo}
        txData={txData}
        VAAData={VAAData}
      />
    );
  };

  const AlertsContent = () => {
    if (hasVAA && !isUnknownPayloadType) return null;
    return (
      <div className="tx-information-alerts">
        <Alert type="info" className="tx-information-alerts-unknown-payload-type">
          {!hasVAA ? (
            appIds && appIds.includes("CCTP_MANUAL") ? (
              <p>
                This transaction is processed by Circle&apos;s CCTP and therefore information might
                be incomplete.
              </p>
            ) : (
              <>
                <p>The VAA for this transaction has not been issued yet.</p>
                <p>This information can be incomplete or have wrong values.</p>
                <p>
                  Waiting for finality on{" "}
                  {getChainName({ chainId: fromChain, network: currentNetwork })} which may take up
                  to 15 minutes.
                </p>
                {lastFinalizedBlock && currentBlock && (
                  <div>
                    <p>
                      Last finalized block number{" "}
                      <a
                        className="tx-information-alerts-unknown-payload-type-link"
                        href={getExplorerLink({
                          network: currentNetwork,
                          chainId: fromChain,
                          value: lastFinalizedBlock.toString(),
                          base: "block",
                        })}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {lastFinalizedBlock}
                      </a>{" "}
                    </p>

                    <p>
                      This block number{" "}
                      <a
                        className="tx-information-alerts-unknown-payload-type-link"
                        href={getExplorerLink({
                          network: currentNetwork,
                          chainId: fromChain,
                          value: currentBlock.toString(),
                          base: "block",
                        })}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {currentBlock}
                      </a>
                    </p>
                  </div>
                )}
              </>
            )
          ) : (
            "This VAA comes from another multiverse, we don't have more details about it."
          )}
        </Alert>
      </div>
    );
  };

  const [loadingRedeem, setLoadingRedeem] = useState(false);
  const canTryToGetRedeem =
    (isEVMChain(toChain) || toChain === 1 || toChain === 21) &&
    toChain === targetTokenChain &&
    !!toAddress &&
    !!tokenAddress &&
    !!timestamp &&
    !!txData?.payload?.amount &&
    !!txData?.txHash &&
    !txData?.globalTx?.destinationTx;

  const getRedeem = async () => {
    setLoadingRedeem(true);

    const redeem = await tryGetRedeemTxn(
      currentNetwork,
      fromChain as ChainId,
      toChain,
      toAddress,
      wrappedTokenAddress && wrappedSide === "target" ? wrappedTokenAddress : tokenAddress,
      timestamp,
      txData?.payload?.amount,
      txData.txHash,
      +VAAId.split("/").pop(), //sequence
    );

    if (redeem?.redeemTxHash) {
      const redeemTimestamp = new Date(
        redeem.timestamp ? redeem.timestamp : timestamp,
      ).toISOString();

      const newDestinationTx: GlobalTxOutput["destinationTx"] = {
        chainId: toChain,
        status: "redeemed",
        timestamp: redeemTimestamp,
        txHash: redeem.redeemTxHash,
        updatedAt: redeemTimestamp,

        blockNumber: null,
        from: null,
        method: null,
        to: null,
      };

      const newTxData = { ...txData };

      if (newTxData.globalTx) {
        newTxData.globalTx.destinationTx = newDestinationTx;
      } else {
        newTxData.globalTx = {
          id: null,
          originTx: null,
          destinationTx: newDestinationTx,
        };
      }

      setTxData(newTxData);
    }
    setLoadingRedeem(false);
  };

  return (
    <section className="tx-information">
      <Tabs
        isGenericRelayerTx={isGenericRelayerTx}
        setShowOverview={setShowOverview}
        setShowOverviewDetail={setShowOverviewDetail}
        showOverview={showOverview}
        showOverviewDetail={showOverviewDetail}
      />
      <Summary
        canTryToGetRedeem={canTryToGetRedeem}
        getRedeem={getRedeem}
        loadingRedeem={loadingRedeem}
        appIds={appIds}
        currentNetwork={currentNetwork}
        globalToRedeemTx={globalToRedeemTx}
        hasAnotherApp={hasAnotherApp}
        isCCTP={isCCTP}
        isConnect={isConnect}
        isPortal={isPortal}
        isTBTC={isTBTC}
        isTransferWithPayload={isTransferWithPayload}
        isUnknownApp={isUnknownApp}
        parsedDestinationAddress={parsedDestinationAddress}
        toChain={toChain}
        vaa={vaa}
      />

      {showOverview ? <OverviewContent /> : <RawDataContent />}
    </section>
  );
};

export { Information };
