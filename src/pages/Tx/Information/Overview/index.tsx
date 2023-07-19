import { CopyIcon, InfoCircledIcon } from "@radix-ui/react-icons";
import { Alert, BlockchainIcon, SignatureCircle, Tooltip } from "src/components/atoms";
import { CopyToClipboard } from "src/components/molecules";
import WormIcon from "src/icons/wormIcon.svg";
import RelayIcon from "src/icons/relayIcon.svg";
import { GetTransactionsOutput, VAADetail } from "@xlabs-libs/wormscan-sdk";
import { getChainName, getExplorerLink } from "src/utils/wormhole";
import { shortAddress } from "src/utils/crypto";
import { formatCurrency } from "src/utils/number";
import { ChainId } from "@certusone/wormhole-sdk";
import { useWindowSize } from "src/utils/hooks/useWindowSize";
import { BREAKPOINTS, colorStatus, txType } from "src/consts";
import { parseTx, parseAddress } from "../../../../utils/crypto";
import { getCurrentNetwork } from "src/api/Client";
import "./styles.scss";

type Props = {
  VAAData: VAADetail & { vaa: any; decodedVaa: any };
  txData: GetTransactionsOutput;
};

const UNKNOWN_APP_ID = "UNKNOWN";

const NotFinalDestinationTooltip = () => (
  <div>
    Address shown corresponds to a Smart Contract handling the transaction. Funds will be sent to
    your recipient address.
  </div>
);

