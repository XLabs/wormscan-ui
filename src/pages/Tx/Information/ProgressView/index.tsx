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
  STATUS,
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

          {!isJustGenericRelayer && STATUS === "IN_GOVERNORS" && (
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
              STATUS === "IN_PROGRESS" || STATUS === "IN_GOVERNORS" ? "disabled" : ""
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
                STATUS === "IN_PROGRESS" || STATUS === "IN_GOVERNORS" || STATUS === "VAA_EMITTED"
                  ? "disabled"
                  : ""
              }`}
            >
              <div className="progress-icon">
                <CheckCircle2 />
              </div>

              <div className="progress-text">
                <p>
                  Pending redemption
                  {!!toChain &&
                    ` in ${getChainName({ chainId: toChain, network: currentNetwork })}`}
                </p>
              </div>
            </div>
          )}

          <div className={`progress-item ${STATUS === "COMPLETED" ? "" : "disabled"}`}>
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
