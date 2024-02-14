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
import { DISCORD_URL, IStatus, canWeGetDestinationTx, txType } from "src/consts";
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
import { tryGetRedeemTxn } from "src/utils/cryptoToolkit";
import { getPorticoInfo, isPortico } from "src/utils/wh-portico-rpc";
import { showSourceTokenUrlState, showTargetTokenUrlState } from "src/utils/recoilStates";
import { getTokenInformation } from "src/utils/fetchWithRPCsFallthrough";
import { TokenInfo, getTokenLogo } from "src/utils/metaMaskUtils";
import { GetBlockData, GetTransactionsOutput } from "src/api/search/types";
import { GlobalTxOutput, VAADetail } from "src/api/guardian-network/types";
import { ChainLimit } from "src/api";

import Tabs from "./Tabs";
import Summary from "./Summary";
import Overview from "./Overview/index";
import Details from "./Details";
import RawData from "./RawData";
import RelayerOverview from "./Overview/RelayerOverview";
import RelayerDetails from "./Details/RelayerDetails";

import "./styles.scss";

interface Props {
  blockData: GetBlockData;
  chainLimitsData?: ChainLimit[];
  extraRawInfo: any;
  setTxData: (x: any) => void;
  txData: GetTransactionsOutput;
  VAAData: VAADetail & { vaa: any; decodedVaa: any };
}

const UNKNOWN_APP_ID = "UNKNOWN";
const CCTP_APP_ID = "CCTP_WORMHOLE_INTEGRATION";
const CONNECT_APP_ID = "CONNECT";
const PORTAL_APP_ID = "PORTAL_TOKEN_BRIDGE";

const ETH_LIMIT = {
  maxTransactionSize: 5000000,
  availableNotional: 50000000,
};

