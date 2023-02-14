import { CrossChainChart, VAACountChart } from "src/components/molecules";
import { BaseLayout } from "src/layouts/BaseLayout";

type Props = {};

const Home = (props: Props) => {
  return (
    <BaseLayout>
      <CrossChainChart />
      <VAACountChart />
    </BaseLayout>
  );
};

export { Home };
