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

const getIcon = ({ chainId, dark = false }: { chainId: ChainId; dark?: boolean }) => {
  const ICONS: { [key in ChainId]: any } = {
    [ChainId.Unset]: dark ? NoDarkIcon : NoIcon,
    [ChainId.Sui]: dark ? NoDarkIcon : NoIcon,
    [ChainId.PythNet]: dark ? NoDarkIcon : NoIcon,
    [ChainId.Btc]: dark ? NoDarkIcon : NoIcon,
    [ChainId.Wormchain]: dark ? NoDarkIcon : NoIcon,
    [ChainId.Acala]: dark ? AcalaDarkIcon : AcalaIcon,
    [ChainId.Algorand]: dark ? AlgorandDarkIcon : AlgorandIcon,
    [ChainId.Aptos]: dark ? AptosDarkIcon : AptosIcon,
    [ChainId.Arbitrum]: dark ? ArbitrumDarkIcon : ArbitrumIcon,
    [ChainId.Aurora]: dark ? AuroraDarkIcon : AuroraIcon,
    [ChainId.Avalanche]: dark ? AvalancheDarkIcon : AvalancheIcon,
    [ChainId.BSC]: dark ? BSCDarkIcon : BSCIcon,
    [ChainId.Celo]: dark ? CeloDarkIcon : CeloIcon,
    [ChainId.Ethereum]: dark ? EthereumDarkIcon : EthereumIcon,
    [ChainId.Fantom]: dark ? FantomDarkIcon : FantomIcon,
    [ChainId.Injective]: dark ? InjectiveDarkIcon : InjectiveIcon,
    [ChainId.Karura]: dark ? KaruraDarkIcon : KaruraIcon,
    [ChainId.Klaytn]: dark ? KlaytnDarkIcon : KlaytnIcon,
    [ChainId.Moonbeam]: dark ? MoonbeamDarkIcon : MoonbeamIcon,
    [ChainId.Near]: dark ? NearDarkIcon : NearIcon,
    [ChainId.Neon]: dark ? NeonDarkIcon : NeonIcon,
    [ChainId.Oasis]: dark ? OasisDarkIcon : OasisIcon,
    [ChainId.Optimism]: dark ? OptimismDarkIcon : OptimismIcon,
    [ChainId.Polygon]: dark ? PolygonDarkIcon : PolygonIcon,
    [ChainId.Solana]: dark ? SolanaDarkIcon : SolanaIcon,
    [ChainId.Terra]: dark ? TerraClassicDarkIcon : TerraClassicIcon,
    [ChainId.Terra2]: dark ? TerraDarkIcon : TerraIcon,
    [ChainId.Xpla]: dark ? XplaDarkIcon : XplaIcon,
  };

  return ICONS[chainId];
};

type Props = {
  chainId: ChainId;
  size?: number;
  dark?: boolean;
};

const BlockchainIcon = ({ chainId, size = 24, dark = false }: Props) => {
  const icon = getIcon({ chainId, dark });

  return <img src={icon} width={size} height={size} />;
};

export default BlockchainIcon;
