import { useCallback } from "react";
import { Tabs } from "src/components/organisms";
import i18n from "src/i18n";
import Overview from "./Overview/index";
import { GetTransactionsOutput, VAADetail } from "@xlabs-libs/wormscan-sdk";
import { minutesBetweenDates } from "src/utils/date";
import Summary from "./Summary";
import RawData from "./RawData";

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
  const { timestamp, symbol, emitterChain, standardizedProperties, globalTx, payload } =
    txData || {};

  const { payloadType } = payload || {};
  const { originTx, destinationTx } = globalTx || {};

  const {
    fromChain: stdFromChain,
    toChain: stdToChain,
    fee: stdFee,
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
  const fee = stdFee;
  const transactionTimeInMinutes = globalToRedeemTx
    ? minutesBetweenDates(new Date(startDate), new Date(endDate))
    : undefined;

  const TopSummary = useCallback(() => {
    return (
      <Summary
        startDate={startDate}
        transactionTimeInMinutes={transactionTimeInMinutes}
        fee={fee}
        symbol={symbol}
        originChainId={fromChain}
        destinationChainId={toChain}
        payloadType={payloadType}
      />
    );
  }, [toChain, fromChain, fee, symbol, transactionTimeInMinutes, payloadType, startDate]);

  return (
    <section className="tx-information">
      <Tabs
        headers={TX_TAB_HEADERS}
        contents={[
          <>
            <TopSummary />
            <Overview VAAData={VAAData} txData={txData} />
          </>,
          <>
            <TopSummary />
            <RawData VAAData={VAAData} />
          </>,
        ]}
      />
    </section>
  );
};

export { Information };
