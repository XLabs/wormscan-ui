import { toast } from "react-toastify";
import {
  ChainId,
  CHAIN_ID_ACALA,
  CHAIN_ID_ARBITRUM,
  CHAIN_ID_AURORA,
  CHAIN_ID_AVAX,
  CHAIN_ID_BASE,
  CHAIN_ID_BSC,
  CHAIN_ID_CELO,
  CHAIN_ID_ETH,
  CHAIN_ID_FANTOM,
  CHAIN_ID_KARURA,
  CHAIN_ID_KLAYTN,
  CHAIN_ID_MOONBEAM,
  CHAIN_ID_NEON,
  CHAIN_ID_OASIS,
  CHAIN_ID_OPTIMISM,
  CHAIN_ID_POLYGON,
  Network,
} from "@certusone/wormhole-sdk";
import detectEthereumProvider from "@metamask/detect-provider";

export interface AddEthereumChainParameter {
  chainId: string; // A 0x-prefixed hexadecimal string
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string; // 2-6 characters long
    decimals: 18;
  };
  rpcUrls: string[];
  blockExplorerUrls?: string[];
  iconUrls?: string[]; // Currently ignored.
}

export interface TokenInfo {
  targetSymbol: string;
  tokenAddress: string;
  tokenDecimals: number;
  tokenImage: string;
  tokenSymbol: string;
}

interface ChainData {
  MAINNET: number;
  TESTNET: number;
  DEVNET: number;
}

interface ChainIds {
  [key: string]: ChainData;
}

interface AddToken {
  currentNetwork: Network;
  toChain: ChainId;
  tokenInfo: TokenInfo;
}

