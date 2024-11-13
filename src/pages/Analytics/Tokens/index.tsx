import { useEffect } from "react";
import analytics from "src/analytics";
import { BaseLayout } from "src/layouts/BaseLayout";
import { TopAssets } from "src/components/molecules";
import { TokenActivity } from "src/components/organisms";
import "./styles.scss";

const Tokens = () => {
  useEffect(() => {
    analytics.page({ title: `ANALYTICS-TOKENS` });
  }, []);

  return (
    <BaseLayout>
      <div className="tokens-page">
        <TokenActivity />

        <TopAssets />
      </div>
    </BaseLayout>
  );
};

export default Tokens;
