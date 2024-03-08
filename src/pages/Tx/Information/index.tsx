import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ethers } from "ethers";
import { useRecoilState } from "recoil";
import { ChainId, isEVMChain, parseVaa } from "@certusone/wormhole-sdk";
import {
  DeliveryInstruction,
  parseEVMExecutionInfoV1,
} from "@certusone/wormhole-sdk/lib/cjs/relayer";

import { useEnvironment } from "src/context/EnvironmentContext";
import {
  CONNECT_APP_ID,
  DISCORD_URL,
  GATEWAY_APP_ID,
  NTT_APP_ID,
  PORTAL_APP_ID,
  txType,
  UNKNOWN_APP_ID,
} from "src/consts";
import { Alert, Loader, Tooltip } from "src/components/atoms";
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
import { tryGetRedeemTxn } from "src/utils/cryptoToolkit";
import { getPorticoInfo, isPortico } from "src/utils/wh-portico-rpc";
import { showSourceTokenUrlState, showTargetTokenUrlState } from "src/utils/recoilStates";
import { GetBlockData } from "src/api/search/types";
import { GetOperationsOutput } from "src/api/guardian-network/types";
import { getTokenInformation } from "src/utils/fetchWithRPCsFallthrough";
import { TokenInfo, getTokenLogo } from "src/utils/metaMaskUtils";
import { ChainLimit } from "src/api";

import Tabs from "./Tabs";
import Summary from "./Summary";
import Overview from "./Overview/index";
import Details from "./Details";
import RawData from "./RawData";
import RelayerOverview from "./Overview/RelayerOverview";
import RelayerDetails from "./Details/RelayerDetails";

import "./styles.scss";
import { CardStackMinusIcon, CardStackPlusIcon } from "@radix-ui/react-icons";

interface Props {
  blockData: GetBlockData;
  chainLimitsData?: ChainLimit[];
  extraRawInfo: any;
  setTxData: (x: any) => void;
  data: GetOperationsOutput;
  isRPC: boolean;
}

const ETH_LIMIT = {
  maxTransactionSize: 5000000,
  availableNotional: 50000000,
};

