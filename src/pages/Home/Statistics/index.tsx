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

  const {
    "24h_messages": messages24h,
    "24h_volume": volume24h,
    total_messages,
    total_volume,
  } = scoreData || {};

  return (
    <section className="home-statistics">
      <div>
        <WormholeStats
          isError={isError}
          isLoading={isLoading}
          messages24h={messages24h}
          total_messages={total_messages}
        />
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