const Overview = ({ VAAData, txData }: Props) => {
  const currentNetwork = getCurrentNetwork();
  const totalGuardiansNeeded = currentNetwork === "mainnet" ? 13 : 1;
  const size = useWindowSize();
  const isMobile = size.width < BREAKPOINTS.tablet;
  const { decodedVaa } = VAAData || {};
  const { guardianSignatures } = decodedVaa || {};
  const guardianSignaturesCount = guardianSignatures?.length || 0;

  const {
    id: VAAId,
    timestamp,
    tokenAmount,
    usdAmount,
    symbol,
    emitterChain,
    emitterNativeAddress,
    standardizedProperties,
    globalTx,
    payload,
  } = txData || {};

  const {
    payloadType,
    callerAppId,
    decimals: payloadTokenDecimals,
    name: payloadTokenName,
    symbol: payloadTokenSymbol,
    tokenChain: payloadTokenChain,
    tokenAddress: payloadTokenAddress,
  } = payload || {};
  const { originTx, destinationTx } = globalTx || {};
  const isAttestation = txType[payloadType] === "Attestation";
  const isUnknownPayloadType = !txType[payloadType];
  console.log({ isUnknownPayloadType: !txType[payloadType] });

  const {
    appIds,
    fromChain: stdFromChain,
    toChain: stdToChain,
    toAddress: stdToAddress,
    tokenChain: stdTokenChain,
    tokenAddress: stdTokenAddress,
  } = standardizedProperties || {};

  const { from: globalFrom, timestamp: globalFromTimestamp } = originTx || {};

  const {
    chainId: globalToChainId,
    from: globalTo,
    timestamp: globalToTimestamp,
    txHash: globalToRedeemTx,
  } = destinationTx || {};

  const fromChain = emitterChain || stdFromChain;
  const fromAddress = globalFrom;
  const toChain = stdToChain || globalToChainId;
  const toAddress = stdToAddress || globalTo;
  const startDate = timestamp || globalFromTimestamp;
  const endDate = globalToTimestamp;
  const tokenChain = stdTokenChain || payloadTokenChain;
  const tokenAddress = stdTokenAddress || payloadTokenAddress;
  const isUnknownApp = callerAppId === UNKNOWN_APP_ID || appIds?.includes(UNKNOWN_APP_ID);

  const parsedOriginAddress = parseAddress({
    value: fromAddress,
    chainId: fromChain as ChainId,
  });

  const parsedEmitterAddress = parseAddress({
    value: emitterNativeAddress,
    chainId: emitterChain as ChainId,
  });

  const parsedDestinationAddress = parseAddress({
    value: toAddress,
    chainId: toChain as ChainId,
  });

  const parsedRedeemTx = parseTx({ value: globalToRedeemTx, chainId: toChain as ChainId });

  const originDate = new Date(startDate).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const destinationDate = new Date(endDate).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const amountSent = formatCurrency(Number(tokenAmount));
  const amountSentUSD = formatCurrency(Number(usdAmount));

  const originDateParsed = originDate.replace(/(.+),\s(.+),\s/g, "$1, $2 at ");
  const destinationDateParsed = destinationDate.replace(/(.+),\s(.+),\s/g, "$1, $2 at ");

  return (
    <div className="tx-overview">
      <div className="tx-overview-graph">
        <div className={`tx-overview-graph-step green source`}>
          <div className="tx-overview-graph-step-name">
            <div>SOURCE CHAIN</div>
          </div>
          <div className="tx-overview-graph-step-iconWrapper">
            <div className="tx-overview-graph-step-iconContainer">
              {fromChain && <BlockchainIcon chainId={fromChain} size={32} />}
            </div>
          </div>
          <div className={`tx-overview-graph-step-data-container`}>
            <div>
              <div className="tx-overview-graph-step-title">Sent from</div>
              <div className="tx-overview-graph-step-description">
                {fromChain && getChainName({ chainId: fromChain }).toUpperCase()}
              </div>
            </div>
            {isAttestation ? (
              <>
                <div>
                  <div className="tx-overview-graph-step-title">Decimals</div>
                  <div className="tx-overview-graph-step-description">{payloadTokenDecimals}</div>
                </div>
                <div className="mobile-hide"></div>
                <div>
                  <div className="tx-overview-graph-step-title">Token Symbol</div>
                  <div className="tx-overview-graph-step-description">{payloadTokenSymbol}</div>
                </div>
                <div>
                  <div className="tx-overview-graph-step-title">Token Name</div>
                  <div className="tx-overview-graph-step-description">
                    <a
                      href={getExplorerLink({
                        chainId: tokenChain,
                        value: tokenAddress,
                        base: "token",
                      })}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {payloadTokenName}
                    </a>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div style={{ order: tokenAmount ? 1 : 2 }}>
                  {tokenAmount && (
                    <>
                      <div className="tx-overview-graph-step-title">Amount</div>
                      <div className="tx-overview-graph-step-description">
                        {amountSent}{" "}
                        {symbol && (
                          <a
                            href={getExplorerLink({
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
                        ({amountSentUSD || "-"} USD)
                      </div>
                    </>
                  )}
                </div>
                <div style={{ order: tokenAmount ? 2 : 1 }}>
                  {parsedOriginAddress && (
                    <>
                      <div className="tx-overview-graph-step-title">Source wallet</div>
                      <div className="tx-overview-graph-step-description">
                        <a
                          href={getExplorerLink({
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
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
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
                <div className="tx-overview-graph-step-description">{originDateParsed}</div>
              </div>
              <div>
                <div className="tx-overview-graph-step-title">Contract Address</div>
                <div className="tx-overview-graph-step-description">
                  <a
                    href={getExplorerLink({
                      chainId: fromChain,
                      value: parsedEmitterAddress,
                      base: "address",
                      isNativeAddress: true,
                    })}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {shortAddress(parsedEmitterAddress).toUpperCase()}
                  </a>{" "}
                  <CopyToClipboard toCopy={parsedEmitterAddress}>
                    <CopyIcon />
                  </CopyToClipboard>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className={`tx-overview-graph-step signatures ${colorStatus["COMPLETED"]}`}>
          <div className="tx-overview-graph-step-name">
            <div>SIGNED VAA</div>
          </div>
          <div className="tx-overview-graph-step-iconWrapper">
            <div className="tx-overview-graph-step-signaturesContainer">
              <SignatureCircle guardianSignatures={guardianSignatures} />
              <div className="tx-overview-graph-step-signaturesContainer-text">
                <div className="tx-overview-graph-step-signaturesContainer-text-number">
                  {guardianSignaturesCount}/{totalGuardiansNeeded}
                </div>
                <div className="tx-overview-graph-step-signaturesContainer-text-description">
                  Signatures
                </div>
              </div>
            </div>
          </div>

          <div className="tx-overview-graph-step-data-container signatures">
            <div>
              <div className="tx-overview-graph-step-title">VAA ID</div>
              <div className="tx-overview-graph-step-description">
                {shortAddress(VAAId)}
                <CopyToClipboard toCopy={VAAId}>
                  <CopyIcon />
                </CopyToClipboard>
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
                <img src={RelayIcon} alt="" height={32} loading="lazy" />
              </div>
            </div>
            <div className="tx-overview-graph-step-data-container">
              <div>
                <div className="tx-overview-graph-step-title">Time</div>
                <div className="tx-overview-graph-step-description">{destinationDateParsed}</div>
              </div>

              <div>
                <div className="tx-overview-graph-step-title">Redeem Tx</div>
                <div className="tx-overview-graph-step-description">
                  <a
                    href={getExplorerLink({
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
                </div>
              </div>
            </div>
          </div>
        )}

        {toChain && (
          <div className="tx-overview-graph-step green">
            <div className="tx-overview-graph-step-name">
              <div>{isMobile ? "DEST. CHAIN" : "DESTINATION CHAIN"}</div>
            </div>
            <div className="tx-overview-graph-step-iconWrapper">
              <div className="tx-overview-graph-step-iconContainer">
                {toChain && <BlockchainIcon chainId={toChain} size={32} />}
              </div>
            </div>
            <div className="tx-overview-graph-step-data-container">
              <div>
                <div className="tx-overview-graph-step-title">Sent to</div>
                <div className="tx-overview-graph-step-description">
                  {toChain && getChainName({ chainId: toChain }).toUpperCase()}
                </div>
              </div>
              <div>
                <div className="tx-overview-graph-step-title">
                  Destination wallet
                  {isUnknownApp && (
                    <div className="tx-overview-graph-step-title-tooltip">
                      <Tooltip tooltip={<NotFinalDestinationTooltip />} type="info">
                        <InfoCircledIcon />
                      </Tooltip>
                    </div>
                  )}
                </div>
                <div className="tx-overview-graph-step-description">
                  <a
                    href={getExplorerLink({
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
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {isUnknownPayloadType && (
        <div className="tx-overview-alerts">
          <div className="tx-overview-alerts-unknown-payload-type">
            <Alert type="info">
              This VAA comes from another multiverse, we don&apos;t have more details about it.
            </Alert>
          </div>
        </div>
      )}
    </div>
  );
};

export default Overview;
