import { useState, useMemo } from "react";
import { useQuery } from "react-query";
import { getClient } from "src/api/Client";
import { getGeckoTokenInfo } from "src/utils/cryptoToolkit";
import { chainToChainId } from "@wormhole-foundation/sdk";
import { Summary } from "./Summary";
import { ByChain } from "./ByChain";
import { TransfersOverTime } from "./TransfersOverTime";
import { TopHolders } from "./TopHolders";
import { TopAddresses } from "./TopAddresses";
import "./styles.scss";
import { ToggleGroup } from "src/components/atoms";
import Metrics from "./Metrics";
import { useWindowSize } from "src/utils/hooks";
import { NTT_APP_ID } from "src/consts";
import RecentTransactions from "./RecentTransactions";
import { Order } from "src/api";
import { GetOperationsOutput } from "src/api/guardian-network/types";

export type TimeRange = { label: string; value: string };
export type ByType = "notional" | "tx";

const WToken = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>({ label: "Last day", value: "1d" });
  const [by, setBy] = useState<ByType>("tx");

  const { width } = useWindowSize();
  const isSmallMobile = width && width < 550;

  const { startDate, endDate } = useMemo(() => {
    const end = new Date();
    const start = new Date(end);
    switch (timeRange.value) {
      case "1d":
        start.setDate(end.getDate() - 1);
        break;
      case "1w":
        start.setDate(end.getDate() - 7);
        break;
      case "1m":
        start.setMonth(end.getMonth() - 1);
        break;
      case "1y":
        start.setFullYear(end.getFullYear() - 1);
        break;
    }
    return { startDate: start, endDate: end };
  }, [timeRange]);

  const {
    data: recentTransactions,
    isError: isErrorRecentTransactions,
    isFetching: isFetchingRecentTransactions,
  } = useQuery("getRecentTransactions", async () => {
    let page = 0;
    let transactions: GetOperationsOutput[] = [];

    while (transactions.length < 7) {
      const data = await getClient().guardianNetwork.getOperations({
        appId: NTT_APP_ID,
        pagination: {
          pageSize: 50,
          sortOrder: Order.DESC,
          page,
        },
      });

      transactions = [...transactions, ...data.filter(operation => operation.data?.symbol === "W")];
      if (page > 10) break;
      page++;
    }

    return transactions.slice(0, 7);
  });

  const {
    data: wTokenPrice,
    isError: isErrorWTokenPrice,
    isFetching: isFetchingWTokenPrice,
  } = useQuery(["getWTokenInfo"], async () => {
    const data = await getGeckoTokenInfo(
      "85VBFQZC9TZkfaptBWjvUw7YbZjy52A6mjtPGjstQAmQ",
      chainToChainId("Solana"),
    );
    if (!data || !data.attributes?.price_usd) return null;
    return data.attributes.price_usd;
  });

  const {
    data: transfersByTime,
    isError: isErrorTransfersByTime,
    isFetching: isFetchingTransfersByTime,
  } = useQuery(
    ["getTransferByTimeTx", startDate, endDate, by],
    async () => {
      const timeSpan = timeRange.value === "1d" ? "1h" : timeRange.value === "1y" ? "1mo" : "1d";
      return {
        data: await getClient().nttApi.getNttTransferByTime({
          by,
          symbol: "W",
          from: startDate.toISOString(),
          timeSpan,
          to: endDate.toISOString(),
        }),
        timeSpan,
      };
    },
    { refetchOnWindowFocus: false },
  );

  const { data: summary } = useQuery(["getSummary"], () =>
    getClient().nttApi.getNttSummary({
      symbol: "W",
    }),
  );

  const { data: activityTx } = useQuery("getActivityTx", async () => {
    const activity = await getClient().nttApi.getNttActivity({
      by: "tx",
      symbol: "W",
    });
    activity.sort((a, b) => (+a.value < +b.value ? 1 : -1));

    return activity;
  });

  const { data: activityNotional } = useQuery("getActivityNotional", async () => {
    const activity = await getClient().nttApi.getNttActivity({
      by: "notional",
      symbol: "W",
    });
    activity.sort((a, b) => (+a.value < +b.value ? 1 : -1));

    return activity;
  });

  const { data: topHolders } = useQuery("getTopHolders", async () => {
    const data = await getClient().nttApi.getNttTopHolder({
      symbol: "W",
    });
    return data;
  });

  const { data: topAddressesNotional } = useQuery(["getNttTopAddressNotional"], async () => {
    const data = await getClient().nttApi.getNttTopAddress({
      by: "notional",
      symbol: "W",
    });
    data.sort((a, b) => (+a.value < +b.value ? 1 : -1));
    return data;
  });

  const { data: topAddressesTx } = useQuery(["getNttTopAddressTx"], async () => {
    const data = await getClient().nttApi.getNttTopAddress({
      by: "tx",
      symbol: "W",
    });
    data.sort((a, b) => (+a.value < +b.value ? 1 : -1));
    return data;
  });

  const [activeView, setActiveView] = useState("general-info");

  return (
    <div>
      <Summary
        wTokenPrice={wTokenPrice}
        isErrorWTokenPrice={isErrorWTokenPrice}
        isFetchingWTokenPrice={isFetchingWTokenPrice}
      />

      <div className="tabs">
        <ToggleGroup
          ariaLabel="Select W Token data view"
          className="tabs-toggle-group"
          items={[
            { label: isSmallMobile ? "Info" : "General Information", value: "general-info" },
            { label: isSmallMobile ? "Transfers" : "Top Transfers", value: "top-transfers" },
            { label: isSmallMobile ? "Holders" : "Top Holders", value: "top-holders" },
            { label: isSmallMobile ? "Addresses" : "Top Addresses", value: "top-addresses" },
          ]}
          onValueChange={value => {
            setActiveView(value);
          }}
          value={activeView}
        />
      </div>

      {activeView === "general-info" && (
        <>
          <Metrics summary={summary} />
          <TransfersOverTime
            transfers={transfersByTime?.data}
            isLoading={isFetchingTransfersByTime}
            isError={isErrorTransfersByTime}
            timeSpan={transfersByTime?.timeSpan || "1d"}
            setTimeRange={value => setTimeRange(value)}
            timeRange={timeRange}
            by={by}
            setBy={setBy}
          />
          <RecentTransactions
            isError={isErrorRecentTransactions}
            isLoading={isFetchingRecentTransactions}
            recentTransactions={recentTransactions}
          />
        </>
      )}

      {activeView === "top-transfers" && (
        <ByChain activityNotional={activityNotional} activityTx={activityTx} />
      )}
      {activeView === "top-holders" && <TopHolders topHolders={topHolders} />}
      {activeView === "top-addresses" && (
        <TopAddresses topAddressesNotional={topAddressesNotional} topAddressesTx={topAddressesTx} />
      )}
    </div>
  );
};

export default WToken;
