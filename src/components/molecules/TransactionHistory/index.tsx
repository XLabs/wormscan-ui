import { useState } from "react";
import { ToggleGroup } from "src/components/atoms";
import { DateRange } from "src/api/guardian-network/types";
import { TransactionHistoryChart } from "..";
import { useEnvironment } from "src/context/EnvironmentContext";
import analytics from "src/analytics";
import "./styles.scss";

const RANGE_LIST = [
  { label: "1D", value: "day", ariaLabel: "One day" },
  { label: "1W", value: "week", ariaLabel: "One week" },
  { label: "1M", value: "month", ariaLabel: "One month" },
  //  TODO, uncomment when 3M data is available
  //  { label: "3M", value: "3-month", ariaLabel: "Three months" },
];

const TransactionHistory = () => {
  const { environment } = useEnvironment();
  const [selectedRange, setSelectedRange] = useState<DateRange>(RANGE_LIST[0].value as DateRange);

  return (
    <div className="tx-history">
      <div className="tx-history-options">
        <div className="tx-title">Transaction History</div>
        <ToggleGroup
          value={selectedRange}
          onValueChange={value => {
            analytics.track("transactionHistory", {
              selected: value,
              network: environment.network,
            });
            setSelectedRange(value);
          }}
          items={RANGE_LIST}
          ariaLabel="Select range"
          separatedOptions
        />
      </div>

      <TransactionHistoryChart range={selectedRange as DateRange} />
    </div>
  );
};

export default TransactionHistory;
