import { chainToChainId, ChainId, Network } from "@wormhole-foundation/sdk";

export const BREAKPOINTS = {
  mobile: 320,
  tablet: 768,
  desktop: 1024,
  bigDesktop: 1440,
};

type GuardianSet = {
  pubkey: string;
  name: string;
};

export const getGuardianSet = (version: number): GuardianSet[] => {
  // https://raw.githubusercontent.com/wormhole-foundation/wormhole-networks/master/mainnetv2/guardianset/v1.prototxt
  const v1 = [
    {
      pubkey: "0x58CC3AE5C097b213cE3c81979e1B9f9570746AA5",
      name: "Certus One",
    },
    {
      pubkey: "0xfF6CB952589BDE862c25Ef4392132fb9D4A42157",
      name: "Staked",
    },
    {
      pubkey: "0x114De8460193bdf3A2fCf81f86a09765F4762fD1",
      name: "Figment",
    },
    {
      pubkey: "0x107A0086b32d7A0977926A205131d8731D39cbEB",
      name: "ChainodeTech",
    },
    {
      pubkey: "0x8C82B2fd82FaeD2711d59AF0F2499D16e726f6b2",
      name: "Inotel",
    },
    {
      pubkey: "0x11b39756C042441BE6D8650b69b54EbE715E2343",
      name: "HashQuark",
    },
    {
      pubkey: "0x54Ce5B4D348fb74B958e8966e2ec3dBd4958a7cd",
      name: "Chainlayer",
    },
    {
      pubkey: "0xeB5F7389Fa26941519f0863349C223b73a6DDEE7",
      name: "DokiaCapital",
    },
    {
      pubkey: "0x74a3bf913953D695260D88BC1aA25A4eeE363ef0",
      name: "Forbole",
    },
    {
      pubkey: "0x000aC0076727b35FBea2dAc28fEE5cCB0fEA768e",
      name: "Staking Fund",
    },
    {
      pubkey: "0xAF45Ced136b9D9e24903464AE889F5C8a723FC14",
      name: "MoonletWallet",
    },
    {
      pubkey: "0xf93124b7c738843CBB89E864c862c38cddCccF95",
      name: "P2P.ORG Validator",
    },
    {
      pubkey: "0xD2CC37A4dc036a8D232b48f62cDD4731412f4890",
      name: "01Node",
    },
    {
      pubkey: "0xDA798F6896A3331F64b48c12D1D57Fd9cbe70811",
      name: "MCF",
    },
    {
      pubkey: "0x71AA1BE1D36CaFE3867910F99C09e347899C19C3",
      name: "Everstake",
    },
    {
      pubkey: "0x8192b6E7387CCd768277c17DAb1b7a5027c0b3Cf",
      name: "Chorus One",
    },
    {
      pubkey: "0x178e21ad2E77AE06711549CFBB1f9c7a9d8096e8",
      name: "Syncnode",
    },
    {
      pubkey: "0x5E1487F35515d02A92753504a8D75471b9f49EdB",
      name: "Triton",
    },
    {
      pubkey: "0x6FbEBc898F403E4773E95feB15E80C9A99c8348d",
      name: "Staking Facilities",
    },
  ];

  // https://raw.githubusercontent.com/wormhole-foundation/wormhole-networks/master/mainnetv2/guardianset/v2.prototxt
  const v2 = [...v1];
  v2[7] = {
    pubkey: "0x66B9590e1c41e0B226937bf9217D1d67Fd4E91F5",
    name: "FTX",
  };

  // https://raw.githubusercontent.com/wormhole-foundation/wormhole-networks/master/mainnetv2/guardianset/v3.prototxt
  const v3 = [...v2];
  v3[7] = {
    pubkey: "0x15e7cAF07C4e3DC8e7C469f92C8Cd88FB8005a20",
    name: "xLabs",
  };

  const v4 = [...v3];
  v4[0] = {
    pubkey: "0x5893B5A76c3f739645648885bDCcC06cd70a3Cd3",
    name: "RockawayX",
  };

  const versions: Record<number, GuardianSet[]> = { 1: v1, 2: v2, 3: v3, 4: v4 };
  return versions[version] || [];
};

export const txType: { [key: number]: "Transfer" | "Attestation" | "Transfer with payload" } = {
  1: "Transfer",
  2: "Attestation",
  3: "Transfer with payload",
} as const;

