import React, { ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Environment, tiltEnv, testnetEnv, mainnetEnv } from "../utils/environment";
import { ChainId } from "@certusone/wormhole-sdk";

interface EnvironmentContext {
  environment: Environment;
  setEnvironment: (env: "DEVNET" | "TESTNET" | "MAINNET") => void;
  userInput: string;
  setUserInput: (input: string) => void;
  chain: ChainId;
  setChain: (selectedChain: ChainId) => void;
}

const initialChain = tiltEnv.chainInfos[0].chainId;

const EnvironmentProviderContext = React.createContext<EnvironmentContext>({
  environment: tiltEnv,
  setEnvironment: () => {},
  userInput: "",
  setUserInput: () => {},
  chain: initialChain,
  setChain: () => {},
});

export const EnvironmentProvider = ({ children }: { children: ReactNode }) => {
  const [currentEnv, setCurrentEnv] = useState<Environment>(tiltEnv);
  const [userInput, setUserInput] = useState("");
  const [chain, setChain] = useState(initialChain);
  const [clearChildren, setClearChildren] = useState<boolean>(false);

  const setEnvironment = useCallback(
    (env: "DEVNET" | "TESTNET" | "MAINNET") => {
      if (env === "DEVNET") {
        setCurrentEnv(tiltEnv);
        setUserInput("");
        setChain(tiltEnv.chainInfos[0].chainId);
        setClearChildren(true);
      } else if (env === "TESTNET") {
        setCurrentEnv(testnetEnv);
        setUserInput("");
        setChain(testnetEnv.chainInfos[0].chainId);
        setClearChildren(true);
      } else if (env === "MAINNET") {
        setCurrentEnv(mainnetEnv);
        setUserInput("");
        setChain(mainnetEnv.chainInfos[0].chainId);
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
      userInput,
      setUserInput,
      chain,
      setChain: (newChain: ChainId) => {
        setUserInput("");
        setChain(newChain);
      },
    }),
    [chain, setChain, userInput, setUserInput, currentEnv, setEnvironment],
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
