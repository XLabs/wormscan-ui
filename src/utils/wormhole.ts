import { ChainId } from "@xlabs-libs/wormscan-sdk";

// import NoIcon from "src/icons/blockchains/noIcon.svg";
import AcalaIcon from "src/icons/blockchains/acala.svg";
import AlgorandIcon from "src/icons/blockchains/algorand.svg";
import AptosIcon from "src/icons/blockchains/aptos.svg";
import ArbitrumIcon from "src/icons/blockchains/arbitrum.svg";
import AuroraIcon from "src/icons/blockchains/aurora.svg";
import AvalancheIcon from "src/icons/blockchains/avax.svg";
import BSCIcon from "src/icons/blockchains/bsc.svg";
import CeloIcon from "src/icons/blockchains/celo.svg";
import EthereumIcon from "src/icons/blockchains/eth.svg";
import FantomIcon from "src/icons/blockchains/fantom.svg";
import InjectiveIcon from "src/icons/blockchains/injective.svg";
import KaruraIcon from "src/icons/blockchains/karura.svg";
import KlaytnIcon from "src/icons/blockchains/klaytn.svg";
import MoonbeamIcon from "src/icons/blockchains/moonbeam.svg";
import NearIcon from "src/icons/blockchains/near.svg";
import NeonIcon from "src/icons/blockchains/neon.svg";
import OasisIcon from "src/icons/blockchains/oasis.svg";
import OptimismIcon from "src/icons/blockchains/optimism.svg";
import PolygonIcon from "src/icons/blockchains/polygon.svg";
import SolanaIcon from "src/icons/blockchains/solana.svg";
import TerraClassicIcon from "src/icons/blockchains/terra-classic.svg";
import TerraIcon from "src/icons/blockchains/terra.svg";
import XplaIcon from "src/icons/blockchains/xpla.svg";
import SeiIcon from "src/icons/blockchains/sei.svg";
import SuiIcon from "src/icons/blockchains/sui.svg";

import NoDarkIcon from "src/icons/blockchains/dark/noIcon.svg";
import AcalaDarkIcon from "src/icons/blockchains/dark/acala.svg";
import AlgorandDarkIcon from "src/icons/blockchains/dark/algorand.svg";
import AptosDarkIcon from "src/icons/blockchains/dark/aptos.svg";
import ArbitrumDarkIcon from "src/icons/blockchains/dark/arbitrum.svg";
import AuroraDarkIcon from "src/icons/blockchains/dark/aurora.svg";
import AvalancheDarkIcon from "src/icons/blockchains/dark/avax.svg";
import BSCDarkIcon from "src/icons/blockchains/dark/bsc.svg";
import CeloDarkIcon from "src/icons/blockchains/dark/celo.svg";
import EthereumDarkIcon from "src/icons/blockchains/dark/eth.svg";
import FantomDarkIcon from "src/icons/blockchains/dark/fantom.svg";
import InjectiveDarkIcon from "src/icons/blockchains/dark/injective.svg";
import KaruraDarkIcon from "src/icons/blockchains/dark/karura.svg";
import KlaytnDarkIcon from "src/icons/blockchains/dark/klaytn.svg";
import MoonbeamDarkIcon from "src/icons/blockchains/dark/moonbeam.svg";
import NearDarkIcon from "src/icons/blockchains/dark/near.svg";
import NeonDarkIcon from "src/icons/blockchains/dark/neon.svg";
import OasisDarkIcon from "src/icons/blockchains/dark/oasis.svg";
import OptimismDarkIcon from "src/icons/blockchains/dark/optimism.svg";
import PolygonDarkIcon from "src/icons/blockchains/dark/polygon.svg";
import SolanaDarkIcon from "src/icons/blockchains/dark/solana.svg";
import TerraClassicDarkIcon from "src/icons/blockchains/dark/terra-classic.svg";
import TerraDarkIcon from "src/icons/blockchains/dark/terra.svg";
import XplaDarkIcon from "src/icons/blockchains/dark/xpla.svg";
import SeiDarkIcon from "src/icons/blockchains/dark/sei.svg";
import SuiDarkIcon from "src/icons/blockchains/dark/sui.svg";

