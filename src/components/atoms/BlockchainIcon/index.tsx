import { Network } from "@wormhole-foundation/sdk";
import { getChainIcon, getChainName } from "src/utils/wormhole";
import { ChainId } from "src/api";
import "./styles.scss";

type Props = {
  background?: string;
  chainId: ChainId;
  className?: string;
  colorless?: boolean;
  network: Network;
  size?: number;
};

const BlockchainIcon = ({
  background,
  chainId,
  className = "",
  colorless = false,
  network,
  size = 24,
}: Props) => {
  const icon = getChainIcon({ chainId, colorless });
  const name = getChainName({ chainId, network });

  return (
    <img
      alt={`${name} icon`}
      className={`blockchain-icon ${className}`}
      height={size}
      loading="lazy"
      src={icon}
      style={{ backgroundColor: background }}
      title={name}
      width={size}
    />
  );
};

export default BlockchainIcon;
