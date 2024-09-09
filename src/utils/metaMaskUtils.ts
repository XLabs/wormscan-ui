import { toast } from "react-toastify";
import { ChainId, Network, chainToChainId } from "@wormhole-foundation/sdk";
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
  tokenAddress: string;
  tokenDecimals: number;
  tokenImage: string;
  tokenSymbol: string;
}

interface ChainData {
  Mainnet: number;
  Testnet: number;
  Devnet: number;
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
  195: {
    chainId: "0xc3",
    chainName: "XLayer Testnet",
    nativeCurrency: { name: "OKB", symbol: "OKB", decimals: 18 },
    rpcUrls: ["https://xlayertestrpc.okx.com"],
    blockExplorerUrls: ["https://www.okx.com/web3/explorer/xlayer-test"],
  },
  196: {
    chainId: "0xc4",
    chainName: "XLayer",
    nativeCurrency: { name: "OKB", symbol: "OKB", decimals: 18 },
    rpcUrls: ["https://xlayerrpc.okx.com"],
    blockExplorerUrls: ["https://www.okx.com/web3/explorer/xlayer"],
  },
  534352: {
    chainId: "0x82750",
    chainName: "Scroll",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://rpc.scroll.io"],
    blockExplorerUrls: ["https://scrollscan.com"],
  },
  534351: {
    chainId: "0x8274f",
    chainName: "Scroll Sepolia Testnet",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://scroll-sepolia.blockpi.network/v1/rpc/public"],
    blockExplorerUrls: ["https://sepolia.scrollscan.com"],
  },
  81457: {
    chainId: "0x13e31",
    chainName: "Blast",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://rpc.blast.io"],
    blockExplorerUrls: ["https://blastscan.io"],
  },
  168587773: {
    chainId: "0xa0c71fd",
    chainName: "Blast Sepolia Testnet",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://blast-sepolia.blockpi.network/v1/rpc/public"],
    blockExplorerUrls: ["https://sepolia.blastscan.io"],
  },
  5000: {
    chainId: "0x1388",
    chainName: "Mantle",
    nativeCurrency: { name: "MNT", symbol: "MNT", decimals: 18 },
    rpcUrls: ["https://rpc.mantle.xyz"],
    blockExplorerUrls: [""],
  },
  5001: {
    chainId: "0x1389",
    chainName: "Mantle Testnet",
    nativeCurrency: { name: "MNT", symbol: "MNT", decimals: 18 },
    rpcUrls: ["https://rpc.testnet.mantle.xyz"],
    blockExplorerUrls: [""],
  },
  2192: {
    chainId: "0x890",
    chainName: "SnaxChain Mainnet",
    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://mainnet.snaxchain.io/"],
    blockExplorerUrls: [""],
  },
  13001: {
    chainId: "0x32C9",
    chainName: "SnaxChain Testnet",
    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://testnet.snaxchain.io/"],
    blockExplorerUrls: [""],
  },
  421614: {
    chainId: "0x66eee",
    chainName: "Arbitrum Sepolia",
    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://sepolia-rollup.arbitrum.io/rpc	"],
    blockExplorerUrls: ["https://sepolia.arbiscan.io"],
  },
  11155111: {
    chainId: "0xaa36a7",
    chainName: "Ethereum Sepolia",
    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://ethereum-sepolia-rpc.publicnode.com"],
    blockExplorerUrls: ["https://sepolia.etherscan.io"],
  },
  11155420: {
    chainId: "0xaa37dc",
    chainName: "Optimism Sepolia",
    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://endpoints.omniatech.io/v1/op/sepolia/public"],
    blockExplorerUrls: ["https://sepolia-optimism.etherscan.io/"],
  },
};