const Information = ({
  blockData,
  chainLimitsData,
  extraRawInfo,
  setTxData,
  data,
  isRPC,
}: Props) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [showSourceTokenUrl] = useRecoilState(showSourceTokenUrlState);
  const [showTargetTokenUrl] = useRecoilState(showTargetTokenUrlState);

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
  const vaa = data?.vaa;
  const guardianSignaturesCount = data?.decodedVaa?.guardianSignatures?.length || 0;
  const hasVAA = !!vaa;

  const { currentBlock, lastFinalizedBlock } = blockData || {};
  const { payload, standarizedProperties } = data?.content || {};
  const { symbol, tokenAmount, usdAmount } = data?.data || {};
  const { hex: emitterAddress, native: emitterNativeAddress } = data?.emitterAddress || {};
  const emitterChain = data?.emitterChain;
  const VAAId = data?.id;
  const { timestamp } = data?.sourceChain || {};

  const {
    parsedPayload,
    payloadType,
    tokenAddress: payloadTokenAddress,
    tokenChain: payloadTokenChain,
  } = payload || {};

  const fee = standarizedProperties?.overwriteFee || standarizedProperties?.fee || "";
  const {
    amount,
    appIds,
    fromAddress: stdFromAddress,
    fromChain: stdFromChain,
    toAddress: stdToAddress,
    toChain: stdToChain,
    tokenAddress: stdTokenAddress,
    tokenChain: stdTokenChain,
    wrappedTokenAddress,
    wrappedTokenSymbol,
  } = standarizedProperties || {};

  const { STATUS } = data;

  const fromChainOrig = emitterChain || stdFromChain;
  const fromAddress = data?.sourceChain?.from || stdFromAddress;
  const toAddress = stdToAddress || data?.targetChain?.to;
  const startDate = timestamp || data?.sourceChain?.timestamp;
  const endDate = data?.targetChain?.timestamp;
  let tokenChain = stdTokenChain || payloadTokenChain;
  const tokenAddress = stdTokenAddress || payloadTokenAddress;

  const isUnknownApp = appIds?.includes(UNKNOWN_APP_ID);
  const isConnect = appIds?.includes(CONNECT_APP_ID);
  const isGateway = appIds?.includes(GATEWAY_APP_ID);
  const isJustPortalUnknown =
    (appIds?.includes(PORTAL_APP_ID) && appIds.length === 1) ||
    (appIds?.includes(PORTAL_APP_ID) && appIds?.includes(UNKNOWN_APP_ID) && appIds.length === 2);

  const isAttestation = txType[payloadType] === "Attestation";
  const isUnknownPayloadType = !txType[payloadType];

  const parsedEmitterAddress = parseAddress({
    value: emitterNativeAddress ? emitterNativeAddress : emitterAddress,
    chainId: emitterChain as ChainId,
  });
  const isGatewaySource = data?.sourceChain?.attribute?.type === "wormchain-gateway";

  // Gateway Transfers
  const fromChain = isGatewaySource
    ? data?.sourceChain?.attribute?.value?.originChainId
    : fromChainOrig;
  const toChain = parsedPayload?.["gateway_transfer"]?.chain
    ? parsedPayload?.["gateway_transfer"].chain
    : stdToChain || data?.targetChain?.chainId;

  const parsedOriginAddress = isGatewaySource
    ? data?.sourceChain?.attribute?.value?.originAddress
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

  const parsedRedeemTx = parseTx({
    value: data?.targetChain?.transaction?.txHash,
    chainId: toChain as ChainId,
  });

  const amountSent = formatNumber(Number(tokenAmount)) || formatNumber(formatUnits(+amount));
  const amountSentUSD = +usdAmount ? formatNumber(+usdAmount, 2) : "";
  const redeemedAmount = standarizedProperties?.overwriteRedeemAmount
    ? formatNumber(+standarizedProperties?.overwriteRedeemAmount, 7)
    : hasVAA || !isRPC
    ? formatNumber(formatUnits(+amount - +fee))
    : formatNumber(+amount - +fee);

  const originDateParsed = formatDate(startDate);
  const destinationDateParsed = formatDate(endDate);

  // TODO - when the backend supports all chainIds, remove
  const extraRawInfoFromChainId = extraRawInfo?.from?.chainId || null;
  const extraRawInfoToChainId = extraRawInfo?.to?.chainId || null;
  // ---

  let sourceTokenLink = showSourceTokenUrl
    ? getExplorerLink({
        network: currentNetwork,
        chainId:
          extraRawInfoFromChainId || standarizedProperties?.overwriteSourceTokenChain || tokenChain,
        value: standarizedProperties?.overwriteSourceTokenAddress || tokenAddress,
        base: "token",
      })
    : "";
  let targetTokenAddress = standarizedProperties?.overwriteTargetTokenAddress || tokenAddress;
  let targetTokenLink = showTargetTokenUrl
    ? getExplorerLink({
        network: currentNetwork,
        chainId:
          extraRawInfoToChainId || standarizedProperties?.overwriteTargetTokenChain || tokenChain,
        value: targetTokenAddress,
        base: "token",
      })
    : "";

  let sourceSymbol = symbol;
  let targetSymbol = symbol;
  let targetTokenChain = tokenChain;
  const wrappedSide = tokenChain !== toChain ? "target" : "source";

  if (wrappedTokenAddress && !standarizedProperties?.appIds.includes("ETH_BRIDGE")) {
    if (wrappedSide === "target") {
      targetTokenChain = toChain;
      targetTokenAddress = wrappedTokenAddress;
      targetTokenLink = showTargetTokenUrl
        ? getExplorerLink({
            network: currentNetwork,
            chainId: extraRawInfoToChainId || toChain,
            value: targetTokenAddress,
            base: "token",
          })
        : "";
      if (wrappedTokenSymbol) {
        targetSymbol = wrappedTokenSymbol;
      }
    } else {
      sourceTokenLink = showSourceTokenUrl
        ? getExplorerLink({
            network: currentNetwork,
            chainId: extraRawInfoFromChainId || fromChain,
            value: wrappedTokenAddress,
            base: "token",
          })
        : "";
      if (wrappedTokenSymbol) {
        sourceSymbol = wrappedTokenSymbol;
      }
    }
  }

  if (standarizedProperties?.overwriteSourceTokenChain) {
    tokenChain = standarizedProperties?.overwriteSourceTokenChain;
  }
  if (standarizedProperties?.overwriteSourceSymbol) {
    sourceSymbol = standarizedProperties?.overwriteSourceSymbol;
  }
  if (standarizedProperties?.overwriteTargetTokenChain) {
    targetTokenChain = standarizedProperties?.overwriteTargetTokenChain;
  }
  if (standarizedProperties?.overwriteTargetSymbol) {
    targetSymbol = standarizedProperties?.overwriteTargetSymbol;
  }

  // --- ⬇ Add to MetaMask ⬇ ---
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const tokenEffectiveAddress = wrappedSide === "target" ? wrappedTokenAddress : tokenAddress;
  const showMetaMaskBtn =
    isEVMChain(toChain) && tokenInfo?.tokenDecimals && toChain === targetTokenChain;

  useEffect(() => {
    if (isEVMChain(toChain)) {
      getTokenInformation(targetTokenChain, environment, targetTokenAddress).then(data => {
        if (data) {
          getTokenLogo({ tokenAddress: targetTokenAddress }).then(tokenImage => {
            setTokenInfo({
              targetSymbol: targetSymbol,
              tokenAddress: tokenEffectiveAddress,
              tokenDecimals: data.tokenDecimals,
              tokenImage: tokenImage,
              tokenSymbol: data.symbol,
            });
          });
        }
      });
    }
  }, [
    toChain,
    targetTokenChain,
    environment,
    targetTokenAddress,
    targetSymbol,
    tokenEffectiveAddress,
  ]);
  // --- ⬆ Add to MetaMask ⬆ ---

  const overviewAndDetailProps = {
    amountSent,
    amountSentUSD,
    currentNetwork,
    destinationDateParsed,
    fee,
    fromChain: extraRawInfoFromChainId || fromChain,
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
    showMetaMaskBtn,
    showSignatures: !(appIds && appIds.includes("CCTP_MANUAL")),
    sourceSymbol,
    sourceTokenLink,
    targetSymbol,
    targetTokenLink,
    toChain: extraRawInfoToChainId || toChain,
    tokenAmount,
    tokenInfo,
    totalGuardiansNeeded,
    VAAId,
  };

  const [loadingRedeem, setLoadingRedeem] = useState(false);
  const [foundRedeem, setFoundRedeem] = useState<null | boolean>(null);
  const canTryToGetRedeem =
    (STATUS === "EXTERNAL_TX" || STATUS === "VAA_EMITTED") &&
    (isEVMChain(toChain) || toChain === 1 || toChain === 21) &&
    toChain === targetTokenChain &&
    !!toAddress &&
    !!(wrappedTokenAddress && tokenEffectiveAddress) &&
    !!timestamp &&
    !!payload?.amount &&
    !!data?.sourceChain?.transaction?.txHash &&
    !data?.targetChain?.transaction?.txHash;

  const getRedeem = async () => {
    setLoadingRedeem(true);

    const redeem = await tryGetRedeemTxn(
      currentNetwork,
      fromChain as ChainId,
      toChain,
      toAddress,
      wrappedTokenAddress && tokenEffectiveAddress,
      timestamp,
      payload?.amount,
      data?.sourceChain?.transaction?.txHash,
      +VAAId?.split("/")?.pop() || 0, //sequence
    );

    if (redeem?.redeemTxHash) {
      const redeemTimestamp = new Date(
        redeem.timestamp ? redeem.timestamp : timestamp,
      ).toISOString();

      const newDestinationTx: GetOperationsOutput["targetChain"] = {
        chainId: toChain,
        status: "redeemed",
        timestamp: redeemTimestamp,
        transaction: {
          txHash: redeem.redeemTxHash,
        },
        from: null,
        to: null,
      };

      const newData: GetOperationsOutput = JSON.parse(JSON.stringify(data));

      newData.STATUS = "COMPLETED";
      newData.targetChain = newDestinationTx;

      if (
        isPortico(
          currentNetwork,
          newData?.content?.standarizedProperties?.toChain as ChainId,
          newData?.content?.standarizedProperties?.toAddress,
        )
      ) {
        const { formattedFinalUserAmount, formattedRelayerFee } = await getPorticoInfo(
          environment,
          newData,
          true,
        );

        if (formattedFinalUserAmount) {
          newData.content.standarizedProperties.overwriteRedeemAmount = formattedFinalUserAmount;
          if (formattedRelayerFee)
            newData.content.standarizedProperties.overwriteFee = formattedRelayerFee;
        }
        newData.content.standarizedProperties.overwriteFee = formattedRelayerFee;
      }

      analytics.track("findRedeem", {
        chain: getChainName({ chainId: toChain, network: currentNetwork }),
        network: currentNetwork,
        found: true,
      });
      setFoundRedeem(true);

      setTimeout(() => {
        setIsGenericRelayerTx(false);
        setTxData(newData);
      }, 2000);
    } else {
      analytics.track("findRedeem", {
        chain: getChainName({ chainId: toChain, network: currentNetwork }),
        network: currentNetwork,
        found: false,
      });
      setFoundRedeem(false);
    }
    setLoadingRedeem(false);
  };

  const isLatestBlockHigherThanVaaEmitBlock = lastFinalizedBlock > currentBlock;
  const limitDataForChain = chainLimitsData
    ? chainLimitsData.find((data: ChainLimit) => data.chainId === fromChain)
    : ETH_LIMIT;
  const transactionLimit = limitDataForChain?.maxTransactionSize;
  const isBigTransaction = transactionLimit <= Number(usdAmount);
  const isDailyLimitExceeded = limitDataForChain?.availableNotional < Number(usdAmount);

  // --- Automatic Relayer Detection and handling ---
  const [genericRelayerInfo, setGenericRelayerInfo] = useState<DeliveryLifecycleRecord>(null);
  const [loadingRelayers, setLoadingRelayers] = useState(false);
  const getRelayerInfo = useCallback(async () => {
    setLoadingRelayers(true);

    // TODO: handle generic relayer non-vaa txns without rpcs
    if (!vaa || !vaa.raw) {
      setLoadingRelayers(false);
      setIsGenericRelayerTx(false);
      console.log("automatic relayer tx without vaa yet");
      return;
    }

    populateDeliveryLifecycleRecordByVaa(environment, vaa.raw)
      .then((result: DeliveryLifecycleRecord) => {
        analytics.track("txDetail", {
          appIds: ["GENERIC_RELAYER"].join(", "),
          chain: getChainName({
            chainId: (result?.sourceChainId as any)
              ? (result.sourceChainId as any)
              : standarizedProperties?.fromChain
              ? standarizedProperties?.fromChain
              : 0,
            network: currentNetwork,
          }),
          toChain: getChainName({
            chainId: result?.targetTransaction?.targetChainId
              ? result.targetTransaction?.targetChainId
              : standarizedProperties?.toChain
              ? standarizedProperties?.toChain
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
    standarizedProperties?.fromChain,
    standarizedProperties?.toChain,
    currentNetwork,
  ]);

  const targetContract = environment.chainInfos.find(
    a => a.chainId === fromChain,
  )?.relayerContractAddress;

  const [isGenericRelayerTx, setIsGenericRelayerTx] = useState(null);

  useEffect(() => {
    if (targetContract || parsedEmitterAddress) {
      const isGeneric = targetContract?.toUpperCase() === parsedEmitterAddress?.toUpperCase();

      setIsGenericRelayerTx(isGeneric && !appIds?.includes(NTT_APP_ID));
      if (isGeneric) {
        console.log("isGenericRelayerTx!!!");
        getRelayerInfo();
      }
    }
  }, [targetContract, parsedEmitterAddress, getRelayerInfo, appIds]);
  // --- x ---

  const OverviewContent = () => {
    if (isGenericRelayerTx === null) {
      return <Loader />;
    }

    if (isGenericRelayerTx) {
      if (loadingRelayers) return <Loader />;
      if (!genericRelayerInfo?.vaa) {
        setIsGenericRelayerTx(false);
        setTxData({
          ...data,
          vaa: null,
        } as GetOperationsOutput);
        return <div>No VAA was found</div>;
      }

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
        return <RelayerDetails {...genericRelayerProps} />;
      }

      return <RelayerOverview {...genericRelayerProps} />;
    }

    if (!isGenericRelayerTx) {
      if (showOverviewDetail) {
        return <Details {...overviewAndDetailProps} />;
      }

      return (
        <Overview
          {...overviewAndDetailProps}
          globalToRedeemTx={data?.targetChain?.transaction?.txHash}
          isAttestation={isAttestation}
        />
      );
    }
  };

  const RawDataContent = () => {
    if (isGenericRelayerTx === null || (isGenericRelayerTx && loadingRelayers)) return <Loader />;

    return <RawData extraRawInfo={extraRawInfo} lifecycleRecord={genericRelayerInfo} data={data} />;
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
                {isRPC && <p>This information can be incomplete or have wrong values.</p>}
                {!isLatestBlockHigherThanVaaEmitBlock &&
                  !isBigTransaction &&
                  !isDailyLimitExceeded && (
                    <p>
                      Waiting for finality on{" "}
                      {getChainName({ chainId: fromChain, network: currentNetwork })} which may take
                      up to 15 minutes.
                    </p>
                  )}
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

                {isBigTransaction && currentNetwork === "MAINNET" ? (
                  <p>
                    This transaction will take 24 hours to process, as it exceeds the Wormhole
                    network&apos;s temporary transaction limit of $
                    {formatNumber(transactionLimit, 0)} on{" "}
                    {getChainName({ chainId: fromChain, network: currentNetwork })} for security
                    reasons. <LearnMoreLink /> about this temporary security measure.
                  </p>
                ) : isDailyLimitExceeded && currentNetwork === "MAINNET" ? (
                  <p>
                    This transaction will take up to 24 hours to process as Wormhole has reached the
                    daily limit for source Blockchain{" "}
                    {getChainName({ chainId: fromChain, network: currentNetwork })}. This is a
                    normal and temporary security feature by the Wormhole network. <LearnMoreLink />{" "}
                    about this security measure.
                  </p>
                ) : (
                  isLatestBlockHigherThanVaaEmitBlock && (
                    <p>
                      Since the latest block number is higher than this transaction&apos;s, there
                      might be an extra delay. You can contact support on <DiscordSupportLink />.
                    </p>
                  )
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
        appIds={appIds}
        currentNetwork={currentNetwork}
        isUnknownApp={isUnknownApp}
        parsedDestinationAddress={parsedDestinationAddress}
        STATUS={STATUS}
        toChain={toChain}
        canTryToGetRedeem={canTryToGetRedeem}
        foundRedeem={foundRedeem}
        getRedeem={getRedeem}
        loadingRedeem={loadingRedeem}
        fromChain={fromChain}
        isJustPortalUnknown={isJustPortalUnknown}
        isConnect={isConnect}
        isGateway={isGateway}
        txHash={data?.sourceChain?.transaction?.txHash}
        vaa={vaa?.raw}
      />

      {showOverview && appIds?.includes(NTT_APP_ID) && appIds?.includes("GENERIC_RELAYER") && (
        <div className="tx-information-button">
          <Tooltip
            tooltip={isGenericRelayerTx ? "Switch to Transfer view" : "Switch to Relayer view"}
            type="info"
          >
            <div
              className="tx-information-button-btn"
              onClick={() => {
                setIsGenericRelayerTx(!isGenericRelayerTx);
              }}
            >
              {isGenericRelayerTx ? (
                <CardStackMinusIcon height={24} width={24} />
              ) : (
                <CardStackPlusIcon height={24} width={24} />
              )}
            </div>
          </Tooltip>
        </div>
      )}

      {showOverview ? <OverviewContent /> : <RawDataContent />}
      {showOverview && <AlertsContent />}
    </section>
  );
};

export { Information };

const DiscordSupportLink = () => (
  <a
    className="tx-information-alerts-unknown-payload-type-link"
    href={DISCORD_URL}
    target="_blank"
    rel="noopener noreferrer"
  >
    Discord
  </a>
);

const LearnMoreLink = () => (
  <a
    className="tx-information-alerts-unknown-payload-type-link"
    href="https://github.com/wormhole-foundation/wormhole/blob/main/whitepapers/0007_governor.md"
    target="_blank"
    rel="noopener noreferrer"
  >
    Learn more
  </a>
);
