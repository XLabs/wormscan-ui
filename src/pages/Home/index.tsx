import { useEffect } from "react";
import analytics from "src/analytics";
import { BaseLayout } from "src/layouts/BaseLayout";
import {
  CrossChainChart,
  ChainActivity,
  ProtocolsStats,
  WormholeStats,
} from "src/components/molecules";
import { TopAssets } from "./TopAssets";

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
