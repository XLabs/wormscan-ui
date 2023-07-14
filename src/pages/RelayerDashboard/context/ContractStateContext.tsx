import { ChainId } from "@certusone/wormhole-sdk";
import React, { ReactNode, useCallback, useContext, useMemo, useState } from "react";
import { useLogger } from "./LoggerContext";
import { BigNumber } from "ethers";
import { ChainInfo, Environment, getChainInfo, getEthersProvider } from "../utils/environment";
import { ethers } from "ethers";
import {
  DeliveryProvider,
  DeliveryProvider__factory,
  WormholeRelayer,
  WormholeRelayer__factory,
} from "@certusone/wormhole-sdk/lib/cjs/ethers-contracts";
import { useEnvironment } from "./EnvironmentContext";

export type WormholeRelayerContractState = {
  network: string;
  chainId: number;
  contractAddress: string;
  defaultProvider: string;
  registeredContracts: { chainId: number; contract: string }[];
};

export type DeliveryProviderContractState = {
  network: string;
  chainId: number;
  contractAddress: string;
  rewardAddress: string;
  owner: string;
  pendingOwner: string;
  pricingWallet: string;
  deliveryOverheads: { chainId: number; deliveryOverhead: BigNumber }[];
  supportedChains: { chainId: number; isSupported: boolean }[];
  targetChainAddresses: { chainId: number; whAddress: string }[];
  gasPrices: { chainId: number; gasPrice: BigNumber }[];
  weiPrices: { chainId: number; weiPrice: BigNumber }[];
  maximumBudgets: { chainId: number; maximumBudget: BigNumber }[];
  assetConversionBuffers: {
    chainId: number;
    assetConversionBuffer: { numerator: number; denominator: number };
  }[];
};

interface IContractStateContext {
  getRelayerContract(
    ChainId: ChainId,
    forceRefresh?: boolean,
  ): Promise<WormholeRelayerContractState>;
  getDeliveryProviderContractState(
    ChainId: ChainId,
    forceRefresh?: boolean,
  ): Promise<DeliveryProviderContractState>;
}

const ContractStateContext = React.createContext<IContractStateContext>({
  getRelayerContract: async (ChainId: ChainId, forceRefresh?: boolean) => {
    return null as any;
  },
  getDeliveryProviderContractState: async (ChainId: ChainId, forceRefresh?: boolean) => {
    return null as any;
  },
});

const RELAYER_CONTEXT = "GetRelayerContractState";
const DELIVERY_PROVIDER_CONTEXT = "GetDeliveryProviderContractState";

export const ContractStateProvider = ({ children }: { children: ReactNode }) => {
  //must be nested below the logger context
  const { log } = useLogger();
  const { environment } = useEnvironment();
  const [relayerContractStates, setRelayerContractStates] = useState<
    WormholeRelayerContractState[]
  >([]);
  const [deliveryProviderContractStates, setDeliveryProviderContractStates] = useState<
    DeliveryProviderContractState[]
  >([]);

  const getRelayerContract = useCallback(
    async (chainId: ChainId, forceRefresh?: boolean) => {
      log("Calling getRelayerContract with chainId: " + chainId, RELAYER_CONTEXT);

      const cached = relayerContractStates.find(state => {
        return (
          state.chainId.toString() === chainId.toString() && state.network === environment.network
        );
      });

      console.log("relayerContractStates", relayerContractStates);

      if (cached && !forceRefresh) {
        return cached;
      } else {
        log("Cache miss on getRelayerContract, fetching from chain", RELAYER_CONTEXT);
        const state: WormholeRelayerContractState = await fetchRelayerContract(
          environment,
          getChainInfo(environment, chainId),
          log,
        );
        setRelayerContractStates(old => [...old, state]);
        return state;
      }
    },
    [log, environment, relayerContractStates],
  );

  const getDeliveryProviderContractState = useCallback(
    async (chainId: ChainId, forceRefresh?: boolean) => {
      log(
        "Calling getDeliveryProviderContractState with chainId: " + chainId,
        DELIVERY_PROVIDER_CONTEXT,
      );

      const cached = deliveryProviderContractStates.find(
        state =>
          state.chainId.toString() === chainId.toString() && state.network === environment.network,
      );

      if (cached && !forceRefresh) {
        return cached;
      } else {
        log(
          "Cache miss on getDeliveryProviderContractState, fetching from chain",
          DELIVERY_PROVIDER_CONTEXT,
        );
        const state: DeliveryProviderContractState = await fetchDeliveryProviderContractState(
          environment,
          getChainInfo(environment, chainId),
          log,
        );
        setDeliveryProviderContractStates(old => [...old, state]);
        return state;
      }
    },
    [log, environment, deliveryProviderContractStates],
  );

  const contextValue = useMemo(
    () => ({
      getRelayerContract,
      getDeliveryProviderContractState,
    }),
    [getRelayerContract, getDeliveryProviderContractState],
  );

  return (
    <ContractStateContext.Provider value={contextValue}>{children}</ContractStateContext.Provider>
  );
};

