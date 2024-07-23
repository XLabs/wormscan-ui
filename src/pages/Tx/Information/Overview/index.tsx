import { AddToMetaMaskBtn, BlockchainIcon, ProtocolIcon, Tooltip } from "src/components/atoms";
import { CopyToClipboard, StatusBadge } from "src/components/molecules";
import { getChainName, getExplorerLink } from "src/utils/wormhole";
import { filterAppIds, formatAppId, formatUnits, parseTx, shortAddress } from "src/utils/crypto";
import { TokenInfo } from "src/utils/metaMaskUtils";
import AddressInfoTooltip from "src/components/molecules/AddressInfoTooltip";
import { useRecoilState } from "recoil";
import { addressesInfoState } from "src/utils/recoilStates";
import { INFTInfo } from "src/api/guardian-network/types";
import {
  CCTP_MANUAL_APP_ID,
  DISCORD_URL,
  IStatus,
  MORE_INFO_GOVERNOR_URL,
  txType,
} from "src/consts";
import {
  ArrowDownIcon,
  ArrowRightIcon,
  CheckCircle2,
  ChevronDownIcon,
  CopyIcon,
  InfoCircleIcon,
  LinkIcon,
} from "src/icons/generic";
import { useLayoutEffect, useRef, useState } from "react";
import { TruncateText } from "src/utils/string";
import { ChainId, Network, chainToChainId } from "@wormhole-foundation/sdk";
import { AutomaticRelayOutput } from "src/api/search/types";
import { formatDate } from "src/utils/date";
import { ARKHAM_CHAIN_NAME } from "src/utils/arkham";
import {
  getChainInfo,
  mainnetDefaultDeliveryProviderContractAddress,
  testnetDefaultDeliveryProviderContractAddress,
} from "src/utils/environment";
import { formatNumber } from "src/utils/number";
import { useEnvironment } from "src/context/EnvironmentContext";
import "./styles.scss";

const BIGDIPPER_TRANSACTIONS = "https://bigdipper.live/wormhole/transactions";

