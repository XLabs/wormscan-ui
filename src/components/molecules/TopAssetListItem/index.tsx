import { ArrowRightIcon } from "@radix-ui/react-icons";
import { BlockchainIcon } from "src/components/atoms";
import { formatCurrency } from "src/utils/number";
import { getChainName } from "src/utils/wormhole";
import "./styles.scss";

type Props = {
  from_chain: number;
  token_logo: string;
  symbol: string;
  volume: string;
};

const TopAssetListItem = ({ from_chain, token_logo, symbol, volume }: Props) => {
  return (
    <div className="top-asset-list-item">
      <div className="top-chain-list-item-from">
        <BlockchainIcon size={25} chainId={from_chain} className="top-asset-list-item-from-icon" />
        <div className="top-asset-list-item-from-chain">
          {getChainName({ chainId: from_chain })}
        </div>
      </div>
      <ArrowRightIcon className="arrow-icon" />
      <div className="top-chain-list-item-to">
        {token_logo && (
          <img
            src={token_logo}
            alt={`${symbol} icon`}
            width="25"
            className="top-asset-list-item-to-icon"
          />
        )}
        <div className="top-asset-list-item-to-asset">{symbol}</div>
      </div>
      <div className="top-asset-list-item-transactions">${formatCurrency(Number(volume))}</div>
    </div>
  );
};

export default TopAssetListItem;
