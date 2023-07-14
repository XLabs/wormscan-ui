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
import { NETWORK } from "src/types";
import { getCurrentNetwork } from "src/api/Client";

export type ExplorerBaseURLInput = {
  network: NETWORK;
  value: string;
  base?: "tx" | "address" | "token";
};

const WORMHOLE_CHAINS: { [key in ChainId]: any } = {
  [ChainId.Unset]: {
    name: "Unset",
    icon: NoDarkIcon,
    darkIcon: NoDarkIcon,
    explorer: {
      testnet: "",
      mainnet: "",
    },
    getExplorerBaseURL: function ({ network = "mainnet", value, base }: ExplorerBaseURLInput) {
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
      testnet: "https://suiexplorer.com",
      mainnet: "https://suiexplorer.com",
    },
    getExplorerBaseURL: function ({ network = "mainnet", value, base }: ExplorerBaseURLInput) {
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
      testnet: "",
      mainnet: "",
    },
    getExplorerBaseURL: function ({ network = "mainnet", value, base }: ExplorerBaseURLInput) {
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
      testnet: "",
      mainnet: "",
    },
    getExplorerBaseURL: function ({ network = "mainnet", value, base }: ExplorerBaseURLInput) {
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
      testnet: "",
      mainnet: "",
    },
    getExplorerBaseURL: function ({ network = "mainnet", value, base }: ExplorerBaseURLInput) {
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
      testnet: "https://blockscout.acala-dev.aca-dev.network",
      mainnet: "https://blockscout.acala.network",
    },
    getExplorerBaseURL: function ({ network = "mainnet", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/address/" + value;
      if (base === "token") return this.explorer?.[network] + "/token/" + value;
      return this.explorer?.[network] + "/tx/" + value;
    },
  },
  [ChainId.Algorand]: {
    name: "Algorand",
    icon: AlgorandIcon,
    darkIcon: AlgorandDarkIcon,
    explorer: {
      testnet: "https://testnet.algoexplorer.io",
      mainnet: "https://algoexplorer.io",
    },
    getExplorerBaseURL: function ({ network = "mainnet", value, base }: ExplorerBaseURLInput) {
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
      testnet: "https://explorer.aptoslabs.com",
      mainnet: "https://explorer.aptoslabs.com",
    },
    getExplorerBaseURL: function ({ network = "mainnet", value, base }: ExplorerBaseURLInput) {
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
      testnet: "https://goerli.arbiscan.io",
      mainnet: "https://arbiscan.io",
    },
    getExplorerBaseURL: function ({ network = "mainnet", value, base }: ExplorerBaseURLInput) {
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
      testnet: "https://explorer.testnet.aurora.dev",
      mainnet: "https://explorer.aurora.dev",
    },
    getExplorerBaseURL: function ({ network = "mainnet", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/address/" + value;
      if (base === "token") return this.explorer?.[network] + "/token/" + value;
      return this.explorer?.[network] + "/tx/" + value;
    },
  },
  [ChainId.Avalanche]: {
    name: "Avalanche",
    icon: AvalancheIcon,
    darkIcon: AvalancheDarkIcon,
    explorer: {
      testnet: "https://testnet.snowtrace.io",
      mainnet: "https://snowtrace.io",
    },
    getExplorerBaseURL: function ({ network = "mainnet", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/address/" + value;
      if (base === "token") return this.explorer?.[network] + "/token/" + value;
      return this.explorer?.[network] + "/tx/" + value;
    },
  },
  [ChainId.BSC]: {
    name: "Binance Smart Chain",
    acronym: "BSC",
    icon: BSCIcon,
    darkIcon: BSCDarkIcon,
    explorer: {
      testnet: "https://testnet.bscscan.com",
      mainnet: "https://bscscan.com",
    },
    getExplorerBaseURL: function ({ network = "mainnet", value, base }: ExplorerBaseURLInput) {
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
      testnet: "https://alfajores.celoscan.io",
      mainnet: "https://explorer.celo.org/mainnet",
    },
    getExplorerBaseURL: function ({ network = "mainnet", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/address/" + value;
      if (base === "token") return this.explorer?.[network] + "/token/" + value;
      return this.explorer?.[network] + "/tx/" + value;
    },
  },
  [ChainId.Ethereum]: {
    name: "Ethereum",
    icon: EthereumIcon,
    darkIcon: EthereumDarkIcon,
    explorer: {
      testnet: "https://goerli.etherscan.io",
      mainnet: "https://etherscan.io",
    },
    getExplorerBaseURL: function ({ network = "mainnet", value, base }: ExplorerBaseURLInput) {
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
      testnet: "https://testnet.ftmscan.com",
      mainnet: "https://ftmscan.com",
    },
    getExplorerBaseURL: function ({ network = "mainnet", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/address/" + value;
      if (base === "token") return this.explorer?.[network] + "/token/" + value;
      return this.explorer?.[network] + "/tx/" + value;
    },
  },
  [ChainId.Injective]: {
    name: "Injective",
    icon: InjectiveIcon,
    darkIcon: InjectiveDarkIcon,
    explorer: {
      testnet: "https://testnet.explorer.injective.network",
      mainnet: "https://explorer.injective.network",
    },
    getExplorerBaseURL: function ({ network = "mainnet", value, base }: ExplorerBaseURLInput) {
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
      testnet: "https://blockscout.karura-dev.aca-dev.network",
      mainnet: "https://blockscout.karura.network",
    },
    getExplorerBaseURL: function ({ network = "mainnet", value, base }: ExplorerBaseURLInput) {
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
      testnet: "https://baobab.scope.klaytn.com",
      mainnet: "https://scope.klaytn.com",
    },
    getExplorerBaseURL: function ({ network = "mainnet", value, base }: ExplorerBaseURLInput) {
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
      testnet: "https://moonbase.moonscan.io",
      mainnet: "https://moonscan.io",
    },
    getExplorerBaseURL: function ({ network = "mainnet", value, base }: ExplorerBaseURLInput) {
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
      testnet: "https://explorer.testnet.near.org",
      mainnet: "https://explorer.near.org",
    },
    getExplorerBaseURL: function ({ network = "mainnet", value, base }: ExplorerBaseURLInput) {
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
      testnet: "https://neonscan.org",
      mainnet: "https://neonscan.org",
    },
    getExplorerBaseURL: function ({ network = "mainnet", value, base }: ExplorerBaseURLInput) {
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
      testnet: "https://testnet.explorer.emerald.oasis.dev",
      mainnet: "https://explorer.emerald.oasis.dev",
    },
    getExplorerBaseURL: function ({ network = "mainnet", value, base }: ExplorerBaseURLInput) {
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
      testnet: "https://goerli-optimism.etherscan.io",
      mainnet: "https://optimistic.etherscan.io",
    },
    getExplorerBaseURL: function ({ network = "mainnet", value, base }: ExplorerBaseURLInput) {
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
      testnet: "https://mumbai.polygonscan.com",
      mainnet: "https://polygonscan.com",
    },
    getExplorerBaseURL: function ({ network = "mainnet", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/address/" + value;
      if (base === "token") return this.explorer?.[network] + "/token/" + value;
      return this.explorer?.[network] + "/tx/" + value;
    },
  },
  [ChainId.Solana]: {
    name: "Solana",
    icon: SolanaIcon,
    darkIcon: SolanaDarkIcon,
    explorer: {
      testnet: "https://solscan.io",
      mainnet: "https://solscan.io",
    },
    getExplorerBaseURL: function ({ network = "mainnet", value, base }: ExplorerBaseURLInput) {
      // Wormhole uses Solana's devnet as their 'testnet'
      const solNetwork = network === "mainnet" ? "mainnet" : "devnet";

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
      testnet: "https://finder.terra.money/columbus-5",
      mainnet: "https://finder.terra.money/columbus-5",
    },
    getExplorerBaseURL: function ({ network = "mainnet", value, base }: ExplorerBaseURLInput) {
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
      testnet: "https://finder.terra.money/pisco-1",
      mainnet: "https://finder.terra.money/phoenix-1",
    },
    getExplorerBaseURL: function ({ network = "mainnet", value, base }: ExplorerBaseURLInput) {
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
      testnet: "https://explorer.xpla.io/testnet",
      mainnet: "https://explorer.xpla.io/mainnet",
    },
    getExplorerBaseURL: function ({ network = "mainnet", value, base }: ExplorerBaseURLInput) {
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
      testnet: "https://sei.explorers.guru",
      mainnet: "https://sei.explorers.guru",
    },
    getExplorerBaseURL: function ({ network = "mainnet", value, base }: ExplorerBaseURLInput) {
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
  chainId,
  value,
  base,
  isNativeAddress = false,
}: {
  chainId: ChainId;
  value: string;
  base?: "tx" | "address" | "token";
  isNativeAddress?: boolean;
}): string => {
  const network = getCurrentNetwork();
  let parsedValue = value;

  if (!isNativeAddress) {
    if (base === "address" || base === "token") {
      parsedValue = parseAddress({ value: value, chainId: chainId });
    }

    parsedValue = parseTx({ value: value, chainId: chainId });
  }

  return WORMHOLE_CHAINS[chainId]?.getExplorerBaseURL({ network, value: parsedValue, base }) || "";
};
