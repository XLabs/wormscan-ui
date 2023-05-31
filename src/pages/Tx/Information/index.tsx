import { Tabs } from "src/components/organisms";
import i18n from "src/i18n";
import Overview from "./Overview/index";

import { GlobalTxOutput, VAADetail } from "@xlabs-libs/wormscan-sdk";
import { minutesBetweenDates } from "src/utils/date";
import Summary from "./Summary";
import "./styles.scss";
import RawData from "./RawData";

const TX_TAB_HEADERS = [
  i18n.t("common.overview").toUpperCase(),
  i18n.t("common.rawData").toUpperCase(),
];

interface Props {
  VAAData: Omit<VAADetail, "vaa"> & { vaa: any };
  globalTxData: GlobalTxOutput;
}

const Information = ({ VAAData, globalTxData }: Props) => {
  const { payload } = VAAData || {};
  const { fee } = payload || {};
  const { originTx, destinationTx } = globalTxData || {};
  const { chainId: originChainId, timestamp: originTimestamp } = originTx || {};
  const { chainId: destinationChainId, timestamp: destinationTimestamp } = destinationTx || {};
  const transactionTimeInMinutes = minutesBetweenDates(
    new Date(originTimestamp),
    new Date(destinationTimestamp),
  );

  return (
    <section className="tx-information">
      <Tabs
        headers={TX_TAB_HEADERS}
        contents={[
          <>
            <Summary
              transactionTimeInMinutes={transactionTimeInMinutes}
              fee={fee}
              originChainId={originChainId}
              destinationChainId={destinationChainId}
            />
            <Overview VAAData={VAAData} globalTxData={globalTxData} />
          </>,
          <>
            <Summary
              transactionTimeInMinutes={transactionTimeInMinutes}
              fee={fee}
              originChainId={originChainId}
              destinationChainId={destinationChainId}
            />
            <RawData VAAData={VAAData} />
          </>,
        ]}
      />
    </section>
  );
};

export { Information };
