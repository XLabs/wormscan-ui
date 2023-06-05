import { ArrowRightIcon, CheckCircledIcon } from "@radix-ui/react-icons";
import { BlockchainIcon } from "src/components/atoms";
import Chip from "src/components/atoms/Chip";
import { colorStatus, TxStatus } from "..";
import "./styles.scss";

type Props = {
  summaryStatus: TxStatus;
  originChainId: number;
  destinationChainId?: number;
  transactionTimeInMinutes?: number;
  fee?: number;
};

const Summary = ({
  transactionTimeInMinutes,
  fee,
  originChainId,
  destinationChainId,
  summaryStatus,
}: Props) => {
  const isError = summaryStatus === "FAILED";

  return (
    <div className="tx-information-summary">
      <div>
        <div className="key">Status:</div>
        <div className="value">
          <Chip color={colorStatus[summaryStatus]}>
            {summaryStatus} <CheckCircledIcon />
          </Chip>
        </div>
      </div>
      {!isError && (
        <div>
          <div className="key">Tx Time:</div>
          <div className={`value ${colorStatus[summaryStatus]}`}>
            {transactionTimeInMinutes ? `${transactionTimeInMinutes} MIN` : "In progress"}{" "}
          </div>
        </div>
      )}
      <div>
        <div className="key">Fee:</div>
        <div className="value">{fee != null ? `${fee} SYMBOL` : "-"}</div>
      </div>
      <div>
        <div className="key">Chains:</div>
        <div className="chains">
          <div className="chains-container">
            <BlockchainIcon size={20} chainId={originChainId || 0} />
          </div>
          <ArrowRightIcon className="arrow-icon" />
          <div className={`chains-container ${!destinationChainId && "disabled"}`}>
            <BlockchainIcon
              size={20}
              chainId={destinationChainId || 0}
              dark={!destinationChainId}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Summary;
