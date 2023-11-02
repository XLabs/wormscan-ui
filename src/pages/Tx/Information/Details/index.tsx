import { useEffect, useRef, useState } from "react";
import { CopyIcon, InfoCircledIcon } from "@radix-ui/react-icons";
import { CHAIN_ID_WORMCHAIN, ChainId, Network } from "@certusone/wormhole-sdk";
import { BlockchainIcon, Tooltip } from "src/components/atoms";
import { CopyToClipboard } from "src/components/molecules";
import { getChainName, getExplorerLink } from "src/utils/wormhole";
import "./styles.scss";

type Props = {
  amountSent?: string;
  amountSentUSD?: string;
  currentNetwork?: Network;
  destinationDateParsed?: string;
  fee?: string;
  fromChain?: ChainId | number;
  fromChainOrig?: ChainId | number;
  guardianSignaturesCount?: number;
  isGatewaySource?: boolean;
  isUnknownApp?: boolean;
  parsedDestinationAddress?: string;
  parsedEmitterAddress?: string;
  parsedOriginAddress?: string;
  parsedPayload?: any;
  parsedRedeemTx?: string;
  redeemedAmount?: string;
  redeemedAmountUSD?: string;
  symbol?: string;
  toChain?: ChainId | number;
  tokenAmount?: string;
  tokenLink?: string;
  totalGuardiansNeeded?: number;
  VAAId?: string;
};

const getWidthOfText = (text: string): number => {
  const span = document.createElement("span");
  span.textContent = text;
  span.style.fontSize = "16px";
  span.style.fontWeight = "400";

  document.body.appendChild(span);
  const textWidth = span.getBoundingClientRect().width;
  document.body.removeChild(span);

  return textWidth;
};

const TruncateText = ({
  text,
  extraWidth = 24, // width for gap and copy icon & (Wormchain) if isGatewaySource
  lineValueWidth, // .tx-details-group-line-value width
}: {
  text: string;
  extraWidth?: number;
  lineValueWidth: number;
}) => {
  const textWidth = getWidthOfText(text);
  const textWidthExtras = textWidth + extraWidth;

  if (textWidthExtras <= lineValueWidth) return text;

  const availableWidth = lineValueWidth - extraWidth;
  const averageCharacterWidth = textWidth / text.length;
  const maxLength = Math.floor(availableWidth / averageCharacterWidth);
  const ellipsisLength = "...".length;
  const availableSpace = maxLength - ellipsisLength;
  const halfLen = Math.floor(availableSpace / 2) > 5 ? Math.floor(availableSpace / 2) : 5;
  const start = text.slice(0, halfLen);
  const end = text.slice(-halfLen);

  return `${start}...${end}`;
};

