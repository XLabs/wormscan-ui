import { ChainId } from "@xlabs-libs/wormscan-sdk";
import { getChainIcon } from "src/utils/wormhole";

type Props = {
  chainId: ChainId;
  className?: string;
  size?: number;
  dark?: boolean;
};

const BlockchainIcon = ({ chainId, size = 24, dark = false, className = "" }: Props) => {
  const icon = getChainIcon({ chainId, dark });

  return <img src={icon} width={size} height={size} className={`blockchain-icon ${className}`} />;
};

export default BlockchainIcon;
