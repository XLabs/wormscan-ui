import { Network, ChainId, chainToChainId } from "@wormhole-foundation/sdk";

import AcalaIcon from "src/icons/blockchains/acala.svg";
import AlgorandIcon from "src/icons/blockchains/algorand.svg";
import AptosIcon from "src/icons/blockchains/aptos.svg";
import ArbitrumIcon from "src/icons/blockchains/arbitrum.svg";
import AuroraIcon from "src/icons/blockchains/aurora.svg";
import AvalancheIcon from "src/icons/blockchains/avax.svg";
import BaseIcon from "src/icons/blockchains/base.svg";
import BlastIcon from "src/icons/blockchains/blast.svg";
import BSCIcon from "src/icons/blockchains/bsc.svg";
import BtcIcon from "src/icons/blockchains/btc.svg";
import CeloIcon from "src/icons/blockchains/celo.svg";
import DymensionIcon from "src/icons/blockchains/dymension.svg";
import EnergiIcon from "src/icons/blockchains/energi.svg";
import EthereumIcon from "src/icons/blockchains/eth.svg";
import EvmosIcon from "src/icons/blockchains/evmos.svg";
import FantomIcon from "src/icons/blockchains/fantom.svg";
import HederaIcon from "src/icons/blockchains/hedera.svg";
import InjectiveIcon from "src/icons/blockchains/injective.svg";
import KaruraIcon from "src/icons/blockchains/karura.svg";
import KlaytnIcon from "src/icons/blockchains/klaytn.svg";
import KujiraIcon from "src/icons/blockchains/kujira.svg";
import LineaIcon from "src/icons/blockchains/linea.svg";
import MantleIcon from "src/icons/blockchains/mantle.svg";
import MonadIcon from "src/icons/blockchains/monad.svg";
import MoonbeamIcon from "src/icons/blockchains/moonbeam.svg";
import NearIcon from "src/icons/blockchains/near.svg";
import NeonIcon from "src/icons/blockchains/neon.svg";
import OasisIcon from "src/icons/blockchains/oasis.svg";
import OptimismIcon from "src/icons/blockchains/optimism.svg";
import OsmosisIcon from "src/icons/blockchains/osmosis.svg";
import PolkadotIcon from "src/icons/blockchains/polkadot.svg";
import PolygonIcon from "src/icons/blockchains/polygon.svg";
import PythIcon from "src/icons/blockchains/pyth.svg";
import ScrollIcon from "src/icons/blockchains/scroll.svg";
import SeiIcon from "src/icons/blockchains/sei.svg";
import SnaxChainIcon from "src/icons/blockchains/snaxchain.svg";
import SolanaIcon from "src/icons/blockchains/solana.svg";
import StellarIcon from "src/icons/blockchains/stellar.svg";
import SuiIcon from "src/icons/blockchains/sui.svg";
import TerraClassicIcon from "src/icons/blockchains/terra-classic.svg";
import TerraIcon from "src/icons/blockchains/terra.svg";
import TronIcon from "src/icons/blockchains/tron.svg";
import UnichainIcon from "src/icons/blockchains/unichain.svg";
import WormChainIcon from "src/icons/blockchains/wormchain.svg";
import XLayerIcon from "src/icons/blockchains/xlayer.svg";
import XplaIcon from "src/icons/blockchains/xpla.svg";
import ZksyncIcon from "src/icons/blockchains/zksync.svg";

import AcalaColorlessIcon from "src/icons/blockchains/colorless/acala.svg";
import AlgorandColorlessIcon from "src/icons/blockchains/colorless/algorand.svg";
import AptosColorlessIcon from "src/icons/blockchains/colorless/aptos.svg";
import ArbitrumColorlessIcon from "src/icons/blockchains/colorless/arbitrum.svg";
import AuroraColorlessIcon from "src/icons/blockchains/colorless/aurora.svg";
import AvalancheColorlessIcon from "src/icons/blockchains/colorless/avax.svg";
import BaseColorlessIcon from "src/icons/blockchains/colorless/base.svg";
import BlastColorlessIcon from "src/icons/blockchains/colorless/blast.svg";
import BSCColorlessIcon from "src/icons/blockchains/colorless/bsc.svg";
import BtcColorlessIcon from "src/icons/blockchains/colorless/btc.svg";
import CeloColorlessIcon from "src/icons/blockchains/colorless/celo.svg";
import DymensionColorlessIcon from "src/icons/blockchains/colorless/dymension.svg";
import EnergiColorlessIcon from "src/icons/blockchains/colorless/energi.svg";
import EthereumColorlessIcon from "src/icons/blockchains/colorless/eth.svg";
import EvmosColorlessIcon from "src/icons/blockchains/colorless/evmos.svg";
import FantomColorlessIcon from "src/icons/blockchains/colorless/fantom.svg";
import HederaColorlessIcon from "src/icons/blockchains/colorless/hedera.svg";
import InjectiveColorlessIcon from "src/icons/blockchains/colorless/injective.svg";
import KaruraColorlessIcon from "src/icons/blockchains/colorless/karura.svg";
import KlaytnColorlessIcon from "src/icons/blockchains/colorless/klaytn.svg";
import KujiraColorlessIcon from "src/icons/blockchains/colorless/kujira.svg";
import LineaColorlessIcon from "src/icons/blockchains/colorless/linea.svg";
import MantleColorlessIcon from "src/icons/blockchains/colorless/mantle.svg";
import MonadColorlessIcon from "src/icons/blockchains/colorless/monad.svg";
import MoonbeamColorlessIcon from "src/icons/blockchains/colorless/moonbeam.svg";
import NearColorlessIcon from "src/icons/blockchains/colorless/near.svg";
import NeonColorlessIcon from "src/icons/blockchains/colorless/neon.svg";
import NoColorlessIcon from "src/icons/blockchains/colorless/noIcon.svg";
import OasisColorlessIcon from "src/icons/blockchains/colorless/oasis.svg";
import OptimismColorlessIcon from "src/icons/blockchains/colorless/optimism.svg";
import OsmosisColorlessIcon from "src/icons/blockchains/colorless/osmosis.svg";
import PolkadotColorlessIcon from "src/icons/blockchains/colorless/polkadot.svg";
import PolygonColorlessIcon from "src/icons/blockchains/colorless/polygon.svg";
import PythColorlessIcon from "src/icons/blockchains/colorless/pyth.svg";
import ScrollColorlessIcon from "src/icons/blockchains/colorless/scroll.svg";
import SeiColorlessIcon from "src/icons/blockchains/colorless/sei.svg";
import SnaxChainColorlessIcon from "src/icons/blockchains/colorless/snaxchain.svg";
import SolanaColorlessIcon from "src/icons/blockchains/colorless/solana.svg";
import StellarColorlessIcon from "src/icons/blockchains/colorless/stellar.svg";
import SuiColorlessIcon from "src/icons/blockchains/colorless/sui.svg";
import TerraClassicColorlessIcon from "src/icons/blockchains/colorless/terra-classic.svg";
import TerraColorlessIcon from "src/icons/blockchains/colorless/terra.svg";
import TronColorlessIcon from "src/icons/blockchains/colorless/tron.svg";
import UniChainColorlessIcon from "src/icons/blockchains/colorless/unichain.svg";
import WormChainColorlessIcon from "src/icons/blockchains/colorless/wormchain.svg";
import XLayerColorlessIcon from "src/icons/blockchains/colorless/xlayer.svg";
import XplaColorlessIcon from "src/icons/blockchains/colorless/xpla.svg";
import ZksyncColorlessIcon from "src/icons/blockchains/colorless/zksync.svg";

