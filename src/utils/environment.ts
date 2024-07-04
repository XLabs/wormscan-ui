import { chainToChainId, ChainId, Network } from "@wormhole-foundation/sdk";
import { JsonRpcProvider } from "ethers";

export const SLOW_FINALITY_CHAINS = [
  chainToChainId("Ethereum"),
  chainToChainId("Polygon"),
  chainToChainId("Bsc"),
  chainToChainId("Optimism"),
  chainToChainId("Arbitrum"),
  chainToChainId("Avalanche"),
  chainToChainId("Base"),
  chainToChainId("Celo"),
  chainToChainId("Xlayer"),
];

const MAINNET_RPCS = {
  acala: "https://eth-rpc-acala.aca-api.network",
  algorand: "https://mainnet-api.algonode.cloud",
  aptos: "https://fullnode.mainnet.aptoslabs.com/",
  arbitrum: "https://arb1.arbitrum.io/rpc",
  avalanche: "https://api.avax.network/ext/bc/C/rpc",
  base: "https://mainnet.base.org",
  blast: "https://rpc.ankr.com/blast",
  bsc: process.env.BSC_RPC || "https://bsc-dataseed2.defibit.io",
  celo: "https://forno.celo.org",
  ethereum: process.env.ETH_RPC || "https://ethereum-rpc.publicnode.com",
  fantom: "https://rpc.ankr.com/fantom",
  injective: "https://api.injective.network",
  karura: "https://eth-rpc-karura.aca-api.network",
  klaytn: "https://klaytn-mainnet-rpc.allthatnode.com:8551",
  moonbeam: "https://rpc.ankr.com/moonbeam",
  mantle: "https://rpc.mantle.xyz",
  near: "https://rpc.mainnet.near.org",
  oasis: "https://emerald.oasis.dev",
  optimism: "https://endpoints.omniatech.io/v1/op/mainnet/public",
  polygon: "https://1rpc.io/matic",
  scroll: "https://rpc.ankr.com/scroll",
  solana: process.env.SOLANA_RPC ?? "https://api.mainnet-beta.solana.com",
  sui: "https://rpc.mainnet.sui.io",
  terra: "https://terra-classic-fcd.publicnode.com",
  terra2: "https://lcd-terra.tfl.foundation",
  xpla: "https://dimension-lcd.xpla.dev",
  xlayer: "https://xlayerrpc.okx.com",
};

const TESTNET_RPCS = {
  arbitrum: "https://goerli-rollup.arbitrum.io/rpc",
  arbitrum_sepolia: "https://sepolia-rollup.arbitrum.io/rpc",
  avalanche: "https://api.avax-test.network/ext/bc/C/rpc",
  base: "https://goerli.base.org",
  base_sepolia: "https://sepolia.base.org",
  bsc: "https://data-seed-prebsc-2-s3.binance.org:8545",
  celo: "https://alfajores-forno.celo-testnet.org",
  ethereum: "https://rpc.ankr.com/eth_goerli",
  fantom: "https://rpc.testnet.fantom.network",
  mantle: "https://rpc.testnet.mantle.xyz",
  moonbeam: "https://rpc.api.moonbase.moonbeam.network",
  sepolia: "https://ethereum-sepolia.publicnode.com",
  optimism: "https://goerli.optimism.io",
  optimism_sepolia: "https://sepolia.optimism.io",
  polygon: "https://rpc.ankr.com/polygon_mumbai",
  scroll: "https://rpc.ankr.com/scroll_sepolia_testnet",
  blast: "https://sepolia.blast.io",
  xlayer: "https://xlayertestrpc.okx.com",
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
  defaultDeliveryProviderContractAddress: string;
  rpcUrl: string;
};

export const testnetDefaultDeliveryProviderContractAddress =
  "0x60a86b97a7596eBFd25fb769053894ed0D9A8366";