export const METAMASK_CHAIN_PARAMETERS: {
  [evmChainId: number]: AddEthereumChainParameter;
} = {
  1: {
    chainId: "0x1",
    chainName: "Ethereum Mainnet",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://rpc.ankr.com/eth"],
    blockExplorerUrls: ["https://etherscan.io"],
  },
  3: {
    chainId: "0x3",
    chainName: "Ropsten",
    nativeCurrency: { name: "Ropsten Ether", symbol: "ROP", decimals: 18 },
    rpcUrls: ["https://rpc.ankr.com/eth_ropsten"],
    blockExplorerUrls: ["https://ropsten.etherscan.io"],
  },
  5: {
    chainId: "0x5",
    chainName: "Görli",
    nativeCurrency: { name: "Görli Ether", symbol: "GOR", decimals: 18 },
    rpcUrls: ["https://rpc.ankr.com/eth_goerli"],
    blockExplorerUrls: ["https://goerli.etherscan.io"],
  },
  10: {
    chainId: "0xA",
    chainName: "Optimism",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://rpc.ankr.com/optimism"],
    blockExplorerUrls: ["https://optimistic.etherscan.io"],
  },
  420: {
    chainId: "0x1A4",
    chainName: "Optimism Goerli Testnet",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://rpc.ankr.com/optimism_testnet"],
    blockExplorerUrls: ["https://optimistic.etherscan.io"],
  },
  56: {
    chainId: "0x38",
    chainName: "BNB Chain Mainnet",
    nativeCurrency: {
      name: "Binance Chain Native Token",
      symbol: "BNB",
      decimals: 18,
    },
    rpcUrls: ["https://bsc-dataseed.binance.org"],
    blockExplorerUrls: ["https://bscscan.com"],
  },
  97: {
    chainId: "0x61",
    chainName: "BNB Chain Testnet",
    nativeCurrency: {
      name: "Binance Chain Native Token",
      symbol: "BNB",
      decimals: 18,
    },
    rpcUrls: ["https://data-seed-prebsc-1-s1.binance.org:8545"],
    blockExplorerUrls: ["https://testnet.bscscan.com"],
  },
  137: {
    chainId: "0x89",
    chainName: "Polygon Mainnet",
    nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
    rpcUrls: ["https://polygon-rpc.com"],
    blockExplorerUrls: ["https://polygonscan.com"],
  },
  250: {
    chainId: "0xfa",
    chainName: "Fantom Opera",
    nativeCurrency: { name: "Fantom", symbol: "FTM", decimals: 18 },
    rpcUrls: ["https://rpc.ftm.tools"],
    blockExplorerUrls: ["https://ftmscan.com"],
  },
  596: {
    chainId: "0x254",
    chainName: "Karura Testnet",
    nativeCurrency: { name: "Karura Token", symbol: "KAR", decimals: 18 },
    rpcUrls: ["https://karura-dev.aca-dev.network/eth/http"],
    blockExplorerUrls: ["https://blockscout.karura-dev.aca-dev.network"],
  },
  597: {
    chainId: "0x255",
    chainName: "Acala Testnet",
    nativeCurrency: { name: "Acala Token", symbol: "ACA", decimals: 18 },
    rpcUrls: ["https://acala-dev.aca-dev.network/eth/http"],
    blockExplorerUrls: ["https://blockscout.acala-dev.aca-dev.network"],
  },
  686: {
    chainId: "0x2AE",
    chainName: "Karura",
    nativeCurrency: { name: "Karura Token", symbol: "KAR", decimals: 18 },
    rpcUrls: ["https://eth-rpc-karura.aca-api.network"],
    blockExplorerUrls: ["https://blockscout.karura.network"],
  },
  787: {
    chainId: "0x313",
    chainName: "Acala",
    nativeCurrency: { name: "Acala Token", symbol: "ACA", decimals: 18 },
    rpcUrls: ["https://eth-rpc-acala.aca-api.network"],
    blockExplorerUrls: ["https://blockscout.acala.network"],
  },
  4002: {
    chainId: "0xfa2",
    chainName: "Fantom Testnet",
    nativeCurrency: { name: "Fantom", symbol: "FTM", decimals: 18 },
    rpcUrls: ["https://rpc.testnet.fantom.network"],
    blockExplorerUrls: ["https://testnet.ftmscan.com"],
  },
  8217: {
    chainId: "0x2019",
    chainName: "Klaytn",
    nativeCurrency: { name: "Klay", symbol: "KLAY", decimals: 18 },
    rpcUrls: ["https://klaytn.drpc.org"],
    blockExplorerUrls: ["https://scope.klaytn.com"],
  },
  1001: {
    chainId: "0x3E9",
    chainName: "Klaytn Testnet Baobab",
    nativeCurrency: { name: "Klay", symbol: "KLAY", decimals: 18 },
    rpcUrls: ["https://klaytn-baobab.drpc.org"],
    blockExplorerUrls: ["https://baobab.klaytnscope.com"],
  },
  42220: {
    chainId: "0xa4ec",
    chainName: "Celo",
    nativeCurrency: { name: "Celo", symbol: "CELO", decimals: 18 },
    rpcUrls: ["https://forno.celo.org"],
    blockExplorerUrls: ["https://explorer.celo.org"],
  },
  44787: {
    chainId: "0xaef3",
    chainName: "Celo (Alfajores Testnet)",
    nativeCurrency: { name: "Celo", symbol: "CELO", decimals: 18 },
    rpcUrls: ["https://alfajores-forno.celo-testnet.org"],
    blockExplorerUrls: ["https://alfajores-blockscout.celo-testnet.org"],
  },
  42261: {
    chainId: "0xa515",
    chainName: "Emerald Paratime Testnet",
    nativeCurrency: { name: "Emerald Rose", symbol: "ROSE", decimals: 18 },
    rpcUrls: ["https://testnet.emerald.oasis.dev"],
    blockExplorerUrls: ["https://testnet.explorer.emerald.oasis.dev"],
  },
  42262: {
    chainId: "0xa516",
    chainName: "Emerald Paratime Mainnet",
    nativeCurrency: { name: "Emerald Rose", symbol: "ROSE", decimals: 18 },
    rpcUrls: ["https://emerald.oasis.dev"],
    blockExplorerUrls: ["https://explorer.emerald.oasis.dev"],
  },
  43113: {
    chainId: "0xa869",
    chainName: "Avalanche Fuji Testnet",
    nativeCurrency: { name: "Avalanche", symbol: "AVAX", decimals: 18 },
    rpcUrls: ["https://api.avax-test.network/ext/bc/C/rpc"],
    blockExplorerUrls: ["https://testnet.snowtrace.io/"],
  },
  43114: {
    chainId: "0xa86a",
    chainName: "Avalanche C-Chain",
    nativeCurrency: { name: "Avalanche", symbol: "AVAX", decimals: 18 },
    rpcUrls: ["https://api.avax.network/ext/bc/C/rpc"],
    blockExplorerUrls: ["https://snowtrace.io/"],
  },
  80001: {
    chainId: "0x13881",
    chainName: "Mumbai",
    nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
    rpcUrls: ["https://rpc-mumbai.maticvigil.com"],
    blockExplorerUrls: ["https://mumbai.polygonscan.com"],
  },
  42161: {
    chainId: "0xA4B1",
    chainName: "Arbitrum One",
    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://arb1.arbitrum.io/rpc"],
    blockExplorerUrls: ["https://arbiscan.io"],
  },
  421613: {
    chainId: "0x66EED",
    chainName: "Arbitrum Görli",
    nativeCurrency: { name: "AGOR", symbol: "AGOR", decimals: 18 },
    rpcUrls: ["https://goerli-rollup.arbitrum.io/rpc"],
    blockExplorerUrls: ["https://goerli.arbiscan.io"],
  },
  245022926: {
    chainId: "0xE9AC0CE",
    chainName: "remote proxy — solana devnet",
    nativeCurrency: { name: "NEON", symbol: "NEON", decimals: 18 },
    rpcUrls: ["https://proxy.devnet.neonlabs.org/solana"],
    blockExplorerUrls: ["https://neonscan.org/"],
  },
  1313161554: {
    chainId: "0x4e454152",
    chainName: "Aurora Mainnet",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://mainnet.aurora.dev"],
    blockExplorerUrls: ["https://aurorascan.dev"],
  },
  1313161555: {
    chainId: "0x4e454153",
    chainName: "Aurora Testnet",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://testnet.aurora.dev"],
    blockExplorerUrls: ["https://testnet.aurorascan.dev"],
  },
  1284: {
    chainId: "0x504",
    chainName: "Moonbeam",
    nativeCurrency: { name: "Glimmer", symbol: "GLMR", decimals: 18 },
    rpcUrls: ["https://rpc.ankr.com/moonbeam"],
    blockExplorerUrls: ["https://moonscan.io"],
  },
  1287: {
    chainId: "0x507",
    chainName: "Moonbase Alpha",
    nativeCurrency: { name: "DEV", symbol: "DEV", decimals: 18 },
    rpcUrls: ["https://rpc.testnet.moonbeam.network"],
    blockExplorerUrls: ["https://moonbase.moonscan.io"],
  },
  8453: {
    chainId: "0x2105",
    chainName: "Base",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://developer-access-mainnet.base.org"],
    blockExplorerUrls: ["https://goerli.basescan.org"],
  },
  84531: {
    chainId: "0x14A33",
    chainName: "Base Goerli",
    nativeCurrency: { name: "Goerli Ether", symbol: "GOR", decimals: 18 },
    rpcUrls: ["https://goerli.base.org"],
    blockExplorerUrls: ["https://goerli.basescan.org"],
  },
  84532: {
    chainId: "0x14a34",
    chainName: "Base Sepolia",
    nativeCurrency: { name: "Sepolia Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://sepolia.base.org"],
    blockExplorerUrls: ["https://sepolia-explorer.base.org"],
  },
};

