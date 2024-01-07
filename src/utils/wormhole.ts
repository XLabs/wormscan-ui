import { Network } from "@certusone/wormhole-sdk";
import { ChainId } from "src/api";

import AcalaIcon from "src/icons/blockchains/acala.svg";
import AlgorandIcon from "src/icons/blockchains/algorand.svg";
import AptosIcon from "src/icons/blockchains/aptos.svg";
import ArbitrumIcon from "src/icons/blockchains/arbitrum.svg";
import AuroraIcon from "src/icons/blockchains/aurora.svg";
import AvalancheIcon from "src/icons/blockchains/avax.svg";
import BaseIcon from "src/icons/blockchains/base.svg";
import BSCIcon from "src/icons/blockchains/bsc.svg";
import CeloIcon from "src/icons/blockchains/celo.svg";
import EthereumIcon from "src/icons/blockchains/eth.svg";
import EvmosIcon from "src/icons/blockchains/evmos.svg";
import FantomIcon from "src/icons/blockchains/fantom.svg";
import InjectiveIcon from "src/icons/blockchains/injective.svg";
import KaruraIcon from "src/icons/blockchains/karura.svg";
import KlaytnIcon from "src/icons/blockchains/klaytn.svg";
import KujiraIcon from "src/icons/blockchains/kujira.svg";
import MoonbeamIcon from "src/icons/blockchains/moonbeam.svg";
import NearIcon from "src/icons/blockchains/near.svg";
import NeonIcon from "src/icons/blockchains/neon.svg";
import OasisIcon from "src/icons/blockchains/oasis.svg";
import OptimismIcon from "src/icons/blockchains/optimism.svg";
import OsmosisIcon from "src/icons/blockchains/osmosis.svg";
import PolygonIcon from "src/icons/blockchains/polygon.svg";
import SeiIcon from "src/icons/blockchains/sei.svg";
import SolanaIcon from "src/icons/blockchains/solana.svg";
import SuiIcon from "src/icons/blockchains/sui.svg";
import TerraClassicIcon from "src/icons/blockchains/terra-classic.svg";
import TerraIcon from "src/icons/blockchains/terra.svg";
import XplaIcon from "src/icons/blockchains/xpla.svg";
import WormChainIcon from "src/icons/blockchains/wormchain.svg";

import AcalaColorlessIcon from "src/icons/blockchains/colorless/acala.svg";
import AlgorandColorlessIcon from "src/icons/blockchains/colorless/algorand.svg";
import AptosColorlessIcon from "src/icons/blockchains/colorless/aptos.svg";
import ArbitrumColorlessIcon from "src/icons/blockchains/colorless/arbitrum.svg";
import AuroraColorlessIcon from "src/icons/blockchains/colorless/aurora.svg";
import AvalancheColorlessIcon from "src/icons/blockchains/colorless/avax.svg";
import BaseColorlessIcon from "src/icons/blockchains/colorless/base.svg";
import BSCColorlessIcon from "src/icons/blockchains/colorless/bsc.svg";
import CeloColorlessIcon from "src/icons/blockchains/colorless/celo.svg";
import EthereumColorlessIcon from "src/icons/blockchains/colorless/eth.svg";
import EvmosColorlessIcon from "src/icons/blockchains/colorless/evmos.svg";
import FantomColorlessIcon from "src/icons/blockchains/colorless/fantom.svg";
import InjectiveColorlessIcon from "src/icons/blockchains/colorless/injective.svg";
import KaruraColorlessIcon from "src/icons/blockchains/colorless/karura.svg";
import KlaytnColorlessIcon from "src/icons/blockchains/colorless/klaytn.svg";
import KujiraColorlessIcon from "src/icons/blockchains/colorless/kujira.svg";
import MoonbeamColorlessIcon from "src/icons/blockchains/colorless/moonbeam.svg";
import NearColorlessIcon from "src/icons/blockchains/colorless/near.svg";
import NeonColorlessIcon from "src/icons/blockchains/colorless/neon.svg";
import NoColorlessIcon from "src/icons/blockchains/colorless/noIcon.svg";
import OasisColorlessIcon from "src/icons/blockchains/colorless/oasis.svg";
import OptimismColorlessIcon from "src/icons/blockchains/colorless/optimism.svg";
import OsmosisColorlessIcon from "src/icons/blockchains/osmosis.svg";
import PolygonColorlessIcon from "src/icons/blockchains/colorless/polygon.svg";
import SeiColorlessIcon from "src/icons/blockchains/colorless/sei.svg";
import SolanaColorlessIcon from "src/icons/blockchains/colorless/solana.svg";
import SuiColorlessIcon from "src/icons/blockchains/colorless/sui.svg";
import TerraClassicColorlessIcon from "src/icons/blockchains/colorless/terra-classic.svg";
import TerraColorlessIcon from "src/icons/blockchains/colorless/terra.svg";
import WormChainColorlessIcon from "src/icons/blockchains/colorless/wormchain.svg";
import XplaColorlessIcon from "src/icons/blockchains/colorless/xpla.svg";