export const CHAIN_IDS: ChainIds = {
  ACALA_NETWORK_CHAIN_ID: { Mainnet: 787, Testnet: 597, Devnet: 597 },
  ARBITRUM_NETWORK_CHAIN_ID: { Mainnet: 42161, Testnet: 421613, Devnet: 421613 },
  ARBITRUM_SEPOLIA_NETWORK_CHAIN_ID: { Mainnet: 0, Testnet: 421614, Devnet: 421614 },
  AURORA_NETWORK_CHAIN_ID: { Mainnet: 1313161554, Testnet: 1313161555, Devnet: 1313161555 },
  AVAX_NETWORK_CHAIN_ID: { Mainnet: 43114, Testnet: 43113, Devnet: 43113 },
  BASE_NETWORK_CHAIN_ID: { Mainnet: 8453, Testnet: 84531, Devnet: 84531 },
  BLAST_NETWORK_CHAIN_ID: { Mainnet: 81457, Testnet: 168587773, Devnet: 168587773 },
  BSC_NETWORK_CHAIN_ID: { Mainnet: 56, Testnet: 97, Devnet: 97 },
  CELO_NETWORK_CHAIN_ID: { Mainnet: 42220, Testnet: 44787, Devnet: 44787 },
  ETH_NETWORK_CHAIN_ID: { Mainnet: 1, Testnet: 5, Devnet: 5 },
  FANTOM_NETWORK_CHAIN_ID: { Mainnet: 250, Testnet: 4002, Devnet: 4002 },
  KARURA_NETWORK_CHAIN_ID: { Mainnet: 686, Testnet: 596, Devnet: 596 },
  KLAYTN_NETWORK_CHAIN_ID: { Mainnet: 8217, Testnet: 1001, Devnet: 1001 },
  MANTLE_NETWORK_CHAIN_ID: { Mainnet: 5000, Testnet: 5001, Devnet: 5001 },
  MOONBEAM_NETWORK_CHAIN_ID: { Mainnet: 1284, Testnet: 1287, Devnet: 1287 },
  NEON_NETWORK_CHAIN_ID: { Mainnet: 245022934, Testnet: 245022926, Devnet: 245022926 },
  OASIS_NETWORK_CHAIN_ID: { Mainnet: 42262, Testnet: 42261, Devnet: 42261 },
  OPTIMISM_NETWORK_CHAIN_ID: { Mainnet: 10, Testnet: 420, Devnet: 420 },
  OPTIMISM_SEPOLIA_NETWORK_CHAIN_ID: { Mainnet: 0, Testnet: 11155420, Devnet: 11155420 },
  POLYGON_NETWORK_CHAIN_ID: { Mainnet: 137, Testnet: 80001, Devnet: 80001 },
  ROPSTEN_ETH_NETWORK_CHAIN_ID: { Mainnet: 1, Testnet: 3, Devnet: 3 },
  SCROLL_NETWORK_CHAIN_ID: { Mainnet: 534352, Testnet: 534351, Devnet: 534351 },
  SEPOLIA_NETWORK_CHAIN_ID: { Mainnet: 0, Testnet: 11155111, Devnet: 11155111 },
  SNAXCHAIN_NETWORK_CHAIN_ID: { Mainnet: 2192, Testnet: 13001, Devnet: 13001 },
  XLAYER_NETWORK_CHAIN_ID: { Mainnet: 196, Testnet: 195, Devnet: 195 },
};

