import { ChainId } from "@xlabs-libs/wormscan-sdk";

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

type BlockChainId = Exclude<
  ChainId,
  ChainId.Unset | ChainId.Sui | ChainId.PythNet | ChainId.Btc | ChainId.Wormchain
>;

const ICONS: { [key in BlockChainId]: any } = {
  [ChainId.Acala]: AcalaIcon,
  [ChainId.Algorand]: AlgorandIcon,
  [ChainId.Aptos]: AptosIcon,
  [ChainId.Arbitrum]: ArbitrumIcon,
  [ChainId.Aurora]: AuroraIcon,
  [ChainId.Avalanche]: AvalancheIcon,
  [ChainId.BSC]: BSCIcon,
  [ChainId.Celo]: CeloIcon,
  [ChainId.Ethereum]: EthereumIcon,
  [ChainId.Fantom]: FantomIcon,
  [ChainId.Injective]: InjectiveIcon,
  [ChainId.Karura]: KaruraIcon,
  [ChainId.Klaytn]: KlaytnIcon,
  [ChainId.Moonbeam]: MoonbeamIcon,
  [ChainId.Near]: NearIcon,
  [ChainId.Neon]: NeonIcon,
  [ChainId.Oasis]: OasisIcon,
  [ChainId.Optimism]: OptimismIcon,
  [ChainId.Polygon]: PolygonIcon,
  [ChainId.Solana]: SolanaIcon,
  [ChainId.Terra]: TerraClassicIcon,
  [ChainId.Terra2]: TerraIcon,
  [ChainId.Xpla]: XplaIcon,
};

type Props = {
  chainId: BlockChainId;
  size?: number;
};

const BlockchainIcon = ({ chainId, size = 24 }: Props) => {
  const icon = ICONS[chainId];

  return <img src={icon} width={size} height={size} />;
};

export { BlockchainIcon };
