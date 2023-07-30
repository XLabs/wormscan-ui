import { CONTRACTS, ChainId, ChainName, Network } from "@certusone/wormhole-sdk";
import { ethers } from "ethers";

const MAINNET_RPCS: { [key in ChainName]?: string } = {
  ethereum: process.env.ETH_RPC || "https://rpc.ankr.com/eth",
  bsc: process.env.BSC_RPC || "https://bsc-dataseed2.defibit.io",
  polygon: "https://rpc.ankr.com/polygon",
  avalanche: "https://rpc.ankr.com/avalanche",
  oasis: "https://emerald.oasis.dev",
  algorand: "https://mainnet-api.algonode.cloud",
  fantom: "https://rpc.ankr.com/fantom",
  karura: "https://eth-rpc-karura.aca-api.network",
  acala: "https://eth-rpc-acala.aca-api.network",
  klaytn: "https://klaytn-mainnet-rpc.allthatnode.com:8551",
  celo: "https://forno.celo.org",
  moonbeam: "https://rpc.ankr.com/moonbeam",
  arbitrum: "https://arb1.arbitrum.io/rpc",
  optimism: "https://rpc.ankr.com/optimism",
  aptos: "https://fullnode.mainnet.aptoslabs.com/",
  near: "https://rpc.mainnet.near.org",
  xpla: "https://dimension-lcd.xpla.dev",
  terra2: "https://phoenix-lcd.terra.dev",
  terra: "https://terra-classic-fcd.publicnode.com",
  injective: "https://api.injective.network",
  solana: process.env.SOLANA_RPC ?? "https://api.mainnet-beta.solana.com",
  sui: "https://rpc.mainnet.sui.io",
};

const TESTNET_RPCS: { [key in ChainName]?: string } = {
  bsc: "https://data-seed-prebsc-2-s3.binance.org:8545",
  polygon: "https://rpc.ankr.com/polygon_mumbai",
  avalanche: "https://api.avax-test.network/ext/bc/C/rpc",
  celo: "https://alfajores-forno.celo-testnet.org",
  moonbeam: "https://rpc.api.moonbase.moonbeam.network",
};

const DEVNET_RPCS: { [key in ChainName]?: string } = {
  ethereum: "http://localhost:8545",
  bsc: "http://localhost:8546",
};

export type Environment = {
  chainInfos: ChainInfo[];
  guardianRpcs: string[];
  network: Network;
};

export type ChainInfo = {
  chainId: ChainId;
  evmNetworkId: number;
  chainName: string;
  nativeCurrencyName: string;
  nativeCurrencyDecimals: number;
  nativeCurrencyUsdPrice: number;
  relayerContractAddress: string;
  defaultDeliveryProviderContractAddress: string;
  coreBridgeAddress: string;
  mockIntegrationAddress: string;
  rpcUrl: string;
};

export const tiltDefaultDeliveryProviderContractAddress =
  "0x1ef9e15c3bbf0555860b5009B51722027134d53a";
export const tiltEnv: Environment = {
  network: "DEVNET",
  chainInfos: [
    {
      chainId: 2 as ChainId,
      evmNetworkId: 1337,
      chainName: "Eth-Tilt",
      nativeCurrencyName: "ETH",
      nativeCurrencyDecimals: 18,
      nativeCurrencyUsdPrice: 1700,
      relayerContractAddress: "0x53855d4b64E9A3CF59A84bc768adA716B5536BC5",
      defaultDeliveryProviderContractAddress: tiltDefaultDeliveryProviderContractAddress,
      coreBridgeAddress: "0xC89Ce4735882C9F0f0FE26686c53074E09B0D550",
      mockIntegrationAddress: "0x0eb0dD3aa41bD15C706BC09bC03C002b7B85aeAC",
      rpcUrl: DEVNET_RPCS.ethereum || "",
    },
    {
      chainId: 4 as ChainId,
      evmNetworkId: 1397,
      chainName: "BSC-Tilt",
      nativeCurrencyName: "BNB",
      nativeCurrencyDecimals: 18,
      nativeCurrencyUsdPrice: 300,
      relayerContractAddress: "0x53855d4b64E9A3CF59A84bc768adA716B5536BC5",
      defaultDeliveryProviderContractAddress: tiltDefaultDeliveryProviderContractAddress,
      coreBridgeAddress: "0xC89Ce4735882C9F0f0FE26686c53074E09B0D550",
      mockIntegrationAddress: "0x0eb0dD3aa41bD15C706BC09bC03C002b7B85aeAC",
      rpcUrl: DEVNET_RPCS.bsc || "",
    },
  ],
  guardianRpcs: ["http://localhost:7071"],
};

