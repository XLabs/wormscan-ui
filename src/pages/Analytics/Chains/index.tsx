import { CrossChainChart } from "src/components/molecules";
import { ChainActivity } from "src/components/organisms";

const Chains = () => {
  return (
    <div>
      <ChainActivity />

      <CrossChainChart />
    </div>
  );
};

export default Chains;
