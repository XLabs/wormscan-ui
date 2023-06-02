import { useMemo } from "react";
import { Tabs } from "src/components/organisms";
import i18n from "src/i18n";
import Overview from "./Overview/index";
import { GlobalTxOutput, VAADetail } from "@xlabs-libs/wormscan-sdk";
import { minutesBetweenDates } from "src/utils/date";
import Summary from "./Summary";
import RawData from "./RawData";
import "./styles.scss";

const TX_TAB_HEADERS = [
  i18n.t("common.overview").toUpperCase(),
  i18n.t("common.rawData").toUpperCase(),
];

export type TxStatus = "SUCCESSFUL" | "ONGOING" | "FAILED";
interface Props {
  VAAData: Omit<VAADetail, "vaa"> & { vaa: any };
  globalTxData: GlobalTxOutput;
}

export const colorStatus = {
  SUCCESSFUL: "green",
  ONGOING: "orange",
  FAILED: "red",
};

const getTxStatus = (originStatus: string, destinationStatus: string) => {
  if (!Boolean(destinationStatus)) {
    return "ONGOING";
  }

  if (
    originStatus === "confirmed" &&
    (destinationStatus === "failed" || destinationStatus === "unknown")
  ) {
    return "FAILED";
  }

  return "SUCCESSFUL";
};

const Information = ({ VAAData, globalTxData }: Props) => {
  const { payload } = VAAData || {};
  const { fee } = payload || {};
  const { originTx, destinationTx } = globalTxData || {};
  const {
    chainId: originChainId,
    timestamp: originTimestamp,
    status: originStatus,
  } = originTx || {};
  const {
    chainId: destinationChainId,
    timestamp: destinationTimestamp,
    status: destinationStatus,
  } = destinationTx || {};
  const transactionTimeInMinutes = minutesBetweenDates(
    new Date(originTimestamp),
    new Date(destinationTimestamp),
  );

  const TopSummary = () =>
    useMemo(() => {
      return (
        <Summary
          transactionTimeInMinutes={transactionTimeInMinutes}
          fee={fee}
          originChainId={originChainId}
          destinationChainId={destinationChainId}
          summaryStatus={getTxStatus(originStatus, destinationStatus)}
        />
      );
    }, []);

  return (
    <section className="tx-information">
      <Tabs
        headers={TX_TAB_HEADERS}
        contents={[
          <>
            <TopSummary />
            <Overview
              VAAData={VAAData}
              globalTxData={globalTxData}
              txStatus={getTxStatus(originStatus, destinationStatus)}
            />
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
