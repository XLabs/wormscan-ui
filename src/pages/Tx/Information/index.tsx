import { useCallback } from "react";
import { Tabs } from "src/components/organisms";
import i18n from "src/i18n";
import Overview from "./Overview/index";
import { GlobalTxOutput, VAADetail } from "@xlabs-libs/wormscan-sdk";
import { minutesBetweenDates } from "src/utils/date";
import Summary from "./Summary";
import RawData from "./RawData";
import { useGetTokenData } from "src/utils/hooks/useGetTokenData";
import { useGetTokenPrice } from "src/utils/hooks/useGetTokenPrice";
import "./styles.scss";

const TX_TAB_HEADERS = [
  i18n.t("common.overview").toUpperCase(),
  i18n.t("common.rawData").toUpperCase(),
];

interface Props {
  VAAData: Omit<VAADetail, "vaa"> & { vaa: any };
  globalTxData: GlobalTxOutput;
}

const getTxStatus = (originStatus: string, destinationStatus: string) => {
  if (!destinationStatus) {
    return "ONGOING";
  }

  if (
    originStatus === "confirmed" &&
    (destinationStatus === "failed" || destinationStatus === "unknown")
  ) {
    return "FAILED";
  }

  return "COMPLETED";
};

const Information = ({ VAAData, globalTxData }: Props) => {
  const { payload } = VAAData || {};
  const { fee, tokenAddress, tokenChain, toChain, payloadType } = payload || {};
  const { originTx, destinationTx } = globalTxData || {};
  const {
    chainId: originChainId,
    timestamp: originTimestamp,
    status: originStatus,
  } = originTx || {};
  const {
    timestamp: destinationTimestamp,
    status: destinationStatus,
    txHash: redeemTx,
  } = destinationTx || {};
  const transactionTimeInMinutes = redeemTx
    ? minutesBetweenDates(new Date(originTimestamp), new Date(destinationTimestamp))
    : undefined;

  const tokenDataResponse = useGetTokenData({
    tokenChain,
    tokenAddress,
  });
  const { tokenData } = tokenDataResponse || {};
  const { coingeckoId } = tokenData || {};
  // dd-mm-yyyy === "es"
  const formattedOriginTimeStamp = new Date(originTimestamp)
    .toLocaleString("es", {
      year: "numeric",
      month: "2-digit",
      day: "numeric",
    })
    .replaceAll("/", "-");

  const tokenPriceResponse = useGetTokenPrice({
    coingeckoId,
    date: formattedOriginTimeStamp,
  });

  const TopSummary = useCallback(() => {
    return (
      <Summary
        transactionTimeInMinutes={transactionTimeInMinutes}
        fee={fee}
        originChainId={originChainId}
        destinationChainId={toChain}
        summaryStatus={getTxStatus(originStatus, destinationStatus)}
        tokenDataResponse={tokenDataResponse}
        payloadType={payloadType}
      />
    );
  }, [
    toChain,
    fee,
    originChainId,
    originStatus,
    destinationStatus,
    transactionTimeInMinutes,
    tokenDataResponse,
    payloadType,
  ]);

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
              tokenDataResponse={tokenDataResponse}
              tokenPriceResponse={tokenPriceResponse}
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
