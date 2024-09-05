import { useQuery } from "react-query";
import { getClient } from "src/api/Client";
import { Summary } from "./Summary";
import { ByChain } from "./ByChain";
import "./styles.scss";

const WToken = () => {
  // const {
  //   data: topAddressesNotional,
  //   isError: isErrorTopAddressesNotional,
  //   isFetching: isFetchingTopAddressesNotional,
  // } = useQuery(["getNttTopAddressNotional"], () =>
  //   getClient().nttApi.getNttTopAddress({
  //     by: "notional",
  //     symbol: "W",
  //   }),
  // );

  // const {
  //   data: topAddressesTx,
  //   isError: isErrorTopAddressesTx,
  //   isFetching: isFetchingTopAddressesTx,
  // } = useQuery(["getNttTopAddressTx"], () =>
  //   getClient().nttApi.getNttTopAddress({
  //     by: "tx",
  //     symbol: "W",
  //   }),
  // );

  const {
    data: summary,
    isError: isErrorSummary,
    isFetching: isFetchingSummary,
  } = useQuery(["getSummary"], () =>
    getClient().nttApi.getNttSummary({
      symbol: "W",
    }),
  );

  const {
    data: activityNotional,
    isError: isErrorActivityNotional,
    isFetching: isFetchingActivityNotional,
  } = useQuery("getActivityNotional", async () => {
    const activity = await getClient().nttApi.getNttActivity({
      by: "notional",
      symbol: "W",
    });
    activity.sort((a, b) => (+a.value < +b.value ? 1 : -1));

    return activity;
  });

  const {
    data: activityTx,
    isError: isErrorActivityTx,
    isFetching: isFetchingActivityTx,
  } = useQuery("getActivityTx", async () => {
    const activity = await getClient().nttApi.getNttActivity({
      by: "tx",
      symbol: "W",
    });
    activity.sort((a, b) => (+a.value < +b.value ? 1 : -1));

    return activity;
  });

  const TODAY = new Date();
  const LAST_WEEK = new Date();
  LAST_WEEK.setDate(TODAY.getDate() - 7);

  const {
    data: transfersByTimeNotional,
    isError: isErrorTransfersByTimeNotional,
    isFetching: isFetchingTransfersByTimeNotional,
  } = useQuery("getTransferByTimeNotional", () =>
    getClient().nttApi.getNttTransferByTime({
      by: "notional",
      symbol: "W",
      from: LAST_WEEK.toISOString(),
      timeSpan: "1d",
      to: TODAY.toISOString(),
    }),
  );

  // const {
  //   data: transfersByTimeTx,
  //   isError: isErrorTransfersByTimeTx,
  //   isFetching: isFetchingTransfersByTimeTx,
  // } = useQuery("getTransferByTimeTx", () =>
  //   getClient().nttApi.getNttTransferByTime({
  //     by: "tx",
  //     symbol: "W",
  //     from: LAST_WEEK.toISOString(),
  //     timeSpan: "1d",
  //     to: TODAY.toISOString(),
  //   }),
  // );

  return (
    <div>
      <Summary summary={summary} />
      <ByChain activityNotional={activityNotional} activityTx={activityTx} />
    </div>
  );
};

export default WToken;
