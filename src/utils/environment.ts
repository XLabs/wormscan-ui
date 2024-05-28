import {
  CHAIN_ID_ARBITRUM,
  CHAIN_ID_AVAX,
  CHAIN_ID_BASE,
  CHAIN_ID_BSC,
  CHAIN_ID_CELO,
  CHAIN_ID_ETH,
  CHAIN_ID_OPTIMISM,
  CHAIN_ID_POLYGON,
  CHAIN_ID_XLAYER,
  ChainId,
  ChainName,
  Network,
} from "@certusone/wormhole-sdk";
import { ethers } from "ethers";

export const SLOW_FINALITY_CHAINS = [
  CHAIN_ID_ETH,
  CHAIN_ID_POLYGON,
  CHAIN_ID_BSC,
  CHAIN_ID_OPTIMISM,
  CHAIN_ID_ARBITRUM,
  CHAIN_ID_AVAX,
  CHAIN_ID_BASE,
  CHAIN_ID_CELO,
  CHAIN_ID_XLAYER,
];

const MAINNET_RPCS: { [key in ChainName]?: string } = {
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

const TESTNET_RPCS: { [key in ChainName]?: string } = {
  arbitrum: "https://goerli-rollup.arbitrum.io/rpc",
  arbitrum_sepolia: "https://sepolia-rollup.arbitrum.io/rpc",
  avalanche: "https://api.avax-test.network/ext/bc/C/rpc",
  base: "https://goerli.base.org",
  base_sepolia: "https://sepolia.base.org",
  bsc: "https://data-seed-prebsc-2-s3.binance.org:8545",
  celo: "https://alfajores-forno.celo-testnet.org",
  ethereum: "https://rpc.ankr.com/eth_goerli",
  moonbeam: "https://rpc.api.moonbase.moonbeam.network",
  sepolia: "https://ethereum-sepolia.publicnode.com",
  optimism: "https://goerli.optimism.io",
  optimism_sepolia: "https://sepolia.optimism.io",
  polygon: "https://rpc.ankr.com/polygon_mumbai",
  scroll: "https://rpc.ankr.com/scroll_sepolia_testnet",
  blast: "http://testnet-rpc.blastblockchain.com",
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
  relayerContractAddress: string;
  defaultDeliveryProviderContractAddress: string;
  rpcUrl: string;
};

export const testnetDefaultDeliveryProviderContractAddress =
  "0x60a86b97a7596eBFd25fb769053894ed0D9A8366";
export const testnetEnv: Environment = {
  network: "TESTNET",
  chainInfos: [
    {
      chainId: 2 as ChainId,
      chainName: "Ethereum",
      defaultDeliveryProviderContractAddress: testnetDefaultDeliveryProviderContractAddress,
      evmNetworkId: 5, // https://chainlist.org/chain/5
      nativeCurrencyDecimals: 18,
      nativeCurrencyName: "ETH",
      relayerContractAddress: "0x28d8f1be96f97c1387e94a53e00eccfb4e75175a",
      rpcUrl: TESTNET_RPCS.ethereum || "",
    },
    {
      chainId: 10002 as ChainId,
      chainName: "Sepolia",
      defaultDeliveryProviderContractAddress: testnetDefaultDeliveryProviderContractAddress,
      evmNetworkId: 11155111, // https://chainlist.org/chain/11155111
      nativeCurrencyDecimals: 18,
      nativeCurrencyName: "ETH",
      relayerContractAddress: "0x7b1bd7a6b4e61c2a123ac6bc2cbfc614437d0470",
      rpcUrl: TESTNET_RPCS.sepolia || "",
    },
    {
      chainId: 10003 as ChainId,
      chainName: "Arbitrum Sepolia",
      defaultDeliveryProviderContractAddress: testnetDefaultDeliveryProviderContractAddress,
      evmNetworkId: 421614, // https://chainlist.org/chain/421614
      nativeCurrencyDecimals: 18,
      nativeCurrencyName: "ETH",
      relayerContractAddress: "0x7B1bD7a6b4E61c2a123AC6BC2cbfC614437D0470",
      rpcUrl: TESTNET_RPCS.arbitrum_sepolia || "",
    },
    {
      chainId: 10004 as ChainId,
      chainName: "BASE Sepolia",
      defaultDeliveryProviderContractAddress: testnetDefaultDeliveryProviderContractAddress,
      evmNetworkId: 84532, // https://chainlist.org/chain/84532
      nativeCurrencyDecimals: 18,
      nativeCurrencyName: "ETH",
      relayerContractAddress: "0x93BAD53DDfB6132b0aC8E37f6029163E63372cEE",
      rpcUrl: TESTNET_RPCS.base_sepolia || "",
    },
    {
      chainId: 10005 as ChainId,
      chainName: "Optimism Sepolia",
      defaultDeliveryProviderContractAddress: testnetDefaultDeliveryProviderContractAddress,
      evmNetworkId: 11155420, // https://chainlist.org/chain/11155420
      nativeCurrencyDecimals: 18,
      nativeCurrencyName: "ETH",
      relayerContractAddress: "0x93BAD53DDfB6132b0aC8E37f6029163E63372cEE",
      rpcUrl: TESTNET_RPCS.optimism_sepolia || "",
    },
    {
      chainId: 4 as ChainId,
      chainName: "BSC - Testnet",
      defaultDeliveryProviderContractAddress: testnetDefaultDeliveryProviderContractAddress,
      evmNetworkId: 97,
      nativeCurrencyDecimals: 18,
      nativeCurrencyName: "BNB",
      relayerContractAddress: "0x80aC94316391752A193C1c47E27D382b507c93F3",
      rpcUrl: TESTNET_RPCS.bsc || "",
    },
    {
      chainId: 5 as ChainId,
      chainName: "Mumbai",
      defaultDeliveryProviderContractAddress: testnetDefaultDeliveryProviderContractAddress,
      evmNetworkId: 80001,
      nativeCurrencyDecimals: 18,
      nativeCurrencyName: "MATIC",
      relayerContractAddress: "0x0591C25ebd0580E0d4F27A82Fc2e24E7489CB5e0",
      rpcUrl: TESTNET_RPCS.polygon || "",
    },
    {
      chainId: 6 as ChainId,
      chainName: "Fuji",
      defaultDeliveryProviderContractAddress: testnetDefaultDeliveryProviderContractAddress,
      evmNetworkId: 43113,
      nativeCurrencyDecimals: 18,
      nativeCurrencyName: "AVAX",
      relayerContractAddress: "0xA3cF45939bD6260bcFe3D66bc73d60f19e49a8BB",
      rpcUrl: TESTNET_RPCS.avalanche || "",
    },
    {
      chainId: 14 as ChainId,
      chainName: "Celo - Alfajores",
      defaultDeliveryProviderContractAddress: testnetDefaultDeliveryProviderContractAddress,
      evmNetworkId: 44787,
      nativeCurrencyDecimals: 18,
      nativeCurrencyName: "Celo",
      relayerContractAddress: "0x306B68267Deb7c5DfCDa3619E22E9Ca39C374f84",
      rpcUrl: TESTNET_RPCS.celo || "",
    },
    {
      chainId: 16 as ChainId,
      chainName: "Moonbase Alpha",
      defaultDeliveryProviderContractAddress: testnetDefaultDeliveryProviderContractAddress,
      evmNetworkId: 1287,
      nativeCurrencyDecimals: 18,
      nativeCurrencyName: "GLMR",
      relayerContractAddress: "0x0591C25ebd0580E0d4F27A82Fc2e24E7489CB5e0",
      rpcUrl: TESTNET_RPCS.moonbeam || "",
    },
    {
      chainId: 30 as ChainId,
      chainName: "BASE Goerli",
      defaultDeliveryProviderContractAddress: testnetDefaultDeliveryProviderContractAddress,
      evmNetworkId: 84531,
      nativeCurrencyDecimals: 18,
      nativeCurrencyName: "ETH",
      relayerContractAddress: "0xea8029CD7FCAEFFcD1F53686430Db0Fc8ed384E1",
      rpcUrl: TESTNET_RPCS.base || "",
    },
    {
      chainId: 23 as ChainId,
      chainName: "Arbitrum",
      defaultDeliveryProviderContractAddress: null,
      evmNetworkId: 42161,
      nativeCurrencyDecimals: 18,
      nativeCurrencyName: "ETH",
      relayerContractAddress: "0xad753479354283eee1b86c9470c84d42f229ff43",
      rpcUrl: TESTNET_RPCS.arbitrum || "",
    },
    {
      chainId: 24 as ChainId,
      chainName: "Optimism",
      defaultDeliveryProviderContractAddress: null,
      evmNetworkId: 10,
      nativeCurrencyDecimals: 18,
      nativeCurrencyName: "ETH",
      relayerContractAddress: "0x01A957A525a5b7A72808bA9D10c389674E459891",
      rpcUrl: TESTNET_RPCS.optimism || "",
    },
    {
      chainId: 34 as ChainId,
      chainName: "SCROLL",
      defaultDeliveryProviderContractAddress: testnetDefaultDeliveryProviderContractAddress,
      evmNetworkId: 534351,
      nativeCurrencyDecimals: 18,
      nativeCurrencyName: "ETH",
      relayerContractAddress: "", // TODO: ADD WHEN EXISTS
      rpcUrl: TESTNET_RPCS.scroll || "",
    },
    {
      chainId: 36 as ChainId,
      chainName: "BLAST",
      defaultDeliveryProviderContractAddress: testnetDefaultDeliveryProviderContractAddress,
      evmNetworkId: 23888,
      nativeCurrencyDecimals: 18,
      nativeCurrencyName: "ETH",
      relayerContractAddress: "", // TODO: ADD WHEN EXISTS
      rpcUrl: TESTNET_RPCS.blast || "",
    },
    {
      chainId: 37 as ChainId,
      chainName: "XLayer",
      defaultDeliveryProviderContractAddress: testnetDefaultDeliveryProviderContractAddress,
      evmNetworkId: 195,
      nativeCurrencyDecimals: 18,
      nativeCurrencyName: "OKB",
      relayerContractAddress: "", // TODO: ADD WHEN EXISTS
      rpcUrl: TESTNET_RPCS.xlayer || "",
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
      chainName: "Ethereum",
      defaultDeliveryProviderContractAddress: mainnetDefaultDeliveryProviderContractAddress,
      evmNetworkId: 1,
      nativeCurrencyDecimals: 18,
      nativeCurrencyName: "ETH",
      relayerContractAddress: "0x27428DD2d3DD32A4D7f7C497eAaa23130d894911",
      rpcUrl: MAINNET_RPCS.ethereum || "",
    },
    {
      chainId: 4 as ChainId,
      chainName: "BSC",
      defaultDeliveryProviderContractAddress: mainnetDefaultDeliveryProviderContractAddress,
      evmNetworkId: 56,
      nativeCurrencyDecimals: 18,
      nativeCurrencyName: "BNB",
      relayerContractAddress: "0x27428DD2d3DD32A4D7f7C497eAaa23130d894911",
      rpcUrl: MAINNET_RPCS.bsc || "",
    },
    {
      chainId: 5 as ChainId,
      chainName: "Polygon",
      defaultDeliveryProviderContractAddress: mainnetDefaultDeliveryProviderContractAddress,
      evmNetworkId: 137,
      nativeCurrencyDecimals: 18,
      nativeCurrencyName: "MATIC",
      relayerContractAddress: "0x27428DD2d3DD32A4D7f7C497eAaa23130d894911",
      rpcUrl: MAINNET_RPCS.polygon || "",
    },
    {
      chainId: 6 as ChainId,
      chainName: "Avalanche",
      defaultDeliveryProviderContractAddress: mainnetDefaultDeliveryProviderContractAddress,
      evmNetworkId: 43114,
      nativeCurrencyDecimals: 18,
      nativeCurrencyName: "AVAX",
      relayerContractAddress: "0x27428DD2d3DD32A4D7f7C497eAaa23130d894911",
      rpcUrl: MAINNET_RPCS.avalanche || "",
    },
    {
      chainId: 10 as ChainId,
      chainName: "Fantom",
      defaultDeliveryProviderContractAddress: mainnetDefaultDeliveryProviderContractAddress,
      evmNetworkId: 250,
      nativeCurrencyDecimals: 18,
      nativeCurrencyName: "FTM",
      relayerContractAddress: "0x27428DD2d3DD32A4D7f7C497eAaa23130d894911",
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
    //   relayerContractAddress: "0x27428DD2d3DD32A4D7f7C497eAaa23130d894911",
    //   rpcUrl: MAINNET_RPCS.ethereum || "",
    // },
    {
      chainId: 13 as ChainId,
      chainName: "Klaytn",
      defaultDeliveryProviderContractAddress: mainnetDefaultDeliveryProviderContractAddress,
      evmNetworkId: 8217,
      nativeCurrencyDecimals: 18,
      nativeCurrencyName: "KLAY",
      relayerContractAddress: "0x27428DD2d3DD32A4D7f7C497eAaa23130d894911",
      rpcUrl: MAINNET_RPCS.klaytn || "",
    },
    {
      chainId: 14 as ChainId,
      chainName: "Celo",
      defaultDeliveryProviderContractAddress: mainnetDefaultDeliveryProviderContractAddress,
      evmNetworkId: 42220,
      nativeCurrencyDecimals: 18,
      nativeCurrencyName: "Celo",
      relayerContractAddress: "0x27428DD2d3DD32A4D7f7C497eAaa23130d894911",
      rpcUrl: MAINNET_RPCS.celo || "",
    },
    {
      chainId: 16 as ChainId,
      chainName: "Moonbeam",
      defaultDeliveryProviderContractAddress: mainnetDefaultDeliveryProviderContractAddress,
      evmNetworkId: 1284,
      nativeCurrencyDecimals: 18,
      nativeCurrencyName: "GLMR",
      relayerContractAddress: "0x27428DD2d3DD32A4D7f7C497eAaa23130d894911",
      rpcUrl: MAINNET_RPCS.moonbeam || "",
    },
    {
      chainId: 23 as ChainId,
      chainName: "Arbitrum",
      defaultDeliveryProviderContractAddress: mainnetDefaultDeliveryProviderContractAddress,
      evmNetworkId: 42161,
      nativeCurrencyDecimals: 18,
      nativeCurrencyName: "ETH",
      relayerContractAddress: "0x27428DD2d3DD32A4D7f7C497eAaa23130d894911",
      rpcUrl: MAINNET_RPCS.arbitrum || "",
    },
    {
      chainId: 24 as ChainId,
      chainName: "Optimism",
      defaultDeliveryProviderContractAddress: mainnetDefaultDeliveryProviderContractAddress,
      evmNetworkId: 10,
      nativeCurrencyDecimals: 18,
      nativeCurrencyName: "ETH",
      relayerContractAddress: "0x27428DD2d3DD32A4D7f7C497eAaa23130d894911",
      rpcUrl: MAINNET_RPCS.optimism || "",
    },
    {
      chainId: 30 as ChainId,
      chainName: "BASE",
      defaultDeliveryProviderContractAddress: mainnetDefaultDeliveryProviderContractAddress,
      evmNetworkId: 8453,
      nativeCurrencyDecimals: 18,
      nativeCurrencyName: "ETH",
      relayerContractAddress: "0x706f82e9bb5b0813501714ab5974216704980e31",
      rpcUrl: MAINNET_RPCS.base || "",
    },
    {
      chainId: 34 as ChainId,
      chainName: "SCROLL",
      defaultDeliveryProviderContractAddress: mainnetDefaultDeliveryProviderContractAddress,
      evmNetworkId: 534352,
      nativeCurrencyDecimals: 18,
      nativeCurrencyName: "ETH",
      relayerContractAddress: "", // TODO: ADD WHEN EXISTS
      rpcUrl: MAINNET_RPCS.scroll || "",
    },
    {
      chainId: 36 as ChainId,
      chainName: "BLAST",
      defaultDeliveryProviderContractAddress: mainnetDefaultDeliveryProviderContractAddress,
      evmNetworkId: 81457,
      nativeCurrencyDecimals: 18,
      nativeCurrencyName: "ETH",
      relayerContractAddress: "", // TODO: ADD WHEN EXISTS
      rpcUrl: MAINNET_RPCS.blast || "",
    },
    {
      chainId: 37 as ChainId,
      chainName: "XLayer",
      defaultDeliveryProviderContractAddress: mainnetDefaultDeliveryProviderContractAddress,
      evmNetworkId: 196,
      nativeCurrencyDecimals: 18,
      nativeCurrencyName: "OKB",
      relayerContractAddress: "", // TODO: ADD WHEN EXISTS
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
  if (chainInfo?.rpcUrl) return new ethers.providers.JsonRpcProvider(chainInfo.rpcUrl);

  return null;
}

export function getChainInfo(env: Environment, chainId: ChainId): ChainInfo {
  const output = env.chainInfos.find(chainInfo => chainInfo.chainId === chainId);

  if (output === undefined) {
    console.error(`Unknown chainId ${chainId}`);
  }

  return output;
}
