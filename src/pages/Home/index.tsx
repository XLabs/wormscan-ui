import { CrossChainChart, JoinUs } from "src/components/molecules";
import { BaseLayout } from "src/layouts/BaseLayout";
import { Statistics } from "./Statistics";
import { TopAssets } from "./TopAssets";
import { useEffect } from "react";
import analytics from "src/analytics";

const Home = () => {
  useEffect(() => {
    analytics.page({ title: "HOME" });
  }, []);

  return (
    <BaseLayout>
      <Statistics />
      <CrossChainChart />
      <TopAssets />
      <JoinUs />
    </BaseLayout>
  );
};

export default Home;
