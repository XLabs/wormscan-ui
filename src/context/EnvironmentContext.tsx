import React, { ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { changeClientNetwork } from "src/api/Client";
import { useSearchParams } from "react-router-dom";
import { Environment, testnetEnv, mainnetEnv } from "src/utils/environment";

interface EnvironmentContext {
  environment: Environment;
  setEnvironment: (env: "DEVNET" | "TESTNET" | "MAINNET") => void;
}

const EnvironmentProviderContext = React.createContext<EnvironmentContext>({
  environment: testnetEnv,
  setEnvironment: () => {},
});

export const EnvironmentProvider = ({ children }: { children: ReactNode }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const networkParam = searchParams.get("network")?.toUpperCase();
  const [currentEnv, setCurrentEnv] = useState<Environment>(
    networkParam === "TESTNET" ? testnetEnv : mainnetEnv,
  );

  const [clearChildren, setClearChildren] = useState<boolean>(false);

  const setEnvironment = useCallback(
    (env: "DEVNET" | "TESTNET" | "MAINNET") => {
      /* if (env === "DEVNET") {
        setCurrentEnv(tiltEnv);
        setChain(tiltEnv.chainInfos[0].chainId);
        setSearchParams(prev => {
          prev.set("network", "testnet");
          return prev;
        });

        setClearChildren(true);
      } else */ if (env === "TESTNET") {
        changeClientNetwork("TESTNET");
        setCurrentEnv(testnetEnv);

        setSearchParams(prev => {
          prev.set("network", "TESTNET");
          return prev;
        });

        setClearChildren(true);
      } else if (env === "MAINNET") {
        changeClientNetwork("MAINNET");
        setCurrentEnv(mainnetEnv);

        setSearchParams(prev => {
          prev.set("network", "MAINNET");
          return prev;
        });

        setClearChildren(true);
      }
    },
    [setSearchParams],
  );

  useEffect(() => {
    if (currentEnv.network === "TESTNET") {
      changeClientNetwork("TESTNET");
    }

    if (clearChildren) {
      setClearChildren(false);
    }
  }, [clearChildren, currentEnv.network, setClearChildren]);

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
