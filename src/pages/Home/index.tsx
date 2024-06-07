import { useEffect } from "react";
import analytics from "src/analytics";
import { BaseLayout } from "src/layouts/BaseLayout";
import {
  CrossChainChart,
  ChainActivity,
  ProtocolsStats,
  WormholeStats,
  TopAssets,
} from "src/components/molecules";

const Home = () => {
  useEffect(() => {
    analytics.page({ title: "HOME" });
  }, []);

  return (
    <BaseLayout>
      <WormholeStats />
      <CrossChainChart />
      <ProtocolsStats />
      <ChainActivity />
      <TopAssets />
    </BaseLayout>
  );
};

export default Home;
