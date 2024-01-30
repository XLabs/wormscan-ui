import { PortalStats, TransactionHistory, WormholeStats } from "src/components/molecules";
import { useQuery } from "react-query";
import { getClient } from "src/api/Client";
import "./styles.scss";

const Statistics = () => {
  const {
    isLoading,
    isError,
    data: scoreData,
  } = useQuery("scoresResponse", () => getClient().guardianNetwork.getScores());

  const { "24h_messages": messages24h, total_volume, "24h_volume": volume24h } = scoreData || {};

  return (
    <section className="home-statistics">
      <div>
        <WormholeStats isError={isError} isLoading={isLoading} messages24h={messages24h} />
      </div>
      <div>
        <PortalStats
          isError={isError}
          isLoading={isLoading}
          total_volume={total_volume}
          volume24h={volume24h}
        />
        <TransactionHistory />
      </div>
    </section>
  );
};

export { Statistics };
