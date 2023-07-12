import { CopyIcon } from "@radix-ui/react-icons";
import { BlockchainIcon, SignatureCircle } from "src/components/atoms";
import { CopyToClipboard } from "src/components/molecules";
import WormIcon from "src/icons/wormIcon.svg";
import RelayIcon from "src/icons/relayIcon.svg";
import {
  GetTokenOutput,
  GetTokenPriceOutput,
  GetTransactionsOutput,
  GlobalTxOutput,
  VAADetail,
} from "@xlabs-libs/wormscan-sdk";
import { getChainName, getExplorerLink } from "src/utils/wormhole";
import { shortAddress, formatUnits } from "src/utils/crypto";
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

const Overview = ({ VAAData, txData }: Props) => {
  const currentNetwork = getCurrentNetwork();
  const totalGuardiansNeeded = currentNetwork === "mainnet" ? 13 : 1;
  const size = useWindowSize();
  const isMobile = size.width < BREAKPOINTS.tablet;
  const { decodedVaa } = VAAData || {};
  const { guardianSignatures } = decodedVaa || {};
  const guardianSignaturesCount = guardianSignatures?.length || 0;
  const signatureContainerMaskDegree = Math.abs(
    360 - (360 - guardianSignaturesCount * fractionDegree),
  );
  const signatureStyles: CSSProperties & { "--m2": string; "--n": number } = {
    "--m2": `calc(${signatureContainerMaskDegree}deg)`,
    "--n": totalGuardiansNeeded,
  };

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
    tokenChain: payloadTokenChain,
    tokenAddress: payloadTokenAddress,
  } = payload || {};
  const { originTx, destinationTx } = globalTx || {};
  const isAttestation = txType[payloadType] === "Attestation";

  const {
    fromChain: stdFromChain,
    fromAddress: stdFromAddress,
    toChain: stdToChain,
    toAddress: stdToAddress,
    tokenChain: stdTokenChain,
    tokenAddress: stdTokenAddress,
  } = standardizedProperties || {};

  const {
    chainId: globalFromChainId,
    from: globalFrom,
    timestamp: globalFromTimestamp,
  } = originTx || {};

  const {
    chainId: globalToChainId,
    from: globalTo,
    timestamp: globalToTimestamp,
    txHash: globalToRedeemTx,
  } = destinationTx || {};

  const fromChain = stdFromChain || globalFromChainId || emitterChain;
  const fromAddress = stdFromAddress || globalFrom;
  const toChain = stdToChain || globalToChainId;
  const toAddress = stdToAddress || globalTo;
  const startDate = timestamp || globalFromTimestamp;
  const endDate = globalToTimestamp;
  const tokenChain = stdTokenChain || payloadTokenChain;
  const tokenAddress = stdTokenAddress || payloadTokenAddress;

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
        <div className={`tx-overview-graph-step green source ${isAttestation && "attestation"}`}>
          <div className="tx-overview-graph-step-name">
            <div>SOURCE CHAIN</div>
          </div>
          <div className="tx-overview-graph-step-iconWrapper">
            <div className="tx-overview-graph-step-iconContainer">
              {fromChain && <BlockchainIcon chainId={fromChain} size={32} />}
            </div>
          </div>
          <div
            className={`tx-overview-graph-step-data-container ${isAttestation && "attestation"}`}
          >
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
                  <div className="tx-overview-graph-step-description">TODO: buscar decimales</div>
                </div>
                <div></div>
                <div>
                  <div className="tx-overview-graph-step-title">Token Symbol</div>
                  <div className="tx-overview-graph-step-description">{symbol}</div>
                </div>
                <div>
                  <div className="tx-overview-graph-step-title">Token Name</div>
                  <div className="tx-overview-graph-step-description">Token Name</div>
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
                <div className="tx-overview-graph-step-title">Destination wallet</div>
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
    </div>
  );
};

export default Overview;
