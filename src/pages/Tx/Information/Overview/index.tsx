import { AddToMetaMaskBtn, BlockchainIcon, ProtocolIcon, Tooltip } from "src/components/atoms";
import { CopyToClipboard, StatusBadge } from "src/components/molecules";
import { getChainName, getExplorerLink } from "src/utils/wormhole";
import { filterAppIds, formatAppId, formatUnits, parseTx, shortAddress } from "src/utils/crypto";
import AddressInfoTooltip from "src/components/molecules/AddressInfoTooltip";
import { useRecoilState } from "recoil";
import { addressesInfoState } from "src/utils/recoilStates";
import { BREAKPOINTS, CCTP_MANUAL_APP_ID, ETH_BRIDGE_APP_ID, txType } from "src/consts";
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  ChevronDownIcon,
  CopyIcon,
  InfoCircleIcon,
  LinkIcon,
} from "src/icons/generic";
import { useLayoutEffect, useRef, useState } from "react";
import { TruncateText } from "src/utils/string";
import { ChainId, chainIdToChain, chainToChainId } from "@wormhole-foundation/sdk";
import { formatDate } from "src/utils/date";
import { ARKHAM_CHAIN_NAME } from "src/utils/arkham";
import {
  mainnetDefaultDeliveryProviderContractAddress,
  mainnetNativeCurrencies,
  testnetDefaultDeliveryProviderContractAddress,
  testnetNativeCurrencies,
} from "src/utils/environment";
import { formatNumber } from "src/utils/number";
import { useWindowSize } from "src/utils/hooks";
import {
  BIGDIPPER_TRANSACTIONS,
  DiscordSupportLink,
  LearnMoreLink,
  OverviewProps,
  extractPageName,
} from "src/utils/txPageUtils";
import "./styles.scss";
import { getTokenIcon } from "src/utils/token";

