import { Network } from "@certusone/wormhole-sdk";
import { getChainIcon, getChainName } from "src/utils/wormhole";
import { ChainId } from "src/api";

type Props = {
  chainId: ChainId;
  className?: string;
  dark?: boolean;
  network: Network;
  size?: number;
};

const BlockchainIcon = ({ chainId, className = "", dark = false, network, size = 24 }: Props) => {
  const icon = getChainIcon({ chainId, dark });
  const name = getChainName({ chainId, network });

  return (
    <img
      src={icon}
      width={size}
      height={size}
      className={`blockchain-icon ${className}`}
      alt={`${name} icon`}
      loading="lazy"
    />
  );
};

export default BlockchainIcon;
