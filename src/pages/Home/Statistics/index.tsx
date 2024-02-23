import { ProtocolsStats, TransactionHistory, WormholeStats } from "src/components/molecules";
import "./styles.scss";

const Statistics = () => {
  return (
    <section className="home-statistics">
      <div>
        <WormholeStats />
      </div>
      <div>
        <ProtocolsStats />
        <TransactionHistory />
      </div>
    </section>
  );
};

export { Statistics };
