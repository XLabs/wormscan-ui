import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useRecoilState } from "recoil";
import {
  ChainId,
  chainIdToChain,
  chainToChainId,
  platformToChains,
} from "@wormhole-foundation/sdk";
import { useEnvironment } from "src/context/EnvironmentContext";
import analytics from "src/analytics";
import {
  CCTP_MANUAL_APP_ID,
  CONNECT_APP_ID,
  ETH_BRIDGE_APP_ID,
  GATEWAY_APP_ID,
  GR_APP_ID,
  WORMHOLE_SETTLEMENTS_APP_ID,
  MAYAN_APP_ID,
  PORTAL_APP_ID,
  txType,
  UNKNOWN_APP_ID,
} from "src/consts";
import { formatUnits, parseAddress, parseTx } from "src/utils/crypto";
import { formatDate } from "src/utils/date";
import { formatNumber } from "src/utils/number";
import { getChainName, getExplorerLink } from "src/utils/wormhole";
import { getGeckoTokenInfo, tryGetRedeemTxn } from "src/utils/cryptoToolkit";
import { getPorticoInfo } from "src/utils/wh-portico-rpc";
import { showSourceTokenUrlState, showTargetTokenUrlState } from "src/utils/recoilStates";
import { TokenInfo } from "src/utils/metaMaskUtils";
import { deepCloneWithBigInt } from "src/utils/object";
import { GetBlockData } from "src/api/search/types";
import { GetOperationsOutput } from "src/api/guardian-network/types";
import Overview from "./Overview";
import AdvancedView from "./AdvancedView";
import ProgressView from "./ProgressView";
import Summary from "./Summary";
import { Modal } from "src/components/atoms";
import { Redeem } from "./Summary/Redeem";
import RedeemModal from "./Summary/Redeem/RedeemModal";
import RedeemModalError from "./Summary/Redeem/RedeemModalError";
import RedeemModalSuccess from "./Summary/Redeem/RedeemModalSuccess";
import RedeemModalLoading from "./Summary/Redeem/RedeemModalLoading";
import { OverviewProps } from "src/utils/txPageUtils";
import "./styles.scss";

interface Props {
  blockData: GetBlockData;
  data: GetOperationsOutput;
  extraRawInfo: any;
  hasMultipleTxs: boolean;
  isRPC: boolean;
  setTxData: (x: any) => void;
  txIndex: number;
}

type TView = "overview" | "advanced" | "progress";