export const useContractState = () => {
  return useContext(ContractStateContext);
};

//This code is adapted from the ethereum/ts-scripts folder in the wormhole monorepo
async function fetchRelayerContract(
  environment: Environment,
  chainInfo: ChainInfo,
  log?: (value: string, context?: string, type?: "error" | "info" | "success" | undefined) => void,
): Promise<WormholeRelayerContractState> {
  try {
    const contractAddress = chainInfo.relayerContractAddress;
    log && log("Querying " + contractAddress, RELAYER_CONTEXT);

    const provider = getEthersProvider(chainInfo);

    const coreRelayer = await getWormholeRelayer(chainInfo, provider);

    // This is excessive to always do, but can be uncommented if needed.
    // console.log("Querying default provider for code");
    // const codeReceipt = await provider.getCode(contractAddress);
    // console.log("Code: " + codeReceipt);

    const registeredContracts: { chainId: number; contract: string }[] = [];

    log && log("Querying registered contracts", RELAYER_CONTEXT);
    for (const chainInfo of environment.chainInfos) {
      registeredContracts.push({
        chainId: chainInfo.chainId,
        contract: (
          await coreRelayer.getRegisteredWormholeRelayerContract(chainInfo.chainId)
        ).toString(),
      });
    }
    log && log("Registered contracts: " + JSON.stringify(registeredContracts), RELAYER_CONTEXT);

    log && log("Querying default provider", RELAYER_CONTEXT);
    const defaultProvider = await coreRelayer.getDefaultDeliveryProvider();
    log && log("Default provider: " + defaultProvider, RELAYER_CONTEXT);
    log &&
      log("Finished querying relayer contract for chain " + chainInfo.chainId, RELAYER_CONTEXT);
    return {
      network: environment.network,
      chainId: chainInfo.chainId,
      contractAddress,
      defaultProvider,
      registeredContracts,
    };
  } catch (e: any) {
    log && log("Failed to gather status for chain " + chainInfo.chainId, RELAYER_CONTEXT, "error");
    log && log(e.toString(), RELAYER_CONTEXT, "error");
  }

  return Promise.reject();
}

export async function getWormholeRelayer(
  chain: ChainInfo,
  provider: ethers.providers.StaticJsonRpcProvider,
): Promise<WormholeRelayer> {
  const thisChainsRelayer = chain.relayerContractAddress;
  return WormholeRelayer__factory.connect(thisChainsRelayer, provider);
}