export const ALLBRIDGE_URL = "https://allbridge.io";
export const C3_URL = "https://c3.io";
export const CCTP_URL = "https://portalbridge.com/usdc-bridge";
export const DISCORD_URL = "https://discord.com/invite/wormholecrypto";
export const GATEWAY_URL = "https://wormhole.com/platform/gateway";
export const GITHUB_URL = "https://github.com/wormhole-foundation";
export const GR_URL =
  "https://wormhole.com/docs/learn/infrastructure/relayer/#wormhole-automatic-relayers";
export const MAYAN_URL = "https://mayan.finance";
export const MORE_INFO_GOVERNOR_URL =
  "https://github.com/wormhole-foundation/wormhole/blob/main/whitepapers/0007_governor.md";
export const NTT_URL = "https://wormhole.com/products/native-token-transfers";
export const OMNISWAP_URL = "https://app.omnibtc.finance/swap";
export const PORTAL_BRIDGE_URL = "https://www.portalbridge.com";
export const PROVIDE_FEEDBACK_URL = "https://forms.gle/rZesvKLgePamiTPi6";
export const SYNONYM_URL = "https://synonym.finance";
export const TBTC_URL = "https://portalbridge.com/tbtc-bridge";
export const TWITTER_URL = "https://x.com/wormhole";
export const WORMHOLE_BLOG = "https://wormhole.com/blog";
export const WORMHOLE_DOCS_URL = "https://wormhole.com/docs";
export const WORMHOLE_PAGE_URL = "https://wormhole.com";
export const WORMHOLESCAN_API_DOCS_URL = "https://docs.wormholescan.io";
export const XLABS_ABOUT_US_URL = "https://www.xlabs.xyz/about-us";
export const XLABS_CAREERS_URL = "https://jobs.ashbyhq.com/Xlabs";
export const XLABS_OUR_WORK_URL = "https://www.xlabs.xyz/our-work";
export const XLABS_URL = "https://www.xlabs.xyz";

// if toChain is on this list we should be able to get destinationTx.
// (contract-watcher for token bridge & connect txs)

export const canWeGetDestinationTx = ({
  appIds,
  network,
  targetChain,
}: {
  appIds: string[];
  network: Network;
  targetChain: ChainId;
}): boolean => {
  if (appIds?.includes(OMNISWAP_APP_ID)) {
    return targetChainsSupportedMainnet[OMNISWAP_APP_ID].includes(targetChain);
  }

  if (appIds?.includes(GATEWAY_APP_ID)) {
    return targetChainsSupportedMainnet[PORTAL_APP_ID].includes(targetChain);
  }

  return appIds?.some(appId => {
    const supportedChains =
      network === "Mainnet"
        ? targetChainsSupportedMainnet[appId]
        : targetChainsSupportedTestnet[appId];
    return supportedChains ? supportedChains.includes(targetChain) : false;
  });
};

export type IStatus =
  | "external_tx"
  | "completed"
  | "pending_redeem"
  | "vaa_emitted"
  | "in_progress"
  | "in_governors";

export const ALL_BRIDGE_APP_ID = "ALL_BRIDGE";
export const C3_APP_ID = "C3";
export const CCTP_APP_ID = "CCTP_WORMHOLE_INTEGRATION";
export const CCTP_MANUAL_APP_ID = "CCTP_MANUAL";
export const CCTP_XR_APP_ID = "CCTP_XR";
export const CONNECT_APP_ID = "CONNECT";
export const ETH_BRIDGE_APP_ID = "ETH_BRIDGE";
export const FOLKS_FINANCE_APP_ID = "FOLKS_FINANCE";
export const GATEWAY_APP_ID = "WORMCHAIN_GATEWAY_TRANSFER";
export const GR_APP_ID = "GENERIC_RELAYER";
export const M_PORTAL_APP_ID = "M_PORTAL";
export const MAYAN_APP_ID = "MAYAN";
export const MAYAN_MCTP_APP_ID = "MAYAN_MCTP";
export const MAYAN_SHUTTLE_APP_ID = "MAYAN_SHUTTLE";
export const MAYAN_SWIFT_APP_ID = "MAYAN_SWIFT";
export const NTT_APP_ID = "NATIVE_TOKEN_TRANSFER";
export const OMNISWAP_APP_ID = "OMNISWAP";
export const PORTAL_APP_ID = "PORTAL_TOKEN_BRIDGE";
export const PORTAL_NFT_APP_ID = "PORTAL_NFT_BRIDGE";
export const SYNONYM_APP_ID = "SYNONYM";
export const TBTC_APP_ID = "TBTC";
export const UNKNOWN_APP_ID = "UNKNOWN";
export const USDT_TRANSFER_APP_ID = "USDT_TRANSFER";
export const WORMHOLE_SETTLEMENTS_APP_ID = "WORMHOLE_SETTLEMENTS";

