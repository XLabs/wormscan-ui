import { ArrowDownIcon, CheckboxIcon, CopyIcon, InfoCircledIcon } from "@radix-ui/react-icons";
import { AddToMetaMaskBtn, BlockchainIcon, Tooltip } from "src/components/atoms";
import { CopyToClipboard } from "src/components/molecules";
import WormIcon from "src/icons/wormIcon.svg";
import { getChainName, getExplorerLink } from "src/utils/wormhole";
import { shortAddress, shortVaaId } from "src/utils/crypto";
import { TokenInfo } from "src/utils/metaMaskUtils";
import AddressInfoTooltip from "src/components/molecules/AddressInfoTooltip";
import { useRecoilState } from "recoil";
import { addressesInfoState } from "src/utils/recoilStates";
import { INFTInfo } from "src/api/guardian-network/types";
import "./styles.scss";
import { ChainId, Network } from "@wormhole-foundation/sdk";

export type OverviewProps = {
  amountSent?: string;
  amountSentUSD?: string;
  currentNetwork?: Network;
  destinationDateParsed?: string;
  fee?: string;
  fromChain?: ChainId;
  fromChainOrig?: ChainId;
  guardianSignaturesCount?: number;
  isAttestation?: boolean;
  isDuplicated?: boolean;
  isGatewaySource?: boolean;
  isMayanOnly?: boolean;
  isUnknownApp?: boolean;
  nftInfo?: INFTInfo;
  originDateParsed?: string;
  parsedDestinationAddress?: string;
  parsedEmitterAddress?: string;
  parsedOriginAddress?: string;
  parsedPayload?: any;
  parsedRedeemTx?: string;
  redeemedAmount?: string;
  relayerNTTStatus?: {
    status?: string;
    refundStatus?: string;
  };
  setShowOverview?: (bool: boolean) => void;
  showMetaMaskBtn?: boolean;
  showSignatures?: boolean;
  sourceSymbol?: string;
  sourceTokenLink?: string;
  targetSymbol?: string;
  targetTokenLink?: string;
  toChain?: ChainId;
  tokenAmount?: string;
  tokenInfo?: TokenInfo;
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
  guardianSignaturesCount,
  isAttestation,
  isDuplicated,
  isGatewaySource,
  isMayanOnly,
  isUnknownApp,
  nftInfo,
  originDateParsed,
  parsedDestinationAddress,
  parsedEmitterAddress,
  parsedOriginAddress,
  parsedRedeemTx,
  redeemedAmount,
  relayerNTTStatus,
  setShowOverview,
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
  console.log({
    1: getExplorerLink({
      network: currentNetwork,
      chainId: toChain,
      value: parsedDestinationAddress,
      base: "address",
      isNativeAddress: true,
    }),
    toChain,
    parsedDestinationAddress,
  });

  const [addressesInfo] = useRecoilState(addressesInfoState);
  return (
    <div className="tx-overview">
      <div className="tx-overview-graph">
        <div className={`tx-overview-graph-step green source`}>
          <div className="tx-overview-graph-step-name">
            <div>SOURCE CHAIN</div>
          </div>
          <div className="tx-overview-graph-step-iconWrapper">
            {fromChain && (
              <Tooltip
                tooltip={<div>{getChainName({ chainId: fromChain, network: currentNetwork })}</div>}
                type="info"
              >
                <div className="tx-overview-graph-step-iconContainer">
                  <BlockchainIcon chainId={fromChain} network={currentNetwork} size={32} />
                </div>
              </Tooltip>
            )}
          </div>
          <div className={`tx-overview-graph-step-data-container`}>
            {!isMayanOnly && !nftInfo && (
              <div>
                <div className="tx-overview-graph-step-title">
                  {isAttestation ? "Token" : "Amount"}
                </div>
                <div className="tx-overview-graph-step-description">
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
            )}
            {nftInfo && (
              <div>
                <div className="tx-overview-graph-step-title">Sent</div>
                <div className="tx-overview-graph-step-description">{nftInfo.name}</div>
                {nftInfo.image && (
                  <a href={nftInfo.image} target="_blank" rel="noopener noreferrer">
                    <img src={nftInfo.image} width={200} height={200} />
                  </a>
                )}
              </div>
            )}
            <div>
              <div className="tx-overview-graph-step-title">Source Address</div>
              <div className="tx-overview-graph-step-description">
                {parsedOriginAddress ? (
                  <>
                    <Tooltip
                      maxWidth={false}
                      tooltip={<div>{parsedOriginAddress.toUpperCase()}</div>}
                      type="info"
                    >
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
                      </a>
                    </Tooltip>
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
          </div>
        </div>

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
                    {fromChainOrig === 3104 ? (
                      <div>
                        <Tooltip
                          maxWidth={false}
                          tooltip={<div>{parsedEmitterAddress.toUpperCase()}</div>}
                          type="info"
                        >
                          <span>{shortAddress(parsedEmitterAddress).toUpperCase()}</span>
                        </Tooltip>
                      </div>
                    ) : (
                      <Tooltip
                        maxWidth={false}
                        tooltip={<div>{parsedEmitterAddress.toUpperCase()}</div>}
                        type="info"
                      >
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
                      </Tooltip>
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
                  </div>
                </>
              ) : (
                "N/A"
              )}
            </div>
          </div>
        </div>

        <div className={`tx-overview-graph-step signatures green`}>
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
                <a
                  onClick={() => {
                    setShowOverview(false);
                    setTimeout(() => {
                      const signedVaaElem = document.getElementById("signatures");
                      if (signedVaaElem) {
                        signedVaaElem.scrollIntoView({ behavior: "smooth", block: "start" });
                      } else {
                        const extraRawElem = document.getElementById("signatures2");
                        if (extraRawElem) {
                          extraRawElem.scrollIntoView({ behavior: "smooth", block: "start" });
                        }
                      }
                    }, 100);
                  }}
                  style={{ cursor: "pointer" }}
                >
                  {showSignatures ? `${guardianSignaturesCount} / ${totalGuardiansNeeded}` : "N/A"}
                </a>
              </div>
            </div>

            <div>
              <div className="tx-overview-graph-step-title">
                VAA ID
                {isDuplicated && (
                  <Tooltip tooltip={<div>VAA ID duplicated</div>} type="info">
                    <InfoCircledIcon />
                  </Tooltip>
                )}
              </div>
              <div className="tx-overview-graph-step-description">
                {VAAId ? (
                  <>
                    <Tooltip maxWidth={false} tooltip={<div>{VAAId}</div>} type="info">
                      <p>{shortVaaId(VAAId)}</p>
                    </Tooltip>
                    <CopyToClipboard toCopy={VAAId}>
                      <CopyIcon height={20} width={20} />
                    </CopyToClipboard>
                  </>
                ) : (
                  "N/A"
                )}
              </div>
            </div>
          </div>
        </div>

        {(parsedRedeemTx || destinationDateParsed) && (
          <div className={`tx-overview-graph-step green`}>
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
                      <Tooltip
                        maxWidth={false}
                        tooltip={<div>{parsedRedeemTx.toUpperCase()}</div>}
                        type="info"
                      >
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
                        </a>
                      </Tooltip>
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
          </div>
        )}

        {relayerNTTStatus && (
          <div className="tx-overview-graph-step green">
            <div className="tx-overview-graph-step-name">
              <div>DELIVERY STATUS</div>
            </div>
            <div className="tx-overview-graph-step-iconWrapper">
              <Tooltip
                tooltip={<div>{getChainName({ chainId: toChain, network: currentNetwork })}</div>}
                type="info"
              >
                <div className="tx-overview-graph-step-iconContainer">
                  <BlockchainIcon chainId={toChain} network={currentNetwork} size={32} />
                </div>
              </Tooltip>
            </div>
            <div className="tx-overview-graph-step-data-container">
              <div>
                <div className="tx-overview-graph-step-title">Status</div>
                <div
                  className={`tx-overview-graph-step-description ${
                    relayerNTTStatus.status === "Delivery Success"
                      ? "green"
                      : relayerNTTStatus.status === "Receiver Failure"
                      ? "red"
                      : "white"
                  }`}
                >
                  {relayerNTTStatus.status || "We were not able to get the status of your relay."}
                </div>
                {relayerNTTStatus.refundStatus && (
                  <div
                    className={`tx-overview-graph-step-description ${
                      relayerNTTStatus.refundStatus === "Refund Sent"
                        ? "green"
                        : relayerNTTStatus.refundStatus === "Refund Fail"
                        ? "red"
                        : "white"
                    }`}
                  >
                    {relayerNTTStatus.refundStatus}
                  </div>
                )}
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
              <Tooltip
                tooltip={<div>{getChainName({ chainId: toChain, network: currentNetwork })}</div>}
                type="info"
              >
                <div className="tx-overview-graph-step-iconContainer">
                  <BlockchainIcon chainId={toChain} network={currentNetwork} size={32} />
                </div>
              </Tooltip>
            </div>
            <div className="tx-overview-graph-step-data-container">
              {!isMayanOnly && !nftInfo && (
                <div>
                  <div className="tx-overview-graph-step-title">
                    {isAttestation ? "Target Token" : "Redeem Amount"}
                  </div>
                  <div className="tx-overview-graph-step-description">
                    {Number(fee) || tokenAmount ? (
                      <>
                        {isAttestation ? "" : Number(fee) ? redeemedAmount : amountSent}{" "}
                        {targetSymbol && (
                          <>
                            {targetTokenLink ? (
                              <a href={targetTokenLink} target="_blank" rel="noopener noreferrer">
                                {targetSymbol}
                              </a>
                            ) : (
                              <span>{targetSymbol}</span>
                            )}
                            {Number(fee) ? null : amountSentUSD && ` (${amountSentUSD} USD)`}
                          </>
                        )}
                        {showMetaMaskBtn && (
                          <div className="tx-overview-graph-step-description-btn-container">
                            <AddToMetaMaskBtn
                              className="metamask-btn-mt-16"
                              currentNetwork={currentNetwork}
                              toChain={toChain as ChainId}
                              tokenInfo={tokenInfo}
                            />
                          </div>
                        )}
                      </>
                    ) : (
                      "N/A"
                    )}
                  </div>
                </div>
              )}

              <div>
                <div className="tx-overview-graph-step-title">
                  Destination Address
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
                      <Tooltip
                        maxWidth={false}
                        tooltip={<div>{parsedDestinationAddress.toUpperCase()}</div>}
                        type="info"
                      >
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
                        </a>
                      </Tooltip>
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