//this code is adapted from the ethereum/ts-scripts folder in the wormhole monorepo
async function fetchDeliveryProviderContractState(
  environment: Environment,
  chainInfo: ChainInfo,
  log?: (value: string, context?: string, type?: "error" | "info" | "success" | undefined) => void,
): Promise<DeliveryProviderContractState> {
  log &&
    log(
      "Gathering delivery provider contract status for chain " + chainInfo.chainId,
      DELIVERY_PROVIDER_CONTEXT,
    );

  try {
    const provider = getEthersProvider(chainInfo);
    const deliveryProvider = await getDeliveryProviderContract(chainInfo, provider);
    const contractAddress = chainInfo.defaultDeliveryProviderContractAddress;

    log &&
      log(
        "Connected to " + contractAddress + " on chain " + chainInfo.chainId,
        DELIVERY_PROVIDER_CONTEXT,
      );

    // This is excessive to always do, but can be uncommented if needed.
    // console.log("Querying Relay Provider for code");
    // const codeReceipt = await provider.getCode(contractAddress);
    //console.log("Code: " + codeReceipt);

    const supportedChains: {
      chainId: number;
      isSupported: boolean;
    }[] = [];
    const targetChainAddresses: {
      chainId: number;
      whAddress: string;
    }[] = [];
    const deliveryOverheads: {
      chainId: number;
      deliveryOverhead: BigNumber;
    }[] = [];
    const gasPrices: { chainId: number; gasPrice: BigNumber }[] = [];
    const weiPrices: { chainId: number; weiPrice: BigNumber }[] = [];
    const maximumBudgets: { chainId: number; maximumBudget: BigNumber }[] = [];
    const assetConversionBuffers: {
      chainId: number;
      assetConversionBuffer: { numerator: number; denominator: number };
    }[] = [];

    log && log("Querying owner", DELIVERY_PROVIDER_CONTEXT);
    const owner: string = await deliveryProvider.owner();
    log && log("Owner: " + owner, DELIVERY_PROVIDER_CONTEXT);
    log && log("Querying pending owner", DELIVERY_PROVIDER_CONTEXT);
    const pendingOwner: string = await deliveryProvider.pendingOwner();
    log && log("Pending owner: " + pendingOwner, DELIVERY_PROVIDER_CONTEXT);
    log && log("Querying pricing wallet", DELIVERY_PROVIDER_CONTEXT);
    const pricingWallet: string = await deliveryProvider.pricingWallet();
    log && log("Pricing wallet: " + pricingWallet, DELIVERY_PROVIDER_CONTEXT);
    log && log("Querying reward address", DELIVERY_PROVIDER_CONTEXT);
    const rewardAddress = await deliveryProvider.getRewardAddress();
    log && log("Reward address: " + rewardAddress, DELIVERY_PROVIDER_CONTEXT);

    for (const chainInfo of environment.chainInfos) {
      log && log("Querying isSupported chain " + chainInfo.chainId, DELIVERY_PROVIDER_CONTEXT);
      const isSupported = await deliveryProvider.isChainSupported(chainInfo.chainId);
      supportedChains.push({
        chainId: chainInfo.chainId,
        isSupported,
      });
      log && log("isSupported: " + isSupported, DELIVERY_PROVIDER_CONTEXT);

      log &&
        log("Querying targetChainAddress chain " + chainInfo.chainId, DELIVERY_PROVIDER_CONTEXT);
      const whAddress = await deliveryProvider.getTargetChainAddress(chainInfo.chainId);
      targetChainAddresses.push({
        chainId: chainInfo.chainId,
        whAddress,
      });
      log && log("TargetChainAddress whFormat: " + whAddress, DELIVERY_PROVIDER_CONTEXT);

      log && log("Querying deliveryOverhead chain " + chainInfo.chainId, DELIVERY_PROVIDER_CONTEXT);
      const deliveryOverhead = await deliveryProvider.quoteDeliveryOverhead(chainInfo.chainId);
      deliveryOverheads.push({
        chainId: chainInfo.chainId,
        deliveryOverhead,
      });
      log && log("DeliveryOverhead: " + deliveryOverhead, DELIVERY_PROVIDER_CONTEXT);

      log && log("Querying gasPrice chain " + chainInfo.chainId, DELIVERY_PROVIDER_CONTEXT);
      const gasPrice = await deliveryProvider.quoteGasPrice(chainInfo.chainId);
      gasPrices.push({
        chainId: chainInfo.chainId,
        gasPrice,
      });
      log && log("GasPrice: " + gasPrice, DELIVERY_PROVIDER_CONTEXT);

      log && log("Querying weiPrice chain " + chainInfo.chainId, DELIVERY_PROVIDER_CONTEXT);
      const weiPrice = await deliveryProvider.quoteAssetConversion(
        chainInfo.chainId,
        ethers.utils.parseEther("1"),
      );
      weiPrices.push({
        chainId: chainInfo.chainId,
        weiPrice,
      });
      log && log("WeiPrice: " + weiPrice, DELIVERY_PROVIDER_CONTEXT);

      log && log("Querying maximumBudget chain " + chainInfo.chainId, DELIVERY_PROVIDER_CONTEXT);
      const maximumBudget = await deliveryProvider.maximumBudget(chainInfo.chainId);
      maximumBudgets.push({
        chainId: chainInfo.chainId,
        maximumBudget,
      });
      log && log("MaximumBudget: " + maximumBudget, DELIVERY_PROVIDER_CONTEXT);

      log &&
        log("Querying assetConversionBuffer chain " + chainInfo.chainId, DELIVERY_PROVIDER_CONTEXT);
      const assetConversionBuffer = await deliveryProvider.assetConversionBuffer(chainInfo.chainId);
      assetConversionBuffers.push({
        chainId: chainInfo.chainId,
        assetConversionBuffer: {
          numerator: assetConversionBuffer[0],
          denominator: assetConversionBuffer[1],
        },
      });
      log && log("AssetConversionBuffer: " + assetConversionBuffer, DELIVERY_PROVIDER_CONTEXT);
    }

    return {
      network: environment.network,
      chainId: chainInfo.chainId,
      contractAddress,
      rewardAddress,
      deliveryOverheads,
      supportedChains,
      targetChainAddresses,
      gasPrices,
      weiPrices,
      owner,
      pendingOwner,
      pricingWallet,
      maximumBudgets,
      assetConversionBuffers,
    };
  } catch (e: any) {
    log &&
      log(
        "Failed to gather delivery provider contract status for chain " + chainInfo.chainId,
        DELIVERY_PROVIDER_CONTEXT,
        "error",
      );
    log && log(e.toString(), DELIVERY_PROVIDER_CONTEXT, "error");
  }

  return Promise.reject();
}

export async function getDeliveryProviderContract(
  chain: ChainInfo,
  provider: ethers.providers.StaticJsonRpcProvider,
): Promise<DeliveryProvider> {
  const thisChainsRelayer = chain.defaultDeliveryProviderContractAddress;
  return DeliveryProvider__factory.connect(thisChainsRelayer, provider);
}
