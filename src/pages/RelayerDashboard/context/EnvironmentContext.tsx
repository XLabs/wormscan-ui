import React, { ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Environment, tiltEnv, testnetEnv, mainnetEnv } from "../utils/environment";
import { ChainId } from "@certusone/wormhole-sdk";
import { changeNetwork } from "src/api/Client";

interface EnvironmentContext {
  environment: Environment;
  setEnvironment: (env: "DEVNET" | "TESTNET" | "MAINNET") => void;
  userInput: string;
  setUserInput: (input: string) => void;
  chain: ChainId;
  setChain: (selectedChain: ChainId) => void;
}

const params = new URLSearchParams(window.location.search);
const queryParams: { [key: string]: string } = {};
for (const param of params) {
  queryParams[param[0]] = param[1];
}

const shouldBeTestnet = () => queryParams.network === "testnet";
const initialEnv = shouldBeTestnet() ? testnetEnv : mainnetEnv;

const shouldBeSpecificChain = () => !!queryParams.chainId;
const initialChain = shouldBeSpecificChain()
  ? initialEnv.chainInfos.find(a => `${a.chainId}` === queryParams.chainId).chainId
  : initialEnv.chainInfos[0].chainId;

const EnvironmentProviderContext = React.createContext<EnvironmentContext>({
  environment: initialEnv,
  setEnvironment: () => {},
  userInput: "",
  setUserInput: () => {},
  chain: initialChain,
  setChain: () => {},
});

export const EnvironmentProvider = ({ children }: { children: ReactNode }) => {
  const [currentEnv, setCurrentEnv] = useState<Environment>(initialEnv);
  const [chain, setChain] = useState(initialChain);
  const [userInput, setUserInput] = useState("");

  const [clearChildren, setClearChildren] = useState<boolean>(false);

  function updateQueryParams(key: string, value: string | null) {
    // Create a new URL object with the current URL
    const url = new URL(window.location.href);

    // If the value is null, remove the key from the query parameters
    if (value === null) {
      url.searchParams.delete(key);
    } else {
      // Otherwise, set the key to the new value
      url.searchParams.set(key, value);
    }

    // Update the URL without reloading the page
    window.history.pushState({}, "", url.toString());
  }

  const setEnvironment = useCallback(
    (env: "DEVNET" | "TESTNET" | "MAINNET") => {
      if (env === "DEVNET") {
        setCurrentEnv(tiltEnv);
        updateQueryParams("network", "testnet");

        setUserInput("");

        setChain(tiltEnv.chainInfos[0].chainId);
        updateQueryParams("chainId", "" + tiltEnv.chainInfos[0].chainId);

        setClearChildren(true);
      } else if (env === "TESTNET") {
        changeNetwork("testnet");
        updateQueryParams("network", "testnet");

        setCurrentEnv(testnetEnv);
        setUserInput("");

        setChain(testnetEnv.chainInfos[0].chainId);
        updateQueryParams("chainId", "" + testnetEnv.chainInfos[0].chainId);

        setClearChildren(true);
      } else if (env === "MAINNET") {
        changeNetwork("mainnet");
        updateQueryParams("network", "mainnet");

        setCurrentEnv(mainnetEnv);
        setUserInput("");

        setChain(mainnetEnv.chainInfos[0].chainId);
        updateQueryParams("chainId", "" + mainnetEnv.chainInfos[0].chainId);

        setClearChildren(true);
      }
    },
    [setCurrentEnv],
  );

  useEffect(() => {
    if (shouldBeTestnet()) {
      changeNetwork("testnet");
    }

    //hacky component unmount to clear state on env change
    if (clearChildren) {
      setClearChildren(false);
    }
  }, [clearChildren, setClearChildren]);

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
        updateQueryParams("chainId", newChain as any);
        setUserInput("");
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