export const testnetDefaultDeliveryProviderContractAddress =
  "0x60a86b97a7596eBFd25fb769053894ed0D9A8366";
export const testnetEnv: Environment = {
  network: "TESTNET",
  chainInfos: [
    {
      chainId: 4 as ChainId,
      evmNetworkId: 97,
      chainName: "BSC - Testnet",
      nativeCurrencyName: "BNB",
      nativeCurrencyDecimals: 18,
      nativeCurrencyUsdPrice: 300,
      relayerContractAddress: "0x80aC94316391752A193C1c47E27D382b507c93F3",
      defaultDeliveryProviderContractAddress: testnetDefaultDeliveryProviderContractAddress,
      coreBridgeAddress: "0x68605AD7b15c732a30b1BbC62BE8F2A509D74b4D",
      mockIntegrationAddress: "0xb6A04D6672F005787147472Be20d39741929Aa03",
      rpcUrl: TESTNET_RPCS.bsc || "",
    },
    {
      chainId: 5 as ChainId,
      evmNetworkId: 80001,
      chainName: "Mumbai",
      nativeCurrencyName: "MATIC",
      nativeCurrencyDecimals: 18,
      nativeCurrencyUsdPrice: 0.66,
      relayerContractAddress: "0x0591C25ebd0580E0d4F27A82Fc2e24E7489CB5e0",
      defaultDeliveryProviderContractAddress: testnetDefaultDeliveryProviderContractAddress,
      coreBridgeAddress: "0x0CBE91CF822c73C2315FB05100C2F714765d5c20",
      mockIntegrationAddress: "0x3bF0c43d88541BBCF92bE508ec41e540FbF28C56",
      rpcUrl: TESTNET_RPCS.polygon || "",
    },
    {
      chainId: 6 as ChainId,
      evmNetworkId: 43113,
      chainName: "Fuji",
      nativeCurrencyName: "AVAX",
      nativeCurrencyDecimals: 18,
      nativeCurrencyUsdPrice: 12,
      relayerContractAddress: "0xA3cF45939bD6260bcFe3D66bc73d60f19e49a8BB",
      defaultDeliveryProviderContractAddress: testnetDefaultDeliveryProviderContractAddress,
      coreBridgeAddress: "0x7bbcE28e64B3F8b84d876Ab298393c38ad7aac4C",
      mockIntegrationAddress: "0x5E52f3eB0774E5e5f37760BD3Fca64951D8F74Ae",
      rpcUrl: TESTNET_RPCS.avalanche || "",
    },
    {
      chainId: 14 as ChainId,
      evmNetworkId: 44787,
      chainName: "Celo - Alfajores",
      nativeCurrencyName: "Celo",
      nativeCurrencyDecimals: 18,
      nativeCurrencyUsdPrice: 0.51,
      relayerContractAddress: "0x306B68267Deb7c5DfCDa3619E22E9Ca39C374f84",
      defaultDeliveryProviderContractAddress: testnetDefaultDeliveryProviderContractAddress,
      coreBridgeAddress: "0x88505117CA88e7dd2eC6EA1E13f0948db2D50D56",
      mockIntegrationAddress: "0x7f1d8E809aBB3F6Dc9B90F0131C3E8308046E190",
      rpcUrl: TESTNET_RPCS.celo || "",
    },
    {
      chainId: 16 as ChainId,
      evmNetworkId: 1287,
      chainName: "Moonbase Alpha",
      nativeCurrencyName: "GLMR",
      nativeCurrencyDecimals: 18,
      nativeCurrencyUsdPrice: 0.26,
      relayerContractAddress: "0x0591C25ebd0580E0d4F27A82Fc2e24E7489CB5e0",
      defaultDeliveryProviderContractAddress: testnetDefaultDeliveryProviderContractAddress,
      coreBridgeAddress: "0xa5B7D85a8f27dd7907dc8FdC21FA5657D5E2F901",
      mockIntegrationAddress: "0x3bF0c43d88541BBCF92bE508ec41e540FbF28C56",
      rpcUrl: TESTNET_RPCS.moonbeam || "",
    },
  ],
  guardianRpcs: ["https://wormhole-v2-testnet-api.certus.one"],
};

export const mainnetDefaultDeliveryProviderContractAddress =
  "0x7A0a53847776f7e94Cc35742971aCb2217b0Db81";
