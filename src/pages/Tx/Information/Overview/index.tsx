import { ArrowDownIcon, CheckboxIcon, CopyIcon, InfoCircledIcon } from "@radix-ui/react-icons";
import { BlockchainIcon, Tooltip } from "src/components/atoms";
import { CopyToClipboard } from "src/components/molecules";
import WormIcon from "src/icons/wormIcon.svg";
import { getChainName, getExplorerLink } from "src/utils/wormhole";
import { shortAddress } from "src/utils/crypto";
import { CHAIN_ID_WORMCHAIN, ChainId, Network } from "@certusone/wormhole-sdk";
import { colorStatus } from "src/consts";
import "./styles.scss";

type Props = {
  amountSent?: string;
  amountSentUSD?: string;
  currentNetwork?: Network;
  destinationDateParsed?: string;
  fee?: string;
  fromChain?: ChainId | number;
  fromChainOrig?: ChainId | number;
  globalToRedeemTx?: string;
  guardianSignaturesCount?: number;
  isAttestation?: boolean;
  isGatewaySource?: boolean;
  isUnknownApp?: boolean;
  originDateParsed?: string;
  parsedDestinationAddress?: string;
  parsedEmitterAddress?: string;
  parsedOriginAddress?: string;
  parsedRedeemTx?: string;
  redeemedAmount?: string;
  symbol?: string;
  toChain?: ChainId | number;
  tokenAddress?: string;
  tokenAmount?: string;
  tokenChain?: ChainId | number;
  totalGuardiansNeeded?: number;
  VAAId?: string;
};

const NotFinalDestinationTooltip = () => (
  <div>
    Address shown corresponds to a Smart Contract handling the transaction. Funds will be sent to
    your recipient address.
  </div>
);

