import { useEffect, useRef, useState } from "react";
import { CopyIcon, InfoCircledIcon } from "@radix-ui/react-icons";
import { CHAIN_ID_WORMCHAIN, ChainId, Network } from "@certusone/wormhole-sdk";
import { BlockchainIcon, Tooltip } from "src/components/atoms";
import { CopyToClipboard } from "src/components/molecules";
import { getChainName, getExplorerLink } from "src/utils/wormhole";
import { TruncateText } from "src/utils/string";
import "./styles.scss";
import { OverviewProps } from "../Overview";

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
  originDateParsed,
  parsedDestinationAddress,
  parsedEmitterAddress,
  parsedOriginAddress,
  parsedPayload,
  parsedRedeemTx,
  redeemedAmount,
  sourceSymbol,
  sourceTokenLink,
  targetSymbol,
  targetTokenLink,
  toChain,
  tokenAmount,
  totalGuardiansNeeded,
  VAAId,
}: OverviewProps) => {
  const extraWidthGatewaySource = isGatewaySource ? 125 : 30;
  const extraWidthUnknownApp = isUnknownApp ? 55 : 30;
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
                <BlockchainIcon chainId={fromChain} network={currentNetwork} size={24} />
                {getChainName({ chainId: fromChain, network: currentNetwork }).toUpperCase()}
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
                        containerWidth={lineValueWidth}
                        extraWidth={extraWidthGatewaySource}
                        text={parsedEmitterAddress.toUpperCase()}
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
                      containerWidth={lineValueWidth}
                      extraWidth={extraWidthGatewaySource}
                      text={parsedEmitterAddress.toUpperCase()}
                    />
                  </a>
                )}
                <CopyToClipboard toCopy={parsedEmitterAddress}>
                  <CopyIcon height={20} width={20} />
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
                    containerWidth={lineValueWidth}
                    text={parsedOriginAddress.toUpperCase()}
                  />
                </a>{" "}
                <CopyToClipboard toCopy={parsedOriginAddress}>
                  <CopyIcon height={20} width={20} />
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
                {sourceSymbol ? (
                  <>
                    {sourceTokenLink ? (
                      <a href={sourceTokenLink} target="_blank" rel="noopener noreferrer">
                        {sourceSymbol}
                      </a>
                    ) : (
                      <span>{sourceSymbol}</span>
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
            {destinationDateParsed ? (
              <>{destinationDateParsed}</>
            ) : originDateParsed ? (
              <>{originDateParsed}</>
            ) : (
              "N/A"
            )}
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
                <TruncateText containerWidth={lineValueWidth} text={VAAId} />
                <CopyToClipboard toCopy={VAAId}>
                  <CopyIcon height={20} width={20} />
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
                    containerWidth={lineValueWidth}
                    text={parsedRedeemTx.toUpperCase()}
                  />
                </a>{" "}
                <CopyToClipboard toCopy={parsedRedeemTx}>
                  <CopyIcon height={20} width={20} />
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
                <BlockchainIcon chainId={toChain} network={currentNetwork} size={24} />
                {getChainName({ chainId: toChain, network: currentNetwork }).toUpperCase()}
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
                    containerWidth={lineValueWidth}
                    extraWidth={extraWidthUnknownApp}
                    text={parsedDestinationAddress.toUpperCase()}
                  />
                </a>{" "}
                <CopyToClipboard toCopy={parsedDestinationAddress}>
                  <CopyIcon height={20} width={20} />
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
                {targetSymbol &&
                  (targetTokenLink ? (
                    <a href={targetTokenLink} target="_blank" rel="noopener noreferrer">
                      {targetSymbol}
                    </a>
                  ) : (
                    <span>{targetSymbol}</span>
                  ))}
              </>
            ) : tokenAmount ? (
              <>
                {amountSent}{" "}
                {targetSymbol ? (
                  <>
                    {targetTokenLink ? (
                      <a href={targetTokenLink} target="_blank" rel="noopener noreferrer">
                        {targetSymbol}
                      </a>
                    ) : (
                      <span>{targetSymbol}</span>
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
