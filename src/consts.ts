import { chainToChainId, ChainId } from "@wormhole-foundation/sdk";

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
      name: "Jump Crypto", // Certus One
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
  v4[1] = {
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
export const CCTP_URL = "https://portalbridge.com/usdc-bridge";
export const DISCORD_URL = "https://discord.com/invite/wormholecrypto";
export const GITHUB_URL = "https://github.com/wormhole-foundation";
export const MAYAN_URL = "https://mayan.finance";
export const MORE_INFO_GOVERNOR_URL =
  "https://github.com/wormhole-foundation/wormhole/blob/main/whitepapers/0007_governor.md";
export const PORTAL_BRIDGE_URL = "https://www.portalbridge.com";
export const PROVIDE_FEEDBACK_URL =
  "https://docs.google.com/forms/d/1LBeJJHF7dG94q9kdFTFpXtYrDvjb2KXLyte5nl5f26Y/viewform?edit_requested=true";
export const TWITTER_URL = "https://x.com/wormhole";
export const WORMHOLE_BLOG = "https://wormhole.com/blog";
export const WORMHOLE_DOCS_URL = "https://docs.wormholescan.io";
export const WORMHOLE_PAGE_URL = "https://wormhole.com";
export const XLABS_ABOUT_US_URL = "https://www.xlabs.xyz/about-us";
export const XLABS_CAREERS_URL = "https://jobs.ashbyhq.com/Xlabs";
export const XLABS_OUR_WORK_URL = "https://www.xlabs.xyz/our-work";
export const XLABS_URL = "https://www.xlabs.xyz";

// if toChain is on this list we should be able to get destinationTx.
// (contract-watcher for token bridge & connect txs)
export const canWeGetDestinationTx = (toChain: any) =>
  [
    chainToChainId("Aptos"),
    chainToChainId("Avalanche"),
    chainToChainId("Base"),
    chainToChainId("Bsc"),
    chainToChainId("Celo"),
    chainToChainId("Ethereum"),
    chainToChainId("Fantom"),
    chainToChainId("Moonbeam"),
    chainToChainId("Oasis"),
    chainToChainId("Polygon"),
    chainToChainId("Terra"),
    // chainToChainId("Arbitrum") // should be supported, but BE having problems
    // chainToChainId("Optimism") // should be supported, but BE having problems
    // chainToChainId("Solana"),  // should be supported, but BE having problems
  ].includes(toChain);

export type IStatus =
  | "EXTERNAL_TX"
  | "COMPLETED"
  | "PENDING_REDEEM"
  | "VAA_EMITTED"
  | "IN_PROGRESS"
  | "IN_GOVERNORS";

export const UNKNOWN_APP_ID = "UNKNOWN";
export const CCTP_APP_ID = "CCTP_WORMHOLE_INTEGRATION";
export const CCTP_MANUAL_APP_ID = "CCTP_MANUAL";
export const CONNECT_APP_ID = "CONNECT";
export const GATEWAY_APP_ID = "WORMHOLE_GATEWAY_TRANSFER";
export const PORTAL_APP_ID = "PORTAL_TOKEN_BRIDGE";
export const PORTAL_NFT_APP_ID = "PORTAL_NFT_BRIDGE";
export const ETH_BRIDGE_APP_ID = "ETH_BRIDGE";
export const USDT_TRANSFER_APP_ID = "USDT_TRANSFER";
export const NTT_APP_ID = "NATIVE_TOKEN_TRANSFER";
export const GR_APP_ID = "GENERIC_RELAYER";
export const MAYAN_APP_ID = "MAYAN";
export const TBTC_APP_ID = "TBTC";
