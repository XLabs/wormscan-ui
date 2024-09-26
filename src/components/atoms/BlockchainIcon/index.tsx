import { Network, ChainId } from "@wormhole-foundation/sdk";
import { getChainIcon, getChainName } from "src/utils/wormhole";
import NoColorlessIcon from "src/icons/blockchains/colorless/noIcon.svg";
import "./styles.scss";

type Props = {
  background?: string;
  chainId: ChainId | 0;
  className?: string;
  colorless?: boolean;
  lazy?: boolean;
  network: Network;
  size?: number;
};

const BlockchainIcon = ({
  background,
  chainId,
  className = "",
  colorless = false,
  lazy = true,
  network,
  size = 24,
}: Props) => {
  const icon = chainId === 0 ? NoColorlessIcon : getChainIcon({ chainId, colorless });
  const name = chainId === 0 ? "Chain" : getChainName({ chainId, network });

  return (
    <img
      alt={`${name} icon`}
      className={`blockchain-icon ${className}`}
      height={size}
      loading={lazy ? "lazy" : "eager"}
      src={icon}
      style={{ backgroundColor: background }}
      title={name}
      width={size}
    />
  );
};

export default BlockchainIcon;
