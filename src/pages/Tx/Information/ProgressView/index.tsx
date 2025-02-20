import { CheckCircle2, ClockIcon } from "src/icons/generic";
import { getChainName } from "src/utils/wormhole";
import { OverviewProps } from "src/utils/txPageUtils";
import { getRemainingTime } from "src/utils/date";
import { VerifyRedemption } from "../Summary/VerifyRedemption";
import "./styles.scss";

const ProgressView = ({
  amountSent,
  amountSentUSD,
  currentNetwork,
  destinationDateParsed,
  fromChain,
  isAttestation,
  isJustGenericRelayer,
  isJustPortalUnknown,
  isMayanOnly,
  nftInfo,
  originDateParsed,
  payloadType,
  releaseTimestamp,
  showVerifyRedemption,
  sourceSymbol,
  sourceTokenInfo,
  startDate,
  status,
  targetTxHash,
  toChain,
  tokenAmount,
  txHash,
  vaa,
}: OverviewProps) => {
  const SOURCE_SYMBOL = sourceTokenInfo?.tokenSymbol || sourceSymbol;

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

        {payloadType !== 2 && !isJustGenericRelayer && !isMayanOnly && !nftInfo && tokenAmount && (
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
                from {getChainName({ chainId: fromChain, network: currentNetwork })}{" "}
                {!!toChain && ` to ${getChainName({ chainId: toChain, network: currentNetwork })}`}
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
                Held by Governor
                {remainingTime && `: this transaction should be released in ${remainingTime}`}
              </div>
            </div>
          </div>
        )}

        {status !== "external_tx" && (
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
        )}

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
                <div className="progress-text-p">
                  Executed in{" "}
                  {!!toChain
                    ? getChainName({ chainId: toChain, network: currentNetwork })
                    : "the Destination Chain"}
                </div>
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
                {payloadType !== 2 ? "Transfer" : "Transaction"} completed
              </div>
              <span>{destinationDateParsed}</span>
            </div>
          </div>
        )}

        {status === "completed" && !targetTxHash && payloadType !== 2 && (
          <div className="progress-item">
            <div className="progress-text">
              <div className="progress-text-p">
                We couldn&apos;t identify a Destination Transaction for this. It might involve an
                unknown protocol (not integrated with WormholeScan) or be part of a multi-step
                process.
              </div>
            </div>
          </div>
        )}

        {/* Resume transaction or show message in Progress View, only after 24 hours of pending */}
        {status === "pending_redeem" &&
          startDate &&
          new Date().getTime() - new Date(startDate).getTime() >= 24 * 60 * 60 * 1000 &&
          (showVerifyRedemption ? (
            <span>
              It has been more than 24 hours that this execution is pending on the destination
              chain. You can resume your transaction{" "}
              <VerifyRedemption
                canTryToGetRedeem={true}
                fromChain={fromChain}
                isJustPortalUnknown={isJustPortalUnknown}
                txHash={txHash}
                vaa={vaa}
                asText="HERE"
              />
            </span>
          ) : (
            <span>
              We could not retrieve information about the executing transaction on the destination
              chain at this time
            </span>
          ))}
      </div>
    </div>
  );
};

export default ProgressView;
