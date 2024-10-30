import { CheckCircle2, ChevronDownIcon } from "src/icons/generic";
import { getChainName } from "src/utils/wormhole";
import { OverviewProps } from "src/utils/txPageUtils";
import "./styles.scss";

const ProgressView = ({
  isJustGenericRelayer,
  isMayanOnly,
  nftInfo,
  tokenAmount,
  isAttestation,
  amountSent,
  fromChain,
  toChain,
  currentNetwork,
  status,
  originDateParsed,
  sourceTokenInfo,
  sourceSymbol,
  amountSentUSD,
  destinationDateParsed,
}: OverviewProps) => {
  const SOURCE_SYMBOL = sourceTokenInfo?.tokenSymbol || sourceSymbol;

  return (
    <div className="progress-section">
      <div className="progress-container">
        <div className={`progress-title active`}>TRANSACTION PROGRESS</div>

        <>
          <div className="progress-item">
            <div className="progress-icon">
              <CheckCircle2 />
            </div>

            <div className="progress-text">
              <p>
                {!isJustGenericRelayer && !isMayanOnly && !nftInfo && (
                  <>
                    Transfer{" "}
                    {tokenAmount && (
                      <>
                        {!isAttestation ? amountSent : ""}{" "}
                        {SOURCE_SYMBOL && (
                          <>
                            {SOURCE_SYMBOL} {amountSentUSD && `($${amountSentUSD})`}
                          </>
                        )}
                      </>
                    )}
                  </>
                )}{" "}
                {!isJustGenericRelayer && !isMayanOnly && !nftInfo ? "from" : "From"}{" "}
                {getChainName({ chainId: fromChain, network: currentNetwork })}{" "}
                {!!toChain && ` to ${getChainName({ chainId: toChain, network: currentNetwork })}`}
              </p>

              <span>{originDateParsed}</span>
            </div>
          </div>

          {!isJustGenericRelayer && status === "in_governors" && (
            <div className="progress-item">
              <div className="progress-icon">
                <CheckCircle2 />
              </div>

              <div className="progress-text">
                <p>In governor - This transaction will take 24 hours to process</p>
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
              <p>VAA signed by wormhole guardians</p>
            </div>
          </div>

          {!isJustGenericRelayer && (
            <div
              className={`progress-item ${
                status === "in_progress" || status === "in_governors" || status === "vaa_emitted"
                  ? "disabled"
                  : ""
              }`}
            >
              <div className="progress-icon">
                <CheckCircle2 />
              </div>

              <div className="progress-text">
                <p>
                  Pending execution
                  {!!toChain &&
                    ` in ${getChainName({ chainId: toChain, network: currentNetwork })}`}
                </p>
              </div>
            </div>
          )}

          <div className={`progress-item ${status === "completed" ? "" : "disabled"}`}>
            <div className="progress-icon">
              <CheckCircle2 />
            </div>

            <div className="progress-text">
              <p>Transactions completed</p>
              <span>{destinationDateParsed}</span>
            </div>
          </div>
        </>
      </div>
    </div>
  );
};

export default ProgressView;
