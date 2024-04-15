import { useEffect } from "react";
import analytics from "src/analytics";
import { BaseLayout } from "src/layouts/BaseLayout";
import { CrossChainChart } from "src/components/molecules";
import { Statistics } from "./Statistics";
import { TopAssets } from "./TopAssets";

const Home = () => {
  useEffect(() => {
    analytics.page({ title: "HOME" });
  }, []);

  return (
    <BaseLayout>
      <Statistics />
      <CrossChainChart />
      <TopAssets />
    </BaseLayout>
  );
};

export default Home;
