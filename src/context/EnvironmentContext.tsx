import React, { ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { changeClientNetwork } from "src/api/Client";
import { useSearchParams } from "react-router-dom";
import { Environment, testnetEnv, mainnetEnv } from "src/utils/environment";
import { Network } from "@certusone/wormhole-sdk";

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

  const networkParam = searchParams.get("network")?.toUpperCase();
  const [currentEnv, setCurrentEnv] = useState<Environment>(
    networkParam === "TESTNET" ? testnetEnv : mainnetEnv,
  );
  const [clearChildren, setClearChildren] = useState<boolean>(true);

  const setEnvironment = useCallback(
    (env: Network) => {
      /* if (env === "DEVNET") {
        setSearchParams(prev => {
          prev.set("network", "testnet");
          return prev;
        });
      } else */ if (env === "TESTNET") {
        setSearchParams(prev => {
          prev.set("network", "TESTNET");
          return prev;
        });
      } else if (env === "MAINNET") {
        setSearchParams(prev => {
          prev.set("network", "MAINNET");
          return prev;
        });
      }
    },
    [setSearchParams],
  );

  const changeEnvironment = useCallback((env: Network) => {
    /* if (env === "DEVNET") {
        setCurrentEnv(tiltEnv);
        setChain(tiltEnv.chainInfos[0].chainId);


        setClearChildren(true);
      } else */ if (env === "TESTNET") {
      changeClientNetwork("TESTNET");
      setCurrentEnv(testnetEnv);

      setClearChildren(true);
    } else if (env === "MAINNET") {
      changeClientNetwork("MAINNET");
      setCurrentEnv(mainnetEnv);
      setClearChildren(true);
    }

    setClearChildren(false);
  }, []);

  useEffect(() => {
    let selectedNetwork = "MAINNET";
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