export const CHAIN_IDS: ChainIds = {
  ETH_NETWORK_CHAIN_ID: { MAINNET: 1, TESTNET: 5, DEVNET: 5 },
  ROPSTEN_ETH_NETWORK_CHAIN_ID: { MAINNET: 1, TESTNET: 3, DEVNET: 3 },
  BSC_NETWORK_CHAIN_ID: { MAINNET: 56, TESTNET: 97, DEVNET: 97 },
  POLYGON_NETWORK_CHAIN_ID: { MAINNET: 137, TESTNET: 80001, DEVNET: 80001 },
  AVAX_NETWORK_CHAIN_ID: { MAINNET: 43114, TESTNET: 43113, DEVNET: 43113 },
  OASIS_NETWORK_CHAIN_ID: { MAINNET: 42262, TESTNET: 42261, DEVNET: 42261 },
  AURORA_NETWORK_CHAIN_ID: { MAINNET: 1313161554, TESTNET: 1313161555, DEVNET: 1313161555 },
  FANTOM_NETWORK_CHAIN_ID: { MAINNET: 250, TESTNET: 4002, DEVNET: 4002 },
  KARURA_NETWORK_CHAIN_ID: { MAINNET: 686, TESTNET: 596, DEVNET: 596 },
  ACALA_NETWORK_CHAIN_ID: { MAINNET: 787, TESTNET: 597, DEVNET: 597 },
  KLAYTN_NETWORK_CHAIN_ID: { MAINNET: 8217, TESTNET: 1001, DEVNET: 1001 },
  CELO_NETWORK_CHAIN_ID: { MAINNET: 42220, TESTNET: 44787, DEVNET: 44787 },
  NEON_NETWORK_CHAIN_ID: { MAINNET: 245022934, TESTNET: 245022926, DEVNET: 245022926 },
  MOONBEAM_NETWORK_CHAIN_ID: { MAINNET: 1284, TESTNET: 1287, DEVNET: 1287 },
  ARBITRUM_NETWORK_CHAIN_ID: { MAINNET: 42161, TESTNET: 421613, DEVNET: 421613 },
  OPTIMISM_NETWORK_CHAIN_ID: { MAINNET: 10, TESTNET: 420, DEVNET: 420 },
  BASE_NETWORK_CHAIN_ID: { MAINNET: 8453, TESTNET: 84531, DEVNET: 84531 },
};