import { parseAddress, parseTx } from "./crypto";

export type ExplorerBaseURLInput = {
  network: Network;
  value: string;
  base?: "tx" | "address" | "token" | "block";
};

const WORMHOLE_CHAINS: any = {
  [0]: {
    name: "Unset",
    icon: NoColorlessIcon,
    colorlessIcon: NoColorlessIcon,
    explorer: {
      TESTNET: "",
      MAINNET: "",
    },
    getExplorerBaseURL: function ({ network = "Mainnet", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return "";
      if (base === "token") return "";
      return "";
    },
  },
  [chainToChainId("Sui")]: {
    name: "Sui",
    icon: SuiIcon,
    colorlessIcon: SuiColorlessIcon,
    explorer: {
      Testnet: "https://testnet.suivision.xyz",
      Devnet: "https://devnet.suivision.xyz",
      Mainnet: "https://suivision.xyz",
    },
    getExplorerBaseURL: function ({ network = "Mainnet", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/account/" + value;
      if (base === "token")
        return (
          this.explorer?.[network] +
          "/coin/" +
          // the SUI native token comes as this following address because of wormhole encoding,
          // we need to hardcode the SUI token address for the explorer to work
          (value === "0x9258181f5ceac8dbffb7030890243caed69a9599d2886d957a9cb7656af3bdb3"
            ? "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI"
            : value)
        );
      return this.explorer?.[network] + "/txblock/" + value;
    },
  },
  [chainToChainId("Pythnet")]: {
    name: "PythNet",
    icon: PythIcon,
    colorlessIcon: PythColorlessIcon,
    explorer: {
      Testnet: "",
      Devnet: "",
      Mainnet: "",
    },
    getExplorerBaseURL: function ({ network = "Mainnet", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return "";
      if (base === "token") return "";
      return "";
    },
  },
  [chainToChainId("MonadDevnet")]: {
    name: "MonadDevnet",
    icon: MonadIcon,
    colorlessIcon: MonadColorlessIcon,
    explorer: {
      Testnet: "",
      Devnet: "",
      Mainnet: "",
    },
    getExplorerBaseURL: function ({ network = "Mainnet", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return "";
      if (base === "token") return "";
      return "";
    },
  },
  [chainToChainId("Snaxchain")]: {
    name: "SnaxChain",
    icon: SnaxChainIcon,
    colorlessIcon: SnaxChainColorlessIcon,
    explorer: {
      Testnet: "https://testnet-explorer.snaxchain.io/",
      Mainnet: "https://explorer.snaxchain.io/",
      Devnet: "",
    },
    getExplorerBaseURL: function ({ network = "Mainnet", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/address/" + value;
      if (base === "token") return this.explorer?.[network] + "/token/" + value;
      return this.explorer?.[network] + "/tx/" + value;
    },
  },
  [chainToChainId("Btc")]: {
    name: "Btc",
    icon: BtcIcon,
    colorlessIcon: BtcColorlessIcon,
    explorer: {
      Testnet: "",
      Devnet: "",
      Mainnet: "",
    },
    getExplorerBaseURL: function ({ network = "Mainnet", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return "";
      if (base === "token") return "";
      return "";
    },
  },
  [chainToChainId("Wormchain")]: {
    name: "WH Gateway",
    icon: WormChainIcon,
    colorlessIcon: WormChainColorlessIcon,
    explorer: {
      Testnet: "",
      Devnet: "",
      Mainnet: "https://bigdipper.live/wormhole",
    },
    getExplorerBaseURL: function ({ network = "Mainnet", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/accounts/" + value;
      if (base === "token") return "";
      return this.explorer?.[network] + "/transactions/" + value;
    },
  },
  [chainToChainId("Osmosis")]: {
    name: "Osmosis",
    icon: OsmosisIcon,
    colorlessIcon: OsmosisColorlessIcon,
    explorer: {
      Testnet: "https://Testnet.mintscan.io/osmosis-Testnet",
      Devnet: "https://Testnet.mintscan.io/osmosis-Testnet",
      Mainnet: "https://www.mintscan.io/osmosis",
    },
    getExplorerBaseURL: function ({ network = "Mainnet", value, base }: ExplorerBaseURLInput) {
      if (network === "Mainnet") {
        if (base === "address") return this.explorer?.[network] + "/accounts/" + value;
        if (base === "token")
          return this.explorer?.[network] + "/assets/ibc/" + btoa(value.replace("ibc/", ""));
        return this.explorer?.[network] + "/transactions/" + value;
      } else {
        if (base === "address") return this.explorer?.[network] + "/account/" + value;
        if (base === "token") return this.explorer?.[network] + "/assets";
        return this.explorer?.[network] + "/txs/" + value;
      }
    },
  },
  [chainToChainId("Evmos")]: {
    name: "Evmos",
    icon: EvmosIcon,
    colorlessIcon: EvmosColorlessIcon,
    explorer: {
      Testnet: "https://Testnet.mintscan.io/evmos-Testnet",
      Devnet: "https://Testnet.mintscan.io/evmos-Testnet",
      Mainnet: "https://www.mintscan.io/evmos",
    },
    getExplorerBaseURL: function ({ network = "Mainnet", value, base }: ExplorerBaseURLInput) {
      if (network === "Mainnet") {
        if (base === "address") return this.explorer?.[network] + "/accounts/" + value;
        if (base === "token")
          return this.explorer?.[network] + "/assets/ibc/" + btoa(value.replace("ibc/", ""));
        return this.explorer?.[network] + "/transactions/" + value;
      } else {
        if (base === "address") return this.explorer?.[network] + "/account/" + value;
        if (base === "token") return this.explorer?.[network] + "/assets";
        return this.explorer?.[network] + "/txs/" + value;
      }
    },
  },
  [chainToChainId("Kujira")]: {
    name: "Kujira",
    icon: KujiraIcon,
    colorlessIcon: KujiraColorlessIcon,
    explorer: {
      Testnet: "https://finder.kujira.network/harpoon-4",
      Devnet: "https://finder.kujira.network/harpoon-4",
      Mainnet: "https://finder.kujira.network/kaiyo-1",
    },
    getExplorerBaseURL: function ({ network = "Mainnet", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/address/" + value;
      if (base === "token") return this.explorer?.[network] + "/token/" + encodeURIComponent(value);
      if (base === "block") return this.explorer?.[network] + "/block/" + value;
      return this.explorer?.[network] + "/tx/" + value;
    },
  },
  [chainToChainId("Dymension")]: {
    name: "Dymension",
    icon: DymensionIcon,
    colorlessIcon: DymensionColorlessIcon,
    explorer: {
      Testnet: "https://www.mintscan.io/dymension", // TODO: EXPLORER CHANGES WHEN EXISTS
      Devnet: "https://www.mintscan.io/dymension", // TODO: EXPLORER CHANGES WHEN EXISTS
      Mainnet: "https://www.mintscan.io/dymension", // TODO: EXPLORER CHANGES WHEN EXISTS
    },
    getExplorerBaseURL: function ({ network = "Mainnet", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/address/" + btoa(value);
      if (base === "token")
        return this.explorer?.[network] + "/assets"; /* + encodeURIComponent(value); */
      if (base === "block") return this.explorer?.[network] + "/block/" + value;
      return this.explorer?.[network] + "/tx/" + value;
    },
  },
  [chainToChainId("Acala")]: {
    name: "Acala",
    icon: AcalaIcon,
    colorlessIcon: AcalaColorlessIcon,
    explorer: {
      Testnet: "https://blockscout.acala-dev.aca-dev.network",
      Devnet: "https://blockscout.acala-dev.aca-dev.network",
      Mainnet: "https://blockscout.acala.network",
    },
    getExplorerBaseURL: function ({ network = "Mainnet", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/address/" + value;
      if (base === "token") return this.explorer?.[network] + "/token/" + value;
      if (base === "block") return this.explorer?.[network] + "/block/" + value;
      return this.explorer?.[network] + "/tx/" + value;
    },
  },
  [chainToChainId("Algorand")]: {
    name: "Algorand",
    acronym: "ALGO",
    icon: AlgorandIcon,
    colorlessIcon: AlgorandColorlessIcon,
    explorer: {
      Testnet: "https://Testnet.explorer.perawallet.app",
      Devnet: "https://Testnet.explorer.perawallet.app",
      Mainnet: "https://explorer.perawallet.app",
    },
    getExplorerBaseURL: function ({ network = "Mainnet", value, base }: ExplorerBaseURLInput) {
      if (base === "address") {
        if (value.length <= 12) return this.explorer?.[network] + "/application/" + value;
        return this.explorer?.[network] + "/address/" + value;
      }
      if (base === "token") return this.explorer?.[network] + "/asset/" + value;
      if (base === "block") return this.explorer?.[network] + "/block/" + value;
      return this.explorer?.[network] + "/tx/" + value;
    },
  },
  [chainToChainId("Aptos")]: {
    name: "Aptos",
    icon: AptosIcon,
    colorlessIcon: AptosColorlessIcon,
    explorer: {
      Testnet: "https://explorer.aptoslabs.com",
      Devnet: "https://explorer.aptoslabs.com",
      Mainnet: "https://explorer.aptoslabs.com",
    },
    getExplorerBaseURL: function ({ network = "Mainnet", value, base }: ExplorerBaseURLInput) {
      if (base === "address")
        return this.explorer?.[network] + "/account/" + value + "?network=" + network;
      if (base === "token")
        return this.explorer?.[network] + "/token/" + value + "?network=" + network;
      return this.explorer?.[network] + "/txn/" + value + "?network=" + network;
    },
  },
  [chainToChainId("Arbitrum")]: {
    name: "Arbitrum",
    nameTestnet: "Arbitrum Goerli",
    icon: ArbitrumIcon,
    colorlessIcon: ArbitrumColorlessIcon,
    explorer: {
      Testnet: "https://goerli.arbiscan.io",
      Devnet: "https://goerli.arbiscan.io",
      Mainnet: "https://arbiscan.io",
    },
    getExplorerBaseURL: function ({ network = "Mainnet", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/address/" + value;
      if (base === "token") return this.explorer?.[network] + "/token/" + value;
      if (base === "block") return this.explorer?.[network] + "/block/" + value;
      return this.explorer?.[network] + "/tx/" + value;
    },
  },
  [chainToChainId("ArbitrumSepolia")]: {
    name: "Arbitrum",
    nameTestnet: "Arbitrum Sepolia",
    icon: ArbitrumIcon,
    colorlessIcon: ArbitrumColorlessIcon,
    explorer: {
      Testnet: "https://sepolia.arbiscan.io",
      Devnet: "https://sepolia.arbiscan.io",
      Mainnet: "https://arbiscan.io",
    },
    getExplorerBaseURL: function ({ network = "Mainnet", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/address/" + value;
      if (base === "token") return this.explorer?.[network] + "/token/" + value;
      if (base === "block") return this.explorer?.[network] + "/block/" + value;
      return this.explorer?.[network] + "/tx/" + value;
    },
  },
  [chainToChainId("Aurora")]: {
    name: "Aurora",
    icon: AuroraIcon,
    colorlessIcon: AuroraColorlessIcon,
    explorer: {
      Testnet: "https://explorer.Testnet.aurora.dev",
      Devnet: "https://explorer.Testnet.aurora.dev",
      Mainnet: "https://explorer.aurora.dev",
    },
    getExplorerBaseURL: function ({ network = "Mainnet", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/address/" + value;
      if (base === "token") return this.explorer?.[network] + "/token/" + value;
      if (base === "block") return this.explorer?.[network] + "/block/" + value;
      return this.explorer?.[network] + "/tx/" + value;
    },
  },
  [chainToChainId("Avalanche")]: {
    name: "Avalanche",
    nameTestnet: "Fuji",
    acronym: "AVAX",
    icon: AvalancheIcon,
    colorlessIcon: AvalancheColorlessIcon,
    explorer: {
      Testnet: "https://Testnet.snowtrace.io",
      Devnet: "https://Testnet.snowtrace.io",
      Mainnet: "https://snowtrace.io",
    },
    getExplorerBaseURL: function ({ network = "Mainnet", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/address/" + value;
      if (base === "token") return this.explorer?.[network] + "/token/" + value;
      if (base === "block") return this.explorer?.[network] + "/block/" + value;
      return this.explorer?.[network] + "/tx/" + value;
    },
  },
  [chainToChainId("Bsc")]: {
    name: "BNB Smart Chain",
    acronym: "BSC",
    icon: BSCIcon,
    colorlessIcon: BSCColorlessIcon,
    explorer: {
      Testnet: "https://Testnet.bscscan.com",
      Devnet: "https://Testnet.bscscan.com",
      Mainnet: "https://bscscan.com",
    },
    getExplorerBaseURL: function ({ network = "Mainnet", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/address/" + value;
      if (base === "token") return this.explorer?.[network] + "/token/" + value;
      if (base === "block") return this.explorer?.[network] + "/block/" + value;
      return this.explorer?.[network] + "/tx/" + value;
    },
  },
  [chainToChainId("Celo")]: {
    name: "Celo",
    nameTestnet: "Alfajores",
    icon: CeloIcon,
    colorlessIcon: CeloColorlessIcon,
    explorer: {
      Testnet: "https://alfajores.celoscan.io",
      Devnet: "https://alfajores.celoscan.io",
      Mainnet: "https://explorer.celo.org/mainnet",
    },
    getExplorerBaseURL: function ({ network = "Mainnet", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/address/" + value;
      if (base === "token") return this.explorer?.[network] + "/token/" + value;
      if (base === "block") return this.explorer?.[network] + "/block/" + value;
      return this.explorer?.[network] + "/tx/" + value;
    },
  },
  [chainToChainId("Ethereum")]: {
    name: "Ethereum",
    nameTestnet: "Goerli",
    acronym: "ETH",
    icon: EthereumIcon,
    colorlessIcon: EthereumColorlessIcon,
    explorer: {
      Testnet: "https://goerli.etherscan.io",
      Devnet: "https://goerli.etherscan.io",
      Mainnet: "https://etherscan.io",
    },
    getExplorerBaseURL: function ({ network = "Mainnet", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/address/" + value;
      if (base === "token") return this.explorer?.[network] + "/token/" + value;
      if (base === "block") return this.explorer?.[network] + "/block/" + value;
      return this.explorer?.[network] + "/tx/" + value;
    },
  },
  [chainToChainId("Fantom")]: {
    name: "Fantom",
    icon: FantomIcon,
    colorlessIcon: FantomColorlessIcon,
    explorer: {
      Testnet: "https://Testnet.ftmscan.com",
      Devnet: "https://Testnet.ftmscan.com",
      Mainnet: "https://ftmscan.com",
    },
    getExplorerBaseURL: function ({ network = "Mainnet", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/address/" + value;
      if (base === "token") return this.explorer?.[network] + "/token/" + value;
      if (base === "block") return this.explorer?.[network] + "/block/" + value;
      return this.explorer?.[network] + "/tx/" + value;
    },
  },
  [chainToChainId("Injective")]: {
    name: "Injective",
    acronym: "INJ",
    icon: InjectiveIcon,
    colorlessIcon: InjectiveColorlessIcon,
    explorer: {
      Testnet: "https://Testnet.explorer.injective.network",
      Devnet: "https://Testnet.explorer.injective.network",
      Mainnet: "https://explorer.injective.network",
    },
    getExplorerBaseURL: function ({ network = "Mainnet", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/account/" + value;
      if (base === "token")
        return (
          this.explorer?.[network] +
          (value.toLowerCase().startsWith("ibc/")
            ? "/asset/?denom=" + value + "&tokenType=ibc"
            : "/contract/" + value)
        );
      if (base === "block") return this.explorer?.[network] + "/block/" + value;
      return this.explorer?.[network] + "/transaction/" + value;
    },
  },
  [chainToChainId("Karura")]: {
    name: "Karura",
    icon: KaruraIcon,
    colorlessIcon: KaruraColorlessIcon,
    explorer: {
      Testnet: "https://blockscout.karura-dev.aca-dev.network",
      Devnet: "https://blockscout.karura-dev.aca-dev.network",
      Mainnet: "https://blockscout.karura.network",
    },
    getExplorerBaseURL: function ({ network = "Mainnet", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/address/" + value;
      if (base === "token") return this.explorer?.[network] + "/token/" + value;
      if (base === "block") return this.explorer?.[network] + "/block/" + value;
      return this.explorer?.[network] + "/tx/" + value;
    },
  },
  [chainToChainId("Klaytn")]: {
    name: "Klaytn",
    icon: KlaytnIcon,
    colorlessIcon: KlaytnColorlessIcon,
    explorer: {
      Testnet: "https://baobab.scope.klaytn.com",
      Devnet: "https://baobab.scope.klaytn.com",
      Mainnet: "https://scope.klaytn.com",
    },
    getExplorerBaseURL: function ({ network = "Mainnet", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/account/" + value;
      if (base === "token") return this.explorer?.[network] + "/token/" + value;
      if (base === "block") return this.explorer?.[network] + "/block/" + value;
      return this.explorer?.[network] + "/tx/" + value;
    },
  },
  [chainToChainId("Moonbeam")]: {
    name: "Moonbeam",
    nameTestnet: "Moonbase Alpha",
    icon: MoonbeamIcon,
    colorlessIcon: MoonbeamColorlessIcon,
    explorer: {
      Testnet: "https://moonbase.moonscan.io",
      Devnet: "https://moonbase.moonscan.io",
      Mainnet: "https://moonscan.io",
    },
    getExplorerBaseURL: function ({ network = "Mainnet", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/address/" + value;
      if (base === "token") return this.explorer?.[network] + "/token/" + value;
      if (base === "block") return this.explorer?.[network] + "/block/" + value;
      return this.explorer?.[network] + "/tx/" + value;
    },
  },
  [chainToChainId("Near")]: {
    name: "Near",
    icon: NearIcon,
    colorlessIcon: NearColorlessIcon,
    explorer: {
      Testnet: "https://explorer.Testnet.near.org",
      Devnet: "https://explorer.Testnet.near.org",
      Mainnet: "https://explorer.near.org",
    },
    getExplorerBaseURL: function ({ network = "Mainnet", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/accounts/" + value;
      if (base === "token") return this.explorer?.[network] + "/token/" + value;
      if (base === "block") return this.explorer?.[network] + "/block/" + value;
      return this.explorer?.[network] + "/transactions/" + value;
    },
  },
  [chainToChainId("Neon")]: {
    name: "Neon",
    icon: NeonIcon,
    colorlessIcon: NeonColorlessIcon,
    explorer: {
      Testnet: "https://neonscan.org",
      Devnet: "https://neonscan.org",
      Mainnet: "https://neonscan.org",
    },
    getExplorerBaseURL: function ({ network = "Mainnet", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/address/" + value;
      if (base === "token") return this.explorer?.[network] + "/token/" + value;
      if (base === "block") return this.explorer?.[network] + "/block/" + value;
      return this.explorer?.[network] + "/tx/" + value;
    },
  },
  [chainToChainId("Oasis")]: {
    name: "Oasis",
    icon: OasisIcon,
    colorlessIcon: OasisColorlessIcon,
    explorer: {
      Testnet: "https://Testnet.explorer.emerald.oasis.dev",
      Devnet: "https://Testnet.explorer.emerald.oasis.dev",
      Mainnet: "https://explorer.emerald.oasis.dev",
    },
    getExplorerBaseURL: function ({ network = "Mainnet", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/address/" + value;
      if (base === "token") return this.explorer?.[network] + "/token/" + value;
      if (base === "block") return this.explorer?.[network] + "/block/" + value;
      return this.explorer?.[network] + "/tx/" + value;
    },
  },
  [chainToChainId("Optimism")]: {
    name: "Optimism",
    nameTestnet: "Optimism Goerli",
    icon: OptimismIcon,
    colorlessIcon: OptimismColorlessIcon,
    explorer: {
      Testnet: "https://goerli-optimism.etherscan.io",
      Devnet: "https://goerli-optimism.etherscan.io",
      Mainnet: "https://optimistic.etherscan.io",
    },
    getExplorerBaseURL: function ({ network = "Mainnet", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/address/" + value;
      if (base === "token") return this.explorer?.[network] + "/token/" + value;
      if (base === "block") return this.explorer?.[network] + "/block/" + value;
      return this.explorer?.[network] + "/tx/" + value;
    },
  },
  [chainToChainId("OptimismSepolia")]: {
    name: "Optimism",
    nameTestnet: "Optimism Sepolia",
    icon: OptimismIcon,
    colorlessIcon: OptimismColorlessIcon,
    explorer: {
      Testnet: "https://sepolia-optimism.etherscan.io",
      Devnet: "https://sepolia-optimism.etherscan.io",
      Mainnet: "https://optimistic.etherscan.io",
    },
    getExplorerBaseURL: function ({ network = "Mainnet", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/address/" + value;
      if (base === "token") return this.explorer?.[network] + "/token/" + value;
      if (base === "block") return this.explorer?.[network] + "/block/" + value;
      return this.explorer?.[network] + "/tx/" + value;
    },
  },
  [chainToChainId("Polygon")]: {
    name: "Polygon",
    nameTestnet: "Mumbai",
    icon: PolygonIcon,
    colorlessIcon: PolygonColorlessIcon,
    explorer: {
      Testnet: "https://mumbai.polygonscan.com",
      Devnet: "https://mumbai.polygonscan.com",
      Mainnet: "https://polygonscan.com",
    },
    getExplorerBaseURL: function ({ network = "Mainnet", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/address/" + value;
      if (base === "token") return this.explorer?.[network] + "/token/" + value;
      if (base === "block") return this.explorer?.[network] + "/block/" + value;
      return this.explorer?.[network] + "/tx/" + value;
    },
  },
  [chainToChainId("Solana")]: {
    name: "Solana",
    acronym: "SOL",
    icon: SolanaIcon,
    colorlessIcon: SolanaColorlessIcon,
    explorer: {
      Testnet: "https://solscan.io",
      Devnet: "https://solscan.io",
      Mainnet: "https://solscan.io",
    },
    getExplorerBaseURL: function ({ network = "Mainnet", value, base }: ExplorerBaseURLInput) {
      // Wormhole uses Solana's devnet as their 'Testnet'
      const solNetwork = network === "Mainnet" ? "" : "devnet";

      if (base === "address")
        return this.explorer?.[network] + "/account/" + value + "?cluster=" + solNetwork;
      if (base === "token")
        return this.explorer?.[network] + "/token/" + value + "?cluster=" + solNetwork;
      return this.explorer?.[network] + "/tx/" + value + "?cluster=" + solNetwork;
    },
  },
  [chainToChainId("Terra")]: {
    name: "Terra",
    icon: TerraClassicIcon,
    colorlessIcon: TerraClassicColorlessIcon,
    explorer: {
      Testnet: "https://finder.terra.money/columbus-5",
      Devnet: "https://finder.terra.money/columbus-5",
      Mainnet: "https://finder.terra.money/columbus-5",
    },
    getExplorerBaseURL: function ({ network = "Mainnet", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/address/" + value;
      if (base === "token") return this.explorer?.[network] + "/token/" + value;
      if (base === "block") return this.explorer?.[network] + "/block/" + value;
      return this.explorer?.[network] + "/tx/" + value;
    },
  },
  [chainToChainId("Terra2")]: {
    name: "Terra2",
    icon: TerraIcon,
    colorlessIcon: TerraColorlessIcon,
    explorer: {
      Testnet: "https://finder.terra.money/pisco-1",
      Devnet: "https://finder.terra.money/pisco-1",
      Mainnet: "https://finder.terra.money/phoenix-1",
    },
    getExplorerBaseURL: function ({ network = "Mainnet", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/address/" + value;
      if (base === "token") return this.explorer?.[network] + "/token/" + value;
      if (base === "block") return this.explorer?.[network] + "/block/" + value;
      return this.explorer?.[network] + "/tx/" + value;
    },
  },
  [chainToChainId("Xpla")]: {
    name: "Xpla",
    icon: XplaIcon,
    colorlessIcon: XplaColorlessIcon,
    explorer: {
      Testnet: "https://explorer.xpla.io/Testnet",
      Devnet: "https://explorer.xpla.io/Testnet",
      Mainnet: "https://explorer.xpla.io/Mainnet",
    },
    getExplorerBaseURL: function ({ network = "Mainnet", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/address/" + value;
      if (base === "token") return this.explorer?.[network] + "/token/" + value;
      if (base === "block") return this.explorer?.[network] + "/block/" + value;
      return this.explorer?.[network] + "/tx/" + value;
    },
  },
  [chainToChainId("Xlayer")]: {
    name: "XLayer",
    icon: XLayerIcon,
    colorlessIcon: XLayerColorlessIcon,
    explorer: {
      Testnet: "https://www.okx.com/web3/explorer/xlayer-test",
      Devnet: "https://www.okx.com/web3/explorer/xlayer-test",
      Mainnet: "https://www.okx.com/web3/explorer/xlayer",
    },
    getExplorerBaseURL: function ({ network = "Mainnet", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/address/" + value;
      if (base === "token") return this.explorer?.[network] + "/token/" + value;
      if (base === "block") return this.explorer?.[network] + "/block/" + value;
      return this.explorer?.[network] + "/tx/" + value;
    },
  },
  [chainToChainId("Sei")]: {
    name: "Sei",
    icon: SeiIcon,
    colorlessIcon: SeiColorlessIcon,
    explorer: {
      Testnet: "https://www.seiscan.app/atlantic-2",
      Devnet: "https://www.seiscan.app/atlantic-2",
      Mainnet: "https://www.seiscan.app/pacific-1",
    },
    getExplorerBaseURL: function ({ network = "Mainnet", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/accounts/" + value;
      if (base === "token") return this.explorer?.[network] + "/contracts/" + value;
      if (base === "block") return this.explorer?.[network] + "/blocks/" + value;
      return this.explorer?.[network] + "/txs/" + value;
    },
  },
  [chainToChainId("Scroll")]: {
    name: "Scroll",
    icon: ScrollIcon,
    colorlessIcon: ScrollColorlessIcon,
    explorer: {
      Testnet: "https://sepolia.scrollscan.com",
      Devnet: "https://sepolia.scrollscan.com",
      Mainnet: "https://scrollscan.com",
    },
    getExplorerBaseURL: function ({ network = "Mainnet", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/address/" + value;
      if (base === "token") return this.explorer?.[network] + "/token/" + value;
      if (base === "block") return this.explorer?.[network] + "/block/" + value;
      return this.explorer?.[network] + "/tx/" + value;
    },
  },
  [chainToChainId("Mantle")]: {
    name: "Mantle",
    icon: MantleIcon,
    colorlessIcon: MantleColorlessIcon,
    explorer: {
      Testnet: "https://sepolia.mantlescan.xyz",
      Devnet: "https://sepolia.mantlescan.xyz",
      Mainnet: "https://explorer.mantle.xyz",
    },
    getExplorerBaseURL: function ({ network = "Mainnet", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/address/" + value;
      if (base === "token") return this.explorer?.[network] + "/token/" + value;
      if (base === "block") return this.explorer?.[network] + "/block/" + value;
      return this.explorer?.[network] + "/tx/" + value;
    },
  },
  [chainToChainId("Blast")]: {
    name: "Blast",
    icon: BlastIcon,
    colorlessIcon: BlastColorlessIcon,
    explorer: {
      Testnet: "https://Testnet.blastscan.io",
      Devnet: "https://Testnet.blastscan.io",
      Mainnet: "https://blastscan.io",
    },
    getExplorerBaseURL: function ({ network = "Mainnet", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/address/" + value;
      if (base === "token") return this.explorer?.[network] + "/token/" + value;
      if (base === "block") return this.explorer?.[network] + "/block/" + value;
      return this.explorer?.[network] + "/tx/" + value;
    },
  },
  [chainToChainId("Base")]: {
    name: "Base",
    nameTestnet: "Base Goerli",
    icon: BaseIcon,
    colorlessIcon: BaseColorlessIcon,
    explorer: {
      Testnet: "https://goerli.basescan.org",
      Devnet: "https://goerli.basescan.org",
      Mainnet: "https://basescan.org",
    },
    getExplorerBaseURL: function ({ network = "Mainnet", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/address/" + value;
      if (base === "token") return this.explorer?.[network] + "/token/" + value;
      if (base === "block") return this.explorer?.[network] + "/block/" + value;
      return this.explorer?.[network] + "/tx/" + value;
    },
  },
  [chainToChainId("BaseSepolia")]: {
    name: "Base",
    nameTestnet: "Base Sepolia",
    icon: BaseIcon,
    colorlessIcon: BaseColorlessIcon,
    explorer: {
      Testnet: "https://sepolia.basescan.org",
      Devnet: "https://sepolia.basescan.org",
      Mainnet: "https://basescan.org",
    },
    getExplorerBaseURL: function ({ network = "Mainnet", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/address/" + value;
      if (base === "token") return this.explorer?.[network] + "/token/" + value;
      if (base === "block") return this.explorer?.[network] + "/block/" + value;
      return this.explorer?.[network] + "/tx/" + value;
    },
  },
  [chainToChainId("Sepolia")]: {
    name: "Sepolia",
    icon: EthereumIcon,
    colorlessIcon: EthereumColorlessIcon,
    explorer: {
      Testnet: "https://sepolia.etherscan.io",
      Devnet: "https://sepolia.etherscan.io",
      Mainnet: "https://sepolia.etherscan.io",
    },
    getExplorerBaseURL: function ({ network = "Mainnet", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/address/" + value;
      if (base === "token") return this.explorer?.[network] + "/token/" + value;
      if (base === "block") return this.explorer?.[network] + "/block/" + value;
      return this.explorer?.[network] + "/tx/" + value;
    },
  },
  [chainToChainId("Holesky")]: {
    name: "Holesky",
    icon: EthereumIcon,
    colorlessIcon: EthereumColorlessIcon,
    explorer: {
      Testnet: "https://holesky.etherscan.io",
      Devnet: "https://holesky.etherscan.io",
      Mainnet: "https://holesky.etherscan.io",
    },
    getExplorerBaseURL: function ({ network = "Mainnet", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/address/" + value;
      if (base === "token") return this.explorer?.[network] + "/token/" + value;
      if (base === "block") return this.explorer?.[network] + "/block/" + value;
      return this.explorer?.[network] + "/tx/" + value;
    },
  },
  [chainToChainId("PolygonSepolia")]: {
    name: "Polygon",
    nameTestnet: "Amoy",
    icon: PolygonIcon,
    colorlessIcon: PolygonColorlessIcon,
    explorer: {
      Testnet: "https://amoy.polygonscan.com",
      Devnet: "https://amoy.polygonscan.com",
      Mainnet: "https://polygonscan.com",
    },
    getExplorerBaseURL: function ({ network = "Mainnet", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/address/" + value;
      if (base === "token") return this.explorer?.[network] + "/token/" + value;
      if (base === "block") return this.explorer?.[network] + "/block/" + value;
      return this.explorer?.[network] + "/tx/" + value;
    },
  },
  [chainToChainId("Unichain")]: {
    name: "Unichain",
    nameTestnet: "Unichain",
    icon: UnichainIcon,
    colorlessIcon: UniChainColorlessIcon,
    explorer: {
      Testnet: "https://unichain-sepolia.blockscout.com",
      Devnet: "https://unichain-sepolia.blockscout.com",
      Mainnet: "https://unichain-sepolia.blockscout.com", // TODO: mainnet when exists
    },
    getExplorerBaseURL: function ({ network = "Mainnet", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/address/" + value;
      if (base === "token") return this.explorer?.[network] + "/token/" + value;
      if (base === "block") return this.explorer?.[network] + "/block/" + value;
      return this.explorer?.[network] + "/tx/" + value;
    },
  },
  [chainToChainId("Linea")]: {
    name: "Linea",
    icon: LineaIcon,
    colorlessIcon: LineaColorlessIcon,
    explorer: {
      Testnet: "https://sepolia.lineascan.build",
      Devnet: "https://sepolia.lineascan.build",
      Mainnet: "https://lineascan.build",
    },
    getExplorerBaseURL: function ({ network = "Mainnet", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/address/" + value;
      if (base === "token") return this.explorer?.[network] + "/token/" + value;
      return this.explorer?.[network] + "/tx/" + value;
    },
  },

  // ---

  // TODO: change the chainId number when it exists
  // we're using these fake chainIds on the NTT-Token page
  // src/pages/Analytics/NTT/NTTToken/Summary.tsx

  [/* chainToChainId("Energi") */ 99949991]: {
    name: "Energi",
    icon: EnergiIcon,
    colorlessIcon: EnergiColorlessIcon,
    explorer: {
      Testnet: "https://testnet.energi.network",
      Devnet: "https://devnet.energi.network",
      Mainnet: "https://explorer.energi.network",
    },
    getExplorerBaseURL: function ({ network = "Mainnet", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/address/" + value;
      if (base === "token") return this.explorer?.[network] + "/token/" + value;
      return this.explorer?.[network] + "/tx/" + value;
    },
  },
  [/* chainToChainId("Hedera Hashgraph") */ 99949992]: {
    name: "Hedera Hashgraph",
    icon: HederaIcon,
    colorlessIcon: HederaColorlessIcon,
    explorer: {
      Testnet: "https://hashscan.io/testnet",
      Devnet: "https://hashscan.io/testnet",
      Mainnet: "https://hashscan.io/mainnet",
    },
    getExplorerBaseURL: function ({ network = "Mainnet", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/account/" + value;
      if (base === "token") return this.explorer?.[network] + "/token/" + value;
      return this.explorer?.[network] + "/transaction/" + value;
    },
  },
  [/* chainToChainId("Polkadot") */ 99949993]: {
    name: "Polkadot",
    icon: PolkadotIcon,
    colorlessIcon: PolkadotColorlessIcon,
    explorer: {
      Testnet: "https://testnet.subscan.io",
      Devnet: "https://devnet.subscan.io",
      Mainnet: "https://polkadot.subscan.io",
    },
    getExplorerBaseURL: function ({ network = "Mainnet", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/account/" + value;
      if (base === "token") return this.explorer?.[network] + "/token/" + value;
      return this.explorer?.[network] + "/extrinsic/" + value;
    },
  },
  [/* chainToChainId("Stellar") */ 99949994]: {
    name: "Stellar",
    icon: StellarIcon,
    colorlessIcon: StellarColorlessIcon,
    explorer: {
      Testnet: "https://testnet.stellarchain.io",
      Devnet: "https://testnet.stellarchain.io",
      Mainnet: "https://stellarchain.io",
    },
    getExplorerBaseURL: function ({ network = "Mainnet", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/accounts/" + value;
      if (base === "token") return this.explorer?.[network] + "/assets/" + value;
      return this.explorer?.[network] + "/transactions/" + value;
    },
  },
  [/* chainToChainId("Tron") */ 99949995]: {
    name: "Tron",
    icon: TronIcon,
    colorlessIcon: TronColorlessIcon,
    explorer: {
      Testnet: "https://nile.tronscan.org/#",
      Devnet: "https://nile.tronscan.org/#",
      Mainnet: "https://tronscan.org/#",
    },
    getExplorerBaseURL: function ({ network = "Mainnet", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/address/" + value;
      if (base === "token") return this.explorer?.[network] + "/token20/" + value;
      return this.explorer?.[network] + "/transaction/" + value;
    },
  },
  [/* chainToChainId("zkSync") */ 99949996]: {
    name: "zkSync",
    icon: ZksyncIcon,
    colorlessIcon: ZksyncColorlessIcon,
    explorer: {
      Testnet: "https://sepolia.explorer.zksync.io",
      Devnet: "https://sepolia.explorer.zksync.io",
      Mainnet: "https://explorer.zksync.io",
    },
    getExplorerBaseURL: function ({ network = "Mainnet", value, base }: ExplorerBaseURLInput) {
      if (base === "address") return this.explorer?.[network] + "/address/" + value;
      if (base === "token") return this.explorer?.[network] + "/address/" + value;
      return this.explorer?.[network] + "/tx/" + value;
    },
  },
  // ---
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
    if (network === "Testnet")
      return chainInfo?.nameTestnet || chainInfo?.acronym || chainInfo?.name;

    return chainInfo?.acronym || chainInfo?.name;
  }

  if (network === "Testnet") return chainInfo?.nameTestnet || chainInfo?.name;
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

  if (
    chainId === chainToChainId("Kujira") ||
    chainId === chainToChainId("Evmos") ||
    chainId === chainToChainId("Osmosis")
  ) {
    parsedValue = parsedValue.startsWith("0x") ? parsedValue.replace("0x", "") : parsedValue;
  }

  return WORMHOLE_CHAINS[chainId]?.getExplorerBaseURL({ network, value: parsedValue, base }) || "";
};
