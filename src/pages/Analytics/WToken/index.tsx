import { useState, useMemo } from "react";
import { useQuery } from "react-query";
import { getClient } from "src/api/Client";
import { Summary } from "./Summary";
import { ByChain } from "./ByChain";
import { TransfersOverTime } from "./TransfersOverTime";
import { TopHolders } from "./TopHolders";
import { TopAddresses } from "./TopAddresses";
import "./styles.scss";

export type TimeRange = { label: string; value: string };
export type ByType = "notional" | "tx";

const WToken = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>({ label: "Last day", value: "1d" });
  const [by, setBy] = useState<ByType>("tx");

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

  return (
    <div>
      <Summary summary={summary} />
      <ByChain activityNotional={activityNotional} activityTx={activityTx} />
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
      <TopHolders topHolders={topHolders} />
      <TopAddresses topAddressesNotional={topAddressesNotional} topAddressesTx={topAddressesTx} />
    </div>
  );
};

export default WToken;