export const getEvmChainId = (chainId: ChainId, currentNetwork: Network): number | undefined => {
  const chainNetworks = {
    [CHAIN_ID_ETH]: CHAIN_IDS.ETH_NETWORK_CHAIN_ID[currentNetwork],
    [CHAIN_ID_BSC]: CHAIN_IDS.BSC_NETWORK_CHAIN_ID[currentNetwork],
    [CHAIN_ID_POLYGON]: CHAIN_IDS.POLYGON_NETWORK_CHAIN_ID[currentNetwork],
    [CHAIN_ID_AVAX]: CHAIN_IDS.AVAX_NETWORK_CHAIN_ID[currentNetwork],
    [CHAIN_ID_OASIS]: CHAIN_IDS.OASIS_NETWORK_CHAIN_ID[currentNetwork],
    [CHAIN_ID_AURORA]: CHAIN_IDS.AURORA_NETWORK_CHAIN_ID[currentNetwork],
    [CHAIN_ID_FANTOM]: CHAIN_IDS.FANTOM_NETWORK_CHAIN_ID[currentNetwork],
    [CHAIN_ID_KARURA]: CHAIN_IDS.KARURA_NETWORK_CHAIN_ID[currentNetwork],
    [CHAIN_ID_ACALA]: CHAIN_IDS.ACALA_NETWORK_CHAIN_ID[currentNetwork],
    [CHAIN_ID_KLAYTN]: CHAIN_IDS.KLAYTN_NETWORK_CHAIN_ID[currentNetwork],
    [CHAIN_ID_CELO]: CHAIN_IDS.CELO_NETWORK_CHAIN_ID[currentNetwork],
    [CHAIN_ID_NEON]: CHAIN_IDS.NEON_NETWORK_CHAIN_ID[currentNetwork],
    [CHAIN_ID_MOONBEAM]: CHAIN_IDS.MOONBEAM_NETWORK_CHAIN_ID[currentNetwork],
    [CHAIN_ID_ARBITRUM]: CHAIN_IDS.ARBITRUM_NETWORK_CHAIN_ID[currentNetwork],
    [CHAIN_ID_OPTIMISM]: CHAIN_IDS.OPTIMISM_NETWORK_CHAIN_ID[currentNetwork],
    [CHAIN_ID_BASE]: CHAIN_IDS.BASE_NETWORK_CHAIN_ID[currentNetwork],
  };

  const evmChainId = chainNetworks[chainId as keyof typeof chainNetworks];
  if (evmChainId) return evmChainId;

  return undefined;
};

