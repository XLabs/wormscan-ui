import { CrossChainChart, JoinUs } from "src/components/molecules";
import { BaseLayout } from "src/layouts/BaseLayout";
import { Statistics } from "./Statistics";
import { TopLists } from "./TopLists";
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
      <TopLists />
      <JoinUs />
    </BaseLayout>
  );
};

export default Home;
