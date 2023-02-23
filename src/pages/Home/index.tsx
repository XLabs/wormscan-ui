import { ChainId } from "@xlabs-libs/wormscan-sdk";
import { BlockchainIcon } from "src/components/atoms";
import { CrossChainChart, VAACountChart } from "src/components/molecules";
import { BaseLayout } from "src/layouts/BaseLayout";
import { Hero } from "./Hero";
import { JoinUs } from "./JoinUs";
import { Statistics } from "./Statistics";

const Home = () => {
  return (
    <BaseLayout>
      <Hero />
      <Statistics />
      <CrossChainChart />
      <VAACountChart />
      <JoinUs />
    </BaseLayout>
  );
};

export { Home };
