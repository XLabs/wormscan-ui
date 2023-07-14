import { useSearchParams } from "react-router-dom";
import { isOfTypeNetwork } from "src/api/Client";
import Header from "../../components/Header";
import { NETWORK } from "../../../../types";

import { LoggerProvider } from "../../context/LoggerContext";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../../theme";
import { ContractStateProvider } from "../../context/ContractStateContext";
import { EthereumProviderProvider } from "../../context/EthereumProviderContext";
import { EnvironmentProvider } from "../../context/EnvironmentContext";

type Props = {
  children: React.ReactNode;
};

const RelayerLayout = ({ children }: Props) => {
  //TODO persisted log watcher object

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <EnvironmentProvider>
        <LoggerProvider>
          <EthereumProviderProvider>
            <ContractStateProvider>
              <Header />
              <div className="main-content">{children}</div>
            </ContractStateProvider>
          </EthereumProviderProvider>
        </LoggerProvider>
      </EnvironmentProvider>
    </ThemeProvider>
  );
};

export default RelayerLayout;