const targetChainsSupportedMainnet: { [key: string]: ChainId[] } = {
  [PORTAL_APP_ID]: [
    chainToChainId("Acala"),
    chainToChainId("Algorand"),
    chainToChainId("Aptos"),
    chainToChainId("Arbitrum"),
    chainToChainId("Avalanche"),
    chainToChainId("Base"),
    chainToChainId("Berachain"),
    chainToChainId("Blast"),
    chainToChainId("Bsc"),
    chainToChainId("Celo"),
    chainToChainId("Ethereum"),
    chainToChainId("Fantom"),
    chainToChainId("Karura"),
    chainToChainId("Klaytn"),
    chainToChainId("Mantle"),
    chainToChainId("Monad"),
    chainToChainId("Moonbeam"),
    chainToChainId("Near"),
    chainToChainId("Oasis"),
    chainToChainId("Optimism"),
    chainToChainId("Polygon"),
    chainToChainId("Scroll"),
    chainToChainId("Sei"),
    chainToChainId("Snaxchain"),
    chainToChainId("Solana"),
    chainToChainId("Sui"),
    chainToChainId("Terra"),
    chainToChainId("Terra2"),
    chainToChainId("Unichain"),
    chainToChainId("Worldchain"),
    chainToChainId("Wormchain"),
    chainToChainId("Xlayer"),
    chainToChainId("Xpla"),
  ],
  [GATEWAY_APP_ID]: [],
  [CCTP_APP_ID]: [
    chainToChainId("Arbitrum"),
    chainToChainId("Avalanche"),
    chainToChainId("Base"),
    chainToChainId("Ethereum"),
    chainToChainId("Optimism"),
    chainToChainId("Polygon"),
  ],
  [CONNECT_APP_ID]: [
    chainToChainId("Avalanche"),
    chainToChainId("Bsc"),
    chainToChainId("Celo"),
    chainToChainId("Ethereum"),
    chainToChainId("Fantom"),
    chainToChainId("Moonbeam"),
    chainToChainId("Polygon"),
  ],
  [TBTC_APP_ID]: [
    chainToChainId("Arbitrum"),
    chainToChainId("Base"),
    chainToChainId("Optimism"),
    chainToChainId("Polygon"),
  ],
  [OMNISWAP_APP_ID]: [
    chainToChainId("Bsc"),
    chainToChainId("Polygon"),
    chainToChainId("Ethereum"),
    chainToChainId("Avalanche"),
  ],
  [MAYAN_APP_ID]: [
    chainToChainId("Arbitrum"),
    chainToChainId("Avalanche"),
    chainToChainId("Bsc"),
    chainToChainId("Ethereum"),
    chainToChainId("Polygon"),
  ],
  // [MAYAN_MCTP_APP_ID]: [
  //   chainToChainId("Arbitrum"),
  //   chainToChainId("Avalanche"),
  //   chainToChainId("Bsc"),
  //   chainToChainId("Ethereum"),
  //   chainToChainId("Polygon"),
  // ],
  // [MAYAN_SWIFT_APP_ID]: [
  //   chainToChainId("Arbitrum"),
  //   chainToChainId("Avalanche"),
  //   chainToChainId("Bsc"),
  //   chainToChainId("Ethereum"),
  //   chainToChainId("Polygon"),
  // ],
  // [MAYAN_SHUTTLE_APP_ID]: [
  //   chainToChainId("Arbitrum"),
  //   chainToChainId("Avalanche"),
  //   chainToChainId("Bsc"),
  //   chainToChainId("Ethereum"),
  //   chainToChainId("Polygon"),
  // ],
  [GR_APP_ID]: [
    chainToChainId("Arbitrum"),
    chainToChainId("Avalanche"),
    chainToChainId("Base"),
    chainToChainId("Bsc"),
    chainToChainId("Celo"),
    chainToChainId("Ethereum"),
    chainToChainId("Fantom"),
    chainToChainId("Monad"),
    chainToChainId("Moonbeam"),
    chainToChainId("Optimism"),
    chainToChainId("Polygon"),
    chainToChainId("Snaxchain"),
  ],
  [NTT_APP_ID]: [
    chainToChainId("Arbitrum"),
    chainToChainId("Bsc"),
    chainToChainId("Base"),
    chainToChainId("Ethereum"),
    chainToChainId("Fantom"),
    chainToChainId("Optimism"),
    chainToChainId("Solana"),
  ],
  [PORTAL_NFT_APP_ID]: [
    chainToChainId("Bsc"),
    chainToChainId("Solana"),
    chainToChainId("Aptos"),
    chainToChainId("Arbitrum"),
    chainToChainId("Avalanche"),
    chainToChainId("Base"),
    chainToChainId("Celo"),
    chainToChainId("Ethereum"),
    chainToChainId("Fantom"),
    chainToChainId("Moonbeam"),
    chainToChainId("Oasis"),
    chainToChainId("Optimism"),
    chainToChainId("Polygon"),
  ],
  [ETH_BRIDGE_APP_ID]: [
    chainToChainId("Arbitrum"),
    chainToChainId("Optimism"),
    chainToChainId("Base"),
    chainToChainId("Bsc"),
    chainToChainId("Polygon"),
    chainToChainId("Ethereum"),
    chainToChainId("Avalanche"),
  ],
};

