import "./styles.scss";

import RelayerLayout from "./layouts/RelayerLayout";
import ContractStates from "./components/ContractStatusViewer";

const RelayerDashboard = () => {
  return (
    <RelayerLayout>
      <ContractStates />
    </RelayerLayout>
  );
};

export default RelayerDashboard;
