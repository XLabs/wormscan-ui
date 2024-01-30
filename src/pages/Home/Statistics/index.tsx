import { PortalStats, TransactionHistory, WormholeStats } from "src/components/molecules";
import "./styles.scss";

const Statistics = () => {
  return (
    <section className="home-statistics">
      <div>
        <WormholeStats />
      </div>
      <div>
        <PortalStats />
        <TransactionHistory />
      </div>
    </section>
  );
};

export { Statistics };