import { parseAddress, parseTx } from "./crypto";
import { Network } from "@certusone/wormhole-sdk";

export type ExplorerBaseURLInput = {
  network: Network;
  value: string;
  base?: "tx" | "address" | "token";
};

const WORMHOLE_CHAINS: { [key in ChainId]: any } = {
  [ChainId.Unset]: {
    name: "Unset",
    icon: NoDarkIcon,
    darkIcon: NoDarkIcon,
    explorer: {
      TESTNET: "",
      MAINNET: "",
    },
    getExplorerBaseURL: function ({ network = "MAINNET", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return "";
      if (base === "token") return "";
      return "";
    },
  },
  [ChainId.Sui]: {
    name: "Sui",
    icon: SuiIcon,
    darkIcon: SuiDarkIcon,
    explorer: {
      TESTNET: "https://suiexplorer.com",
      MAINNET: "https://suiexplorer.com",
    },
    getExplorerBaseURL: function ({ network = "MAINNET", value, base }: ExplorerBaseURLInput) {
      if (base === "address")
        return this.explorer?.[network] + "/address/" + value + "?network=" + network;
      if (base === "token")
        return this.explorer?.[network] + "/token/" + value + "?network=" + network;
      return this.explorer?.[network] + "/txblock/" + value + "?network=" + network;
    },
  },
  [ChainId.PythNet]: {
    name: "PythNet",
    icon: NoDarkIcon,
    darkIcon: NoDarkIcon,
    explorer: {
      TESTNET: "",
      MAINNET: "",
    },
    getExplorerBaseURL: function ({ network = "MAINNET", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return "";
      if (base === "token") return "";
      return "";
    },
  },
  [ChainId.Btc]: {
    name: "Btc",
    icon: NoDarkIcon,
    darkIcon: NoDarkIcon,
    explorer: {
      TESTNET: "",
      MAINNET: "",
    },
    getExplorerBaseURL: function ({ network = "MAINNET", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return "";
      if (base === "token") return "";
      return "";
    },
  },
  [ChainId.Wormchain]: {
    name: "Wormchain",
    icon: NoDarkIcon,
    darkIcon: NoDarkIcon,
    explorer: {
      TESTNET: "",
      MAINNET: "",
    },
    getExplorerBaseURL: function ({ network = "MAINNET", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return "";
      if (base === "token") return "";
      return "";
    },
  },
  [ChainId.Acala]: {
    name: "Acala",
    icon: AcalaIcon,
    darkIcon: AcalaDarkIcon,
    explorer: {
      TESTNET: "https://blockscout.acala-dev.aca-dev.network",
      MAINNET: "https://blockscout.acala.network",
    },
    getExplorerBaseURL: function ({ network = "MAINNET", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/address/" + value;
      if (base === "token") return this.explorer?.[network] + "/token/" + value;
      return this.explorer?.[network] + "/tx/" + value;
    },
  },
  [ChainId.Algorand]: {
    name: "Algorand",
    acronym: "ALGO",
    icon: AlgorandIcon,
    darkIcon: AlgorandDarkIcon,
    explorer: {
      TESTNET: "https://TESTNET.algoexplorer.io",
      MAINNET: "https://algoexplorer.io",
    },
    getExplorerBaseURL: function ({ network = "MAINNET", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/address/" + value;
      if (base === "token") return this.explorer?.[network] + "/token/" + value;
      return this.explorer?.[network] + "/tx/" + value;
    },
  },
  [ChainId.Aptos]: {
    name: "Aptos",
    icon: AptosIcon,
    darkIcon: AptosDarkIcon,
    explorer: {
      TESTNET: "https://explorer.aptoslabs.com",
      MAINNET: "https://explorer.aptoslabs.com",
    },
    getExplorerBaseURL: function ({ network = "MAINNET", value, base }: ExplorerBaseURLInput) {
      if (base === "address")
        return this.explorer?.[network] + "/account/" + value + "?network=" + network;
      if (base === "token")
        return this.explorer?.[network] + "/token/" + value + "?network=" + network;
      return this.explorer?.[network] + "/txn/" + value + "?network=" + network;
    },
  },
  [ChainId.Arbitrum]: {
    name: "Arbitrum",
    icon: ArbitrumIcon,
    darkIcon: ArbitrumDarkIcon,
    explorer: {
      TESTNET: "https://goerli.arbiscan.io",
      MAINNET: "https://arbiscan.io",
    },
    getExplorerBaseURL: function ({ network = "MAINNET", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/address/" + value;
      if (base === "token") return this.explorer?.[network] + "/token/" + value;
      return this.explorer?.[network] + "/tx/" + value;
    },
  },
  [ChainId.Aurora]: {
    name: "Aurora",
    icon: AuroraIcon,
    darkIcon: AuroraDarkIcon,
    explorer: {
      TESTNET: "https://explorer.TESTNET.aurora.dev",
      MAINNET: "https://explorer.aurora.dev",
    },
    getExplorerBaseURL: function ({ network = "MAINNET", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/address/" + value;
      if (base === "token") return this.explorer?.[network] + "/token/" + value;
      return this.explorer?.[network] + "/tx/" + value;
    },
  },
  [ChainId.Avalanche]: {
    name: "Avalanche",
    acronym: "AVAX",
    icon: AvalancheIcon,
    darkIcon: AvalancheDarkIcon,
    explorer: {
      TESTNET: "https://TESTNET.snowtrace.io",
      MAINNET: "https://snowtrace.io",
    },
    getExplorerBaseURL: function ({ network = "MAINNET", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/address/" + value;
      if (base === "token") return this.explorer?.[network] + "/token/" + value;
      return this.explorer?.[network] + "/tx/" + value;
    },
  },
  [ChainId.BSC]: {
    name: "BNB Smart Chain",
    acronym: "BSC",
    icon: BSCIcon,
    darkIcon: BSCDarkIcon,
    explorer: {
      TESTNET: "https://TESTNET.bscscan.com",
      MAINNET: "https://bscscan.com",
    },
    getExplorerBaseURL: function ({ network = "MAINNET", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/address/" + value;
      if (base === "token") return this.explorer?.[network] + "/token/" + value;
      return this.explorer?.[network] + "/tx/" + value;
    },
  },
  [ChainId.Celo]: {
    name: "Celo",
    icon: CeloIcon,
    darkIcon: CeloDarkIcon,
    explorer: {
      TESTNET: "https://alfajores.celoscan.io",
      MAINNET: "https://explorer.celo.org/MAINNET",
    },
    getExplorerBaseURL: function ({ network = "MAINNET", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/address/" + value;
      if (base === "token") return this.explorer?.[network] + "/token/" + value;
      return this.explorer?.[network] + "/tx/" + value;
    },
  },
  [ChainId.Ethereum]: {
    name: "Ethereum",
    acronym: "ETH",
    icon: EthereumIcon,
    darkIcon: EthereumDarkIcon,
    explorer: {
      TESTNET: "https://goerli.etherscan.io",
      MAINNET: "https://etherscan.io",
    },
    getExplorerBaseURL: function ({ network = "MAINNET", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/address/" + value;
      if (base === "token") return this.explorer?.[network] + "/token/" + value;
      return this.explorer?.[network] + "/tx/" + value;
    },
  },
  [ChainId.Fantom]: {
    name: "Fantom",
    icon: FantomIcon,
    darkIcon: FantomDarkIcon,
    explorer: {
      TESTNET: "https://TESTNET.ftmscan.com",
      MAINNET: "https://ftmscan.com",
    },
    getExplorerBaseURL: function ({ network = "MAINNET", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/address/" + value;
      if (base === "token") return this.explorer?.[network] + "/token/" + value;
      return this.explorer?.[network] + "/tx/" + value;
    },
  },
  [ChainId.Injective]: {
    name: "Injective",
    acronym: "INJ",
    icon: InjectiveIcon,
    darkIcon: InjectiveDarkIcon,
    explorer: {
      TESTNET: "https://TESTNET.explorer.injective.network",
      MAINNET: "https://explorer.injective.network",
    },
    getExplorerBaseURL: function ({ network = "MAINNET", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/account/" + value;
      if (base === "token") return this.explorer?.[network] + "/token/" + value;
      return this.explorer?.[network] + "/transaction/" + value;
    },
  },
  [ChainId.Karura]: {
    name: "Karura",
    icon: KaruraIcon,
    darkIcon: KaruraDarkIcon,
    explorer: {
      TESTNET: "https://blockscout.karura-dev.aca-dev.network",
      MAINNET: "https://blockscout.karura.network",
    },
    getExplorerBaseURL: function ({ network = "MAINNET", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/address/" + value;
      if (base === "token") return this.explorer?.[network] + "/token/" + value;
      return this.explorer?.[network] + "/tx/" + value;
    },
  },
  [ChainId.Klaytn]: {
    name: "Klaytn",
    icon: KlaytnIcon,
    darkIcon: KlaytnDarkIcon,
    explorer: {
      TESTNET: "https://baobab.scope.klaytn.com",
      MAINNET: "https://scope.klaytn.com",
    },
    getExplorerBaseURL: function ({ network = "MAINNET", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/account/" + value;
      if (base === "token") return this.explorer?.[network] + "/token/" + value;
      return this.explorer?.[network] + "/tx/" + value;
    },
  },
  [ChainId.Moonbeam]: {
    name: "Moonbeam",
    icon: MoonbeamIcon,
    darkIcon: MoonbeamDarkIcon,
    explorer: {
      TESTNET: "https://moonbase.moonscan.io",
      MAINNET: "https://moonscan.io",
    },
    getExplorerBaseURL: function ({ network = "MAINNET", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/address/" + value;
      if (base === "token") return this.explorer?.[network] + "/token/" + value;
      return this.explorer?.[network] + "/tx/" + value;
    },
  },
  [ChainId.Near]: {
    name: "Near",
    icon: NearIcon,
    darkIcon: NearDarkIcon,
    explorer: {
      TESTNET: "https://explorer.TESTNET.near.org",
      MAINNET: "https://explorer.near.org",
    },
    getExplorerBaseURL: function ({ network = "MAINNET", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/accounts/" + value;
      if (base === "token") return this.explorer?.[network] + "/token/" + value;
      return this.explorer?.[network] + "/transactions/" + value;
    },
  },
  [ChainId.Neon]: {
    name: "Neon",
    icon: NeonIcon,
    darkIcon: NeonDarkIcon,
    explorer: {
      TESTNET: "https://neonscan.org",
      MAINNET: "https://neonscan.org",
    },
    getExplorerBaseURL: function ({ network = "MAINNET", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/address/" + value;
      if (base === "token") return this.explorer?.[network] + "/token/" + value;
      return this.explorer?.[network] + "/tx/" + value;
    },
  },
  [ChainId.Oasis]: {
    name: "Oasis",
    icon: OasisIcon,
    darkIcon: OasisDarkIcon,
    explorer: {
      TESTNET: "https://TESTNET.explorer.emerald.oasis.dev",
      MAINNET: "https://explorer.emerald.oasis.dev",
    },
    getExplorerBaseURL: function ({ network = "MAINNET", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/address/" + value;
      if (base === "token") return this.explorer?.[network] + "/token/" + value;
      return this.explorer?.[network] + "/tx/" + value;
    },
  },
  [ChainId.Optimism]: {
    name: "Optimism",
    icon: OptimismIcon,
    darkIcon: OptimismDarkIcon,
    explorer: {
      TESTNET: "https://goerli-optimism.etherscan.io",
      MAINNET: "https://optimistic.etherscan.io",
    },
    getExplorerBaseURL: function ({ network = "MAINNET", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/address/" + value;
      if (base === "token") return this.explorer?.[network] + "/token/" + value;
      return this.explorer?.[network] + "/tx/" + value;
    },
  },
  [ChainId.Polygon]: {
    name: "Polygon",
    icon: PolygonIcon,
    darkIcon: PolygonDarkIcon,
    explorer: {
      TESTNET: "https://mumbai.polygonscan.com",
      MAINNET: "https://polygonscan.com",
    },
    getExplorerBaseURL: function ({ network = "MAINNET", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/address/" + value;
      if (base === "token") return this.explorer?.[network] + "/token/" + value;
      return this.explorer?.[network] + "/tx/" + value;
    },
  },
  [ChainId.Solana]: {
    name: "Solana",
    acronym: "SOL",
    icon: SolanaIcon,
    darkIcon: SolanaDarkIcon,
    explorer: {
      TESTNET: "https://solscan.io",
      MAINNET: "https://solscan.io",
    },
    getExplorerBaseURL: function ({ network = "MAINNET", value, base }: ExplorerBaseURLInput) {
      // Wormhole uses Solana's devnet as their 'TESTNET'
      const solNetwork = network === "MAINNET" ? "MAINNET" : "devnet";

      if (base === "address")
        return this.explorer?.[network] + "/account/" + value + "?cluster=" + solNetwork;
      if (base === "token")
        return this.explorer?.[network] + "/token/" + value + "?cluster=" + solNetwork;
      return this.explorer?.[network] + "/tx/" + value + "?cluster=" + solNetwork;
    },
  },
  [ChainId.Terra]: {
    name: "Terra",
    icon: TerraClassicIcon,
    darkIcon: TerraClassicDarkIcon,
    explorer: {
      TESTNET: "https://finder.terra.money/columbus-5",
      MAINNET: "https://finder.terra.money/columbus-5",
    },
    getExplorerBaseURL: function ({ network = "MAINNET", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/address/" + value;
      if (base === "token") return this.explorer?.[network] + "/token/" + value;
      return this.explorer?.[network] + "/tx/" + value;
    },
  },
  [ChainId.Terra2]: {
    name: "Terra2",
    icon: TerraIcon,
    darkIcon: TerraDarkIcon,
    explorer: {
      TESTNET: "https://finder.terra.money/pisco-1",
      MAINNET: "https://finder.terra.money/phoenix-1",
    },
    getExplorerBaseURL: function ({ network = "MAINNET", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/address/" + value;
      if (base === "token") return this.explorer?.[network] + "/token/" + value;
      return this.explorer?.[network] + "/tx/" + value;
    },
  },
  [ChainId.Xpla]: {
    name: "Xpla",
    icon: XplaIcon,
    darkIcon: XplaDarkIcon,
    explorer: {
      TESTNET: "https://explorer.xpla.io/TESTNET",
      MAINNET: "https://explorer.xpla.io/MAINNET",
    },
    getExplorerBaseURL: function ({ network = "MAINNET", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/address/" + value;
      if (base === "token") return this.explorer?.[network] + "/token/" + value;
      return this.explorer?.[network] + "/tx/" + value;
    },
  },
  [ChainId.Sei]: {
    name: "Sei",
    icon: SeiIcon,
    darkIcon: SeiDarkIcon,
    explorer: {
      TESTNET: "https://sei.explorers.guru",
      MAINNET: "https://sei.explorers.guru",
    },
    getExplorerBaseURL: function ({ network = "MAINNET", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/account/" + value;
      if (base === "token") return this.explorer?.[network] + "/token/" + value;
      return this.explorer?.[network] + "/transaction/" + value;
    },
  },
};

export const getChainName = ({
  chainId,
  acronym = false,
}: {
  chainId: ChainId;
  acronym?: boolean;
}): string => {
  if (acronym) return WORMHOLE_CHAINS[chainId]?.acronym || WORMHOLE_CHAINS[chainId]?.name || "";
  return WORMHOLE_CHAINS[chainId]?.name || "";
};

export const getChainIcon = ({ chainId, dark = false }: { chainId: ChainId; dark?: boolean }) => {
  if (!WORMHOLE_CHAINS[chainId]) return WORMHOLE_CHAINS[0]?.darkIcon;

  if (dark) {
    return WORMHOLE_CHAINS[chainId]?.darkIcon;
  }

  return WORMHOLE_CHAINS[chainId]?.icon;
};

export const getExplorerLink = ({
  network,
  chainId,
  value,
  base,
  isNativeAddress = false,
}: {
  network: Network;
  chainId: ChainId;
  value: string;
  base?: "tx" | "address" | "token";
  isNativeAddress?: boolean;
}): string => {
  let parsedValue = value;

  if (!isNativeAddress) {
    if (base === "address" || base === "token") {
      parsedValue = parseAddress({ value: value, chainId: chainId });
    }

    parsedValue = parseTx({ value: value, chainId: chainId });
  }

  return WORMHOLE_CHAINS[chainId]?.getExplorerBaseURL({ network, value: parsedValue, base }) || "";
};
