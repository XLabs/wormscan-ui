import { useCallback, useEffect, useState } from "react";
import { ChainId } from "@certusone/wormhole-sdk";
import { GetTransactionsOutput, VAADetail } from "@xlabs-libs/wormscan-sdk";

import { useEnvironment } from "src/context/EnvironmentContext";
import { useLocalStorage } from "src/utils/hooks/useLocalStorage";
import { formatUnits, parseAddress, parseTx } from "src/utils/crypto";
import { formatDate } from "src/utils/date";
import { formatCurrency } from "src/utils/number";
import {
  DeliveryLifecycleRecord,
  populateDeliveryLifecycleRecordByVaa,
} from "src/utils/genericRelayerVaaUtils";
import { txType } from "src/consts";
import { Loader } from "src/components/atoms";

import Tabs from "./Tabs";
import Summary from "./Summary";
import Overview from "./Overview/index";
import Details from "./Details";
import RawData from "./RawData";
import RelayerOverview from "./RelayerOverview";

import "./styles.scss";

interface Props {
  VAAData: VAADetail & { vaa: any; decodedVaa: any };
  txData: GetTransactionsOutput;
}

const UNKNOWN_APP_ID = "UNKNOWN";

const Information = ({ VAAData, txData }: Props) => {
  const [showOverview, setShowOverview] = useState(true);
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
  const hasVAA = !vaa;

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
    payloadType,
    callerAppId,
    tokenChain: payloadTokenChain,
    tokenAddress: payloadTokenAddress,
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
  } = standardizedProperties || {};

  const { from: globalFrom, timestamp: globalFromTimestamp } = originTx || {};

  const {
    chainId: globalToChainId,
    from: globalTo,
    timestamp: globalToTimestamp,
    txHash: globalToRedeemTx,
  } = destinationTx || {};

  const fromChain = emitterChain || stdFromChain;
  const fromAddress = globalFrom || stdFromAddress;
  const toChain = stdToChain || globalToChainId;
  const toAddress = stdToAddress || globalTo;
  const startDate = timestamp || globalFromTimestamp;
  const endDate = globalToTimestamp;
  const tokenChain = stdTokenChain || payloadTokenChain;
  const tokenAddress = stdTokenAddress || payloadTokenAddress;
  const isUnknownApp = callerAppId === UNKNOWN_APP_ID || appIds?.includes(UNKNOWN_APP_ID);
  const isAttestation = txType[payloadType] === "Attestation";
  const isUnknownPayloadType = !txType[payloadType];

  const parsedOriginAddress = parseAddress({
    value: fromAddress,
    chainId: fromChain as ChainId,
  });
  const parsedEmitterAddress = parseAddress({
    value: emitterNativeAddress ? emitterNativeAddress : emitterAddress,
    chainId: emitterChain as ChainId,
  });
  const parsedDestinationAddress = parseAddress({
    value: toAddress,
    chainId: toChain as ChainId,
  });

  const parsedRedeemTx = parseTx({ value: globalToRedeemTx, chainId: toChain as ChainId });

  const amountSent = formatCurrency(Number(tokenAmount));
  const amountSentUSD = formatCurrency(Number(usdAmount));
  const redeemedAmount = formatCurrency(formatUnits(+amount - +fee));

  const originDateParsed = formatDate(startDate);
  const destinationDateParsed = formatDate(endDate);

  const overviewAndDetailProps = {
    amountSent,
    amountSentUSD,
    currentNetwork,
    destinationDateParsed,
    fee,
    fromChain,
    guardianSignaturesCount,
    hasVAA,
    isUnknownApp,
    originDateParsed,
    parsedDestinationAddress,
    parsedEmitterAddress,
    parsedOriginAddress,
    parsedRedeemTx,
    redeemedAmount,
    symbol,
    toChain,
    tokenAddress,
    tokenAmount,
    tokenChain,
    totalGuardiansNeeded,
    VAAId,
  };
  // --- x ---

  // --- Automatic Relayer Detection and handling ---
  const [genericRelayerInfo, setGenericRelayerInfo] = useState<DeliveryLifecycleRecord>(null);
  const [loadingRelayers, setLoadingRelayers] = useState(false);
  const getRelayerInfo = useCallback(async () => {
    setLoadingRelayers(true);
    populateDeliveryLifecycleRecordByVaa(environment, VAAData.vaa)
      .then((result: DeliveryLifecycleRecord) => {
        setLoadingRelayers(false);
        setGenericRelayerInfo(result);
      })
      .catch((e: any) => {
        setLoadingRelayers(false);
        console.error("automatic relayer tx errored:", e);
        setIsGenericRelayerTx(false);
      });
  }, [VAAData.vaa, environment]);

  const targetContract = environment.chainInfos.find(
    a => a.chainId === fromChain,
  )?.relayerContractAddress;

  const [isGenericRelayerTx, setIsGenericRelayerTx] = useState(
    targetContract?.toUpperCase() === parsedEmitterAddress?.toUpperCase(),
  );

  useEffect(() => {
    if (isGenericRelayerTx) {
      console.log("isGenericRelayerTx!!!");
      getRelayerInfo();
    }
  }, [getRelayerInfo, isGenericRelayerTx]);
  // --- x ---

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
        toChain={toChain}
        vaa={vaa}
      />

      {showOverview ? (
        isGenericRelayerTx ? (
          loadingRelayers ? (
            <Loader />
          ) : (
            <RelayerOverview VAAData={VAAData} lifecycleRecord={genericRelayerInfo} />
          )
        ) : showOverviewDetail ? (
          <Details {...overviewAndDetailProps} />
        ) : (
          <Overview
            {...overviewAndDetailProps}
            globalToRedeemTx={globalToRedeemTx}
            isAttestation={isAttestation}
            isUnknownPayloadType={isUnknownPayloadType}
          />
        )
      ) : isGenericRelayerTx && loadingRelayers ? (
        <Loader />
      ) : (
        <RawData lifecycleRecord={genericRelayerInfo} txData={txData} VAAData={VAAData} />
      )}
    </section>
  );
};

export { Information };
