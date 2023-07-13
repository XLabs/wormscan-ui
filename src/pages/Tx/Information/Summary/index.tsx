import { ArrowRightIcon } from "@radix-ui/react-icons";
import { BlockchainIcon } from "src/components/atoms";
import { txType } from "src/consts";
import { formatUnits } from "src/utils/crypto";
import "./styles.scss";

type Props = {
  originChainId: number;
  destinationChainId?: number;
  transactionTimeInMinutes?: number;
  symbol?: string;
  fee?: string;
  payloadType: number;
};

const Summary = ({
  transactionTimeInMinutes,
  fee,
  symbol,
  originChainId,
  destinationChainId,
  payloadType,
}: Props) => {
  const isAttestation = txType[payloadType] === "Attestation";

  return (
    <div className="tx-information-summary">
      {transactionTimeInMinutes && (
        <div>
          <div className="key">Tx Time:</div>
          <div className={"value"}>
            {transactionTimeInMinutes ? `${transactionTimeInMinutes} MIN` : "In progress"}{" "}
          </div>
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
        <div className="key">{!isAttestation ? "Chains:" : "Chain:"}</div>
        <div className="chains">
          <div className="chains-container">
            <BlockchainIcon size={20} chainId={originChainId || 0} />
          </div>
          {!isAttestation && (
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
          )}
        </div>
      </div>
    </div>
  );
};

export default Summary;
