import { ArrowRightIcon, CheckCircledIcon } from "@radix-ui/react-icons";
import { BlockchainIcon } from "src/components/atoms";
import Chip from "src/components/atoms/Chip";
import { colorStatus, TxStatus } from "..";
import "./styles.scss";

type Props = {
  transactionTimeInMinutes: number;
  fee: number;
  originChainId: number;
  destinationChainId: number;
  summaryStatus: TxStatus;
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
            {originChainId && <BlockchainIcon size={20} chainId={originChainId} />}
          </div>
          <ArrowRightIcon className="arrow-icon" />
          <div className={`chains-container ${!Boolean(destinationChainId) && "disabled"}`}>
            <BlockchainIcon
              size={20}
              chainId={destinationChainId || 0}
              dark={!Boolean(destinationChainId)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Summary;