const Details = ({
  amountSent,
  amountSentUSD,
  currentNetwork,
  destinationDateParsed,
  fee,
  fromChain,
  fromChainOrig,
  guardianSignaturesCount,
  isGatewaySource,
  isUnknownApp,
  parsedDestinationAddress,
  parsedEmitterAddress,
  parsedOriginAddress,
  parsedPayload,
  parsedRedeemTx,
  redeemedAmount,
  symbol,
  toChain,
  tokenAmount,
  tokenLink,
  totalGuardiansNeeded,
  VAAId,
}: Props) => {
  const extraWidth = isGatewaySource ? 120 : 24;
  const lineValueRef = useRef<HTMLDivElement>(null);
  const [lineValueWidth, setLineValueWidth] = useState<number>(0);

  useEffect(() => {
    const updateWidth = () => {
      if (lineValueRef.current) {
        const newWidth = lineValueRef.current.offsetWidth;
        newWidth !== lineValueWidth && setLineValueWidth(newWidth);
      }
    };

    updateWidth();

    window.addEventListener("resize", updateWidth);

    return () => {
      window.removeEventListener("resize", updateWidth);
    };
  }, [lineValueWidth]);

  return (
    <div className="tx-details">
      <div className="tx-details-group">
        <div className="tx-details-group-line">
          <div className="tx-details-group-line-key">Source Chain</div>
          <div className="tx-details-group-line-value" ref={lineValueRef}>
            {fromChain ? (
              <>
                <BlockchainIcon chainId={fromChain} size={24} />
                {getChainName({ chainId: fromChain }).toUpperCase()}
                {isGatewaySource && <span className="comment"> (through Wormchain)</span>}
              </>
            ) : (
              "N/A"
            )}
          </div>
        </div>
        <div className="tx-details-group-line">
          <div className="tx-details-group-line-key">Contract Address</div>
          <div className="tx-details-group-line-value">
            {parsedEmitterAddress ? (
              <>
                {/* delete conditional when WORMCHAIN gets an explorer */}
                {fromChainOrig === CHAIN_ID_WORMCHAIN ? (
                  <div>
                    <span>
                      <TruncateText
                        text={parsedEmitterAddress.toUpperCase()}
                        extraWidth={extraWidth}
                        lineValueWidth={lineValueWidth}
                      />
                    </span>
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
                    <TruncateText
                      text={parsedEmitterAddress.toUpperCase()}
                      extraWidth={extraWidth}
                      lineValueWidth={lineValueWidth}
                    />
                  </a>
                )}
                <CopyToClipboard toCopy={parsedEmitterAddress}>
                  <CopyIcon />
                </CopyToClipboard>
                {isGatewaySource && <span className="comment"> (Wormchain)</span>}
              </>
            ) : (
              "N/A"
            )}
          </div>
        </div>
        <div className="tx-details-group-line">
          <div className="tx-details-group-line-key">From</div>
          <div className="tx-details-group-line-value">
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
                  <TruncateText
                    text={parsedOriginAddress.toUpperCase()}
                    lineValueWidth={lineValueWidth}
                  />
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
        <div className="tx-details-group-line">
          <div className="tx-details-group-line-key">Amount</div>
          <div className="tx-details-group-line-value">
            {tokenAmount ? (
              <>
                {amountSent}{" "}
                {symbol ? (
                  <>
                    {tokenLink ? (
                      <a href={tokenLink} target="_blank" rel="noopener noreferrer">
                        {symbol}
                      </a>
                    ) : (
                      <span>{symbol}</span>
                    )}
                    {amountSentUSD && `(${amountSentUSD} USD)`}
                  </>
                ) : (
                  "N/A"
                )}
              </>
            ) : (
              "N/A"
            )}
          </div>
        </div>
      </div>
      <div className="tx-details-group">
        <div className="tx-details-group-line">
          <div className="tx-details-group-line-key">Time</div>
          <div className="tx-details-group-line-value">
            {destinationDateParsed ? <>{destinationDateParsed}</> : "N/A"}
          </div>
        </div>
        <div className="tx-details-group-line">
          <div className="tx-details-group-line-key">Signatures</div>
          <div className="tx-details-group-line-value">
            {guardianSignaturesCount} / {totalGuardiansNeeded}
          </div>
        </div>
        <div className="tx-details-group-line">
          <div className="tx-details-group-line-key">VAA ID</div>
          <div className="tx-details-group-line-value">
            {VAAId ? (
              <>
                <TruncateText text={VAAId} lineValueWidth={lineValueWidth} />
                <CopyToClipboard toCopy={VAAId}>
                  <CopyIcon />
                </CopyToClipboard>
              </>
            ) : (
              "N/A"
            )}
          </div>
        </div>
        <div className="tx-details-group-line">
          <div className="tx-details-group-line-key">Redeem Txn</div>
          <div className="tx-details-group-line-value">
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
                  <TruncateText
                    text={parsedRedeemTx.toUpperCase()}
                    lineValueWidth={lineValueWidth}
                  />
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
      <div className="tx-details-group">
        <div className="tx-details-group-line">
          <div className="tx-details-group-line-key">Target Chain</div>
          <div className="tx-details-group-line-value">
            {toChain ? (
              <>
                <BlockchainIcon chainId={toChain} size={24} />
                {getChainName({ chainId: toChain }).toUpperCase()}
                {parsedPayload?.["gateway_transfer"] && (
                  <span className="comment"> (through Wormchain)</span>
                )}
              </>
            ) : (
              "N/A"
            )}
          </div>
        </div>
        <div className="tx-details-group-line">
          <div className="tx-details-group-line-key">To</div>
          <div className="tx-details-group-line-value">
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
                  <TruncateText
                    text={parsedDestinationAddress.toUpperCase()}
                    lineValueWidth={lineValueWidth}
                  />
                </a>{" "}
                <CopyToClipboard toCopy={parsedDestinationAddress}>
                  <CopyIcon />
                </CopyToClipboard>
              </>
            ) : (
              "N/A"
            )}
            {isUnknownApp && (
              <Tooltip
                tooltip={
                  <div>
                    Address shown corresponds to a Smart Contract handling the transaction. Funds
                    will be sent to your recipient address.
                  </div>
                }
                type="info"
              >
                <InfoCircledIcon />
              </Tooltip>
            )}
          </div>
        </div>
        <div className="tx-details-group-line">
          <div className="tx-details-group-line-key">Redeem Amount</div>
          <div className="tx-details-group-line-value">
            {Number(fee) ? (
              <>
                {redeemedAmount}{" "}
                {symbol &&
                  (tokenLink ? (
                    <a href={tokenLink} target="_blank" rel="noopener noreferrer">
                      {symbol}
                    </a>
                  ) : (
                    <span>{symbol}</span>
                  ))}
              </>
            ) : tokenAmount ? (
              <>
                {amountSent}{" "}
                {symbol ? (
                  <>
                    {tokenLink ? (
                      <a href={tokenLink} target="_blank" rel="noopener noreferrer">
                        {symbol}
                      </a>
                    ) : (
                      <span>{symbol}</span>
                    )}
                    {amountSentUSD && `(${amountSentUSD} USD)`}
                  </>
                ) : (
                  "N/A"
                )}
              </>
            ) : (
              "N/A"
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Details;
