import { ArrowRightIcon } from "@radix-ui/react-icons";
import { ChainId } from "@xlabs-libs/wormscan-sdk";
import { BlockchainIcon } from "src/components/atoms";
import { formatNumber } from "src/utils/number";
import { getChainName } from "src/utils/wormhole";
import "./styles.scss";

type Props = {
  from_chain: number;
  to_chain: number;
  transactions: string;
};

const TopChainListItem = ({ from_chain, to_chain, transactions }: Props) => {
  return (
    <div className="top-chain-list-item">
      <div className="top-chain-list-item-from">
        <BlockchainIcon size={25} chainId={from_chain} className="top-chain-list-item-from-icon" />
        <div className="top-chain-list-item-from-chain">
          {getChainName({ chainId: from_chain })}
        </div>
      </div>
      <ArrowRightIcon className="arrow-icon" />
      <div className="top-chain-list-item-to">
        <BlockchainIcon size={25} chainId={to_chain} className="top-chain-list-item-to-icon" />
        <div className="top-chain-list-item-to-chain">{getChainName({ chainId: to_chain })}</div>
      </div>
      <div className="top-chain-list-item-transactions">
        {formatNumber(Number(transactions), 0)}
      </div>
    </div>
  );
};

export default TopChainListItem;
