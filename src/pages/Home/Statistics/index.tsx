import { useState } from "react";
import { ToggleGroup } from "src/components/atoms";
import { TransactionHistoryChart } from "src/components/molecules";
import { DateRange } from "@xlabs-libs/wormscan-sdk";
import ScoreCard from "src/components/molecules/ScoreCard";
import "./styles.scss";

const RANGE_LIST = [
  { label: "1D", value: "day", ariaLabel: "One day" },
  { label: "1W", value: "week", ariaLabel: "One week" },
  { label: "1M", value: "month", ariaLabel: "One month" },
];

const Statistics = () => {
  const [selectedRange, setSelectedRange] = useState<DateRange>(RANGE_LIST[0].value as DateRange);

  return (
    <section className="home-statistics" data-testid="home-transaction-history-card">
      {/* TODO: I think this should be a whole component */}
      <div className="home-statistics-history">
        <div className="home-statistics-history-options">
          <div className="home-statistics-title">Transaction History</div>
          <ToggleGroup
            value={selectedRange}
            onValueChange={setSelectedRange}
            items={RANGE_LIST}
            ariaLabel="Select range"
            separatedOptions
          />
        </div>

        <TransactionHistoryChart range={selectedRange as DateRange} />
      </div>
      {/*  */}
      <ScoreCard />
    </section>
  );
};

export { Statistics };
