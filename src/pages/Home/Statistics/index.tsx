import { ScoreCard, TransactionHistory } from "src/components/molecules";
import "./styles.scss";

const RANGE_LIST = [
  { label: "1D", value: "day", ariaLabel: "One day" },
  { label: "1W", value: "week", ariaLabel: "One week" },
  { label: "1M", value: "month", ariaLabel: "One month" },
];

const Statistics = () => {
  return (
    <section className="home-statistics" data-testid="home-transaction-history-card">
      <TransactionHistory />
      <ScoreCard />
    </section>
  );
};

export { Statistics };
