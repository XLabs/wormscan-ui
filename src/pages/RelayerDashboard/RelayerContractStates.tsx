import "./styles.scss";

import ContractStates from "./components/ContractStatusViewer";

import DeliveryStatus from "src/pages/RelayerDashboard/components/DeliveryStatus";
import Header from "src/pages/RelayerDashboard/components/Header";
import { LoggerProvider } from "src/pages/RelayerDashboard/context/LoggerContext";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import theme from "src/pages/RelayerDashboard/theme";
import { ContractStateProvider } from "src/pages/RelayerDashboard/context/ContractStateContext";
import { EthereumProviderProvider } from "src/pages/RelayerDashboard/context/EthereumProviderContext";
import { EnvironmentProvider } from "src/pages/RelayerDashboard/context/EnvironmentContext";

const RelayerDashboard = () => {
  //TODO persisted log watcher object

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <EnvironmentProvider>
        <LoggerProvider>
          <EthereumProviderProvider>
            <ContractStateProvider>
              <Header page="contracts" />
              <div className="main-content">
                <div className="relayer-dashboard">
                  <ContractStates />
                </div>
              </div>
            </ContractStateProvider>
          </EthereumProviderProvider>
        </LoggerProvider>
      </EnvironmentProvider>
    </ThemeProvider>
  );
};

export default RelayerDashboard;