export const mainnetEnv: Environment = {
  network: "MAINNET",
  chainInfos: [
    {
      chainId: 2 as ChainId,
      evmNetworkId: 1,
      chainName: "Ethereum",
      nativeCurrencyName: "ETH",
      nativeCurrencyDecimals: 18,
      nativeCurrencyUsdPrice: 2000,
      relayerContractAddress: "0x27428DD2d3DD32A4D7f7C497eAaa23130d894911",
      defaultDeliveryProviderContractAddress: mainnetDefaultDeliveryProviderContractAddress,
      coreBridgeAddress: CONTRACTS.MAINNET.ethereum.core,
      mockIntegrationAddress: "",
      rpcUrl: MAINNET_RPCS.ethereum || "",
    },
    {
      chainId: 4 as ChainId,
      evmNetworkId: 56,
      chainName: "BSC",
      nativeCurrencyName: "BNB",
      nativeCurrencyDecimals: 18,
      nativeCurrencyUsdPrice: 244,
      relayerContractAddress: "0x27428DD2d3DD32A4D7f7C497eAaa23130d894911",
      defaultDeliveryProviderContractAddress: mainnetDefaultDeliveryProviderContractAddress,
      coreBridgeAddress: CONTRACTS.MAINNET.bsc.core,
      mockIntegrationAddress: "",
      rpcUrl: MAINNET_RPCS.bsc || "",
    },
    {
      chainId: 5 as ChainId,
      evmNetworkId: 137,
      chainName: "Polygon",
      nativeCurrencyName: "MATIC",
      nativeCurrencyDecimals: 18,
      nativeCurrencyUsdPrice: 0.73,
      relayerContractAddress: "0x27428DD2d3DD32A4D7f7C497eAaa23130d894911",
      defaultDeliveryProviderContractAddress: mainnetDefaultDeliveryProviderContractAddress,
      coreBridgeAddress: CONTRACTS.MAINNET.polygon.core,
      mockIntegrationAddress: "",
      rpcUrl: MAINNET_RPCS.polygon || "",
    },
    {
      chainId: 6 as ChainId,
      evmNetworkId: 43114,
      chainName: "Avalanche",
      nativeCurrencyName: "AVAX",
      nativeCurrencyDecimals: 18,
      nativeCurrencyUsdPrice: 12,
      relayerContractAddress: "0x27428DD2d3DD32A4D7f7C497eAaa23130d894911",
      defaultDeliveryProviderContractAddress: mainnetDefaultDeliveryProviderContractAddress,
      coreBridgeAddress: CONTRACTS.MAINNET.avalanche.core,
      mockIntegrationAddress: "",
      rpcUrl: MAINNET_RPCS.avalanche || "",
    },
    {
      chainId: 10 as ChainId,
      evmNetworkId: 250,
      chainName: "Fantom",
      nativeCurrencyName: "FTM",
      nativeCurrencyDecimals: 18,
      nativeCurrencyUsdPrice: 0.27,
      relayerContractAddress: "0x27428DD2d3DD32A4D7f7C497eAaa23130d894911",
      defaultDeliveryProviderContractAddress: mainnetDefaultDeliveryProviderContractAddress,
      coreBridgeAddress: CONTRACTS.MAINNET.fantom.core,
      mockIntegrationAddress: "",
      rpcUrl: MAINNET_RPCS.fantom || "",
    },
    // {
    //   chainId: 12 as ChainId,
    //   evmNetworkId: 787,
    //   chainName: "Acala",
    //   nativeCurrencyName: "ACA",
    //   nativeCurrencyDecimals: 18,
    //   nativeCurrencyUsdPrice: 0.06,
    //   relayerContractAddress: "0x27428DD2d3DD32A4D7f7C497eAaa23130d894911",
    //   defaultDeliveryProviderContractAddress:
    //     mainnetDefaultDeliveryProviderContractAddress,
    //   coreBridgeAddress: "",
    //   mockIntegrationAddress: "",
    //   rpcUrl: MAINNET_RPCS.ethereum || "",
    // },
    {
      chainId: 13 as ChainId,
      evmNetworkId: 8217,
      chainName: "Klaytn",
      nativeCurrencyName: "KLAY",
      nativeCurrencyDecimals: 18,
      nativeCurrencyUsdPrice: 0.16,
      relayerContractAddress: "0x27428DD2d3DD32A4D7f7C497eAaa23130d894911",
      defaultDeliveryProviderContractAddress: mainnetDefaultDeliveryProviderContractAddress,
      coreBridgeAddress: CONTRACTS.MAINNET.klaytn.core,
      mockIntegrationAddress: "",
      rpcUrl: MAINNET_RPCS.klaytn || "",
    },
    {
      chainId: 14 as ChainId,
      evmNetworkId: 42220,
      chainName: "Celo",
      nativeCurrencyName: "Celo",
      nativeCurrencyDecimals: 18,
      nativeCurrencyUsdPrice: 0.49,
      relayerContractAddress: "0x27428DD2d3DD32A4D7f7C497eAaa23130d894911",
      defaultDeliveryProviderContractAddress: mainnetDefaultDeliveryProviderContractAddress,
      coreBridgeAddress: CONTRACTS.MAINNET.celo.core,
      mockIntegrationAddress: "",
      rpcUrl: MAINNET_RPCS.celo || "",
    },
    {
      chainId: 16 as ChainId,
      evmNetworkId: 1284,
      chainName: "Moonbeam",
      nativeCurrencyName: "GLMR",
      nativeCurrencyDecimals: 18,
      nativeCurrencyUsdPrice: 0.24,
      relayerContractAddress: "0x27428DD2d3DD32A4D7f7C497eAaa23130d894911",
      defaultDeliveryProviderContractAddress: mainnetDefaultDeliveryProviderContractAddress,
      coreBridgeAddress: CONTRACTS.MAINNET.moonbeam.core,
      mockIntegrationAddress: "",
      rpcUrl: MAINNET_RPCS.moonbeam || "",
    },
    {
      chainId: 23 as ChainId,
      evmNetworkId: 42161,
      chainName: "Arbitrum",
      nativeCurrencyName: "ETH",
      nativeCurrencyDecimals: 18,
      nativeCurrencyUsdPrice: 2000,
      relayerContractAddress: "0x27428DD2d3DD32A4D7f7C497eAaa23130d894911",
      defaultDeliveryProviderContractAddress: mainnetDefaultDeliveryProviderContractAddress,
      coreBridgeAddress: CONTRACTS.MAINNET.arbitrum.core,
      mockIntegrationAddress: "",
      rpcUrl: MAINNET_RPCS.arbitrum || "",
    },
    {
      chainId: 24 as ChainId,
      evmNetworkId: 10,
      chainName: "Optimism",
      nativeCurrencyName: "Eth",
      nativeCurrencyDecimals: 18,
      nativeCurrencyUsdPrice: 2000,
      relayerContractAddress: "0x27428DD2d3DD32A4D7f7C497eAaa23130d894911",
      defaultDeliveryProviderContractAddress: mainnetDefaultDeliveryProviderContractAddress,
      coreBridgeAddress: CONTRACTS.MAINNET.optimism.core,
      mockIntegrationAddress: "",
      rpcUrl: MAINNET_RPCS.optimism || "",
    },
  ],
  guardianRpcs: [
    "https://wormhole-v2-mainnet-api.certus.one",
    "https://wormhole.inotel.ro",
    "https://wormhole-v2-mainnet-api.mcf.rocks",
    "https://wormhole-v2-mainnet-api.chainlayer.network",
    "https://wormhole-v2-mainnet-api.staking.fund",
  ],
};

