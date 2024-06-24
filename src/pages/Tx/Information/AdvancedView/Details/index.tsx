import { useLayoutEffect, useRef, useState } from "react";
import { CopyIcon, InfoCircledIcon } from "@radix-ui/react-icons";
import { CHAIN_ID_WORMCHAIN, ChainId } from "@certusone/wormhole-sdk";
import { AddToMetaMaskBtn, BlockchainIcon, Tooltip } from "src/components/atoms";
import { OverviewProps } from "src/pages/Tx/Information/Overview";
import { CopyToClipboard } from "src/components/molecules";
import { getChainName, getExplorerLink } from "src/utils/wormhole";
import { TruncateText } from "src/utils/string";
import AddressInfoTooltip from "src/components/molecules/AddressInfoTooltip";
import "./styles.scss";
import { useRecoilState } from "recoil";
import { addressesInfoState } from "src/utils/recoilStates";

const Details = ({
  amountSent,
  amountSentUSD,
  currentNetwork,
  destinationDateParsed,
  fee,
  fromChain,
  fromChainOrig,
  guardianSignaturesCount,
  isAttestation,
  isDuplicated,
  isGatewaySource,
  isUnknownApp,
  originDateParsed,
  parsedDestinationAddress,
  parsedEmitterAddress,
  parsedOriginAddress,
  parsedPayload,
  parsedRedeemTx,
  redeemedAmount,
  showMetaMaskBtn,
  showSignatures,
  sourceSymbol,
  sourceTokenLink,
  targetSymbol,
  targetTokenLink,
  toChain,
  tokenAmount,
  tokenInfo,
  totalGuardiansNeeded,
  VAAId,
}: OverviewProps) => {
  const [addressesInfo] = useRecoilState(addressesInfoState);
  const extraWidthGatewaySource = isGatewaySource ? 125 : 30;
  const extraWidthUnknownApp = isUnknownApp ? 55 : 30;
  const extraWidthDuplicated = isDuplicated ? 53 : 30;
  const lineValueRef = useRef<HTMLDivElement>(null);
  const [lineValueWidth, setLineValueWidth] = useState<number>(0);

  useLayoutEffect(() => {
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
                {isGatewaySource && <span className="comment"> (through Gateway)</span>}
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
                {addressesInfo?.[parsedEmitterAddress.toLowerCase()] && (
                  <AddressInfoTooltip
                    info={addressesInfo[parsedEmitterAddress.toLowerCase()]}
                    chain={fromChainOrig}
                  />
                )}
                {isGatewaySource && <span className="comment"> (Gateway)</span>}
              </>
            ) : (
              "N/A"
            )}
          </div>
        </div>
        <div className="tx-details-group-line">
          <div className="tx-details-group-line-key">Source Address</div>
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
                {addressesInfo?.[parsedOriginAddress.toLowerCase()] && (
                  <AddressInfoTooltip
                    info={addressesInfo[parsedOriginAddress.toLowerCase()]}
                    chain={fromChain}
                  />
                )}
              </>
            ) : (
              "N/A"
            )}
          </div>
        </div>
        <div className="tx-details-group-line">
          <div className="tx-details-group-line-key">{isAttestation ? "Token" : "Amount"}</div>
          <div className="tx-details-group-line-value">
            {tokenAmount ? (
              <>
                {!isAttestation ? amountSent : ""}{" "}
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
            {showSignatures ? `${guardianSignaturesCount} / ${totalGuardiansNeeded}` : "N/A"}
          </div>
        </div>
        <div className="tx-details-group-line">
          <div className="tx-details-group-line-key">VAA ID</div>
          <div className="tx-details-group-line-value">
            {VAAId ? (
              <>
                <TruncateText
                  containerWidth={lineValueWidth}
                  extraWidth={extraWidthDuplicated}
                  text={VAAId}
                />
                <CopyToClipboard toCopy={VAAId}>
                  <CopyIcon height={20} width={20} />
                </CopyToClipboard>
                {isDuplicated && (
                  <Tooltip tooltip={<div>VAA ID duplicated</div>} type="info">
                    <InfoCircledIcon />
                  </Tooltip>
                )}
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

      {(!isAttestation || (isAttestation && toChain)) && (
        <div className="tx-details-group">
          <div className="tx-details-group-line">
            <div className="tx-details-group-line-key">Target Chain</div>
            <div className="tx-details-group-line-value">
              {toChain ? (
                <>
                  <BlockchainIcon chainId={toChain} network={currentNetwork} size={24} />
                  {getChainName({ chainId: toChain, network: currentNetwork }).toUpperCase()}
                  {parsedPayload?.["gateway_transfer"] && (
                    <span className="comment"> (through Gateway)</span>
                  )}
                </>
              ) : (
                "N/A"
              )}
            </div>
          </div>
          <div className="tx-details-group-line">
            <div className="tx-details-group-line-key">Destination Address</div>
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
                  {addressesInfo?.[parsedDestinationAddress.toLowerCase()] && (
                    <AddressInfoTooltip
                      info={addressesInfo[parsedDestinationAddress.toLowerCase()]}
                      chain={toChain}
                    />
                  )}
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
            <div className="tx-details-group-line-key">
              {isAttestation ? "Target Token" : "Redeem Amount"}
            </div>
            <div className="tx-details-group-line-value">
              {Number(fee) ? (
                <>
                  {!isAttestation ? redeemedAmount : ""}{" "}
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
                  {!isAttestation ? amountSent : ""}{" "}
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
          {showMetaMaskBtn && (
            <div className="tx-details-group-line">
              <div className="tx-details-group-line-key"></div>
              <div className="tx-details-group-line-value">
                <AddToMetaMaskBtn
                  currentNetwork={currentNetwork}
                  toChain={toChain as ChainId}
                  tokenInfo={tokenInfo}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Details;
