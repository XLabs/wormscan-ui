import { useState } from "react";
import client from "src/api/Client";
import { Chart } from "./Chart";
import { useQuery } from "react-query";
import { Loader } from "src/components/atoms";
import i18n from "src/i18n";
import { useTranslation } from "react-i18next";
import "./styles.scss";

const mockedResponse = {
  txs: [41, 26, 99, 24, 49, 32, 80, 24, 59, 18, 50, 63],
};

const RANGES_LIST = [
  { label: "1D", value: "1D", ariaLabel: "one day" },
  { label: "1W", value: "1W", ariaLabel: "one week" },
  { label: "1M", value: "1M", ariaLabel: "one month" },
];

const TransactionHistoryChart = () => {
  const { t } = useTranslation();
  const [selectedRange, setSelectedRange] = useState(RANGES_LIST[0].value);

  const { isLoading, error, data } = useQuery("crossChainResponse", () =>
    client.guardianNetwork.getCrossChainActivity(),
  );

  if (error) return null;
  return (
    <div className="trans-history">
      {isLoading ? (
        <div className="trans-history-loader">
          <Loader />
        </div>
      ) : (
        <Chart data={mockedResponse.txs} /* data={data} */ />
      )}
    </div>
  );
};

export default TransactionHistoryChart;
