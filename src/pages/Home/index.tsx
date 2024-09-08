import { useEffect } from "react";
import analytics from "src/analytics";
import { BaseLayout } from "src/layouts/BaseLayout";
import { CrossChainChart, ProtocolsStats, WormholeStats } from "src/components/molecules";
import { TokenActivity } from "src/components/organisms";

const Home = () => {
  useEffect(() => {
    analytics.page({ title: "HOME" });
  }, []);

  return (
    <BaseLayout>
      <WormholeStats />
      <CrossChainChart />
      <ProtocolsStats numberOfProtocols={5} />
      <TokenActivity isHomePage />
    </BaseLayout>
  );
};

export default Home;