export const getChainName = (chainId: ChainId, env: Environment) => {
  return env.chainInfos.find(a => a.chainId === chainId);
};

// Use environment context instead
// export function getEnvironment(): Environment {
//   if (env === null) {
//     const envString = process.env.REACT_APP_TARGET_ENVIRONMENT;
//     if (envString === undefined) {
//       throw new Error("Environment variable TARGET_ENVIRONMENT not set");
//     }
//     if (
//       envString.toLowerCase() === "devnet" ||
//       envString.toLowerCase() === "tilt"
//     ) {
//       env = tiltEnv;
//     } else if (envString.toLowerCase() === "testnet") {
//       env = testnetEnv;
//     } else if (envString.toLowerCase() === "mainnet") {
//       env = mainnetEnv;
//     } else {
//       throw new Error(`Unknown environment ${envString}`);
//     }
//   }

//   return env;
// }

export function getEthersProvider(chainInfo: ChainInfo) {
  return new ethers.providers.JsonRpcProvider(chainInfo.rpcUrl);
}

export function getChainInfo(env: Environment, chainId: ChainId): ChainInfo {
  const output = env.chainInfos.find(chainInfo => chainInfo.chainId === chainId);

  if (output === undefined) {
    throw new Error(`Unknown chainId ${chainId}`);
  }

  return output;
}