const Overview = ({
  amountSent,
  amountSentUSD,
  appIds,
  budgetText,
  copyBudgetText,
  currentBlock,
  currentNetwork,
  decodeExecution,
  deliveryAttempt,
  deliveryInstruction,
  deliveryParsedRefundAddress,
  deliveryParsedRefundProviderAddress,
  deliveryParsedSenderAddress,
  deliveryParsedSourceProviderAddress,
  deliveryParsedTargetAddress,
  deliveryStatus,
  destinationDateParsed,
  emitterChainId,
  fee,
  fromChain,
  fromChainOrig,
  gasUsed,
  gasUsedText,
  gatewayInfo,
  guardianSignaturesCount,
  hasVAA,
  isAttestation,
  isBigTransaction,
  isDailyLimitExceeded,
  isDelivery,
  isDuplicated,
  isGatewaySource,
  isJustGenericRelayer,
  isLatestBlockHigherThanVaaEmitBlock,
  isMayanOnly,
  isUnknownApp,
  isUnknownPayloadType,
  lastFinalizedBlock,
  maxRefundText,
  nftInfo,
  originDateParsed,
  parsedDestinationAddress,
  parsedEmitterAddress,
  parsedOriginAddress,
  parsedRedeemTx,
  parsedVaa,
  payloadType,
  receiverValueText,
  redeemedAmount,
  refundStatus,
  refundText,
  resultLog,
  setShowOverview,
  showMetaMaskBtn,
  showSignatures,
  sourceAddress,
  sourceFee,
  sourceTokenChain,
  sourceFeeUSD,
  sourceSymbol,
  sourceTokenInfo,
  sourceTokenLink,
  STATUS,
  targetFee,
  targetFeeUSD,
  targetSymbol,
  targetTokenInfo,
  targetTokenLink,
  targetTxTimestamp,
  toChain,
  tokenAmount,
  totalGuardiansNeeded,
  transactionLimit,
  txHash,
  txIndex,
  VAAId,
}: OverviewProps) => {
  const [addressesInfo] = useRecoilState(addressesInfoState);
  const lineValueRef = useRef<HTMLDivElement>(null);
  const [lineValueWidth, setLineValueWidth] = useState<number>(0);

  const [showDetailsNft, setShowDetailsNft] = useState(false);

  const { width } = useWindowSize();
  const isDekstop = width >= BREAKPOINTS.desktop;

  const parseTxHash = parseTx({
    value: txHash,
    chainId: emitterChainId,
  });
  const parseTxHashUpperCase = parseTxHash.toUpperCase();

  const SOURCE_SYMBOL = sourceTokenInfo?.tokenSymbol || sourceSymbol;
  const TARGET_SYMBOL = targetTokenInfo?.tokenSymbol || targetSymbol;

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
    <div className="tx-overview">
      <div className="tx-overview-section">
        <h4 className="tx-overview-section-title">
          <Tooltip
            type="info"
            tooltip={
              <div className="tx-overview-section-info-tooltip-content">
                <p>Current state of the transaction</p>
              </div>
            }
            className="tx-overview-section-info-tooltip"
          >
            <span>Status</span>
          </Tooltip>
        </h4>

        <div className="tx-overview-section-info">
          <div className="tx-overview-section-info-container">
            <div className="text">
              <StatusBadge STATUS={STATUS} />

              <button
                className="tx-overview-section-info-steps"
                onClick={() => {
                  setShowOverview("progress");
                }}
              >
                {STATUS === "IN_PROGRESS"
                  ? "1"
                  : STATUS === "IN_GOVERNORS"
                  ? "2"
                  : STATUS === "VAA_EMITTED"
                  ? "2"
                  : STATUS === "PENDING_REDEEM"
                  ? "3"
                  : STATUS === "COMPLETED"
                  ? isJustGenericRelayer
                    ? "3"
                    : "4"
                  : "5"}
                /{STATUS === "IN_GOVERNORS" ? "5" : isJustGenericRelayer ? "3" : "4"}
                <p className="desktop">Steps Complete</p> <ArrowUpRightIcon width={24} />
              </button>

              {(!hasVAA || isUnknownPayloadType) && (
                <div className="tx-overview-section-info-alert">
                  <div className="desktop">
                    {!hasVAA
                      ? appIds && appIds.includes(CCTP_MANUAL_APP_ID)
                        ? "This transaction is processed by Circle&apos;s CCTP and therefore information might be incomplete"
                        : "The VAA for this transaction has not been issued yet"
                      : "VAA comes from another multiverse, we don’t have more details about it"}
                  </div>
                  {!(isDekstop && hasVAA) && (
                    <Tooltip
                      type="info"
                      tooltip={
                        <div className="tx-overview-section-info-alert-tooltip-content">
                          {!hasVAA ? (
                            appIds && appIds.includes(CCTP_MANUAL_APP_ID) ? (
                              <p>
                                This transaction is processed by Circle&apos;s CCTP and therefore
                                information might be incomplete.
                              </p>
                            ) : (
                              <>
                                <p className="mobile">
                                  The VAA for this transaction has not been issued yet.
                                </p>
                                {!isLatestBlockHigherThanVaaEmitBlock &&
                                  !isBigTransaction &&
                                  !isDailyLimitExceeded && (
                                    <p>
                                      Waiting for finality on{" "}
                                      {getChainName({
                                        chainId: fromChain,
                                        network: currentNetwork,
                                      })}{" "}
                                      which may take up to 15 minutes.
                                    </p>
                                  )}
                                {lastFinalizedBlock && currentBlock && (
                                  <>
                                    <div>
                                      <h5>LAST FINALIZED BLOCK NUMBER</h5>
                                      <span>
                                        <a
                                          className="tx-information-alerts-unknown-payload-type-link"
                                          href={getExplorerLink({
                                            network: currentNetwork,
                                            chainId: fromChain,
                                            value: lastFinalizedBlock.toString(),
                                            base: "block",
                                          })}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                        >
                                          {lastFinalizedBlock}
                                        </a>
                                      </span>
                                    </div>

                                    <div>
                                      <h5>THIS BLOCK NUMBER</h5>
                                      <a
                                        className="tx-information-alerts-unknown-payload-type-link"
                                        href={getExplorerLink({
                                          network: currentNetwork,
                                          chainId: fromChain,
                                          value: currentBlock.toString(),
                                          base: "block",
                                        })}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        {currentBlock}
                                      </a>
                                    </div>
                                  </>
                                )}

                                {isBigTransaction && currentNetwork === "Mainnet" ? (
                                  <div>
                                    <h5>BIG TRANSACTION</h5>
                                    <div>
                                      This transaction will take 24 hours to process, as it exceeds
                                      the Wormhole network&apos;s temporary transaction limit of $
                                      {formatNumber(transactionLimit, 0)} on{" "}
                                      {getChainName({
                                        chainId: fromChain,
                                        network: currentNetwork,
                                      })}{" "}
                                      for security reasons. <LearnMoreLink /> about this temporary
                                      security measure.
                                    </div>
                                  </div>
                                ) : isDailyLimitExceeded && currentNetwork === "Mainnet" ? (
                                  <div>
                                    <h5>DAILY LIMIT EXCEEDED</h5>
                                    <div>
                                      This transaction will take up to 24 hours to process as
                                      Wormhole has reached the daily limit for source Blockchain{" "}
                                      {getChainName({
                                        chainId: fromChain,
                                        network: currentNetwork,
                                      })}
                                      . This is a normal and temporary security feature by the
                                      Wormhole network. <LearnMoreLink /> about this security
                                      measure.
                                    </div>
                                  </div>
                                ) : (
                                  isLatestBlockHigherThanVaaEmitBlock && (
                                    <div>
                                      Since the latest block number is higher than this
                                      transaction&apos;s, there might be an extra delay. You can
                                      contact support on <DiscordSupportLink />.
                                    </div>
                                  )
                                )}
                              </>
                            )
                          ) : (
                            "This VAA comes from another multiverse, we don't have more details about it."
                          )}
                        </div>
                      }
                      className="tx-overview-section-info-alert-tooltip"
                      side="bottom"
                    >
                      <div className="tx-overview-section-info-alert-tooltip-icon">
                        <InfoCircleIcon />
                      </div>
                    </Tooltip>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="tx-overview-section">
        <h4 className="tx-overview-section-title">
          <Tooltip
            type="info"
            tooltip={
              <div className="tx-overview-section-info-tooltip-content">
                <p>
                  Tx Hash is a unique transaction identifier and could contain more than one VAA.
                </p>
              </div>
            }
            className="tx-overview-section-info-tooltip"
          >
            <span>Source Tx Hash</span>
          </Tooltip>
        </h4>

        <div className="tx-overview-section-info" ref={lineValueRef}>
          <div className="tx-overview-section-info-container">
            <div className="text">
              {emitterChainId === chainToChainId("Wormchain") && !gatewayInfo?.originTxHash ? (
                <TruncateText containerWidth={lineValueWidth} text={parseTxHash} />
              ) : (
                <a
                  href={getExplorerLink({
                    network: currentNetwork,
                    chainId: gatewayInfo?.originChainId || emitterChainId,
                    value: gatewayInfo?.originTxHash || parseTxHash,
                    isNativeAddress: true,
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <TruncateText
                    containerWidth={lineValueWidth}
                    text={gatewayInfo?.originTxHash || parseTxHash}
                  />
                </a>
              )}
              <CopyToClipboard toCopy={gatewayInfo?.originTxHash || parseTxHash}>
                <CopyIcon width={24} />
              </CopyToClipboard>
            </div>
          </div>
        </div>
      </div>

      {gatewayInfo?.originTxHash && (
        <div className="tx-overview-section">
          <h4 className="tx-overview-section-title">
            <Tooltip
              type="info"
              tooltip={
                <div className="tx-overview-section-info-tooltip-content">
                  <p>
                    Transaction hash from Gateway, a Wormhole Cosmos chain that bridges Ethereum to
                    Cosmos via the Guardian network.
                  </p>
                </div>
              }
            >
              <span>Gateway Tx Hash</span>
            </Tooltip>
          </h4>

          <div className="tx-overview-section-info">
            <div className="tx-overview-section-info-container">
              <div className="text">
                <a
                  href={`${BIGDIPPER_TRANSACTIONS}/${
                    parseTxHashUpperCase.startsWith("0X")
                      ? parseTxHashUpperCase.substring(2)
                      : parseTxHashUpperCase
                  }`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <TruncateText containerWidth={lineValueWidth} text={parseTxHashUpperCase} />
                </a>
                <CopyToClipboard toCopy={parseTxHashUpperCase}>
                  <CopyIcon width={24} />
                </CopyToClipboard>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="tx-overview-section">
        <h4 className="tx-overview-section-title">
          <Tooltip
            type="info"
            tooltip={
              <div className="tx-overview-section-info-tooltip-content">
                <p>Protocols used to facilitate the cross-chain transfer.</p>
              </div>
            }
            className="tx-overview-section-info-tooltip"
          >
            <span>Protocols</span>
          </Tooltip>
        </h4>
        <div className="tx-overview-section-info">
          <div className="tx-overview-section-info-container protocols">
            {appIds?.length > 0 ? (
              filterAppIds(appIds).map((appId, i) => (
                <div className="text" key={i}>
                  <ProtocolIcon protocol={appId} width={24} />
                  {formatAppId(appId)}
                </div>
              ))
            ) : (
              <div className="text">N/A</div>
            )}
          </div>
        </div>

        {deliveryParsedSenderAddress && (
          <>
            <h4 className="tx-overview-section-title">
              <Tooltip
                type="info"
                tooltip={
                  <div className="tx-overview-section-info-tooltip-content">
                    <p>Contract address of the source app.</p>
                  </div>
                }
                className="tx-overview-section-info-tooltip"
              >
                <span>Source App Contract</span>
              </Tooltip>
            </h4>
            <div className="tx-overview-section-info">
              <div className="tx-overview-section-info-container">
                <div className="text">
                  <a
                    href={getExplorerLink({
                      network: currentNetwork,
                      chainId: fromChain,
                      value: deliveryParsedSenderAddress,
                      base: "address",
                      isNativeAddress: true,
                    })}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <TruncateText
                      containerWidth={lineValueWidth}
                      text={deliveryParsedSenderAddress.toUpperCase()}
                    />
                  </a>
                  <CopyToClipboard toCopy={deliveryParsedSenderAddress}>
                    <CopyIcon />
                  </CopyToClipboard>
                  {ARKHAM_CHAIN_NAME[fromChain as ChainId] &&
                    addressesInfo?.[deliveryParsedSenderAddress.toLowerCase()] && (
                      <AddressInfoTooltip
                        info={addressesInfo[deliveryParsedSenderAddress.toLowerCase()]}
                        chain={fromChain}
                      />
                    )}
                </div>
              </div>
            </div>
          </>
        )}

        <h4 className="tx-overview-section-title">
          <Tooltip
            type="info"
            tooltip={
              <div className="tx-overview-section-info-tooltip-content">
                <p>Smart contract address used on the source chain.</p>
              </div>
            }
            className="tx-overview-section-info-tooltip"
          >
            <span>Contract Address</span>
          </Tooltip>
        </h4>
        <div className="tx-overview-section-info">
          <div className="tx-overview-section-info-container">
            <div className="text">
              {parsedEmitterAddress ? (
                <>
                  {/* delete conditional when WORMCHAIN gets an explorer */}
                  {fromChainOrig === chainToChainId("Wormchain") ? (
                    <div>
                      <span>
                        <TruncateText
                          containerWidth={lineValueWidth}
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
                        extraWidth={isGatewaySource ? 120 : 80}
                        text={parsedEmitterAddress.toUpperCase()}
                      />
                    </a>
                  )}
                  <CopyToClipboard toCopy={parsedEmitterAddress}>
                    <CopyIcon width={24} />
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
        </div>
      </div>

      {txType[payloadType] && (
        <div className="tx-overview-section">
          <h4 className="tx-overview-section-title">
            <Tooltip
              type="info"
              tooltip={
                <div className="tx-overview-section-info-tooltip-content">
                  <p>The type of transaction</p>
                </div>
              }
            >
              <span>Transaction Action</span>
            </Tooltip>
          </h4>

          <div className="tx-overview-section-info">
            <div className="tx-overview-section-info-container">
              <div className="text">{txType[payloadType]}</div>
            </div>
          </div>
        </div>
      )}

      {nftInfo && (
        <div className="tx-overview-section start nft-section">
          <h4 className="tx-overview-section-title">Transferred NFT</h4>

          <div className="tx-overview-section-info">
            <div
              className={`nft-container ${showDetailsNft ? "" : "hide"} ${
                nftInfo.image ? "" : "no-image"
              }`}
            >
              <>
                <div className="nft-container-top">
                  <div className="nft-container-top-title">{nftInfo.name}</div>
                  <button
                    className={showDetailsNft ? "show" : ""}
                    onClick={() => setShowDetailsNft(!showDetailsNft)}
                  >
                    <p className="desktop">{showDetailsNft ? "Hide details" : "Show details"}</p>
                    <ChevronDownIcon />
                  </button>
                </div>

                {nftInfo.image && (
                  <div className="nft-container-mid">
                    <img className="nft-container-mid-image" src={nftInfo.image} />
                    <a
                      className="nft-container-mid-link"
                      href={nftInfo.image}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Show on {extractPageName(nftInfo.image)} <LinkIcon />
                    </a>
                  </div>
                )}

                <div className="nft-container-bottom">
                  <div className="nft-container-bottom-div">
                    <div className="nft-container-bottom-div-data data-owned">
                      <div className="nft-container-bottom-div-data-head">Owned by</div>
                      <div className="nft-container-bottom-div-data-owned">
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
                              {shortAddress(parsedOriginAddress.toUpperCase())}
                            </a>
                            <CopyToClipboard toCopy={parsedOriginAddress}>
                              <CopyIcon width={24} />
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

                    <div className="nft-container-bottom-div-data">
                      <div className="nft-container-bottom-div-data-head">Collection name</div>
                      <a href={nftInfo.external_url} target="_blank" rel="noopener noreferrer">
                        {nftInfo.name}
                      </a>
                    </div>
                  </div>

                  {nftInfo.description && (
                    <div className="nft-container-bottom-div">
                      <div className="nft-container-bottom-div-data">
                        <div className="nft-container-bottom-div-data-head">Description</div>
                        <div className="nft-container-bottom-div-data-description">
                          {nftInfo.description}
                        </div>
                      </div>
                    </div>
                  )}

                  {nftInfo?.attributes?.length > 0 && (
                    <div className="nft-container-bottom-div">
                      <div className="nft-container-bottom-div-data">
                        <div className="nft-container-bottom-div-data-head">Attributes</div>
                        <div className="nft-container-bottom-div-data-attributes">
                          {nftInfo.attributes.map((attr, i) => (
                            <div className="nft-container-bottom-div-data-attributes-item" key={i}>
                              <div className="nft-container-bottom-div-data-attributes-item-type">
                                {attr.trait_type}
                              </div>
                              <div className="nft-container-bottom-div-data-attributes-item-value">
                                {attr.value}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            </div>
          </div>
        </div>
      )}

      <div className="tx-overview-section">
        <h4 className="tx-overview-section-title">
          <Tooltip
            type="info"
            tooltip={
              <div className="tx-overview-section-info-tooltip-content">
                <p>Chains involved in the transaction.</p>
              </div>
            }
            className="tx-overview-section-info-tooltip"
          >
            <span>Chains</span>
          </Tooltip>
        </h4>

        <div className="tx-overview-section-info">
          <div className="tx-overview-section-info-container">
            <div className="tx-overview-section-info-container-item">
              <BlockchainIcon chainId={fromChain} network={currentNetwork} />
              <div className="text">
                {getChainName({ chainId: fromChain, network: currentNetwork })}
              </div>
            </div>

            {!!toChain && (
              <>
                <div className="tx-overview-section-info-container-arrow">
                  <ArrowRightIcon width={24} />
                </div>

                <div className="tx-overview-section-info-container-item">
                  <BlockchainIcon chainId={toChain} network={currentNetwork} />
                  <div className="text">
                    {getChainName({ chainId: toChain, network: currentNetwork })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="tx-overview-section start details-section">
        <h4 className="tx-overview-section-title">Details</h4>

        <div className="tx-overview-section-info details-info">
          {!isJustGenericRelayer && !isMayanOnly && !nftInfo && (
            <div className="tx-overview-section-info-container">
              <div className="tx-overview-section-info-container-key">
                {isAttestation ? "TOKEN" : "SENT"}
              </div>

              <div className="tx-overview-section-info-container-value">
                <div className="text">
                  {tokenAmount ? (
                    <>
                      {!isAttestation ? amountSent : ""}{" "}
                      {SOURCE_SYMBOL ? (
                        <>
                          {sourceTokenLink ? (
                            <a href={sourceTokenLink} target="_blank" rel="noopener noreferrer">
                              {SOURCE_SYMBOL}
                            </a>
                          ) : (
                            <span>{SOURCE_SYMBOL}</span>
                          )}
                          <span>{amountSentUSD && `($${amountSentUSD})`}</span>
                        </>
                      ) : (
                        "N/A"
                      )}
                    </>
                  ) : (
                    <>
                      N/A
                      {SOURCE_SYMBOL &&
                        (sourceTokenLink ? (
                          <a href={sourceTokenLink} target="_blank" rel="noopener noreferrer">
                            {SOURCE_SYMBOL}
                          </a>
                        ) : (
                          <span>{SOURCE_SYMBOL}</span>
                        ))}
                    </>
                  )}
                </div>

                {sourceTokenInfo?.tokenImage && sourceTokenInfo.tokenImage !== "missing.png" ? (
                  <div className="token-image">
                    <img src={sourceTokenInfo.tokenImage} height={22} width={22} />
                  </div>
                ) : getTokenIcon(SOURCE_SYMBOL, true) ? (
                  <div className="token-image">
                    <img src={getTokenIcon(SOURCE_SYMBOL)} height={22} width={22} />
                  </div>
                ) : (
                  <div className="token-image">
                    <BlockchainIcon
                      chainId={sourceTokenChain ? sourceTokenChain : 0}
                      network={currentNetwork}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
          {!isJustGenericRelayer && nftInfo && (
            <div className="tx-overview-section-info-container">
              <div className="tx-overview-section-info-container-key">SENT</div>

              <div className="text">
                {nftInfo.image && <img src={nftInfo.image} height={24} width={24} />}
                {nftInfo.name}
              </div>
            </div>
          )}

          <div className="tx-overview-section-info-container">
            <div className="tx-overview-section-info-container-key">FROM</div>

            <div className="tx-overview-section-info-container-value">
              <div className="text">
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
                      <div className="desktop">
                        {shortAddress(parsedOriginAddress.toUpperCase())}
                      </div>
                      <div className="mobile">
                        <TruncateText
                          containerWidth={lineValueWidth}
                          text={parsedOriginAddress.toUpperCase()}
                        />
                      </div>
                    </a>
                    <CopyToClipboard toCopy={parsedOriginAddress}>
                      <CopyIcon width={24} />
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

          {!isJustGenericRelayer && !nftInfo && sourceFee && (
            <div className="tx-overview-section-info-container span2">
              <div className="tx-overview-section-info-container-key">SOURCE GAS FEE</div>

              <div className="tx-overview-section-info-container-value">
                <div className="text">
                  {formatNumber(+sourceFee)}{" "}
                  {currentNetwork === "Testnet"
                    ? testnetNativeCurrencies[chainIdToChain(fromChain)]
                    : mainnetNativeCurrencies[chainIdToChain(fromChain)]}
                  {sourceFeeUSD && <span>(${formatNumber(+sourceFeeUSD)})</span>}
                  <img
                    src={getTokenIcon(
                      currentNetwork === "Testnet"
                        ? testnetNativeCurrencies[chainIdToChain(fromChain)]
                        : mainnetNativeCurrencies[chainIdToChain(fromChain)],
                    )}
                    height={22}
                    width={22}
                  />
                </div>
              </div>
            </div>
          )}

          {!isJustGenericRelayer && !isMayanOnly && !nftInfo && (
            <div className="tx-overview-section-info-container">
              <div className="tx-overview-section-info-container-key">RECEIVED</div>

              <div className="tx-overview-section-info-container-value">
                <div className="text">
                  {Number(fee) ? (
                    <>
                      {!isAttestation ? redeemedAmount : ""}{" "}
                      {TARGET_SYMBOL &&
                        (targetTokenLink ? (
                          <a href={targetTokenLink} target="_blank" rel="noopener noreferrer">
                            {TARGET_SYMBOL}
                          </a>
                        ) : (
                          <span>{TARGET_SYMBOL}</span>
                        ))}
                    </>
                  ) : tokenAmount ? (
                    <>
                      {!isAttestation ? amountSent : ""}{" "}
                      {TARGET_SYMBOL ? (
                        <>
                          {targetTokenLink ? (
                            <a href={targetTokenLink} target="_blank" rel="noopener noreferrer">
                              {TARGET_SYMBOL}
                            </a>
                          ) : (
                            <span>{TARGET_SYMBOL}</span>
                          )}
                          <span>{amountSentUSD && `($${amountSentUSD})`}</span>
                        </>
                      ) : (
                        "N/A"
                      )}
                    </>
                  ) : (
                    <>
                      N/A
                      {TARGET_SYMBOL &&
                        (targetTokenLink ? (
                          <a href={targetTokenLink} target="_blank" rel="noopener noreferrer">
                            {TARGET_SYMBOL}
                          </a>
                        ) : (
                          <span>{TARGET_SYMBOL}</span>
                        ))}
                    </>
                  )}

                  {targetTokenInfo?.tokenImage && targetTokenInfo.tokenImage !== "missing.png" ? (
                    <div className="token-image">
                      <img src={targetTokenInfo.tokenImage} height={22} width={22} />
                    </div>
                  ) : getTokenIcon(TARGET_SYMBOL, true) ? (
                    <div className="token-image">
                      <img src={getTokenIcon(TARGET_SYMBOL)} height={22} width={22} />
                    </div>
                  ) : (
                    <div className="token-image">
                      <BlockchainIcon chainId={toChain ? toChain : 0} network={currentNetwork} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          {!isJustGenericRelayer && nftInfo && (
            <div className="tx-overview-section-info-container">
              <div className="tx-overview-section-info-container-key">RECEIVED</div>

              <div className="tx-overview-section-info-container-value">
                <div className="text">
                  <div className="text">
                    {nftInfo.image && <img src={nftInfo.image} height={24} width={24} />}
                    {nftInfo.name}
                  </div>
                </div>
              </div>
            </div>
          )}

          {!!showMetaMaskBtn && (
            <div className="tx-overview-section-info-container span2 metamask-mobile">
              <AddToMetaMaskBtn
                className="add-to-metamask-btn"
                currentNetwork={currentNetwork}
                toChain={toChain as ChainId}
                targetTokenInfo={targetTokenInfo}
                isPortico={appIds.includes(ETH_BRIDGE_APP_ID)}
              />
            </div>
          )}

          <div className="tx-overview-section-info-container">
            <div className="tx-overview-section-info-container-key">TO</div>

            <div className="tx-overview-section-info-container-value">
              <div className="text">
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
                      <div className="desktop">
                        {shortAddress(parsedDestinationAddress.toLocaleUpperCase())}
                      </div>
                      <div className="mobile">
                        <TruncateText
                          containerWidth={lineValueWidth}
                          text={parsedDestinationAddress.toLocaleUpperCase()}
                        />
                      </div>
                    </a>
                    <CopyToClipboard toCopy={parsedDestinationAddress}>
                      <CopyIcon width={24} />
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
                        Address shown corresponds to a Smart Contract handling the transaction.
                        Funds will be sent to your recipient address.
                      </div>
                    }
                    type="info"
                  >
                    <div>
                      <InfoCircleIcon />
                    </div>
                  </Tooltip>
                )}
              </div>
            </div>
          </div>

          {!!showMetaMaskBtn && (
            <div className="tx-overview-section-info-container span2 metamask-desktop">
              <AddToMetaMaskBtn
                className="add-to-metamask-btn"
                currentNetwork={currentNetwork}
                toChain={toChain as ChainId}
                targetTokenInfo={targetTokenInfo}
                isPortico={appIds.includes(ETH_BRIDGE_APP_ID)}
              />
            </div>
          )}

          {!isJustGenericRelayer && !nftInfo && targetFee && (
            <div className="tx-overview-section-info-container span2">
              <div className="tx-overview-section-info-container-key">TARGET GAS FEE</div>

              <div className="tx-overview-section-info-container-value">
                <div className="text">
                  {formatNumber(+targetFee)}{" "}
                  {currentNetwork === "Testnet"
                    ? testnetNativeCurrencies[chainIdToChain(toChain)]
                    : mainnetNativeCurrencies[chainIdToChain(toChain)]}
                  {targetFeeUSD && <span>(${formatNumber(+targetFeeUSD)})</span>}
                  <img
                    src={getTokenIcon(
                      currentNetwork === "Testnet"
                        ? testnetNativeCurrencies[chainIdToChain(toChain)]
                        : mainnetNativeCurrencies[chainIdToChain(toChain)],
                    )}
                    height={22}
                    width={22}
                  />
                </div>
              </div>
            </div>
          )}

          {isDelivery && deliveryParsedRefundAddress !== deliveryParsedTargetAddress && (
            <>
              <div className="tx-overview-section-info-container span2">
                <div className="tx-overview-section-info-container-key">REFUND ADDRESS</div>

                <div className="tx-overview-section-info-container-value">
                  <div className="text">
                    <a
                      href={getExplorerLink({
                        network: currentNetwork,
                        chainId: deliveryInstruction.refundChainId,
                        value: deliveryParsedRefundAddress,
                        base: "address",
                        isNativeAddress: true,
                      })}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <TruncateText
                        containerWidth={lineValueWidth}
                        extraWidth={180}
                        text={deliveryParsedRefundAddress.toUpperCase()}
                      />
                    </a>
                    <CopyToClipboard toCopy={deliveryParsedRefundAddress}>
                      <CopyIcon />
                    </CopyToClipboard>
                    {addressesInfo?.[deliveryParsedRefundAddress.toLowerCase()] && (
                      <AddressInfoTooltip
                        info={addressesInfo[deliveryParsedRefundAddress.toLowerCase()]}
                        chain={deliveryInstruction.refundChainId}
                      />
                    )}
                  </div>
                </div>
              </div>
              {deliveryParsedRefundProviderAddress.toLowerCase() !==
                testnetDefaultDeliveryProviderContractAddress.toLowerCase() &&
                deliveryParsedRefundProviderAddress.toLowerCase() !==
                  mainnetDefaultDeliveryProviderContractAddress.toLowerCase() && (
                  <div className="tx-overview-section-info-container span2">
                    <div className="tx-overview-section-info-container-key">REFUND PROVIDER</div>

                    <div className="tx-overview-section-info-container-value">
                      <div className="text">
                        <a
                          href={getExplorerLink({
                            network: currentNetwork,
                            chainId: deliveryInstruction.refundChainId,
                            value: deliveryParsedRefundProviderAddress,
                            base: "address",
                            isNativeAddress: true,
                          })}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <TruncateText
                            containerWidth={lineValueWidth}
                            extraWidth={180}
                            text={deliveryParsedRefundProviderAddress.toUpperCase()}
                          />
                        </a>

                        <CopyToClipboard toCopy={deliveryParsedRefundProviderAddress}>
                          <CopyIcon />
                        </CopyToClipboard>
                      </div>
                    </div>
                  </div>
                )}
            </>
          )}

          {isDelivery && (
            <div className="tx-overview-section-info-container span2">
              <div className="tx-overview-section-info-container-key">DELIVERY PROVIDER</div>

              <div className="tx-overview-section-info-container-value">
                <div className="text">
                  <a
                    href={getExplorerLink({
                      network: currentNetwork,
                      chainId: deliveryInstruction.targetChainId,
                      value: deliveryParsedSourceProviderAddress,
                      base: "address",
                      isNativeAddress: true,
                    })}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {deliveryParsedSourceProviderAddress.toLowerCase() ===
                      testnetDefaultDeliveryProviderContractAddress.toLowerCase() ||
                    deliveryParsedSourceProviderAddress.toLowerCase() ===
                      mainnetDefaultDeliveryProviderContractAddress.toLowerCase() ? (
                      "xLabs"
                    ) : (
                      <TruncateText
                        containerWidth={lineValueWidth}
                        extraWidth={200}
                        text={deliveryParsedSourceProviderAddress.toUpperCase()}
                      />
                    )}
                  </a>
                  <CopyToClipboard toCopy={deliveryParsedSourceProviderAddress}>
                    <CopyIcon />
                  </CopyToClipboard>
                  {addressesInfo?.[deliveryParsedSourceProviderAddress.toLowerCase()] && (
                    <AddressInfoTooltip
                      info={addressesInfo[deliveryParsedSourceProviderAddress.toLowerCase()]}
                      chain={deliveryInstruction.targetChainId}
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {+fee > 0 && (
        <>
          <div className="tx-overview-section">
            <h4 className="tx-overview-section-title">
              <Tooltip
                type="info"
                tooltip={
                  <div>
                    <p>The fee paid to the relayer for processing the transaction.</p>
                  </div>
                }
              >
                <span>Transaction Fee</span>
              </Tooltip>
            </h4>
            <div className="tx-overview-section-info">
              <div className="tx-overview-section-info-container">
                <div className="text">
                  {formatNumber(formatUnits(+fee))} {SOURCE_SYMBOL}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {decodeExecution && (
        <div className="tx-overview-section">
          <h4 className="tx-overview-section-title">Budget</h4>

          <div className="tx-overview-section-info">
            <div className="tx-overview-section-info-container">
              <div className="text">
                <Tooltip
                  maxWidth={false}
                  type="info"
                  tooltip={
                    <div className="budget-tooltip">
                      <div className="budget-tooltip-title">
                        Max Refund: <span>{maxRefundText()}</span>
                      </div>

                      {decodeExecution && gasUsedText() && (
                        <div className="budget-tooltip-title">
                          {isNaN(gasUsed) ? "Gas Limit:" : "Gas Used/Gas Limit:"}{" "}
                          <span>{gasUsedText()}</span>
                        </div>
                      )}

                      {!isNaN(gasUsed) && (
                        <div className="budget-tooltip-title">
                          Refund amount: <span>{refundText()}</span>
                        </div>
                      )}

                      <div className="budget-tooltip-title">
                        Receiver Value: {receiverValueText()}
                      </div>
                    </div>
                  }
                >
                  <div className="budget">{budgetText()}</div>
                </Tooltip>
                <CopyToClipboard toCopy={copyBudgetText()}>
                  <CopyIcon />
                </CopyToClipboard>
              </div>
            </div>
          </div>
        </div>
      )}

      {deliveryStatus && (
        <div className="tx-overview-section start details-section">
          <h4 className="tx-overview-section-title">Relay Status</h4>

          <div className="tx-overview-section-info details-info">
            <div className="tx-overview-section-info-container span2">
              <div className="tx-overview-section-info-container-key">STATUS</div>
              <div className="tx-overview-section-info-container-value">
                <div className="text">
                  {" "}
                  {deliveryStatus?.status === "failed" && (
                    <>
                      <div className="red">FAILED</div>
                      {formatDate(deliveryStatus?.failedAt)}
                    </>
                  )}
                  {deliveryStatus?.status === "waiting" && (
                    <>
                      WAITING.. | Attempts:
                      {`${deliveryAttempt}/${deliveryStatus?.data?.maxAttempts}`}
                    </>
                  )}
                  {deliveryStatus?.status !== "failed" && deliveryStatus?.status !== "waiting" && (
                    <div>{resultLog || "We were not able to get the status of your relay."}</div>
                  )}
                </div>
              </div>
            </div>

            {refundStatus && (
              <div className="tx-overview-section-info-container span2">
                <div className="tx-overview-section-info-container-key">MESSAGE</div>
                <div className="tx-overview-section-info-container-value">
                  <div className="text">{refundStatus}</div>
                </div>
              </div>
            )}

            {deliveryStatus?.status && (
              <div className="tx-overview-section-info-container span2">
                <div className="tx-overview-section-info-container-key">TARGET TX HASH</div>

                <div className="tx-overview-section-info-container-value">
                  <div className="text">
                    {deliveryStatus?.status !== "failed" &&
                    deliveryStatus?.status !== "waiting" &&
                    deliveryStatus?.data?.toTxHash ? (
                      <>
                        <a
                          href={getExplorerLink({
                            network: currentNetwork,
                            chainId: deliveryInstruction.targetChainId,
                            value: deliveryStatus?.data?.toTxHash,
                            isNativeAddress: true,
                          })}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <TruncateText
                            containerWidth={lineValueWidth}
                            extraWidth={150}
                            text={deliveryStatus?.data?.toTxHash?.toUpperCase()}
                          />
                        </a>
                        <CopyToClipboard toCopy={deliveryStatus?.data?.toTxHash}>
                          <CopyIcon />
                        </CopyToClipboard>
                      </>
                    ) : (
                      "N/A"
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="tx-overview-section">
        <h4 className="tx-overview-section-title">
          <Tooltip
            type="info"
            tooltip={
              <div>
                <p>The date and time when the transaction was produced.</p>
              </div>
            }
          >
            <span>Initial Time</span>
          </Tooltip>
        </h4>
        <div className="tx-overview-section-info">
          <div className="tx-overview-section-info-container">
            <div className="text">{originDateParsed ? originDateParsed : "N/A"}</div>
          </div>
        </div>

        <h4 className="tx-overview-section-title">
          <Tooltip
            type="info"
            tooltip={
              <div>
                <p>Number of guardian signatures obtained.</p>
                <p>It’s mandatory to have at least 13 signs for Mainnet.</p>
              </div>
            }
          >
            <span>Signatures</span>
          </Tooltip>
        </h4>
        <div className="tx-overview-section-info">
          <div className="tx-overview-section-info-container">
            <div className="text">
              <a
                onClick={() => {
                  setShowOverview("advanced");
                  setTimeout(() => {
                    const signedVaaElem = document.getElementById(`signatures${txIndex}`);
                    if (signedVaaElem) {
                      signedVaaElem.scrollIntoView({ behavior: "smooth", block: "start" });
                    } else {
                      const extraRawElem = document.getElementById(`signatures2${txIndex}`);
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
        </div>

        <h4 className="tx-overview-section-title">
          <Tooltip
            type="info"
            tooltip={
              <div>
                <p>Identifier for the approval needed to validate the cross-chain transfer.</p>
                <p>This concept is formed by chainId/emitterChain/sequence.</p>
              </div>
            }
          >
            <span>VAA ID</span>
          </Tooltip>
        </h4>
        <div className="tx-overview-section-info">
          <div className="tx-overview-section-info-container">
            <div className="text">
              {VAAId ? (
                <>
                  <TruncateText containerWidth={lineValueWidth} text={VAAId} />
                  <CopyToClipboard toCopy={VAAId}>
                    <CopyIcon width={24} />
                  </CopyToClipboard>
                  {isDuplicated && (
                    <Tooltip tooltip={<div>VAA ID duplicated</div>} type="info">
                      <div>
                        <InfoCircleIcon />
                      </div>
                    </Tooltip>
                  )}
                </>
              ) : (
                "N/A"
              )}
            </div>
          </div>
        </div>

        {parsedRedeemTx && (
          <>
            <h4 className="tx-overview-section-title">
              <Tooltip
                type="info"
                tooltip={
                  <div>
                    <p>
                      Identifier of the transaction on the destination chain to complete the
                      operation.
                    </p>
                  </div>
                }
              >
                <span>Redeem Tx</span>
              </Tooltip>
            </h4>
            <div className="tx-overview-section-info">
              <div className="tx-overview-section-info-container">
                <div className="text">
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
                  </a>
                  <CopyToClipboard toCopy={parsedRedeemTx}>
                    <CopyIcon width={24} />
                  </CopyToClipboard>
                </div>
              </div>
            </div>
          </>
        )}

        {destinationDateParsed && (
          <>
            <h4 className="tx-overview-section-title">
              <Tooltip
                type="info"
                tooltip={
                  <div>
                    <p>
                      The date and time when the transactions is finalized in the Destination Chain.
                    </p>
                  </div>
                }
              >
                <span>Complete Time</span>
              </Tooltip>
            </h4>
            <div className="tx-overview-section-info">
              <div className="tx-overview-section-info-container">
                <div className="text">{destinationDateParsed}</div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Overview;