const targetChainsSupportedTestnet: { [key: string]: ChainId[] } = {
  [PORTAL_APP_ID]: [
    chainToChainId("Solana"),
    chainToChainId("OptimismSepolia"),
    chainToChainId("Karura"),
    chainToChainId("ArbitrumSepolia"),
    chainToChainId("Sui"),
    chainToChainId("Sepolia"),
    chainToChainId("Bsc"),
    chainToChainId("Mantle"),
    chainToChainId("Xlayer"),
    chainToChainId("Wormchain"),
    chainToChainId("Fantom"),
    chainToChainId("Avalanche"),
    chainToChainId("Base"),
    chainToChainId("PolygonSepolia"),
    chainToChainId("Klaytn"),
    chainToChainId("Algorand"),
    chainToChainId("Oasis"),
    chainToChainId("Moonbeam"),
    chainToChainId("Celo"),
    chainToChainId("Aptos"),
    chainToChainId("Scroll"),
    chainToChainId("Blast"),
    chainToChainId("Holesky"),
    chainToChainId("Snaxchain"),
    chainToChainId("Berachain"),
    chainToChainId("Unichain"),
    chainToChainId("Monad"),
    chainToChainId("Worldchain"),
    chainToChainId("Seievm"),
  ],
  [GATEWAY_APP_ID]: [],
  [CCTP_APP_ID]: [
    chainToChainId("Sepolia"),
    chainToChainId("PolygonSepolia"),
    chainToChainId("ArbitrumSepolia"),
    chainToChainId("OptimismSepolia"),
    chainToChainId("BaseSepolia"),
    chainToChainId("Avalanche"),
  ],
  [CONNECT_APP_ID]: [
    chainToChainId("Celo"),
    chainToChainId("Sepolia"),
    chainToChainId("Moonbeam"),
    chainToChainId("Bsc"),
    chainToChainId("PolygonSepolia"),
    chainToChainId("Fantom"),
    chainToChainId("Avalanche"),
  ],
  [TBTC_APP_ID]: [
    chainToChainId("ArbitrumSepolia"),
    chainToChainId("OptimismSepolia"),
    chainToChainId("BaseSepolia"),
  ],
  [GR_APP_ID]: [
    chainToChainId("Bsc"),
    chainToChainId("PolygonSepolia"),
    chainToChainId("Avalanche"),
    chainToChainId("BaseSepolia"),
    chainToChainId("ArbitrumSepolia"),
    chainToChainId("OptimismSepolia"),
    chainToChainId("Sepolia"),
    chainToChainId("Celo"),
    chainToChainId("Moonbeam"),
    chainToChainId("Monad"),
  ],
  [NTT_APP_ID]: [
    chainToChainId("Solana"),
    chainToChainId("OptimismSepolia"),
    chainToChainId("ArbitrumSepolia"),
    chainToChainId("BaseSepolia"),
    chainToChainId("Sepolia"),
    chainToChainId("Fantom"),
  ],
  [PORTAL_NFT_APP_ID]: [
    chainToChainId("Bsc"),
    chainToChainId("Solana"),
    chainToChainId("Aptos"),
    chainToChainId("ArbitrumSepolia"),
    chainToChainId("Avalanche"),
    chainToChainId("BaseSepolia"),
    chainToChainId("Celo"),
    chainToChainId("Sepolia"),
    chainToChainId("Holesky"),
    chainToChainId("Fantom"),
    chainToChainId("Moonbeam"),
    chainToChainId("Oasis"),
    chainToChainId("OptimismSepolia"),
    chainToChainId("PolygonSepolia"),
  ],
};
