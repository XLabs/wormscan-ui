import { ArrowRightIcon } from "@radix-ui/react-icons";
import { useEnvironment } from "src/context/EnvironmentContext";
import { BlockchainIcon } from "src/components/atoms";
import { formatCurrency } from "src/utils/number";
import { getChainName } from "src/utils/wormhole";
import noIconToken from "src/icons/tokens/noIcon.svg";
import "./styles.scss";

type Props = {
  from_chain: number;
  token_logo: string;
  symbol: string;
  volume: string;
};

const TopAssetListItem = ({ from_chain, token_logo, symbol, volume }: Props) => {
  const { environment } = useEnvironment();
  const currentNetwork = environment.network;

  return (
    <div className="top-asset-list-item">
      <div className="top-asset-list-item-from">
        <div className="top-asset-list-item-from-icon-container">
          <BlockchainIcon
            chainId={from_chain}
            className="top-asset-list-item-from-icon"
            network={currentNetwork}
            size={25}
          />
        </div>

        <div className="top-asset-list-item-from-chain">
          {getChainName({ chainId: from_chain, acronym: true, network: currentNetwork })}
        </div>
      </div>
      <div>
        <ArrowRightIcon className="arrow-icon" />
      </div>
      <div className="top-asset-list-item-to">
        <div className="top-asset-list-item-to-icon-container">
          <img
            src={token_logo || noIconToken}
            alt={`${symbol} icon`}
            height="25"
            width="25"
            className="top-asset-list-item-to-icon"
            loading="lazy"
          />
        </div>

        <div className="top-asset-list-item-to-asset">{symbol}</div>
      </div>
      <div className="top-asset-list-item-transactions">${formatCurrency(Number(volume), 0)}</div>
    </div>
  );
};

export default TopAssetListItem;
