import { ArrowRightIcon, CheckCircledIcon } from "@radix-ui/react-icons";
import { GetTokenOutput } from "@xlabs-libs/wormscan-sdk";
import { BlockchainIcon } from "src/components/atoms";
// import { StatusBadge } from "src/components/molecules";
import { colorStatus, txType } from "src/consts";
import { TxStatus } from "src/types";
import { formatUnits } from "src/utils/crypto";
import "./styles.scss";

type Props = {
  summaryStatus: TxStatus;
  originChainId: number;
  destinationChainId?: number;
  transactionTimeInMinutes?: number;
  fee?: number;
  tokenDataResponse: {
    tokenDataIsLoading: boolean;
    tokenDataError: unknown;
    tokenData: GetTokenOutput;
  };
  payloadType: number;
};

const Summary = ({
  transactionTimeInMinutes,
  fee,
  originChainId,
  destinationChainId,
  summaryStatus,
  tokenDataResponse,
  payloadType,
}: Props) => {
  const { symbol, decimals } = tokenDataResponse?.tokenData || {};
  const hasDestinationChain = txType[payloadType] && payloadType !== 2;

  return (
    <div className="tx-information-summary">
      {/* <div>
        <div className="key">Status:</div>
        <div className="value">
          <StatusBadge status={summaryStatus} />
        </div>
      </div> */}
      {transactionTimeInMinutes && (
        <div>
          <div className="key">Tx Time:</div>
          <div className={`value ${colorStatus[summaryStatus]}`}>
            {transactionTimeInMinutes ? `${transactionTimeInMinutes} MIN` : "In progress"}{" "}
          </div>
        </div>
      )}
      {Boolean(fee) && (
        <div>
          <div className="key">Fee:</div>
          <div className="value">
            {typeof fee === "number" ? `${formatUnits(fee, decimals)} ${symbol || ""}` : fee}
          </div>
        </div>
      )}
      <div>
        <div className="key">{hasDestinationChain ? "Chains:" : "Chain:"}</div>
        <div className="chains">
          <div className="chains-container">
            <BlockchainIcon size={20} chainId={originChainId || 0} />
          </div>
          {hasDestinationChain && (
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
