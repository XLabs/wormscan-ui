import { useCallback, useEffect, useState } from "react";
import { Loader } from "src/components/atoms";
import { Tabs } from "src/components/organisms";
import { GetTransactionsOutput, VAADetail } from "@xlabs-libs/wormscan-sdk";
import { minutesBetweenDates } from "src/utils/date";

import i18n from "src/i18n";
import Overview from "./Overview/index";
import Summary from "./Summary";
import RawData from "./RawData";

import { useEnvironment } from "src/context/EnvironmentContext";
import { parseAddress } from "src/utils/crypto";
import { ChainId } from "@certusone/wormhole-sdk";
import RelayerOverview from "./RelayerOverview";
import {
  DeliveryLifecycleRecord,
  populateDeliveryLifecycleRecordByVaa,
} from "src/utils/genericRelayerVaaUtils";
import "./styles.scss";

const TX_TAB_HEADERS = [
  i18n.t("common.overview").toUpperCase(),
  i18n.t("common.rawData").toUpperCase(),
];

interface Props {
  VAAData: VAADetail & { vaa: any; decodedVaa: any };
  txData: GetTransactionsOutput;
}

const Information = ({ VAAData, txData }: Props) => {
  const { environment } = useEnvironment();
  const { timestamp, symbol, emitterChain, standardizedProperties, globalTx, payload } =
    txData || {};

  const { payloadType } = payload || {};
  const { originTx, destinationTx } = globalTx || {};

  const {
    fromChain: stdFromChain,
    toChain: stdToChain,
    fee,
    appIds,
  } = standardizedProperties || {};

  const { chainId: globalFromChainId, timestamp: globalFromTimestamp } = originTx || {};

  const {
    chainId: globalToChainId,
    timestamp: globalToTimestamp,
    txHash: globalToRedeemTx,
  } = destinationTx || {};

  const fromChain = stdFromChain || globalFromChainId || emitterChain;
  const toChain = stdToChain || globalToChainId;
  const startDate = timestamp || globalFromTimestamp;
  const endDate = globalToTimestamp;

  const transactionTimeInMinutes = globalToRedeemTx
    ? minutesBetweenDates(new Date(startDate), new Date(endDate))
    : undefined;

  const TopSummary = useCallback(() => {
    return (
      <Summary
        startDate={startDate}
        transactionTimeInMinutes={transactionTimeInMinutes}
        fee={fee}
        appIds={appIds}
        symbol={symbol}
        originChainId={fromChain}
        destinationChainId={toChain}
        payloadType={payloadType}
      />
    );
  }, [toChain, fromChain, fee, appIds, symbol, transactionTimeInMinutes, payloadType, startDate]);

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

  const parsedEmitterAddress = parseAddress({
    value: txData?.emitterAddress,
    chainId: txData?.emitterChain as ChainId,
  });

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
        headers={TX_TAB_HEADERS}
        contents={[
          <>
            <TopSummary />
            {isGenericRelayerTx ? (
              <>
                {loadingRelayers ? (
                  <Loader />
                ) : (
                  <RelayerOverview VAAData={VAAData} lifecycleRecord={genericRelayerInfo} />
                )}
              </>
            ) : (
              <Overview VAAData={VAAData} txData={txData} />
            )}
          </>,
          <>
            <TopSummary />
            {isGenericRelayerTx && loadingRelayers ? (
              <Loader />
            ) : (
              <RawData lifecycleRecord={genericRelayerInfo} VAAData={VAAData} />
            )}
          </>,
        ]}
      />
    </section>
  );
};

export { Information };
