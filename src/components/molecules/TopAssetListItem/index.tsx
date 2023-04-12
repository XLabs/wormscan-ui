import { ArrowRightIcon } from "@radix-ui/react-icons";
import { BlockchainIcon } from "src/components/atoms";
import { formatCurrency } from "src/utils/number";
import "./styles.scss";

type Props = {
  from_chain: {
    id: number;
    name: string;
  };
  to_asset: {
    symbol: string;
    contract_address: string;
  };
  transactions: number;
};

const TopAssetListItem = ({ from_chain, to_asset, transactions }: Props) => {
  const { id: fromId, name: fromName } = from_chain;
  const { symbol } = to_asset;
  const assetId = Math.floor(Math.random() * 15);

  return (
    <div className="top-asset-list-item">
      <div className="top-chain-list-item-from">
        <BlockchainIcon size={25} chainId={fromId} />
        <div className="top-asset-list-item-from-chain">{fromName}</div>
      </div>
      <ArrowRightIcon className="arrow-icon" />
      <div className="top-chain-list-item-to">
        <BlockchainIcon size={25} chainId={assetId} />
        <div className="top-asset-list-item-to-asset">{symbol}</div>
      </div>
      <div className="top-asset-list-item-transactions">${formatCurrency(transactions)}</div>
    </div>
  );
};

export default TopAssetListItem;