const Information = ({
  blockData,
  chainLimitsData,
  extraRawInfo,
  setTxData,
  txData,
  VAAData,
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
  const { decodedVaa, vaa } = VAAData || {};
  const { guardianSignatures } = decodedVaa || {};
  const guardianSignaturesCount =
    guardianSignatures?.length || extraRawInfo?.signatures?.length || 0;
  const hasVAA = !!vaa;

  const { currentBlock, lastFinalizedBlock } = blockData || {};

  const {
    emitterAddress,
    emitterChain,
    emitterNativeAddress,
    globalTx,
    id: VAAId,
    payload,
    standardizedProperties,
    symbol,
    timestamp,
    tokenAmount,
    txHash,
    usdAmount,
  } = txData || {};

  const {
    callerAppId,
    parsedPayload,
    payloadType,
    tokenAddress: payloadTokenAddress,
    tokenChain: payloadTokenChain,
  } = payload || {};

  const { originTx, destinationTx } = globalTx || {};

  const fee = txData?.standardizedProperties?.overwriteFee || standardizedProperties?.fee || "";
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
  let tokenChain = stdTokenChain || payloadTokenChain;
  const tokenAddress = stdTokenAddress || payloadTokenAddress;

  const isUnknownApp = callerAppId === UNKNOWN_APP_ID || appIds?.includes(UNKNOWN_APP_ID);
  const isCCTP = callerAppId === CCTP_APP_ID || appIds?.includes(CCTP_APP_ID);
  const isConnect = callerAppId === CONNECT_APP_ID || appIds?.includes(CONNECT_APP_ID);
  const isPortal = callerAppId === PORTAL_APP_ID || appIds?.includes(PORTAL_APP_ID);
  const isJustPortalUnknown =
    callerAppId === PORTAL_APP_ID ||
    (appIds?.includes(PORTAL_APP_ID) && appIds.length === 1) ||
    (appIds?.includes(PORTAL_APP_ID) && appIds?.includes(UNKNOWN_APP_ID) && appIds.length === 2);

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
  const redeemedAmount = txData.standardizedProperties?.overwriteRedeemAmount
    ? formatNumber(+txData.standardizedProperties?.overwriteRedeemAmount, 7)
    : hasVAA
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
          extraRawInfoFromChainId ||
          txData?.standardizedProperties?.overwriteSourceTokenChain ||
          tokenChain,
        value: txData?.standardizedProperties?.overwriteSourceTokenAddress || tokenAddress,
        base: "token",
      })
    : "";
  let targetTokenAddress =
    txData?.standardizedProperties?.overwriteTargetTokenAddress || tokenAddress;
  let targetTokenLink = showTargetTokenUrl
    ? getExplorerLink({
        network: currentNetwork,
        chainId:
          extraRawInfoToChainId ||
          txData?.standardizedProperties?.overwriteTargetTokenChain ||
          tokenChain,
        value: targetTokenAddress,
        base: "token",
      })
    : "";

  let sourceSymbol = symbol;
  let targetSymbol = symbol;
  let targetTokenChain = tokenChain;
  const wrappedSide = tokenChain !== toChain ? "target" : "source";

  if (wrappedTokenAddress && !txData.standardizedProperties?.appIds.includes("ETH_BRIDGE")) {
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

  if (txData.standardizedProperties?.overwriteSourceTokenChain) {
    tokenChain = txData.standardizedProperties?.overwriteSourceTokenChain;
  }
  if (txData.standardizedProperties?.overwriteSourceSymbol) {
    sourceSymbol = txData.standardizedProperties?.overwriteSourceSymbol;
  }
  if (txData.standardizedProperties?.overwriteTargetTokenChain) {
    targetTokenChain = txData.standardizedProperties?.overwriteTargetTokenChain;
  }
  if (txData.standardizedProperties?.overwriteTargetSymbol) {
    targetSymbol = txData.standardizedProperties?.overwriteTargetSymbol;
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

  const STATUS: IStatus = globalToRedeemTx
    ? "COMPLETED"
    : appIds && appIds.includes("CCTP_MANUAL")
    ? "EXTERNAL_TX"
    : vaa
    ? isConnect || isPortal || isCCTP
      ? (canWeGetDestinationTx(toChain) &&
          !hasAnotherApp &&
          (!isTransferWithPayload ||
            (isTransferWithPayload && isConnect) ||
            (isTransferWithPayload && isTBTC))) ||
        isCCTP
        ? "PENDING_REDEEM"
        : "VAA_EMITTED"
      : "VAA_EMITTED"
    : "IN_PROGRESS";

  const [loadingRedeem, setLoadingRedeem] = useState(false);
  const [foundRedeem, setFoundRedeem] = useState<null | boolean>(null);
  const canTryToGetRedeem =
    (STATUS === "EXTERNAL_TX" || STATUS === "VAA_EMITTED") &&
    (isEVMChain(toChain) || toChain === 1 || toChain === 21) &&
    toChain === targetTokenChain &&
    !!toAddress &&
    !!(wrappedTokenAddress && tokenEffectiveAddress) &&
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
      wrappedTokenAddress && tokenEffectiveAddress,
      timestamp,
      txData?.payload?.amount,
      txData.txHash,
      +VAAId?.split("/")?.pop() || 0, //sequence
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

      const newTxData: GetTransactionsOutput = JSON.parse(JSON.stringify(txData));

      if (newTxData.globalTx) {
        newTxData.globalTx.destinationTx = newDestinationTx;
      } else {
        newTxData.globalTx = {
          id: null,
          originTx: null,
          destinationTx: newDestinationTx,
        };
      }

      if (
        isPortico(
          currentNetwork,
          newTxData?.standardizedProperties?.toChain as ChainId,
          newTxData?.standardizedProperties?.toAddress,
        )
      ) {
        const { formattedFinalUserAmount, formattedRelayerFee } = await getPorticoInfo(
          environment,
          newTxData,
          true,
        );

        if (formattedFinalUserAmount) {
          newTxData.standardizedProperties.overwriteRedeemAmount = formattedFinalUserAmount;
          if (formattedRelayerFee)
            newTxData.standardizedProperties.overwriteFee = formattedRelayerFee;
        }
        newTxData.standardizedProperties.overwriteFee = formattedRelayerFee;
      }

      analytics.track("findRedeem", {
        chain: getChainName({ chainId: toChain, network: currentNetwork }),
        network: currentNetwork,
        found: true,
      });
      setFoundRedeem(true);

      setTimeout(() => {
        setTxData(newTxData);
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
  const isBigTransaction = transactionLimit < Number(usdAmount);
  const isDailyLimitExceeded = limitDataForChain?.availableNotional < Number(usdAmount);

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
              ? txData.standardizedProperties?.fromChain
              : 0,
            network: currentNetwork,
          }),
          toChain: getChainName({
            chainId: result?.targetTransaction?.targetChainId
              ? result.targetTransaction?.targetChainId
              : txData?.standardizedProperties?.toChain
              ? txData.standardizedProperties?.toChain
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
          globalToRedeemTx={globalToRedeemTx}
          isAttestation={isAttestation}
        />
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
                {!isLatestBlockHigherThanVaaEmitBlock && (
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
                {isLatestBlockHigherThanVaaEmitBlock && (
                  <>
                    {isBigTransaction && currentNetwork === "MAINNET" ? (
                      <p>
                        This transaction will take 24 hours to process, as it exceeds the Wormhole
                        network&apos;s temporary transaction limit of ${transactionLimit} on{" "}
                        {getChainName({ chainId: fromChain, network: currentNetwork })} for security
                        reasons. <LearnMoreLink /> about this temporary security measure.
                      </p>
                    ) : isDailyLimitExceeded && currentNetwork === "MAINNET" ? (
                      <p>
                        This transaction will take up to 24 hours to process as Wormhole has reached
                        the daily limit for source Blockchain{" "}
                        {getChainName({ chainId: fromChain, network: currentNetwork })}. This is a
                        normal and temporary security feature by the Wormhole network.{" "}
                        <LearnMoreLink /> about this security measure.
                      </p>
                    ) : (
                      <p>
                        Since the latest block number is higher than this transaction&apos;s, there
                        might be an extra delay. You can contact support on <DiscordSupportLink />.
                      </p>
                    )}
                  </>
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
        txHash={txHash}
        vaa={vaa}
      />

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