const Overview = ({
  amountSent,
  amountSentUSD,
  currentNetwork,
  destinationDateParsed,
  fee,
  fromChain,
  fromChainOrig,
  globalToRedeemTx,
  guardianSignaturesCount,
  isAttestation,
  isGatewaySource,
  isUnknownApp,
  originDateParsed,
  parsedDestinationAddress,
  parsedEmitterAddress,
  parsedOriginAddress,
  parsedRedeemTx,
  redeemedAmount,
  symbol,
  toChain,
  tokenAddress,
  tokenAmount,
  tokenChain,
  totalGuardiansNeeded,
  VAAId,
}: Props) => (
  <div className="tx-overview">
    <div className="tx-overview-graph">
      <div className={`tx-overview-graph-step green source`}>
        <div className="tx-overview-graph-step-name">
          <div>SOURCE CHAIN</div>
        </div>
        <div className="tx-overview-graph-step-iconWrapper">
          {fromChain && (
            <Tooltip tooltip={<div>{getChainName({ chainId: fromChain })}</div>} type="info">
              <div className="tx-overview-graph-step-iconContainer">
                <BlockchainIcon chainId={fromChain} size={32} />
              </div>
            </Tooltip>
          )}
        </div>
        <div className={`tx-overview-graph-step-data-container`}>
          <div>
            <div className="tx-overview-graph-step-title">Amount</div>
            <div className="tx-overview-graph-step-description">
              {tokenAmount ? (
                <>
                  {amountSent}{" "}
                  {symbol && (
                    <a
                      href={getExplorerLink({
                        network: currentNetwork,
                        chainId: tokenChain,
                        value: tokenAddress,
                        base: "token",
                      })}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {symbol}
                    </a>
                  )}
                  {amountSentUSD && `(${amountSentUSD} USD)`}
                </>
              ) : (
                "N/A"
              )}
            </div>
          </div>
          <div>
            <div className="tx-overview-graph-step-title">Source wallet</div>
            <div className="tx-overview-graph-step-description">
              {parsedOriginAddress ? (
                <>
                  <a
                    href={getExplorerLink({
                      network: currentNetwork,
                      chainId: fromChain,
                      value: parsedOriginAddress,
                      base: "address",
                      isNativeAddress: true,
                    })}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {shortAddress(parsedOriginAddress).toUpperCase()}
                  </a>{" "}
                  <CopyToClipboard toCopy={parsedOriginAddress}>
                    <CopyIcon />
                  </CopyToClipboard>
                </>
              ) : (
                "N/A"
              )}
            </div>
          </div>
        </div>
      </div>

      {!isAttestation && (
        <div className="tx-overview-graph-step green">
          <div className="tx-overview-graph-step-name">
            <div>EMITTER CONTRACT</div>
          </div>
          <div className="tx-overview-graph-step-iconWrapper">
            <div className="tx-overview-graph-step-iconContainer">
              <img src={WormIcon} alt="" height={32} loading="lazy" />
            </div>
          </div>
          <div className="tx-overview-graph-step-data-container">
            <div>
              <div className="tx-overview-graph-step-title">Time</div>
              <div className="tx-overview-graph-step-description">
                {originDateParsed ? <>{originDateParsed}</> : "N/A"}
              </div>
            </div>
            <div>
              <div className="tx-overview-graph-step-title">Contract Address</div>
              {parsedEmitterAddress ? (
                <>
                  <div className="tx-overview-graph-step-description">
                    {/* delete conditional when WORMCHAIN gets an explorer */}
                    {fromChainOrig === CHAIN_ID_WORMCHAIN ? (
                      <div>
                        <span>{shortAddress(parsedEmitterAddress).toUpperCase()}</span>
                      </div>
                    ) : (
                      <a
                        href={getExplorerLink({
                          network: currentNetwork,
                          chainId: fromChainOrig,
                          value: parsedEmitterAddress,
                          base: "address",
                          isNativeAddress: true,
                        })}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {shortAddress(parsedEmitterAddress).toUpperCase()}
                      </a>
                    )}{" "}
                    <CopyToClipboard toCopy={parsedEmitterAddress}>
                      <CopyIcon />
                    </CopyToClipboard>
                    {isGatewaySource && <span className="comment"> (Wormchain)</span>}
                  </div>
                </>
              ) : (
                "N/A"
              )}
            </div>
          </div>
        </div>
      )}

      <div className={`tx-overview-graph-step signatures ${colorStatus["COMPLETED"]}`}>
        <div className="tx-overview-graph-step-name">
          <div>SIGNED VAA</div>
        </div>
        <div className="tx-overview-graph-step-iconWrapper">
          <div className="tx-overview-graph-step-iconContainer">
            <CheckboxIcon height={24} width={24} />
          </div>
        </div>

        <div className="tx-overview-graph-step-data-container">
          <div>
            <div className="tx-overview-graph-step-title">Signatures</div>
            <div className="tx-overview-graph-step-description">
              {guardianSignaturesCount} / {totalGuardiansNeeded}
            </div>
          </div>

          <div>
            <div className="tx-overview-graph-step-title">VAA ID</div>
            <div className="tx-overview-graph-step-description">
              {VAAId ? (
                <>
                  {shortAddress(VAAId)}
                  <CopyToClipboard toCopy={VAAId}>
                    <CopyIcon />
                  </CopyToClipboard>
                </>
              ) : (
                "N/A"
              )}
            </div>
          </div>
        </div>
      </div>

      {globalToRedeemTx && (
        <div className={`tx-overview-graph-step ${colorStatus["COMPLETED"]}`}>
          <div className="tx-overview-graph-step-name">
            <div>RELAYING</div>
          </div>
          <div className="tx-overview-graph-step-iconWrapper">
            <div className="tx-overview-graph-step-iconContainer">
              <ArrowDownIcon height={24} width={24} />
            </div>
          </div>
          <div className="tx-overview-graph-step-data-container">
            <div>
              <div className="tx-overview-graph-step-title">Time</div>
              <div className="tx-overview-graph-step-description">
                {destinationDateParsed ? destinationDateParsed : "N/A"}
              </div>
            </div>

            <div>
              <div className="tx-overview-graph-step-title">Redeem Txn</div>
              <div className="tx-overview-graph-step-description">
                {parsedRedeemTx ? (
                  <>
                    <a
                      href={getExplorerLink({
                        network: currentNetwork,
                        chainId: toChain,
                        value: parsedRedeemTx,
                        isNativeAddress: true,
                      })}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {shortAddress(parsedRedeemTx).toUpperCase()}
                    </a>{" "}
                    <CopyToClipboard toCopy={parsedRedeemTx}>
                      <CopyIcon />
                    </CopyToClipboard>
                  </>
                ) : (
                  "N/A"
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {toChain && (
        <div className="tx-overview-graph-step green">
          <div className="tx-overview-graph-step-name">
            <div>TARGET CHAIN</div>
          </div>
          <div className="tx-overview-graph-step-iconWrapper">
            <Tooltip tooltip={<div>{getChainName({ chainId: toChain })}</div>} type="info">
              <div className="tx-overview-graph-step-iconContainer">
                <BlockchainIcon chainId={toChain} size={32} />
              </div>
            </Tooltip>
          </div>
          <div className="tx-overview-graph-step-data-container">
            <div>
              <div className="tx-overview-graph-step-title">Redeemed Amount</div>
              <div className="tx-overview-graph-step-description">
                {Number(fee) ? (
                  <>
                    {redeemedAmount}{" "}
                    {symbol && (
                      <a
                        href={getExplorerLink({
                          network: currentNetwork,
                          chainId: tokenChain,
                          value: tokenAddress,
                          base: "token",
                        })}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {symbol}
                      </a>
                    )}
                  </>
                ) : tokenAmount ? (
                  <>
                    {amountSent}{" "}
                    {symbol && (
                      <a
                        href={getExplorerLink({
                          network: currentNetwork,
                          chainId: tokenChain,
                          value: tokenAddress,
                          base: "token",
                        })}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {symbol}
                      </a>
                    )}
                    {amountSentUSD && `(${amountSentUSD} USD)`}
                  </>
                ) : (
                  "N/A"
                )}
              </div>
            </div>
            <div>
              <div className="tx-overview-graph-step-title">
                Destination Wallet
                {isUnknownApp && (
                  <div className="tx-overview-graph-step-title-tooltip">
                    <Tooltip tooltip={<NotFinalDestinationTooltip />} type="info">
                      <InfoCircledIcon />
                    </Tooltip>
                  </div>
                )}
              </div>
              <div className="tx-overview-graph-step-description">
                {parsedDestinationAddress ? (
                  <>
                    <a
                      href={getExplorerLink({
                        network: currentNetwork,
                        chainId: toChain,
                        value: parsedDestinationAddress,
                        base: "address",
                        isNativeAddress: true,
                      })}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {shortAddress(parsedDestinationAddress).toUpperCase()}
                    </a>{" "}
                    <CopyToClipboard toCopy={parsedDestinationAddress}>
                      <CopyIcon />
                    </CopyToClipboard>
                  </>
                ) : (
                  "N/A"
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
);

export default Overview;
