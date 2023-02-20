import { CrossChainChart, VAACountChart } from "src/components/molecules";
import { BaseLayout } from "src/layouts/BaseLayout";
import { Hero } from "./Hero";
import { JoinUs } from "./JoinUs/JoinUs";

type Props = {};

const Home = (props: Props) => {
  return (
    <BaseLayout>
      <Hero />
      <CrossChainChart />
      <VAACountChart />
      <JoinUs />
    </BaseLayout>
  );
};

export { Home };
