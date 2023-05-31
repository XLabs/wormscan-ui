import { ArrowRightIcon, CheckCircledIcon } from "@radix-ui/react-icons";
import { BlockchainIcon } from "src/components/atoms";
import Chip from "src/components/atoms/Chip";
import "./styles.scss";

type Props = {
  transactionTimeInMinutes: number;
  fee: number;
  originChainId: number;
  destinationChainId: number;
};

const Summary = ({ transactionTimeInMinutes, fee, originChainId, destinationChainId }: Props) => {
  return (
    <div className="tx-information-summary">
      <div>
        <div className="key">Status:</div>
        <div className="value">
          <Chip className="green">
            SUCCESSFUL <CheckCircledIcon />
          </Chip>
        </div>
      </div>
      <div>
        <div className="key">Transaction Time:</div>
        <div className="value">{transactionTimeInMinutes} MIN</div>
      </div>
      <div>
        <div className="key">Fee:</div>
        <div className="value">{fee} SYMBOL</div>
      </div>
      <div>
        <div className="key">Chains:</div>
        <div className="chains">
          <div className="chains-container">
            <BlockchainIcon size={20} chainId={originChainId} />
          </div>
          <ArrowRightIcon className="arrow-icon" />
          <div className="chains-container">
            <BlockchainIcon size={20} chainId={destinationChainId} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Summary;
