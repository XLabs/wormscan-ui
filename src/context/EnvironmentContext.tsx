import React, { ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { changeClientNetwork } from "src/api/Client";
import { useSearchParams } from "react-router-dom";
import { Environment, testnetEnv, mainnetEnv } from "src/utils/environment";

interface EnvironmentContext {
  environment: Environment;
  setEnvironment: (env: "DEVNET" | "TESTNET" | "MAINNET") => void;
  userInput: string;
  setUserInput: (input: string) => void;
}

const EnvironmentProviderContext = React.createContext<EnvironmentContext>({
  environment: testnetEnv,
  setEnvironment: () => {},
  userInput: "",
  setUserInput: () => {},
});

export const EnvironmentProvider = ({ children }: { children: ReactNode }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const networkParam = searchParams.get("network")?.toUpperCase();
  const [currentEnv, setCurrentEnv] = useState<Environment>(
    networkParam === "TESTNET" ? testnetEnv : mainnetEnv,
  );

  const [userInput, setUserInput] = useState("");
  const [clearChildren, setClearChildren] = useState<boolean>(false);

  const setEnvironment = useCallback(
    (env: "DEVNET" | "TESTNET" | "MAINNET") => {
      /* if (env === "DEVNET") {
        setCurrentEnv(tiltEnv);
        setUserInput("");
        setChain(tiltEnv.chainInfos[0].chainId);
        setSearchParams(prev => {
          prev.delete("userInput");
          prev.set("network", "testnet");
          prev.set("chainId", "" + tiltEnv.chainInfos[0].chainId);
          return prev;
        });

        setClearChildren(true);
      } else */ if (env === "TESTNET") {
        changeClientNetwork("TESTNET");
        setCurrentEnv(testnetEnv);
        setUserInput("");

        setSearchParams(prev => {
          prev.delete("userInput");
          prev.set("network", "TESTNET");
          return prev;
        });

        setClearChildren(true);
      } else if (env === "MAINNET") {
        changeClientNetwork("MAINNET");
        setCurrentEnv(mainnetEnv);
        setUserInput("");

        setSearchParams(prev => {
          prev.delete("userInput");
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
      userInput,
      setUserInput: (input: string) => {
        setUserInput(input);
      },
    }),
    [currentEnv, setEnvironment, userInput],
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
