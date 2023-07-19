import React, { ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Environment, tiltEnv, testnetEnv, mainnetEnv } from "../utils/environment";
import { ChainId } from "@certusone/wormhole-sdk";
import { changeNetwork } from "src/api/Client";
import { useSearchParams } from "react-router-dom";
import { NETWORK } from "src/types";

interface EnvironmentContext {
  environment: Environment;
  setEnvironment: (env: "DEVNET" | "TESTNET" | "MAINNET") => void;
  userInput: string;
  setUserInput: (input: string) => void;
  chain: ChainId;
  setChain: (selectedChain: ChainId) => void;
}

const EnvironmentProviderContext = React.createContext<EnvironmentContext>({
  environment: testnetEnv,
  setEnvironment: () => {},
  userInput: "",
  setUserInput: () => {},
  chain: testnetEnv.chainInfos[0].chainId,
  setChain: () => {},
});

export const EnvironmentProvider = ({ children }: { children: ReactNode }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const networkParam = searchParams.get("network") as NETWORK;
  const [currentEnv, setCurrentEnv] = useState<Environment>(
    networkParam === "testnet" ? testnetEnv : mainnetEnv,
  );

  const chainIdParam = searchParams.get("chainId");
  const [chain, setChain] = useState(
    chainIdParam
      ? currentEnv.chainInfos.find(a => "" + a.chainId === chainIdParam).chainId
      : currentEnv.chainInfos[0].chainId,
  );

  const [userInput, setUserInput] = useState("");
  const [clearChildren, setClearChildren] = useState<boolean>(false);

  const setEnvironment = useCallback(
    (env: "DEVNET" | "TESTNET" | "MAINNET") => {
      if (env === "DEVNET") {
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
      } else if (env === "TESTNET") {
        changeNetwork("testnet");
        setCurrentEnv(testnetEnv);
        setUserInput("");
        setChain(testnetEnv.chainInfos[0].chainId);

        setSearchParams(prev => {
          prev.delete("userInput");
          prev.set("network", "testnet");
          prev.set("chainId", "" + testnetEnv.chainInfos[0].chainId);
          return prev;
        });

        setClearChildren(true);
      } else if (env === "MAINNET") {
        changeNetwork("mainnet");
        setCurrentEnv(mainnetEnv);
        setUserInput("");

        setChain(mainnetEnv.chainInfos[0].chainId);
        setSearchParams(prev => {
          prev.delete("userInput");
          prev.set("network", "mainnet");
          prev.set("chainId", "" + mainnetEnv.chainInfos[0].chainId);
          return prev;
        });

        setClearChildren(true);
      }
    },
    [setSearchParams],
  );

  useEffect(() => {
    if (currentEnv.network === "TESTNET") {
      changeNetwork("testnet");
    }

    //hacky component unmount to clear state on env change
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
      chain,
      setChain: (newChain: ChainId) => {
        setChain(newChain);
        setSearchParams(prev => {
          prev.delete("userInput");
          prev.set("chainId", newChain as any);
          return prev;
        });
        setUserInput("");
      },
    }),
    [currentEnv, setEnvironment, userInput, chain, setSearchParams],
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
