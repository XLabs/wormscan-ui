import { useEffect } from "react";
import analytics from "src/analytics";
import { BaseLayout } from "src/layouts/BaseLayout";
import {
  CrossChainChart,
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
      <TopAssets />
    </BaseLayout>
  );
};

export default Home;