export const testnetEnv: Environment = {
  network: "Testnet",
  chainInfos: [
    {
      chainId: 2 as ChainId,
      chainName: "Ethereum",
      defaultDeliveryProviderContractAddress: testnetDefaultDeliveryProviderContractAddress,
      evmNetworkId: 5, // https://chainlist.org/chain/5
      nativeCurrencyDecimals: 18,
      nativeCurrencyName: "ETH",
      rpcUrl: TESTNET_RPCS.ethereum || "",
    },
    {
      chainId: 10002 as ChainId,
      chainName: "Sepolia",
      defaultDeliveryProviderContractAddress: testnetDefaultDeliveryProviderContractAddress,
      evmNetworkId: 11155111, // https://chainlist.org/chain/11155111
      nativeCurrencyDecimals: 18,
      nativeCurrencyName: "ETH",
      rpcUrl: TESTNET_RPCS.sepolia || "",
    },
    {
      chainId: 10003 as ChainId,
      chainName: "Arbitrum Sepolia",
      defaultDeliveryProviderContractAddress: testnetDefaultDeliveryProviderContractAddress,
      evmNetworkId: 421614, // https://chainlist.org/chain/421614
      nativeCurrencyDecimals: 18,
      nativeCurrencyName: "ETH",
      rpcUrl: TESTNET_RPCS.arbitrum_sepolia || "",
    },
    {
      chainId: 10004 as ChainId,
      chainName: "BASE Sepolia",
      defaultDeliveryProviderContractAddress: testnetDefaultDeliveryProviderContractAddress,
      evmNetworkId: 84532, // https://chainlist.org/chain/84532
      nativeCurrencyDecimals: 18,
      nativeCurrencyName: "ETH",
      rpcUrl: TESTNET_RPCS.base_sepolia || "",
    },
    {
      chainId: 10005 as ChainId,
      chainName: "Optimism Sepolia",
      defaultDeliveryProviderContractAddress: testnetDefaultDeliveryProviderContractAddress,
      evmNetworkId: 11155420, // https://chainlist.org/chain/11155420
      nativeCurrencyDecimals: 18,
      nativeCurrencyName: "ETH",
      rpcUrl: TESTNET_RPCS.optimism_sepolia || "",
    },
    {
      chainId: 4 as ChainId,
      chainName: "BSC - Testnet",
      defaultDeliveryProviderContractAddress: testnetDefaultDeliveryProviderContractAddress,
      evmNetworkId: 97,
      nativeCurrencyDecimals: 18,
      nativeCurrencyName: "BNB",
      rpcUrl: TESTNET_RPCS.bsc || "",
    },
    {
      chainId: 5 as ChainId,
      chainName: "Mumbai",
      defaultDeliveryProviderContractAddress: testnetDefaultDeliveryProviderContractAddress,
      evmNetworkId: 80001,
      nativeCurrencyDecimals: 18,
      nativeCurrencyName: "MATIC",
      rpcUrl: TESTNET_RPCS.polygon || "",
    },
    {
      chainId: 6 as ChainId,
      chainName: "Fuji",
      defaultDeliveryProviderContractAddress: testnetDefaultDeliveryProviderContractAddress,
      evmNetworkId: 43113,
      nativeCurrencyDecimals: 18,
      nativeCurrencyName: "AVAX",
      rpcUrl: TESTNET_RPCS.avalanche || "",
    },
    {
      chainId: 10 as ChainId,
      chainName: "Fantom",
      defaultDeliveryProviderContractAddress: testnetDefaultDeliveryProviderContractAddress,
      evmNetworkId: 4002,
      nativeCurrencyDecimals: 18,
      nativeCurrencyName: "FTM",
      rpcUrl: TESTNET_RPCS.fantom || "",
    },
    {
      chainId: 14 as ChainId,
      chainName: "Celo - Alfajores",
      defaultDeliveryProviderContractAddress: testnetDefaultDeliveryProviderContractAddress,
      evmNetworkId: 44787,
      nativeCurrencyDecimals: 18,
      nativeCurrencyName: "Celo",
      rpcUrl: TESTNET_RPCS.celo || "",
    },
    {
      chainId: 16 as ChainId,
      chainName: "Moonbase Alpha",
      defaultDeliveryProviderContractAddress: testnetDefaultDeliveryProviderContractAddress,
      evmNetworkId: 1287,
      nativeCurrencyDecimals: 18,
      nativeCurrencyName: "GLMR",
      rpcUrl: TESTNET_RPCS.moonbeam || "",
    },
    {
      chainId: 30 as ChainId,
      chainName: "BASE Goerli",
      defaultDeliveryProviderContractAddress: testnetDefaultDeliveryProviderContractAddress,
      evmNetworkId: 84531,
      nativeCurrencyDecimals: 18,
      nativeCurrencyName: "ETH",
      rpcUrl: TESTNET_RPCS.base || "",
    },
    {
      chainId: 23 as ChainId,
      chainName: "Arbitrum",
      defaultDeliveryProviderContractAddress: testnetDefaultDeliveryProviderContractAddress,
      evmNetworkId: 42161,
      nativeCurrencyDecimals: 18,
      nativeCurrencyName: "ETH",
      rpcUrl: TESTNET_RPCS.arbitrum || "",
    },
    {
      chainId: 24 as ChainId,
      chainName: "Optimism",
      defaultDeliveryProviderContractAddress: testnetDefaultDeliveryProviderContractAddress,
      evmNetworkId: 10,
      nativeCurrencyDecimals: 18,
      nativeCurrencyName: "ETH",
      rpcUrl: TESTNET_RPCS.optimism || "",
    },
    {
      chainId: 34 as ChainId,
      chainName: "SCROLL",
      defaultDeliveryProviderContractAddress: testnetDefaultDeliveryProviderContractAddress,
      evmNetworkId: 534351,
      nativeCurrencyDecimals: 18,
      nativeCurrencyName: "ETH",
      rpcUrl: TESTNET_RPCS.scroll || "",
    },
    {
      chainId: 36 as ChainId,
      chainName: "BLAST",
      defaultDeliveryProviderContractAddress: testnetDefaultDeliveryProviderContractAddress,
      evmNetworkId: 23888,
      nativeCurrencyDecimals: 18,
      nativeCurrencyName: "ETH",
      rpcUrl: TESTNET_RPCS.blast || "",
    },
    {
      chainId: 37 as ChainId,
      chainName: "XLayer",
      defaultDeliveryProviderContractAddress: testnetDefaultDeliveryProviderContractAddress,
      evmNetworkId: 195,
      nativeCurrencyDecimals: 18,
      nativeCurrencyName: "OKB",
      rpcUrl: TESTNET_RPCS.xlayer || "",
    },
    {
      chainId: 35 as ChainId,
      chainName: "Mantle",
      defaultDeliveryProviderContractAddress: testnetDefaultDeliveryProviderContractAddress,
      evmNetworkId: 5001,
      nativeCurrencyDecimals: 18,
      nativeCurrencyName: "MNT",
      rpcUrl: TESTNET_RPCS.mantle || "",
    },
  ],
  guardianRpcs: ["https://wormhole-v2-testnet-api.certus.one"],
};

