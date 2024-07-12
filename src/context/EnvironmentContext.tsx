import React, { ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Environment, testnetEnv, mainnetEnv } from "src/utils/environment";
import { changeClientNetwork } from "src/api/Client";
import { Network } from "@wormhole-foundation/sdk";

interface EnvironmentContext {
  environment: Environment;
  setEnvironment: (env: Network) => void;
}

const EnvironmentProviderContext = React.createContext<EnvironmentContext>({
  environment: testnetEnv,
  setEnvironment: () => {},
});

export const EnvironmentProvider = ({ children }: { children: ReactNode }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const networkParam = searchParams.get("network");
  const [currentEnv, setCurrentEnv] = useState<Environment>(
    networkParam === "Testnet" ? testnetEnv : mainnetEnv,
  );
  const [clearChildren, setClearChildren] = useState<boolean>(true);

  const setEnvironment = useCallback(
    (env: Network) => {
      if (env === "Testnet") {
        setSearchParams(prev => {
          prev.set("network", "Testnet");
          return prev;
        });
      } else if (env === "Mainnet") {
        setSearchParams(prev => {
          prev.set("network", "Mainnet");
          return prev;
        });
      }
    },
    [setSearchParams],
  );

  const changeEnvironment = useCallback((env: Network) => {
    if (env === "Testnet") {
      changeClientNetwork("Testnet");
      setCurrentEnv(testnetEnv);
      setClearChildren(true);
    } else if (env === "Mainnet") {
      changeClientNetwork("Mainnet");
      setCurrentEnv(mainnetEnv);
      setClearChildren(true);
    }

    setClearChildren(false);
  }, []);

  useEffect(() => {
    let selectedNetwork = "Mainnet";
    if (networkParam) selectedNetwork = networkParam;
    changeEnvironment(selectedNetwork as Network);
  }, [changeEnvironment, networkParam]);

  const contextValue = useMemo(
    () => ({
      environment: currentEnv,
      setEnvironment,
    }),
    [currentEnv, setEnvironment],
  );

  return (
    <EnvironmentProviderContext.Provider value={contextValue}>
      {clearChildren ? null : children}
    </EnvironmentProviderContext.Provider>
  );
};

export const useEnvironment = () => {
  return useContext(EnvironmentProviderContext);
};
