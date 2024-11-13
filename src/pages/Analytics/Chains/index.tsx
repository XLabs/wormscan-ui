import { useEffect } from "react";
import analytics from "src/analytics";
import { BaseLayout } from "src/layouts/BaseLayout";
import { CrossChainChart } from "src/components/molecules";
import { ChainActivity } from "src/components/organisms";

const Chains = () => {
  useEffect(() => {
    analytics.page({ title: `ANALYTICS-CHAINS` });
  }, []);

  return (
    <BaseLayout>
      <div>
        <ChainActivity />

        <CrossChainChart />
      </div>
    </BaseLayout>
  );
};

export default Chains;