export const mainnetDefaultDeliveryProviderContractAddress =
  "0x7A0a53847776f7e94Cc35742971aCb2217b0Db81";
export const mainnetEnv: Environment = {
  network: "Mainnet",
  chainInfos: [
    {
      chainId: 2 as ChainId,
      chainName: "Ethereum",
      defaultDeliveryProviderContractAddress: mainnetDefaultDeliveryProviderContractAddress,
      evmNetworkId: 1,
      nativeCurrencyDecimals: 18,
      nativeCurrencyName: "ETH",
      rpcUrl: MAINNET_RPCS.ethereum || "",
    },
    {
      chainId: 4 as ChainId,
      chainName: "BSC",
      defaultDeliveryProviderContractAddress: mainnetDefaultDeliveryProviderContractAddress,
      evmNetworkId: 56,
      nativeCurrencyDecimals: 18,
      nativeCurrencyName: "BNB",
      rpcUrl: MAINNET_RPCS.bsc || "",
    },
    {
      chainId: 5 as ChainId,
      chainName: "Polygon",
      defaultDeliveryProviderContractAddress: mainnetDefaultDeliveryProviderContractAddress,
      evmNetworkId: 137,
      nativeCurrencyDecimals: 18,
      nativeCurrencyName: "MATIC",
      rpcUrl: MAINNET_RPCS.polygon || "",
    },
    {
      chainId: 6 as ChainId,
      chainName: "Avalanche",
      defaultDeliveryProviderContractAddress: mainnetDefaultDeliveryProviderContractAddress,
      evmNetworkId: 43114,
      nativeCurrencyDecimals: 18,
      nativeCurrencyName: "AVAX",
      rpcUrl: MAINNET_RPCS.avalanche || "",
    },
    {
      chainId: 10 as ChainId,
      chainName: "Fantom",
      defaultDeliveryProviderContractAddress: mainnetDefaultDeliveryProviderContractAddress,
      evmNetworkId: 250,
      nativeCurrencyDecimals: 18,
      nativeCurrencyName: "FTM",
      rpcUrl: MAINNET_RPCS.fantom || "",
    },
    // {
    //   chainId: 12 as ChainId,
    //   chainName: "Acala",
    //   defaultDeliveryProviderContractAddress:
    //   evmNetworkId: 787,
    //   mainnetDefaultDeliveryProviderContractAddress,
    //   nativeCurrencyDecimals: 18,
    //   nativeCurrencyName: "ACA",
    //   rpcUrl: MAINNET_RPCS.ethereum || "",
    // },
    {
      chainId: 13 as ChainId,
      chainName: "Klaytn",
      defaultDeliveryProviderContractAddress: mainnetDefaultDeliveryProviderContractAddress,
      evmNetworkId: 8217,
      nativeCurrencyDecimals: 18,
      nativeCurrencyName: "KLAY",
      rpcUrl: MAINNET_RPCS.klaytn || "",
    },
    {
      chainId: 14 as ChainId,
      chainName: "Celo",
      defaultDeliveryProviderContractAddress: mainnetDefaultDeliveryProviderContractAddress,
      evmNetworkId: 42220,
      nativeCurrencyDecimals: 18,
      nativeCurrencyName: "Celo",
      rpcUrl: MAINNET_RPCS.celo || "",
    },
    {
      chainId: 16 as ChainId,
      chainName: "Moonbeam",
      defaultDeliveryProviderContractAddress: mainnetDefaultDeliveryProviderContractAddress,
      evmNetworkId: 1284,
      nativeCurrencyDecimals: 18,
      nativeCurrencyName: "GLMR",
      rpcUrl: MAINNET_RPCS.moonbeam || "",
    },
    {
      chainId: 23 as ChainId,
      chainName: "Arbitrum",
      defaultDeliveryProviderContractAddress: mainnetDefaultDeliveryProviderContractAddress,
      evmNetworkId: 42161,
      nativeCurrencyDecimals: 18,
      nativeCurrencyName: "ETH",
      rpcUrl: MAINNET_RPCS.arbitrum || "",
    },
    {
      chainId: 24 as ChainId,
      chainName: "Optimism",
      defaultDeliveryProviderContractAddress: mainnetDefaultDeliveryProviderContractAddress,
      evmNetworkId: 10,
      nativeCurrencyDecimals: 18,
      nativeCurrencyName: "ETH",
      rpcUrl: MAINNET_RPCS.optimism || "",
    },
    {
      chainId: 30 as ChainId,
      chainName: "BASE",
      defaultDeliveryProviderContractAddress: mainnetDefaultDeliveryProviderContractAddress,
      evmNetworkId: 8453,
      nativeCurrencyDecimals: 18,
      nativeCurrencyName: "ETH",
      rpcUrl: MAINNET_RPCS.base || "",
    },
    {
      chainId: 34 as ChainId,
      chainName: "SCROLL",
      defaultDeliveryProviderContractAddress: mainnetDefaultDeliveryProviderContractAddress,
      evmNetworkId: 534352,
      nativeCurrencyDecimals: 18,
      nativeCurrencyName: "ETH",
      rpcUrl: MAINNET_RPCS.scroll || "",
    },
    {
      chainId: 35 as ChainId,
      chainName: "Mantle",
      defaultDeliveryProviderContractAddress: mainnetDefaultDeliveryProviderContractAddress,
      evmNetworkId: 5000,
      nativeCurrencyDecimals: 18,
      nativeCurrencyName: "MNT",
      rpcUrl: MAINNET_RPCS.mantle || "",
    },
    {
      chainId: 36 as ChainId,
      chainName: "BLAST",
      defaultDeliveryProviderContractAddress: mainnetDefaultDeliveryProviderContractAddress,
      evmNetworkId: 81457,
      nativeCurrencyDecimals: 18,
      nativeCurrencyName: "ETH",
      rpcUrl: MAINNET_RPCS.blast || "",
    },
    {
      chainId: 37 as ChainId,
      chainName: "XLayer",
      defaultDeliveryProviderContractAddress: mainnetDefaultDeliveryProviderContractAddress,
      evmNetworkId: 196,
      nativeCurrencyDecimals: 18,
      nativeCurrencyName: "OKB",
      rpcUrl: MAINNET_RPCS.xlayer || "",
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

export function getEthersProvider(chainInfo: ChainInfo) {
  const provider = new JsonRpcProvider(chainInfo.rpcUrl);

  if (chainInfo?.rpcUrl) return provider;

  return null;
}

export function getChainInfo(env: Environment, chainId: ChainId): ChainInfo {
  const output = env.chainInfos.find(chainInfo => chainInfo.chainId === chainId);

  if (output === undefined) {
    console.error(`Unknown chainId ${chainId}`);
  }

  return output;
}
