import { useEffect } from "react";
import { BaseLayout } from "src/layouts/BaseLayout";
import { useParams } from "react-router-dom";
import analytics from "src/analytics";
import Chains from "./Chains";
import Tokens from "./Tokens";
import Protocols from "./Protocols";

const Analytics = () => {
  const { analyticsId } = useParams();

  useEffect(() => {
    analytics.page({ title: `ANALYTICS-${analyticsId.toUpperCase()}` });
  }, [analyticsId]);

  return (
    <BaseLayout>
      {analyticsId === "chains" && <Chains />}
      {analyticsId === "tokens" && <Tokens />}
      {analyticsId === "protocols" && <Protocols />}
    </BaseLayout>
  );
};

export default Analytics;