const Information = ({
  blockData,
  data,
  extraRawInfo,
  hasMultipleTxs,
  isRPC,
  setTxData,
  txIndex,
}: Props) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [showSourceTokenUrl] = useRecoilState(showSourceTokenUrlState);
  const [showTargetTokenUrl] = useRecoilState(showTargetTokenUrlState);

  const { environment } = useEnvironment();
  const currentNetwork = environment.network;
  const isMainnet = currentNetwork === "Mainnet";

  const [showOverview, setShowOverviewState] = useState<TView>(
    (searchParams.get("view") as TView) || "overview",
  );
  const setShowOverview = (view: TView) => {
    setShowOverviewState(view);
    setSearchParams(prev => {
      prev.set("view", view);
      return prev;
    });
  };

  useEffect(() => {
    if (!hasMultipleTxs) {
      const view = (searchParams.get("view") as TView) || "overview";
      setShowOverviewState(view);
    }
  }, [hasMultipleTxs, isMainnet, searchParams]);

  const totalGuardiansNeeded = isMainnet ? 13 : 1;
  const vaa = data?.vaa;
  const { isDuplicated } = data?.vaa || {};
  const guardianSignaturesCount =
    data?.decodedVaa?.guardianSignatures?.length || extraRawInfo?.signatures?.length || 0;

  const hasVAA = !!vaa;

  const { currentBlock, lastFinalizedBlock } = blockData || {};
  const { payload, standarizedProperties } = data?.content || {};
  const { symbol, tokenAmount, usdAmount } = data?.data || {};
  const { hex: emitterAddress, native: emitterNativeAddress } = data?.emitterAddress || {};
  const emitterChain = data?.emitterChain;
  const VAAId = data?.id;
  const {
    timestamp,
    fee: sourceFee,
    gasTokenNotional: sourceGasTokenNotional,
    feeUSD: sourceFeeUSD,
  } = data?.sourceChain || {};

  const {
    parsedPayload,
    payloadType = payload?.payloadType || payload?.payloadId,
    tokenAddress: payloadTokenAddress,
    tokenChain: payloadTokenChain,
    action,
  } = payload || {};

  const fee = standarizedProperties?.overwriteFee || standarizedProperties?.fee || "";
  const {
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

  const { status, isBigTransaction, isDailyLimitExceeded, transactionLimit } = data;
  const {
    fee: targetFee,
    gasTokenNotional: targetGasTokenNotional,
    feeUSD: targetFeeUSD,
  } = data?.targetChain || {};

  const fromChainOrig: ChainId = emitterChain || stdFromChain;
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
  const isJustGenericRelayer =
    (appIds?.includes(GR_APP_ID) && appIds.length === 1) ||
    (appIds?.includes(GR_APP_ID) && appIds?.includes(UNKNOWN_APP_ID) && appIds.length === 2);

  const isAttestation = txType[payloadType] === "Attestation";
  const isUnknownPayloadType =
    !txType[payloadType] && (!appIds || appIds?.includes(UNKNOWN_APP_ID));

  const parsedEmitterAddress = parseAddress({
    value: emitterNativeAddress ? emitterNativeAddress : emitterAddress,
    chainId: emitterChain as ChainId,
  });
  const isGatewaySource = data?.sourceChain?.attribute?.type === "wormchain-gateway";

  // Gateway Transfers
  const gatewayInfo = data?.sourceChain?.attribute?.value;

  const fromChain = (isGatewaySource ? gatewayInfo?.originChainId : fromChainOrig) as ChainId;
  const toChain: ChainId = parsedPayload?.["gateway_transfer"]?.chain
    ? chainToChainId(parsedPayload?.["gateway_transfer"].chain)
      ? chainToChainId(parsedPayload?.["gateway_transfer"].chain)
      : parsedPayload?.["gateway_transfer"].chain
    : stdToChain || data?.targetChain?.chainId || 0;

  const parsedOriginAddress = isGatewaySource
    ? gatewayInfo?.originAddress
    : parseAddress({
        value: fromAddress,
        chainId: fromChainOrig,
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

  const amount = standarizedProperties?.amount || payload?.amount;
  const amountSent = formatNumber(Number(tokenAmount)) || formatNumber(formatUnits(+amount));
  const amountSentUSD = +usdAmount ? formatNumber(+usdAmount, 2) : "";
  const redeemedAmount = standarizedProperties?.overwriteRedeemAmount
    ? standarizedProperties?.overwriteRedeemAmount
    : hasVAA || !isRPC
    ? formatNumber(formatUnits(+amount - +fee))
    : formatNumber(+amount - +fee);

  const originDateParsed = formatDate(startDate);
  const destinationDateParsed = formatDate(endDate);

  // TODO - when the backend supports all chainIds, remove
  const extraRawInfoFromChainId: ChainId = extraRawInfo?.from?.chainId || null;
  const extraRawInfoToChainId: ChainId = extraRawInfo?.to?.chainId || null;
  // ---

  let sourceTokenAddress = standarizedProperties?.overwriteSourceTokenAddress || tokenAddress;
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
  let sourceTokenChain = tokenChain as ChainId;
  let targetSymbol = symbol;
  let targetTokenChain = tokenChain as ChainId;
  const wrappedSide = tokenChain !== toChain ? "target" : "source";

  if (wrappedTokenAddress && !standarizedProperties?.appIds?.includes(ETH_BRIDGE_APP_ID)) {
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
      sourceTokenChain = fromChain;
      sourceTokenAddress = wrappedTokenAddress;
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
    targetTokenChain = standarizedProperties?.overwriteTargetTokenChain as ChainId;
  }
  if (standarizedProperties?.overwriteTargetSymbol) {
    targetSymbol = standarizedProperties?.overwriteTargetSymbol;
  }

  // --- ⬇ Add to MetaMask and get Gecko Token Info ⬇ ---
  const [sourceTokenInfo, setSourceTokenInfo] = useState<TokenInfo | null>(null);
  const [targetTokenInfo, setTargetTokenInfo] = useState<TokenInfo | null>(null);

  const tokenEffectiveAddress = wrappedSide === "target" ? wrappedTokenAddress : tokenAddress;
  const showMetaMaskBtn =
    toChain &&
    targetTokenInfo?.tokenDecimals &&
    toChain === targetTokenChain &&
    !appIds.includes(ETH_BRIDGE_APP_ID) &&
    platformToChains("Evm").includes(chainIdToChain(toChain) as any);

  useEffect(() => {
    if (targetTokenChain && targetTokenAddress && !targetTokenInfo) {
      getGeckoTokenInfo(targetTokenAddress, targetTokenChain).then(data => {
        setTargetTokenInfo({
          tokenAddress: targetTokenAddress,
          tokenDecimals: data?.attributes?.decimals,
          tokenImage: data?.attributes?.image_url,
          tokenSymbol: data?.attributes?.symbol,
        });
      });
    }

    if (sourceTokenChain && sourceTokenAddress && !sourceTokenInfo) {
      getGeckoTokenInfo(sourceTokenAddress, sourceTokenChain).then(data => {
        setSourceTokenInfo({
          tokenAddress: sourceTokenAddress,
          tokenDecimals: data?.attributes?.decimals,
          tokenImage: data?.attributes?.image_url,
          tokenSymbol: data?.attributes?.symbol,
        });
      });
    }
  }, [
    sourceTokenAddress,
    sourceTokenChain,
    sourceTokenInfo,
    targetTokenAddress,
    targetTokenChain,
    targetTokenInfo,
  ]);
  // --- ⬆ Add to MetaMask and get Gecko Token Info ⬆ ---

  const [loadingRedeem, setLoadingRedeem] = useState(false);
  const [foundRedeem, setFoundRedeem] = useState<null | boolean>(null);

  const date_10_min_before = new Date(new Date().getTime() - 10 * 60000);
  const canTryToGetRedeem =
    (status === "external_tx" ||
      (status === "pending_redeem" && new Date(timestamp) < date_10_min_before)) &&
    (platformToChains("Evm").includes(chainIdToChain(toChain) as any) ||
      toChain === chainToChainId("Solana") ||
      toChain === chainToChainId("Sui")) &&
    toChain === targetTokenChain &&
    !!toAddress &&
    !!(wrappedTokenAddress && tokenEffectiveAddress) &&
    !!timestamp &&
    !!amount &&
    !!data?.sourceChain?.transaction?.txHash &&
    !data?.targetChain?.transaction?.txHash &&
    // Portal: only transfer with payload
    (data.content?.standarizedProperties?.appIds?.includes(PORTAL_APP_ID)
      ? data.content.payload.payloadType === 3
      : true);

  const getRedeem = async () => {
    setLoadingRedeem(true);

    const redeem = await tryGetRedeemTxn(
      currentNetwork,
      fromChain as ChainId,
      toChain,
      toAddress,
      wrappedTokenAddress && tokenEffectiveAddress,
      timestamp,
      amount,
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

      const newData: GetOperationsOutput = deepCloneWithBigInt(data);

      newData.status = "completed";
      newData.targetChain = newDestinationTx;

      if (newData?.content?.standarizedProperties?.appIds?.includes(ETH_BRIDGE_APP_ID)) {
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

  const showVerifyRedemption =
    status === "pending_redeem" && (isJustPortalUnknown || isConnect || isGateway);

  const showMinReceivedTooltip = !!(
    data.content?.standarizedProperties?.appIds?.includes(WORMHOLE_SETTLEMENTS_APP_ID) &&
    data.content?.payload?.payload?.parsedRedeemerMessage?.outputToken?.swap?.limitAmount
  );

  const overviewAndDetailProps: OverviewProps = {
    action,
    amountSent,
    amountSentUSD,
    appIds,
    currentBlock,
    currentNetwork,
    destinationDateParsed,
    emitterChainId: emitterChain,
    fee,
    fromChain: extraRawInfoFromChainId || fromChain,
    fromChainOrig,
    gatewayInfo,
    guardianSignaturesCount,
    hasVAA,
    isAttestation,
    isBigTransaction,
    isDailyLimitExceeded,
    isDuplicated,
    isGatewaySource,
    isJustGenericRelayer,
    isLatestBlockHigherThanVaaEmitBlock,
    isMayanOnly: appIds?.length === 1 && appIds.includes(MAYAN_APP_ID),
    isUnknownApp,
    isUnknownPayloadType,
    lastFinalizedBlock,
    nftInfo: payload?.nftInfo || null,
    originDateParsed,
    parsedDestinationAddress,
    parsedEmitterAddress,
    parsedOriginAddress,
    parsedPayload: parsedPayload ?? payload,
    parsedRedeemTx,
    payloadType,
    redeemedAmount,
    releaseTimestamp: data?.releaseTimestamp,
    setShowOverview,
    showMetaMaskBtn,
    showSignatures: !(appIds && appIds.includes(CCTP_MANUAL_APP_ID)),
    showVerifyRedemption,
    showMinReceivedTooltip,
    sourceFee,
    sourceFeeUSD,
    sourceSymbol,
    sourceTokenChain,
    sourceTokenInfo,
    sourceTokenLink,
    startDate,
    status,
    targetFee,
    targetFeeUSD,
    targetSymbol,
    targetTokenInfo,
    targetTokenLink,
    targetTxHash: data?.targetChain?.transaction?.txHash,
    toChain: extraRawInfoToChainId || toChain,
    tokenAmount,
    totalGuardiansNeeded,
    transactionLimit,
    txHash: data?.sourceChain?.transaction?.txHash,
    txIndex,
    VAAId,
  };

  const [showRedeemModal, setShowRedeemModal] = useState(false);

  const RedeemModalComponent = () => (
    <RedeemModal
      currentNetwork={currentNetwork}
      fromChain={fromChain}
      parsedDestinationAddress={parsedDestinationAddress}
      parsedOriginAddress={parsedOriginAddress}
      toChain={toChain}
      sourceTokenLink={sourceTokenLink}
      sourceSymbol={sourceSymbol}
      amountSent={amountSent}
    />
  );

  return (
    <section className="tx-information">
      <Summary
        canTryToGetRedeem={canTryToGetRedeem}
        foundRedeem={foundRedeem}
        getRedeem={getRedeem}
        loadingRedeem={loadingRedeem}
        setShowOverview={setShowOverview}
        showOverview={showOverview}
        showVerifyRedemption={showVerifyRedemption}
        status={status}
        startDate={startDate}
        txHash={data?.sourceChain?.transaction?.txHash}
        vaa={vaa?.raw}
        setShowRedeemModal={setShowRedeemModal}
      />

      <div className="tx-information-content">
        {showOverview === "overview" && (
          <Overview {...overviewAndDetailProps} {...data?.relayerInfo?.props} />
        )}
        {showOverview === "advanced" && (
          <AdvancedView data={data} extraRawInfo={extraRawInfo} txIndex={txIndex} />
        )}
        {showOverview === "progress" && (
          <ProgressView
            {...overviewAndDetailProps}
            vaa={vaa?.raw}
            showRedeemModal={showRedeemModal}
            setShowRedeemModal={setShowRedeemModal}
          />
        )}

        <Modal shouldShow={showRedeemModal} setShouldShow={setShowRedeemModal}>
          {showRedeemModal && (
            <Redeem
              txHash={data?.sourceChain?.transaction?.txHash}
              sourceChain={fromChain as ChainId}
              CustomComponent={RedeemModalComponent}
              CustomError={RedeemModalError}
              CustomSuccess={RedeemModalSuccess}
              CustomLoading={RedeemModalLoading}
              network={currentNetwork}
            />
          )}
        </Modal>
      </div>
    </section>
  );
};

export { Information };