export const getTokenLogo = async ({ tokenAddress }: { tokenAddress: string }) => {
  const data = await fetch(process.env.WORMHOLE_MARKET_TOKENS_URL).then(res => res.json());
  const tokens = data?.tokens;
  let logo;
  for (const chainId in tokens) {
    if (tokens[chainId][tokenAddress]) {
      logo = tokens[chainId][tokenAddress].logo;
      break;
    }
  }

  return logo;
};

export const addToken = async ({ currentNetwork, toChain, tokenInfo }: AddToken) => {
  const { targetSymbol, tokenAddress, tokenDecimals, tokenImage, tokenSymbol } = tokenInfo || {};
  const correctEvmNetwork = getEvmChainId(toChain, currentNetwork);

  try {
    const ethereum = (await detectEthereumProvider()) as any;

    if (!ethereum) {
      toast("MetaMask not found", {
        type: "error",
        theme: "dark",
        style: {
          background: "var(--color-primary-500)",
          color: "var(--color-primary-10)",
        },
      });
      return;
    }

    // Add token to MetaMask
    const addAsset = async () => {
      const wasAdded = await ethereum.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20",
          options: {
            address: tokenAddress,
            symbol: tokenSymbol,
            decimals: tokenDecimals,
            image: tokenImage,
          },
        },
      });

      wasAdded
        ? toast(`${targetSymbol} has been added to MetaMask`, {
            type: "success",
            theme: "dark",
            style: {
              background: "var(--color-primary-500)",
              color: "var(--color-primary-10)",
            },
          })
        : console.log(`${targetSymbol} has not been added to MetaMask`);
    };

    // Detect current network
    const chainId = await ethereum.request({ method: "eth_chainId" });
    const hasCorrectEvmNetwork = chainId === correctEvmNetwork;

    if (!hasCorrectEvmNetwork) {
      try {
        await ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: `${METAMASK_CHAIN_PARAMETERS[correctEvmNetwork]?.chainId}` }],
        });

        await addAsset();
      } catch (switchError: any) {
        // This error code indicates that the chain has not been added to MetaMask
        if (switchError?.code === 4902) {
          try {
            await ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: METAMASK_CHAIN_PARAMETERS[correctEvmNetwork]?.chainId,
                  chainName: METAMASK_CHAIN_PARAMETERS[correctEvmNetwork]?.chainName,
                  nativeCurrency: METAMASK_CHAIN_PARAMETERS[correctEvmNetwork]?.nativeCurrency,
                  rpcUrls: METAMASK_CHAIN_PARAMETERS[correctEvmNetwork]?.rpcUrls,
                  blockExplorerUrls:
                    METAMASK_CHAIN_PARAMETERS[correctEvmNetwork]?.blockExplorerUrls,
                },
              ],
            });

            await addAsset();
          } catch (addError) {
            console.error("Failed to add chain to MetaMask", addError);
          }
        } else {
          console.error("Failed to switch chain in MetaMask", switchError);
        }
      }
    } else {
      await addAsset();
    }
  } catch (error) {
    console.error("Failed to add token", error);
  }
};
