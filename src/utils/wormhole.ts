import { ChainId } from "@xlabs-libs/wormscan-sdk";

import NoIcon from "src/icons/blockchains/noIcon.svg";
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

const WORMHOLE_CHAINS: { [key in ChainId]: any } = {
  [ChainId.Unset]: {
    name: "Unset",
    icon: NoIcon,
    darkIcon: NoDarkIcon,
  },
  [ChainId.Sui]: {
    name: "Sui",
    icon: NoIcon,
    darkIcon: NoDarkIcon,
  },
  [ChainId.PythNet]: {
    name: "PythNet",
    icon: NoIcon,
    darkIcon: NoDarkIcon,
  },
  [ChainId.Btc]: {
    name: "Btc",
    icon: NoIcon,
    darkIcon: NoDarkIcon,
  },
  [ChainId.Wormchain]: {
    name: "Wormchain",
    icon: NoIcon,
    darkIcon: NoDarkIcon,
  },
  [ChainId.Acala]: {
    name: "Acala",
    icon: AcalaIcon,
    darkIcon: AcalaDarkIcon,
  },
  [ChainId.Algorand]: {
    name: "Algorand",
    icon: AlgorandIcon,
    darkIcon: AlgorandDarkIcon,
  },
  [ChainId.Aptos]: {
    name: "Aptos",
    icon: AptosIcon,
    darkIcon: AptosDarkIcon,
  },
  [ChainId.Arbitrum]: {
    name: "Arbitrum",
    icon: ArbitrumIcon,
    darkIcon: ArbitrumDarkIcon,
  },
  [ChainId.Aurora]: {
    name: "Aurora",
    icon: AuroraIcon,
    darkIcon: AuroraDarkIcon,
  },
  [ChainId.Avalanche]: {
    name: "Avalanche",
    icon: AvalancheIcon,
    darkIcon: AvalancheDarkIcon,
  },
  [ChainId.BSC]: {
    name: "Binance Smart Chain",
    icon: BSCIcon,
    darkIcon: BSCDarkIcon,
  },
  [ChainId.Celo]: {
    name: "Celo",
    icon: CeloIcon,
    darkIcon: CeloDarkIcon,
  },
  [ChainId.Ethereum]: {
    name: "Ethereum ",
    icon: EthereumIcon,
    darkIcon: EthereumDarkIcon,
  },
  [ChainId.Fantom]: {
    name: "Fantom",
    icon: FantomIcon,
    darkIcon: FantomDarkIcon,
  },
  [ChainId.Injective]: {
    name: "Injective",
    icon: InjectiveIcon,
    darkIcon: InjectiveDarkIcon,
  },
  [ChainId.Karura]: {
    name: "Karura",
    icon: KaruraIcon,
    darkIcon: KaruraDarkIcon,
  },
  [ChainId.Klaytn]: {
    name: "Klaytn",
    icon: KlaytnIcon,
    darkIcon: KlaytnDarkIcon,
  },
  [ChainId.Moonbeam]: {
    name: "Moonbeam",
    icon: MoonbeamIcon,
    darkIcon: MoonbeamDarkIcon,
  },
  [ChainId.Near]: {
    name: "Near",
    icon: NearIcon,
    darkIcon: NearDarkIcon,
  },
  [ChainId.Neon]: {
    name: "Neon",
    icon: NeonIcon,
    darkIcon: NeonDarkIcon,
  },
  [ChainId.Oasis]: {
    name: "Oasis",
    icon: OasisIcon,
    darkIcon: OasisDarkIcon,
  },
  [ChainId.Optimism]: {
    name: "Optimism",
    icon: OptimismIcon,
    darkIcon: OptimismDarkIcon,
  },
  [ChainId.Polygon]: {
    name: "Polygon",
    icon: PolygonIcon,
    darkIcon: PolygonDarkIcon,
  },
  [ChainId.Solana]: {
    name: "Solana",
    icon: SolanaIcon,
    darkIcon: SolanaDarkIcon,
  },
  [ChainId.Terra]: {
    name: "Terra",
    icon: TerraClassicIcon,
    darkIcon: TerraClassicDarkIcon,
  },
  [ChainId.Terra2]: {
    name: "Terra2",
    icon: TerraIcon,
    darkIcon: TerraDarkIcon,
  },
  [ChainId.Xpla]: {
    name: "Xpla",
    icon: XplaIcon,
    darkIcon: XplaDarkIcon,
  },
};

export const getChainName = ({ chainId }: { chainId: ChainId }) => {
  return WORMHOLE_CHAINS[chainId].name;
};

export const getChainIcon = ({ chainId, dark = false }: { chainId: ChainId; dark?: boolean }) => {
  if (dark) {
    return WORMHOLE_CHAINS[chainId].darkIcon;
  }

  return WORMHOLE_CHAINS[chainId].icon;
};
