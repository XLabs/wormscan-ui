import { ArrowRightIcon } from "@radix-ui/react-icons";
import { BlockchainIcon } from "src/components/atoms";
import { formatUnits } from "src/utils/crypto";
import "./styles.scss";

type Props = {
  originChainId: number;
  destinationChainId?: number;
  transactionTimeInMinutes?: number;
  symbol?: string;
  fee?: string;
  startDate?: string | Date;
};

const Summary = ({
  transactionTimeInMinutes,
  fee,
  symbol,
  originChainId,
  destinationChainId,
  startDate,
}: Props) => {
  const parsedStartDate = new Date(startDate).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const formattedStartDate = parsedStartDate.replace(/(.+),\s(.+),\s/g, "$1, $2 at ");

  return (
    <div className="tx-information-summary">
      {transactionTimeInMinutes ? (
        <div>
          <div className="key">Tx Time:</div>
          <div className={"value"}>
            {transactionTimeInMinutes ? `${transactionTimeInMinutes} MIN` : "In progress"}
          </div>
        </div>
      ) : (
        <div>
          <div className="key">Timestamp:</div>
          <div className={"value"}>{formattedStartDate}</div>
        </div>
      )}
      {fee && (
        <div>
          <div className="key">Fee:</div>
          <div className="value">
            {formatUnits(Number(fee))} {symbol || ""}
          </div>
        </div>
      )}
      <div>
        <div className="key">Chains:</div>
        <div className="chains">
          <div className="chains-container">
            <BlockchainIcon size={20} chainId={originChainId || 0} />
          </div>
          <>
            <ArrowRightIcon className="arrow-icon" />
            <div className={`chains-container ${!destinationChainId && "disabled"}`}>
              <BlockchainIcon
                size={20}
                chainId={destinationChainId || 0}
                dark={!destinationChainId}
              />
            </div>
          </>
        </div>
      </div>
    </div>
  );
};

export default Summary;
