import { ArrowRightIcon } from "@radix-ui/react-icons";
import { BlockchainIcon } from "src/components/atoms";
import { formatNumber } from "src/utils/number";
import "./styles.scss";

type Props = {
  from_chain: {
    id: number;
    name: string;
  };
  to_chain: {
    id: number;
    name: string;
  };
  transactions: number;
};

const TopChainListItem = ({ from_chain, to_chain, transactions }: Props) => {
  const { id: fromId, name: fromName } = from_chain;
  const { id: toId, name: toName } = to_chain;

  return (
    <div className="top-chain-list-item">
      <div className="top-chain-list-item-icons">
        <BlockchainIcon size={25} chainId={fromId} />
        <ArrowRightIcon className="icon" />
        <BlockchainIcon size={25} chainId={toId} />
      </div>
      <div className="top-chain-list-item-data">
        <div className="top-chain-list-item-from-chain">{fromName}</div>
        <div className="top-chain-list-item-to-chain">{toName}</div>
        <div className="top-chain-list-item-transactions">{formatNumber(transactions)}</div>
      </div>
    </div>
  );
};

export default TopChainListItem;