type OverviewProps = {
  amountSent?: string;
  amountSentUSD?: string;
  appIds?: string[];
  budgetText?: () => string;
  copyBudgetText?: () => string;
  currentBlock?: number;
  currentNetwork?: Network;
  decodeExecution?: any;
  deliveryAttempt?: string;
  deliveryInstruction?: any;
  deliveryParsedRefundAddress?: string;
  deliveryParsedRefundProviderAddress?: string;
  deliveryParsedSenderAddress?: string;
  deliveryParsedSourceProviderAddress?: string;
  deliveryParsedTargetAddress?: string;
  deliveryStatus?: AutomaticRelayOutput;
  destinationDateParsed?: string;
  emitterChainId?: ChainId;
  fee?: string;
  fromChain?: ChainId;
  fromChainOrig?: ChainId;
  gasUsed?: number;
  gasUsedText?: () => string;
  gatewayInfo?: {
    originAddress?: string;
    originChainId?: ChainId;
    originTxHash?: string;
  };
  guardianSignaturesCount?: number;
  hasVAA?: boolean;
  isAttestation?: boolean;
  isBigTransaction?: boolean;
  isDailyLimitExceeded?: boolean;
  isDelivery?: boolean;
  isDuplicated?: boolean;
  isGatewaySource?: boolean;
  isGenericRelayerTx?: boolean;
  isLatestBlockHigherThanVaaEmitBlock?: boolean;
  isMayanOnly?: boolean;
  isUnknownApp?: boolean;
  isUnknownPayloadType?: boolean;
  lastFinalizedBlock?: number;
  maxRefundText?: () => string;
  nftInfo?: INFTInfo;
  originDateParsed?: string;
  parsedDestinationAddress?: string;
  parsedEmitterAddress?: string;
  parsedOriginAddress?: string;
  parsedPayload?: any;
  parsedRedeemTx?: string;
  parsedVaa?: any;
  payloadType?: number;
  receiverValueText?: () => string;
  redeemedAmount?: string;
  refundStatus?: string;
  refundText?: () => string;
  resultLog?: string;
  setShowOverview?: (bool: boolean) => void;
  showMetaMaskBtn?: boolean;
  showSignatures?: boolean;
  sourceAddress?: string;
  sourceFee?: string;
  sourceFeeUSD?: string;
  sourceGasTokenNotional?: string;
  sourceSymbol?: string;
  sourceTokenLink?: string;
  sourceTxHash?: string;
  STATUS?: IStatus;
  targetFee?: string;
  targetFeeUSD?: string;
  targetGasTokenNotional?: string;
  targetSymbol?: string;
  targetTokenLink?: string;
  targetTxTimestamp?: number;
  toChain?: ChainId;
  tokenAmount?: string;
  tokenInfo?: TokenInfo;
  totalGuardiansNeeded?: number;
  transactionLimit?: number;
  txHash?: string;
  txIndex?: number;
  VAAId?: string;
};

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
  isGenericRelayerTx,
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
  sourceFeeUSD,
  sourceGasTokenNotional,
  sourceSymbol,
  sourceTokenLink,
  sourceTxHash,
  STATUS,
  targetFee,
  targetFeeUSD,
  targetGasTokenNotional,
  targetSymbol,
  targetTokenLink,
  targetTxTimestamp,
  toChain,
  tokenAmount,
  tokenInfo,
  totalGuardiansNeeded,
  transactionLimit,
  txHash,
  txIndex,
  VAAId,
}: OverviewProps) => {
  const [addressesInfo] = useRecoilState(addressesInfoState);
  const extraWidthGatewaySource = isGatewaySource ? 125 : 30;
  const extraWidthDuplicated = isDuplicated ? 53 : 30;
  const lineValueRef = useRef<HTMLDivElement>(null);
  const [lineValueWidth, setLineValueWidth] = useState<number>(0);

  const [showDetailsNft, setShowDetailsNft] = useState(false);
  const [showProgress, setShowProgress] = useState(false);

  const { environment } = useEnvironment();

  const parseTxHash = parseTx({
    value: txHash,
    chainId: emitterChainId,
  });
  const parseTxHashUpperCase = parseTxHash.toUpperCase();

  const progressRef = useRef<HTMLDivElement>(null);

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

  const ProgressContainer = () => {
    return (
      <div className="progress-container">
        <button
          className={`progress-title ${showProgress ? "active" : ""}`}
          onClick={() => setShowProgress(!showProgress)}
        >
          TRANSACTION PROGRESS <ChevronDownIcon />
        </button>

        {showProgress && (
          <>
            <div className="progress-item">
              <div className="progress-icon">
                <CheckCircle2 />
              </div>

              <div className="progress-text">
                <p>
                  {!isGenericRelayerTx && !isMayanOnly && !nftInfo && (
                    <>
                      Transfer{" "}
                      {tokenAmount && (
                        <>
                          {!isAttestation ? amountSent : ""}{" "}
                          {sourceSymbol && (
                            <>
                              {sourceSymbol} {amountSentUSD && `($${amountSentUSD})`}
                            </>
                          )}
                        </>
                      )}
                    </>
                  )}{" "}
                  {!isGenericRelayerTx && !isMayanOnly && !nftInfo ? "from" : "From"}{" "}
                  {getChainName({ chainId: fromChain, network: currentNetwork })}{" "}
                  {!!toChain &&
                    ` to ${getChainName({ chainId: toChain, network: currentNetwork })}`}
                </p>

                <span>{originDateParsed}</span>
              </div>
            </div>

            {!isGenericRelayerTx && STATUS === "IN_GOVERNORS" && (
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

            {!isGenericRelayerTx && (
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
        )}
      </div>
    );
  };

  return (
    <div className="tx-overview">
      <div className="tx-overview-section">
        <h4 className="tx-overview-section-title">Status</h4>

        <div className="tx-overview-section-info">
          <div className="tx-overview-section-info-container">
            <div className="text">
              <StatusBadge STATUS={STATUS} />

              <button
                className="tx-overview-section-info-steps"
                onClick={() => {
                  setShowProgress(true);
                  progressRef.current?.scrollIntoView({ behavior: "smooth" });
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
                  ? isGenericRelayerTx
                    ? "3"
                    : "4"
                  : "5"}
                /{STATUS === "IN_GOVERNORS" ? "5" : isGenericRelayerTx ? "3" : "4"}
                <p className="desktop">Steps Complete</p> <ArrowDownIcon width={24} />
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
                                    {getChainName({ chainId: fromChain, network: currentNetwork })}{" "}
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
                                    {getChainName({ chainId: fromChain, network: currentNetwork })}{" "}
                                    for security reasons. <LearnMoreLink /> about this temporary
                                    security measure.
                                  </div>
                                </div>
                              ) : isDailyLimitExceeded && currentNetwork === "Mainnet" ? (
                                <div>
                                  <h5>DAILY LIMIT EXCEEDED</h5>
                                  <div>
                                    This transaction will take up to 24 hours to process as Wormhole
                                    has reached the daily limit for source Blockchain{" "}
                                    {getChainName({ chainId: fromChain, network: currentNetwork })}.
                                    This is a normal and temporary security feature by the Wormhole
                                    network. <LearnMoreLink /> about this security measure.
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
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="tx-overview-section">
        <h4 className="tx-overview-section-title">Source Tx Hash</h4>

        <div className="tx-overview-section-info">
          <div className="tx-overview-section-info-container">
            <div className="text">
              {emitterChainId === chainToChainId("Wormchain") && !gatewayInfo?.originTxHash ? (
                <TruncateText containerWidth={lineValueWidth} extraWidth={100} text={parseTxHash} />
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
                    extraWidth={100}
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
          <h4 className="tx-overview-section-title">Gateway Tx Hash</h4>

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
                  {parseTxHashUpperCase}
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
        <h4 className="tx-overview-section-title">Protocols</h4>
        <div className="tx-overview-section-info">
          <div className="tx-overview-section-info-container protocols">
            {appIds?.length > 0 ? (
              filterAppIds(appIds).map((appId, i) => (
                <div className="text" key={i}>
                  <ProtocolIcon protocolName={appId} width={24} />
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
            <h4 className="tx-overview-section-title">Source App Contract</h4>
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
                      extraWidth={100}
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

        <h4 className="tx-overview-section-title">Contract Address</h4>
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
                          extraWidth={100}
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
                        extraWidth={100}
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

      <div className="tx-overview-section">
        <h4 className="tx-overview-section-title">Type</h4>

        <div className="tx-overview-section-info">
          <div className="tx-overview-section-info-container">
            <div className="text">{txType[payloadType] ? txType[payloadType] : "N/A"}</div>
          </div>
        </div>
      </div>

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
        <h4 className="tx-overview-section-title">Chains</h4>

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
          {!isGenericRelayerTx && !isMayanOnly && !nftInfo && (
            <div className="tx-overview-section-info-container">
              <div className="tx-overview-section-info-container-key">
                {isAttestation ? "Token" : "SENT"}
              </div>

              <div className="tx-overview-section-info-container-value">
                <div className="text">
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
                          <span>{amountSentUSD && `($${amountSentUSD})`}</span>
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
          )}
          {!isGenericRelayerTx && nftInfo && (
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
          </div>

          {!isGenericRelayerTx && !nftInfo && sourceGasTokenNotional && (
            <div className="tx-overview-section-info-container span2">
              <div className="tx-overview-section-info-container-key">GAS FEE</div>

              <div className="tx-overview-section-info-container-value">
                <div className="text">
                  {sourceFee} {getChainInfo(environment, fromChain)?.nativeCurrencyName}
                  {sourceFeeUSD && <span>(${formatNumber(+sourceFeeUSD)})</span>}
                </div>
              </div>
            </div>
          )}

          {!isGenericRelayerTx && !isMayanOnly && !nftInfo && (
            <div className="tx-overview-section-info-container">
              <div className="tx-overview-section-info-container-key">RECEIVED</div>

              <div className="tx-overview-section-info-container-value">
                <div className="text">
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
                          <span>{amountSentUSD && `($${amountSentUSD})`}</span>
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
          )}
          {!isGenericRelayerTx && nftInfo && (
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
                      {shortAddress(parsedDestinationAddress.toLocaleUpperCase())}
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

          {!isGenericRelayerTx && !nftInfo && targetGasTokenNotional && (
            <div className="tx-overview-section-info-container span2">
              <div className="tx-overview-section-info-container-key">GAS FEE</div>

              <div className="tx-overview-section-info-container-value">
                <div className="text">
                  {targetFee}
                  {targetFeeUSD && <span>(${formatNumber(+targetFeeUSD)})</span>}
                </div>
              </div>
            </div>
          )}

          {isDelivery && deliveryParsedRefundAddress !== deliveryParsedTargetAddress && (
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
        <div className="tx-overview-section">
          <h4 className="tx-overview-section-title">Gas Fee</h4>

          <div className="tx-overview-section-info">
            <div className="tx-overview-section-info-container">
              <div className="text">
                {formatUnits(+fee)} {sourceSymbol}
              </div>
            </div>
          </div>
        </div>
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
        <h4 className="tx-overview-section-title">Time</h4>
        <div className="tx-overview-section-info" ref={lineValueRef}>
          <div className="tx-overview-section-info-container">
            <div className="text">{originDateParsed ? originDateParsed : "N/A"}</div>
          </div>
        </div>

        <h4 className="tx-overview-section-title">Signatures</h4>
        <div className="tx-overview-section-info">
          <div className="tx-overview-section-info-container">
            <div className="text">
              <a
                onClick={() => {
                  setShowOverview(false);
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

        <h4 className="tx-overview-section-title">VAA ID</h4>
        <div className="tx-overview-section-info">
          <div className="tx-overview-section-info-container">
            <div className="text">
              {VAAId ? (
                <>
                  <TruncateText
                    containerWidth={lineValueWidth}
                    extraWidth={extraWidthDuplicated}
                    text={VAAId}
                  />
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
            <h4 className="tx-overview-section-title">Redeem Tx</h4>
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
      </div>

      <div className="tx-overview-section progress-section">
        <h4 className="tx-overview-section-title">
          <div className="progress-ref" ref={progressRef} />
          Progress
        </h4>

        <div className="tx-overview-section-info">
          <ProgressContainer />
        </div>
      </div>
    </div>
  );
};

export default Overview;

const extractPageName = (url: string) => {
  const domain = url.split("//")[1].split("/")[0];
  const parts = domain.split(".");
  if (parts.length > 2) {
    return parts.slice(1, -1).join(".");
  } else {
    return parts[0];
  }
};

const DiscordSupportLink = () => (
  <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer">
    Discord
  </a>
);

const LearnMoreLink = () => (
  <a href={MORE_INFO_GOVERNOR_URL} target="_blank" rel="noopener noreferrer">
    Learn more
  </a>
);
