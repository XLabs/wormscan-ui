import { useQuery } from "react-query";
import { getClient } from "src/api/Client";
import { Loader } from "src/components/atoms";
import { WORMHOLE_PAGE_URL } from "src/consts";
import { ActivityIcon, LinkIcon } from "src/icons/generic";
import { getTokenIcon } from "src/utils/token";
import "./styles.scss";
import { formatNumber, numberToSuffix } from "src/utils/number";
import { Summary } from "./Summary";

const WToken = () => {
  const {
    data: topAddressesNotional,
    isError: isErrorTopAddressesNotional,
    isFetching: isFetchingTopAddressesNotional,
  } = useQuery(["getNttTopAddressNotional"], () =>
    getClient().nttApi.getNttTopAddress({
      by: "notional",
      symbol: "W",
    }),
  );

  const {
    data: topAddressesTx,
    isError: isErrorTopAddressesTx,
    isFetching: isFetchingTopAddressesTx,
  } = useQuery(["getNttTopAddressTx"], () =>
    getClient().nttApi.getNttTopAddress({
      by: "tx",
      symbol: "W",
    }),
  );

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
  } = useQuery("getActivityNotional", () =>
    getClient().nttApi.getNttActivity({
      by: "notional",
      symbol: "W",
    }),
  );

  const {
    data: activityTx,
    isError: isErrorActivityTx,
    isFetching: isFetchingActivityTx,
  } = useQuery("getActivityTx", () =>
    getClient().nttApi.getNttActivity({
      by: "tx",
      symbol: "W",
    }),
  );

  // const {
  //   data: transfersByTimeNotional,
  //   isError: isErrorTransfersByTimeNotional,
  //   isFetching: isFetchingTransfersByTimeNotional,
  // } = useQuery([
  //   "getTransferByTimeNotional",
  //   () =>
  //     getClient().nttApi.getNttTransferByTime({
  //       by: "notional",
  //       symbol: "W",
  //       from: "",
  //       timeSpan: "",
  //       to: "",
  //     }),
  // ]);

  // const {
  //   data: transfersByTimeTx,
  //   isError: isErrorTransfersByTimeTx,
  //   isFetching: isFetchingTransfersByTimeTx,
  // } = useQuery([
  //   "getTransferByTimeTx",
  //   () =>
  //     getClient().nttApi.getNttTransferByTime({
  //       by: "tx",
  //       symbol: "W",
  //       from: "",
  //       timeSpan: "",
  //       to: "",
  //     }),
  // ]);

  return (
    <div>
      <Summary summary={summary} />

      {/* {!!topAddressesNotional?.length && (
        <div>
          TOP ADDRESSES NOTIONAL
          {topAddressesNotional.map((topAddress, idx) => (
            <div key={idx}>{JSON.stringify(topAddress)}</div>
          ))}
        </div>
      )}

      {!!topAddressesTx?.length && (
        <div>
          TOP ADDRESSES TX
          {topAddressesTx.map((topAddress, idx) => (
            <div key={idx}>{JSON.stringify(topAddress)}</div>
          ))}
        </div>
      )} */}
    </div>
  );
};

export default WToken;
