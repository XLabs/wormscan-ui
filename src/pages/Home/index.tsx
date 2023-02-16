import { CrossChainChart, VAACountChart } from "src/components/molecules";
import { BaseLayout } from "src/layouts/BaseLayout";
import { Hero } from "./Hero";

type Props = {};

const Home = (props: Props) => {
  return (
    <BaseLayout>
      <Hero />
      <CrossChainChart />
      <VAACountChart />
    </BaseLayout>
  );
};

export { Home };
