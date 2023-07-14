import "./styles.scss";

import ContractStateInternals from "./views/contractStateInternals";
import RelayerLayout from "./layouts/RelayerLayout";

const RelayerDashboard = () => {
  return (
    <RelayerLayout>
      <div className="relayer-dashboard">
        <ContractStateInternals />
      </div>
    </RelayerLayout>
  );
};

export default RelayerDashboard;
