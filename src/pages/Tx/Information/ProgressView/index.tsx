import { NavLink } from "src/components/atoms";
import { CheckCircle2, ClockIcon } from "src/icons/generic";
import { getChainName } from "src/utils/wormhole";
import { OverviewProps } from "src/utils/txPageUtils";
import "./styles.scss";
import { parseTx } from "src/utils/crypto";
import { getRemainingTime } from "src/utils/date";

const ProgressView = ({
  amountSent,
  amountSentUSD,
  currentNetwork,
  destinationDateParsed,
  emitterChainId,
  fromChain,
  isAttestation,
  isJustGenericRelayer,
  isMayanOnly,
  nftInfo,
  originDateParsed,
  payloadType,
  releaseTimestamp,
  sourceSymbol,
  sourceTokenInfo,
  status,
  targetTxHash,
  toChain,
  tokenAmount,
  txHash,
}: OverviewProps) => {
  const SOURCE_SYMBOL = sourceTokenInfo?.tokenSymbol || sourceSymbol;

  const parseTxHash = parseTx({
    value: txHash,
    chainId: emitterChainId,
  });

  const remainingTime = getRemainingTime(releaseTimestamp);

  return (
    <div className="progress-section">
      <div className="progress-container">
        <div className="progress-title active">TRANSACTION PROGRESS</div>

        <div className="progress-item">
          <div className="progress-icon">
            <CheckCircle2 />
          </div>

          <div className="progress-text">
            <div className="progress-text-p">
              Transaction initiated from{" "}
              {getChainName({ chainId: fromChain, network: currentNetwork })}{" "}
              {!!toChain && ` to ${getChainName({ chainId: toChain, network: currentNetwork })}`}
            </div>

            <span>{originDateParsed}</span>
          </div>
        </div>

        {(payloadType === 1 || payloadType === 3) &&
          !isJustGenericRelayer &&
          !isMayanOnly &&
          !nftInfo &&
          tokenAmount && (
            <div className="progress-item">
              <div className="progress-icon">
                <CheckCircle2 />
              </div>

              <div className="progress-text">
                <div className="progress-text-p">
                  Transfer {!isAttestation ? amountSent : ""}{" "}
                  {SOURCE_SYMBOL && (
                    <>
                      {SOURCE_SYMBOL} {amountSentUSD && `($${amountSentUSD}) `}
                    </>
                  )}
                  {getChainName({ chainId: fromChain, network: currentNetwork })}{" "}
                  {!!toChain &&
                    ` to ${getChainName({ chainId: toChain, network: currentNetwork })}`}
                </div>
              </div>
            </div>
          )}

        {status === "in_progress" && (
          <div className="progress-item wait">
            <div className="progress-icon">
              <ClockIcon />
            </div>

            <div className="progress-text">
              <div className="progress-text-p">
                Collecting signatures of guardians{" "}
                <div className="loading-container">
                  <div className="loading-container-dot dot-1"></div>
                  <div className="loading-container-dot dot-2"></div>
                  <div className="loading-container-dot dot-3"></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {status === "in_governors" && (
          <div className="progress-item wait">
            <div className="progress-icon">
              <ClockIcon />
            </div>

            <div className="progress-text">
              <div className="progress-text-p">
                Held by Governor: this transaction should be released in{" "}
                {releaseTimestamp ? `${remainingTime}` : "N/A"}.
              </div>
            </div>
          </div>
        )}

        <div
          className={`progress-item ${
            status === "in_progress" || status === "in_governors" ? "disabled" : ""
          }`}
        >
          <div className="progress-icon">
            <CheckCircle2 />
          </div>

          <div className="progress-text">
            <div className="progress-text-p">VAA signed by Wormhole guardians</div>
          </div>
        </div>

        {(status === "pending_redeem" || (status === "completed" && targetTxHash)) &&
          !isJustGenericRelayer && (
            <div className={`progress-item ${status === "pending_redeem" ? "wait" : ""}`}>
              <div className="progress-icon">
                {status === "pending_redeem" ? <ClockIcon /> : <CheckCircle2 />}
              </div>

              <div className="progress-text">
                <div className="progress-text-p">
                  Pending execution
                  {!!toChain &&
                    ` in ${getChainName({ chainId: toChain, network: currentNetwork })}`}
                  {status === "pending_redeem" && (
                    <div className="loading-container">
                      <div className="loading-container-dot dot-1"></div>
                      <div className="loading-container-dot dot-2"></div>
                      <div className="loading-container-dot dot-3"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        {(status === "pending_redeem" || (status === "completed" && targetTxHash)) &&
          !isJustGenericRelayer && (
            <div className={`progress-item ${status === "pending_redeem" ? "disabled" : ""}`}>
              <div className="progress-icon">
                <CheckCircle2 />
              </div>

              <div className="progress-text">
                <div className="progress-text-p">Executed in the Destination Chain</div>
              </div>
            </div>
          )}

        {status === "completed" && (
          <div className="progress-item">
            <div className="progress-icon">
              <CheckCircle2 />
            </div>

            <div className="progress-text">
              <div className="progress-text-p">
                {payloadType === 1 || payloadType === 3 ? "Transfer" : "Transaction"} completed
              </div>
              <span>{destinationDateParsed}</span>
            </div>
          </div>
        )}

        {status === "completed" && !targetTxHash && (payloadType === 1 || payloadType === 3) && (
          <div className="progress-item">
            <div className="progress-text">
              <div className="progress-text-p">
                Message: Hey! This transaction doesn&apos;t have an associated Destination
                Transaction. It may involve an application or process unknown to WormholeScan. Want
                to add your protocol?{" "}
                <NavLink to="/developers/submit">Submit Your Protocol!</NavLink>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressView;
