import React, { ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Environment, tiltEnv, testnetEnv, mainnetEnv } from "../utils/environment";

interface EnvironmentContext {
  environment: Environment;
  setEnvironment: (env: "DEVNET" | "TESTNET" | "MAINNET") => void;
}

const EnvironmentProviderContext = React.createContext<EnvironmentContext>({
  environment: tiltEnv,
  setEnvironment: () => {},
});

export const EnvironmentProvider = ({ children }: { children: ReactNode }) => {
  const [currentEnv, setCurrentEnv] = useState<Environment>(tiltEnv);
  const [clearChildren, setClearChildren] = useState<boolean>(false);

  const setEnvironment = useCallback(
    (env: "DEVNET" | "TESTNET" | "MAINNET") => {
      if (env === "DEVNET") {
        setCurrentEnv(tiltEnv);
        setClearChildren(true);
      } else if (env === "TESTNET") {
        setCurrentEnv(testnetEnv);
        setClearChildren(true);
      } else if (env === "MAINNET") {
        setCurrentEnv(mainnetEnv);
        setClearChildren(true);
      }
    },
    [setCurrentEnv],
  );

  //hacky component unmount to clear state on env change
  useEffect(() => {
    if (clearChildren) {
      setClearChildren(false);
    }
  }, [clearChildren, setClearChildren]);

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
