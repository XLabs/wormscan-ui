import { useEnvironment } from "src/context/EnvironmentContext";
import { ProtocolsStats, TransactionHistory, WormholeStats } from "src/components/molecules";
import "./styles.scss";

const Statistics = () => {
  const { environment } = useEnvironment();
  const isMainnet = environment.network === "MAINNET";

  return (
    <section className={`home-statistics ${isMainnet ? "" : "home-statistics-testnet"}`}>
      <WormholeStats />

      {isMainnet && <ProtocolsStats />}
      <TransactionHistory />
    </section>
  );
};

export { Statistics };