import { parseAddress, parseTx } from "./crypto";

export type ExplorerBaseURLInput = {
  network: Network;
  value: string;
  base?: "tx" | "address" | "token" | "block";
};

const WORMHOLE_CHAINS: { [key in ChainId]: any } = {
  [ChainId.Unset]: {
    name: "Unset",
    icon: NoColorlessIcon,
    colorlessIcon: NoColorlessIcon,
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
    colorlessIcon: SuiColorlessIcon,
    explorer: {
      TESTNET: "https://suiscan.xyz/testnet",
      MAINNET: "https://suiscan.xyz/mainnet",
    },
    getExplorerBaseURL: function ({ network = "MAINNET", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/account/" + value;
      if (base === "token") return this.explorer?.[network] + "/coin/" + value;
      return this.explorer?.[network] + "/tx/" + value;
    },
  },
  [ChainId.PythNet]: {
    name: "PythNet",
    icon: NoColorlessIcon,
    colorlessIcon: NoColorlessIcon,
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
    icon: NoColorlessIcon,
    colorlessIcon: NoColorlessIcon,
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
    name: "WH Gateway",
    icon: WormChainIcon,
    colorlessIcon: WormChainColorlessIcon,
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
  [ChainId.Osmosis]: {
    name: "Osmosis",
    icon: OsmosisIcon,
    colorlessIcon: OsmosisColorlessIcon,
    explorer: {
      TESTNET: "https://testnet.mintscan.io/osmosis-testnet",
      MAINNET: "https://www.mintscan.io/osmosis",
    },
    getExplorerBaseURL: function ({ network = "MAINNET", value, base }: ExplorerBaseURLInput) {
      if (network === "MAINNET") {
        if (base === "address") return this.explorer?.[network] + "/accounts/" + value;
        if (base === "token") return this.explorer?.[network] + "/assets/ibc/" + value;
        return this.explorer?.[network] + "/transactions/" + value;
      } else {
        if (base === "address") return this.explorer?.[network] + "/account/" + value;
        if (base === "token") return this.explorer?.[network] + "/assets";
        return this.explorer?.[network] + "/txs/" + value;
      }
    },
  },
  [ChainId.Evmos]: {
    name: "Evmos",
    icon: EvmosIcon,
    colorlessIcon: EvmosColorlessIcon,
    explorer: {
      TESTNET: "https://testnet.mintscan.io/evmos-testnet",
      MAINNET: "https://www.mintscan.io/evmos",
    },
    getExplorerBaseURL: function ({ network = "MAINNET", value, base }: ExplorerBaseURLInput) {
      if (network === "MAINNET") {
        if (base === "address") return this.explorer?.[network] + "/accounts/" + value;
        if (base === "token") return this.explorer?.[network] + "/assets/ibc/" + value;
        return this.explorer?.[network] + "/transactions/" + value;
      } else {
        if (base === "address") return this.explorer?.[network] + "/account/" + value;
        if (base === "token") return this.explorer?.[network] + "/assets";
        return this.explorer?.[network] + "/txs/" + value;
      }
    },
  },
  [ChainId.Kujira]: {
    name: "Kujira",
    icon: KujiraIcon,
    colorlessIcon: KujiraColorlessIcon,
    explorer: {
      TESTNET: "https://finder.kujira.network/harpoon-4",
      MAINNET: "https://finder.kujira.network/kaiyo-1",
    },
    getExplorerBaseURL: function ({ network = "MAINNET", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/address/" + value;
      if (base === "token") return this.explorer?.[network] + "/token/" + value;
      if (base === "block") return this.explorer?.[network] + "/block/" + value;
      return this.explorer?.[network] + "/tx/" + value;
    },
  },
  [ChainId.Acala]: {
    name: "Acala",
    icon: AcalaIcon,
    colorlessIcon: AcalaColorlessIcon,
    explorer: {
      TESTNET: "https://blockscout.acala-dev.aca-dev.network",
      MAINNET: "https://blockscout.acala.network",
    },
    getExplorerBaseURL: function ({ network = "MAINNET", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/address/" + value;
      if (base === "token") return this.explorer?.[network] + "/token/" + value;
      if (base === "block") return this.explorer?.[network] + "/block/" + value;
      return this.explorer?.[network] + "/tx/" + value;
    },
  },
  [ChainId.Algorand]: {
    name: "Algorand",
    acronym: "ALGO",
    icon: AlgorandIcon,
    colorlessIcon: AlgorandColorlessIcon,
    explorer: {
      TESTNET: "https://TESTNET.algoexplorer.io",
      MAINNET: "https://allo.info",
    },
    getExplorerBaseURL: function ({ network = "MAINNET", value, base }: ExplorerBaseURLInput) {
      if (base === "address") {
        if (network === "MAINNET") return this.explorer?.[network] + "/account/" + value;
        return this.explorer?.[network] + "/address/" + value;
      }
      if (base === "token") return this.explorer?.[network] + "/asset/" + value;
      if (base === "block") return this.explorer?.[network] + "/block/" + value;
      return this.explorer?.[network] + "/tx/" + value;
    },
  },
  [ChainId.Aptos]: {
    name: "Aptos",
    icon: AptosIcon,
    colorlessIcon: AptosColorlessIcon,
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
    nameTestnet: "Arbitrum Goerli",
    icon: ArbitrumIcon,
    colorlessIcon: ArbitrumColorlessIcon,
    explorer: {
      TESTNET: "https://goerli.arbiscan.io",
      MAINNET: "https://arbiscan.io",
    },
    getExplorerBaseURL: function ({ network = "MAINNET", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/address/" + value;
      if (base === "token") return this.explorer?.[network] + "/token/" + value;
      if (base === "block") return this.explorer?.[network] + "/block/" + value;
      return this.explorer?.[network] + "/tx/" + value;
    },
  },
  [ChainId.Aurora]: {
    name: "Aurora",
    icon: AuroraIcon,
    colorlessIcon: AuroraColorlessIcon,
    explorer: {
      TESTNET: "https://explorer.TESTNET.aurora.dev",
      MAINNET: "https://explorer.aurora.dev",
    },
    getExplorerBaseURL: function ({ network = "MAINNET", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/address/" + value;
      if (base === "token") return this.explorer?.[network] + "/token/" + value;
      if (base === "block") return this.explorer?.[network] + "/block/" + value;
      return this.explorer?.[network] + "/tx/" + value;
    },
  },
  [ChainId.Avalanche]: {
    name: "Avalanche",
    nameTestnet: "Fuji",
    acronym: "AVAX",
    icon: AvalancheIcon,
    colorlessIcon: AvalancheColorlessIcon,
    explorer: {
      TESTNET: "https://testnet.snowtrace.io/",
      MAINNET: "https://snowtrace.io/",
    },
    getExplorerBaseURL: function ({ network = "MAINNET", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/address/" + value;
      if (base === "token") return this.explorer?.[network] + "/token/" + value;
      if (base === "block") return this.explorer?.[network] + "/block/" + value;
      return this.explorer?.[network] + "/tx/" + value;
    },
  },
  [ChainId.BSC]: {
    name: "BNB Smart Chain",
    acronym: "BSC",
    icon: BSCIcon,
    colorlessIcon: BSCColorlessIcon,
    explorer: {
      TESTNET: "https://TESTNET.bscscan.com",
      MAINNET: "https://bscscan.com",
    },
    getExplorerBaseURL: function ({ network = "MAINNET", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/address/" + value;
      if (base === "token") return this.explorer?.[network] + "/token/" + value;
      if (base === "block") return this.explorer?.[network] + "/block/" + value;
      return this.explorer?.[network] + "/tx/" + value;
    },
  },
  [ChainId.Celo]: {
    name: "Celo",
    nameTestnet: "Alfajores",
    icon: CeloIcon,
    colorlessIcon: CeloColorlessIcon,
    explorer: {
      TESTNET: "https://alfajores.celoscan.io",
      MAINNET: "https://explorer.celo.org/mainnet",
    },
    getExplorerBaseURL: function ({ network = "MAINNET", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/address/" + value;
      if (base === "token") return this.explorer?.[network] + "/token/" + value;
      if (base === "block") return this.explorer?.[network] + "/block/" + value;
      return this.explorer?.[network] + "/tx/" + value;
    },
  },
  [ChainId.Ethereum]: {
    name: "Ethereum",
    nameTestnet: "Goerli",
    acronym: "ETH",
    icon: EthereumIcon,
    colorlessIcon: EthereumColorlessIcon,
    explorer: {
      TESTNET: "https://goerli.etherscan.io",
      MAINNET: "https://etherscan.io",
    },
    getExplorerBaseURL: function ({ network = "MAINNET", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/address/" + value;
      if (base === "token") return this.explorer?.[network] + "/token/" + value;
      if (base === "block") return this.explorer?.[network] + "/block/" + value;
      return this.explorer?.[network] + "/tx/" + value;
    },
  },
  [ChainId.Fantom]: {
    name: "Fantom",
    icon: FantomIcon,
    colorlessIcon: FantomColorlessIcon,
    explorer: {
      TESTNET: "https://TESTNET.ftmscan.com",
      MAINNET: "https://ftmscan.com",
    },
    getExplorerBaseURL: function ({ network = "MAINNET", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/address/" + value;
      if (base === "token") return this.explorer?.[network] + "/token/" + value;
      if (base === "block") return this.explorer?.[network] + "/block/" + value;
      return this.explorer?.[network] + "/tx/" + value;
    },
  },
  [ChainId.Injective]: {
    name: "Injective",
    acronym: "INJ",
    icon: InjectiveIcon,
    colorlessIcon: InjectiveColorlessIcon,
    explorer: {
      TESTNET: "https://TESTNET.explorer.injective.network",
      MAINNET: "https://explorer.injective.network",
    },
    getExplorerBaseURL: function ({ network = "MAINNET", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/account/" + value;
      if (base === "token") return this.explorer?.[network] + "/token/" + value;
      if (base === "block") return this.explorer?.[network] + "/block/" + value;
      return this.explorer?.[network] + "/transaction/" + value;
    },
  },
  [ChainId.Karura]: {
    name: "Karura",
    icon: KaruraIcon,
    colorlessIcon: KaruraColorlessIcon,
    explorer: {
      TESTNET: "https://blockscout.karura-dev.aca-dev.network",
      MAINNET: "https://blockscout.karura.network",
    },
    getExplorerBaseURL: function ({ network = "MAINNET", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/address/" + value;
      if (base === "token") return this.explorer?.[network] + "/token/" + value;
      if (base === "block") return this.explorer?.[network] + "/block/" + value;
      return this.explorer?.[network] + "/tx/" + value;
    },
  },
  [ChainId.Klaytn]: {
    name: "Klaytn",
    icon: KlaytnIcon,
    colorlessIcon: KlaytnColorlessIcon,
    explorer: {
      TESTNET: "https://baobab.scope.klaytn.com",
      MAINNET: "https://scope.klaytn.com",
    },
    getExplorerBaseURL: function ({ network = "MAINNET", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/account/" + value;
      if (base === "token") return this.explorer?.[network] + "/token/" + value;
      if (base === "block") return this.explorer?.[network] + "/block/" + value;
      return this.explorer?.[network] + "/tx/" + value;
    },
  },
  [ChainId.Moonbeam]: {
    name: "Moonbeam",
    nameTestnet: "Moonbase Alpha",
    icon: MoonbeamIcon,
    colorlessIcon: MoonbeamColorlessIcon,
    explorer: {
      TESTNET: "https://moonbase.moonscan.io",
      MAINNET: "https://moonscan.io",
    },
    getExplorerBaseURL: function ({ network = "MAINNET", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/address/" + value;
      if (base === "token") return this.explorer?.[network] + "/token/" + value;
      if (base === "block") return this.explorer?.[network] + "/block/" + value;
      return this.explorer?.[network] + "/tx/" + value;
    },
  },
  [ChainId.Near]: {
    name: "Near",
    icon: NearIcon,
    colorlessIcon: NearColorlessIcon,
    explorer: {
      TESTNET: "https://explorer.TESTNET.near.org",
      MAINNET: "https://explorer.near.org",
    },
    getExplorerBaseURL: function ({ network = "MAINNET", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/accounts/" + value;
      if (base === "token") return this.explorer?.[network] + "/token/" + value;
      if (base === "block") return this.explorer?.[network] + "/block/" + value;
      return this.explorer?.[network] + "/transactions/" + value;
    },
  },
  [ChainId.Neon]: {
    name: "Neon",
    icon: NeonIcon,
    colorlessIcon: NeonColorlessIcon,
    explorer: {
      TESTNET: "https://neonscan.org",
      MAINNET: "https://neonscan.org",
    },
    getExplorerBaseURL: function ({ network = "MAINNET", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/address/" + value;
      if (base === "token") return this.explorer?.[network] + "/token/" + value;
      if (base === "block") return this.explorer?.[network] + "/block/" + value;
      return this.explorer?.[network] + "/tx/" + value;
    },
  },
  [ChainId.Oasis]: {
    name: "Oasis",
    icon: OasisIcon,
    colorlessIcon: OasisColorlessIcon,
    explorer: {
      TESTNET: "https://TESTNET.explorer.emerald.oasis.dev",
      MAINNET: "https://explorer.emerald.oasis.dev",
    },
    getExplorerBaseURL: function ({ network = "MAINNET", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/address/" + value;
      if (base === "token") return this.explorer?.[network] + "/token/" + value;
      if (base === "block") return this.explorer?.[network] + "/block/" + value;
      return this.explorer?.[network] + "/tx/" + value;
    },
  },
  [ChainId.Optimism]: {
    name: "Optimism",
    nameTestnet: "Optimism Goerli",
    icon: OptimismIcon,
    colorlessIcon: OptimismColorlessIcon,
    explorer: {
      TESTNET: "https://goerli-optimism.etherscan.io",
      MAINNET: "https://optimistic.etherscan.io",
    },
    getExplorerBaseURL: function ({ network = "MAINNET", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/address/" + value;
      if (base === "token") return this.explorer?.[network] + "/token/" + value;
      if (base === "block") return this.explorer?.[network] + "/block/" + value;
      return this.explorer?.[network] + "/tx/" + value;
    },
  },
  [ChainId.Polygon]: {
    name: "Polygon",
    nameTestnet: "Mumbai",
    icon: PolygonIcon,
    colorlessIcon: PolygonColorlessIcon,
    explorer: {
      TESTNET: "https://mumbai.polygonscan.com",
      MAINNET: "https://polygonscan.com",
    },
    getExplorerBaseURL: function ({ network = "MAINNET", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/address/" + value;
      if (base === "token") return this.explorer?.[network] + "/token/" + value;
      if (base === "block") return this.explorer?.[network] + "/block/" + value;
      return this.explorer?.[network] + "/tx/" + value;
    },
  },
  [ChainId.Solana]: {
    name: "Solana",
    acronym: "SOL",
    icon: SolanaIcon,
    colorlessIcon: SolanaColorlessIcon,
    explorer: {
      TESTNET: "https://solscan.io",
      MAINNET: "https://solscan.io",
    },
    getExplorerBaseURL: function ({ network = "MAINNET", value, base }: ExplorerBaseURLInput) {
      // Wormhole uses Solana's devnet as their 'TESTNET'
      const solNetwork = network === "MAINNET" ? "" : "devnet";

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
    colorlessIcon: TerraClassicColorlessIcon,
    explorer: {
      TESTNET: "https://finder.terra.money/columbus-5",
      MAINNET: "https://finder.terra.money/columbus-5",
    },
    getExplorerBaseURL: function ({ network = "MAINNET", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/address/" + value;
      if (base === "token") return this.explorer?.[network] + "/token/" + value;
      if (base === "block") return this.explorer?.[network] + "/block/" + value;
      return this.explorer?.[network] + "/tx/" + value;
    },
  },
  [ChainId.Terra2]: {
    name: "Terra2",
    icon: TerraIcon,
    colorlessIcon: TerraColorlessIcon,
    explorer: {
      TESTNET: "https://finder.terra.money/pisco-1",
      MAINNET: "https://finder.terra.money/phoenix-1",
    },
    getExplorerBaseURL: function ({ network = "MAINNET", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/address/" + value;
      if (base === "token") return this.explorer?.[network] + "/token/" + value;
      if (base === "block") return this.explorer?.[network] + "/block/" + value;
      return this.explorer?.[network] + "/tx/" + value;
    },
  },
  [ChainId.Xpla]: {
    name: "Xpla",
    icon: XplaIcon,
    colorlessIcon: XplaColorlessIcon,
    explorer: {
      TESTNET: "https://explorer.xpla.io/TESTNET",
      MAINNET: "https://explorer.xpla.io/MAINNET",
    },
    getExplorerBaseURL: function ({ network = "MAINNET", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/address/" + value;
      if (base === "token") return this.explorer?.[network] + "/token/" + value;
      if (base === "block") return this.explorer?.[network] + "/block/" + value;
      return this.explorer?.[network] + "/tx/" + value;
    },
  },
  [ChainId.Sei]: {
    name: "Sei",
    icon: SeiIcon,
    colorlessIcon: SeiColorlessIcon,
    explorer: {
      TESTNET: "https://www.seiscan.app/atlantic-2",
      MAINNET: "https://www.seiscan.app/pacific-1",
    },
    getExplorerBaseURL: function ({ network = "MAINNET", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/accounts/" + value;
      if (base === "token") return this.explorer?.[network] + "/token/" + value;
      if (base === "block") return this.explorer?.[network] + "/blocks/" + value;
      return this.explorer?.[network] + "/txs/" + value;
    },
  },
  [ChainId.Base]: {
    name: "Base",
    nameTestnet: "Base Goerli",
    icon: BaseIcon,
    colorlessIcon: BaseColorlessIcon,
    explorer: {
      TESTNET: "https://goerli.basescan.org",
      MAINNET: "https://basescan.org",
    },
    getExplorerBaseURL: function ({ network = "MAINNET", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/address/" + value;
      if (base === "token") return this.explorer?.[network] + "/token/" + value;
      if (base === "block") return this.explorer?.[network] + "/block/" + value;
      return this.explorer?.[network] + "/tx/" + value;
    },
  },
  [ChainId.Sepolia]: {
    name: "Sepolia",
    icon: EthereumIcon,
    colorlessIcon: EthereumColorlessIcon,
    explorer: {
      TESTNET: "https://sepolia.etherscan.io",
      MAINNET: "https://sepolia.etherscan.io",
    },
    getExplorerBaseURL: function ({ network = "MAINNET", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/address/" + value;
      if (base === "token") return this.explorer?.[network] + "/token/" + value;
      if (base === "block") return this.explorer?.[network] + "/block/" + value;
      return this.explorer?.[network] + "/tx/" + value;
    },
  },
};

const OTHERS_FAKE_CHAIN_ID = 123123123 as ChainId;

export const getChainName = ({
  network,
  chainId,
  acronym = false,
}: {
  network: Network;
  chainId: ChainId;
  acronym?: boolean;
}): string => {
  if (chainId === OTHERS_FAKE_CHAIN_ID) return "Others";

  const chainInfo = WORMHOLE_CHAINS[chainId];
  if (!chainInfo) return "Unset";

  if (acronym) {
    if (network === "TESTNET")
      return chainInfo?.nameTestnet || chainInfo?.acronym || chainInfo?.name;

    return chainInfo?.acronym || chainInfo?.name;
  }

  if (network === "TESTNET") return chainInfo?.nameTestnet || chainInfo?.name;
  return chainInfo?.name;
};

export const getChainIcon = ({
  chainId,
  colorless = false,
}: {
  chainId: ChainId;
  colorless?: boolean;
}) => {
  if (!WORMHOLE_CHAINS[chainId]) return WORMHOLE_CHAINS[0]?.colorlessIcon;

  if (colorless) {
    return WORMHOLE_CHAINS[chainId]?.colorlessIcon;
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
  base?: "tx" | "address" | "token" | "block";
  isNativeAddress?: boolean;
}): string => {
  let parsedValue = value;

  if (!isNativeAddress && base !== "block") {
    if (base === "address" || base === "token") {
      parsedValue = parseAddress({ value: value, chainId: chainId });
    }

    parsedValue = parseTx({ value: value, chainId: chainId });
  }

  return WORMHOLE_CHAINS[chainId]?.getExplorerBaseURL({ network, value: parsedValue, base }) || "";
};