export const getEvmChainId = (chainId: ChainId, currentNetwork: Network): number | undefined => {
  const chainNetworks = {
    [chainToChainId("Acala")]: CHAIN_IDS.ACALA_NETWORK_CHAIN_ID[currentNetwork],
    [chainToChainId("Arbitrum")]: CHAIN_IDS.ARBITRUM_NETWORK_CHAIN_ID[currentNetwork],
    [chainToChainId("ArbitrumSepolia")]:
      CHAIN_IDS.ARBITRUM_SEPOLIA_NETWORK_CHAIN_ID[currentNetwork],
    [chainToChainId("Aurora")]: CHAIN_IDS.AURORA_NETWORK_CHAIN_ID[currentNetwork],
    [chainToChainId("Avalanche")]: CHAIN_IDS.AVAX_NETWORK_CHAIN_ID[currentNetwork],
    [chainToChainId("Base")]: CHAIN_IDS.BASE_NETWORK_CHAIN_ID[currentNetwork],
    [chainToChainId("Blast")]: CHAIN_IDS.BLAST_NETWORK_CHAIN_ID[currentNetwork],
    [chainToChainId("Bsc")]: CHAIN_IDS.BSC_NETWORK_CHAIN_ID[currentNetwork],
    [chainToChainId("Celo")]: CHAIN_IDS.CELO_NETWORK_CHAIN_ID[currentNetwork],
    [chainToChainId("Ethereum")]: CHAIN_IDS.ETH_NETWORK_CHAIN_ID[currentNetwork],
    [chainToChainId("Fantom")]: CHAIN_IDS.FANTOM_NETWORK_CHAIN_ID[currentNetwork],
    [chainToChainId("Karura")]: CHAIN_IDS.KARURA_NETWORK_CHAIN_ID[currentNetwork],
    [chainToChainId("Klaytn")]: CHAIN_IDS.KLAYTN_NETWORK_CHAIN_ID[currentNetwork],
    [chainToChainId("Mantle")]: CHAIN_IDS.MANTLE_NETWORK_CHAIN_ID[currentNetwork],
    [chainToChainId("Moonbeam")]: CHAIN_IDS.MOONBEAM_NETWORK_CHAIN_ID[currentNetwork],
    [chainToChainId("Neon")]: CHAIN_IDS.NEON_NETWORK_CHAIN_ID[currentNetwork],
    [chainToChainId("Oasis")]: CHAIN_IDS.OASIS_NETWORK_CHAIN_ID[currentNetwork],
    [chainToChainId("Optimism")]: CHAIN_IDS.OPTIMISM_NETWORK_CHAIN_ID[currentNetwork],
    [chainToChainId("OptimismSepolia")]:
      CHAIN_IDS.OPTIMISM_SEPOLIA_NETWORK_CHAIN_ID[currentNetwork],
    [chainToChainId("Polygon")]: CHAIN_IDS.POLYGON_NETWORK_CHAIN_ID[currentNetwork],
    [chainToChainId("Scroll")]: CHAIN_IDS.SCROLL_NETWORK_CHAIN_ID[currentNetwork],
    [chainToChainId("Sepolia")]: CHAIN_IDS.SEPOLIA_NETWORK_CHAIN_ID[currentNetwork],
    [chainToChainId("Snaxchain")]: CHAIN_IDS.SNAXCHAIN_NETWORK_CHAIN_ID[currentNetwork],
    [chainToChainId("Xlayer")]: CHAIN_IDS.XLAYER_NETWORK_CHAIN_ID[currentNetwork],
  };

  const evmChainId = chainNetworks[chainId as keyof typeof chainNetworks];
  if (evmChainId) return evmChainId;

  return undefined;
};

export const addToken = async ({ currentNetwork, toChain, tokenInfo }: AddToken) => {
  const { tokenAddress, tokenDecimals, tokenImage, tokenSymbol } = tokenInfo || {};
  const correctEvmNetwork = getEvmChainId(toChain, currentNetwork);

  try {
    const ethereum = (await detectEthereumProvider()) as any;

    if (!ethereum) {
      toast("MetaMask not found", {
        type: "error",
        theme: "dark",
        style: {
          background: "var(--color-gray-950)",
          color: "var(--color-white-70)",
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
        ? toast(`${tokenSymbol} has been added to MetaMask`, {
            type: "success",
            theme: "dark",
            style: {
              background: "var(--color-gray-950)",
              color: "var(--color-white-70)",
            },
          })
        : console.log(`${tokenSymbol} has not been added to MetaMask`);
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
