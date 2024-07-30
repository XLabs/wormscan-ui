import { ArrowRightIcon, CopyIcon, ExternalLinkIcon, InfoCircledIcon } from "@radix-ui/react-icons";
import { BlockchainIcon, NavLink, Tooltip } from "src/components/atoms";
import { CopyToClipboard } from "src/components/molecules";
import RelayIcon from "src/icons/relayIcon.svg";
import { getChainName, getExplorerLink } from "src/utils/wormhole";
import { shortAddress, shortVaaId } from "src/utils/crypto";
import {
  mainnetDefaultDeliveryProviderContractAddress,
  testnetDefaultDeliveryProviderContractAddress,
} from "src/utils/environment";
import { formatDate } from "src/utils/date";
import "../styles.scss";
import { AutomaticRelayOutput } from "src/api/search/types";
import { addressesInfoState } from "src/utils/recoilStates";
import AddressInfoTooltip from "src/components/molecules/AddressInfoTooltip";
import { ARKHAM_CHAIN_NAME } from "src/utils/arkham";
import { ChainId } from "src/api";
import { RelayerOverviewProps } from "src/utils/genericRelayerVaaUtils";
import { useRecoilState } from "recoil";
import { CHAIN_ID_GATEWAY } from "@certusone/wormhole-sdk";
import { RedeliveryInstruction } from "@certusone/wormhole-sdk/lib/cjs/relayer";

const RelayerOverview = ({
  budgetText,
  copyBudgetText,
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
  fromChain,
  gasUsed,
  gasUsedText,
  guardianSignaturesCount,
  isDelivery,
  isDuplicated,
  maxRefundText,
  parsedEmitterAddress,
  parsedVaa,
  receiverValueText,
  refundStatus,
  refundText,
  resultLog,
  sourceAddress,
  sourceTxHash,
  targetTxTimestamp,
  totalGuardiansNeeded,
  VAAId,
}: RelayerOverviewProps) => {
  const [addressesInfo] = useRecoilState(addressesInfoState);

  const renderDeliveryStatus = (deliveryStatus: AutomaticRelayOutput) => {
    return (
      <div className={`tx-overview-graph-step-data-container`}>
        <div>
          <div className="tx-overview-graph-step-title">STATUS</div>
          <div
            className={`tx-overview-graph-step-description ${
              resultLog === "Delivery Success"
                ? "green"
                : resultLog === "Receiver Failure"
                ? "red"
                : "white"
            }`}
          >
            {resultLog || "We were not able to get the status of your relay."}
          </div>
          {refundStatus && (
            <div
              className={`tx-overview-graph-step-description ${
                refundStatus === "Refund Sent"
                  ? "green"
                  : refundStatus === "Refund Fail"
                  ? "red"
                  : "white"
              }`}
            >
              {refundStatus}
            </div>
          )}
        </div>
        {deliveryStatus.data?.toTxHash && (
          <div>
            <div className="tx-overview-graph-step-title">
              <Tooltip
                maxWidth={false}
                tooltip={<div>{formatDate(targetTxTimestamp * 1000)}</div>}
                enableTooltip={!!targetTxTimestamp}
                type="info"
              >
                <span style={{ cursor: targetTxTimestamp ? "pointer" : "default" }}>
                  Target Tx Hash
                </span>
              </Tooltip>
            </div>
            <div className="tx-overview-graph-step-description">
              <Tooltip
                maxWidth={false}
                tooltip={<div>{deliveryStatus.data.toTxHash?.toUpperCase()}</div>}
                type="info"
              >
                <a
                  href={getExplorerLink({
                    network: currentNetwork,
                    chainId: deliveryInstruction.targetChainId,
                    value: deliveryStatus.data.toTxHash,
                    isNativeAddress: true,
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {shortAddress(deliveryStatus.data.toTxHash).toUpperCase()}
                </a>
              </Tooltip>
              <CopyToClipboard toCopy={deliveryStatus.data.toTxHash}>
                <CopyIcon height={20} width={20} />
              </CopyToClipboard>
            </div>
          </div>
        )}
      </div>
    );
  };

  const redeliveryInstruction = deliveryInstruction as unknown as RedeliveryInstruction;

  let originalVAA = "";
  if (!isDelivery && redeliveryInstruction?.deliveryVaaKey?.chainId) {
    originalVAA = `${redeliveryInstruction.deliveryVaaKey.chainId}/${Buffer.from(
      redeliveryInstruction.deliveryVaaKey.emitterAddress,
    ).toString("hex")}/${Number(redeliveryInstruction.deliveryVaaKey.sequence).toString()}`;
  }

  return (
    <div className="tx-overview">
      <div className="tx-overview-graph">
        <div className={`tx-overview-graph-step green source`}>
          <div className="tx-overview-graph-step-name">
            <div>SOURCE</div>
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
            <div>
              <div className="tx-overview-graph-step-title">Source Address</div>
              <div className="tx-overview-graph-step-description">
                <Tooltip
                  maxWidth={false}
                  tooltip={<div>{sourceAddress.toUpperCase()}</div>}
                  type="info"
                >
                  <a
                    href={getExplorerLink({
                      network: currentNetwork,
                      chainId: fromChain,
                      value: sourceAddress,
                      base: "address",
                      isNativeAddress: true,
                    })}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {shortAddress(sourceAddress).toUpperCase()}
                  </a>
                </Tooltip>
                <CopyToClipboard toCopy={sourceAddress}>
                  <CopyIcon height={20} width={20} />
                </CopyToClipboard>
                {ARKHAM_CHAIN_NAME[fromChain as ChainId] &&
                  addressesInfo?.[sourceAddress.toLowerCase()] && (
                    <AddressInfoTooltip
                      info={addressesInfo[sourceAddress.toLowerCase()]}
                      chain={fromChain}
                    />
                  )}
              </div>
            </div>
            <div>
              <div className="tx-overview-graph-step-title">Time</div>
              <div className="tx-overview-graph-step-description">
                {formatDate(parsedVaa.timestamp * 1000)}
              </div>
            </div>
          </div>
        </div>

        <div className={`tx-overview-graph-step green source`}>
          <div className="tx-overview-graph-step-name">
            <div>SOURCE APP CONTRACT</div>
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
            <div>
              <div className="tx-overview-graph-step-title">Sent from</div>
              <div className="tx-overview-graph-step-description">
                <div className="tx-overview-graph-step-description">
                  <Tooltip
                    maxWidth={false}
                    tooltip={<div>{deliveryParsedSenderAddress.toUpperCase()}</div>}
                    type="info"
                  >
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
                      {shortAddress(deliveryParsedSenderAddress).toUpperCase()}
                    </a>
                  </Tooltip>
                  <CopyToClipboard toCopy={deliveryParsedSenderAddress}>
                    <CopyIcon height={20} width={20} />
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
          </div>
        </div>

        <div className="tx-overview-graph-step green">
          <div className="tx-overview-graph-step-name">
            <div>STANDARD RELAYER CONTRACT</div>
          </div>
          <div className="tx-overview-graph-step-iconWrapper">
            {fromChain && (
              <div className="tx-overview-graph-step-iconContainer">
                <BlockchainIcon chainId={CHAIN_ID_GATEWAY} network={currentNetwork} size={32} />
              </div>
            )}
          </div>
          <div className="tx-overview-graph-step-data-container">
            <div>
              <div className="tx-overview-graph-step-title">Contract Address</div>
              <div className="tx-overview-graph-step-description">
                <div className="tx-overview-graph-step-description">
                  <Tooltip
                    maxWidth={false}
                    tooltip={<div>{parsedEmitterAddress.toUpperCase()}</div>}
                    type="info"
                  >
                    <a
                      href={getExplorerLink({
                        network: currentNetwork,
                        chainId: fromChain,
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
                  <CopyToClipboard toCopy={parsedEmitterAddress}>
                    <CopyIcon height={20} width={20} />
                  </CopyToClipboard>
                  {addressesInfo?.[parsedEmitterAddress.toLowerCase()] && (
                    <AddressInfoTooltip
                      info={addressesInfo[parsedEmitterAddress.toLowerCase()]}
                      chain={fromChain}
                    />
                  )}
                </div>
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
                <Tooltip
                  maxWidth={false}
                  tooltip={
                    <div style={{ textAlign: "center" }}>
                      <p>{VAAId}</p>
                      <p>
                        Signatures: {guardianSignaturesCount} / {totalGuardiansNeeded}
                      </p>
                      <p>{formatDate(deliveryStatus?.receivedAt)}</p>
                    </div>
                  }
                  type="info"
                >
                  <p style={{ cursor: "pointer" }}>{shortVaaId(VAAId)}</p>
                </Tooltip>
                <CopyToClipboard toCopy={VAAId}>
                  <CopyIcon height={20} width={20} />
                </CopyToClipboard>
              </div>
            </div>
          </div>
        </div>

        {deliveryParsedRefundAddress !== deliveryParsedTargetAddress && (
          <div className="tx-overview-graph-step green">
            <div className="tx-overview-graph-step-name">
              <div>
                <span>REFUND</span> <span>INSTRUCTIONS</span>
              </div>
            </div>
            <div className="tx-overview-graph-step-iconWrapper">
              <Tooltip
                tooltip={
                  <div>
                    {getChainName({
                      chainId: deliveryInstruction.refundChainId,
                      network: currentNetwork,
                    })}
                  </div>
                }
                type="info"
              >
                <div className="tx-overview-graph-step-iconContainer">
                  <BlockchainIcon
                    chainId={deliveryInstruction.refundChainId}
                    network={currentNetwork}
                    size={32}
                  />
                </div>
              </Tooltip>
            </div>
            <div className="tx-overview-graph-step-data-container">
              <div>
                <div className="tx-overview-graph-step-title">Refund Address</div>
                <div className="tx-overview-graph-step-description">
                  <Tooltip
                    maxWidth={false}
                    tooltip={<div>{deliveryParsedRefundAddress.toUpperCase()}</div>}
                    type="info"
                  >
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
                      {shortAddress(deliveryParsedRefundAddress).toUpperCase()}
                    </a>
                  </Tooltip>
                  <CopyToClipboard toCopy={deliveryParsedRefundAddress}>
                    <CopyIcon height={20} width={20} />
                  </CopyToClipboard>
                  {addressesInfo?.[deliveryParsedRefundAddress.toLowerCase()] && (
                    <AddressInfoTooltip
                      info={addressesInfo[deliveryParsedRefundAddress.toLowerCase()]}
                      chain={deliveryInstruction.refundChainId}
                    />
                  )}
                </div>
              </div>
              {deliveryParsedRefundProviderAddress.toLowerCase() !==
                testnetDefaultDeliveryProviderContractAddress.toLowerCase() &&
                deliveryParsedRefundProviderAddress.toLowerCase() !==
                  mainnetDefaultDeliveryProviderContractAddress.toLowerCase() && (
                  <div>
                    <div className="tx-overview-graph-step-title">Refund Provider</div>
                    <div className="tx-overview-graph-step-description">
                      <Tooltip
                        maxWidth={false}
                        tooltip={<div>{deliveryParsedRefundProviderAddress.toUpperCase()}</div>}
                        type="info"
                      >
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
                          {shortAddress(deliveryParsedRefundProviderAddress).toUpperCase()}
                        </a>
                      </Tooltip>
                      <CopyToClipboard toCopy={deliveryParsedRefundProviderAddress}>
                        <CopyIcon height={20} width={20} />
                      </CopyToClipboard>
                    </div>
                  </div>
                )}
            </div>
          </div>
        )}

        {!isDelivery && deliveryStatus && (
          <div className={`tx-overview-graph-step green source`}>
            <div className="tx-overview-graph-step-name">
              <div>RELAY STATUS</div>
            </div>
            <div className="tx-overview-graph-step-iconWrapper">
              <div className="tx-overview-graph-step-iconContainer">
                <ArrowRightIcon height={24} width={24} />
              </div>
            </div>

            {deliveryStatus.status === "failed" && (
              <div className={`tx-overview-graph-step-data-container`}>
                <div>
                  <div className="tx-overview-graph-step-title">STATUS</div>
                  <div className="tx-overview-graph-step-description red">FAILED</div>
                </div>
                <div>
                  <div className="tx-overview-graph-step-title">Failed at</div>
                  <div className="tx-overview-graph-step-description">
                    {formatDate(deliveryStatus.failedAt)}
                  </div>
                </div>
              </div>
            )}

            {deliveryStatus?.status === "waiting" && (
              <div className={`tx-overview-graph-step-data-container`}>
                <div>
                  <div className="tx-overview-graph-step-title">STATUS</div>
                  <div className="tx-overview-graph-step-description">WAITING..</div>
                </div>
                <div>
                  <div className="tx-overview-graph-step-title">Attempts</div>
                  <div className="tx-overview-graph-step-description">
                    {`${deliveryAttempt}/${deliveryStatus?.data?.maxAttempts}`}
                  </div>
                </div>
              </div>
            )}

            {deliveryStatus.status !== "failed" &&
              deliveryStatus.status !== "waiting" &&
              renderDeliveryStatus(deliveryStatus)}
          </div>
        )}

        {isDelivery && (
          <>
            <div className="tx-overview-graph-step green">
              <div className="tx-overview-graph-step-name">
                <div>DELIVERY INSTRUCTIONS</div>
              </div>
              <div className="tx-overview-graph-step-iconWrapper">
                <Tooltip
                  tooltip={
                    <div>
                      {getChainName({
                        chainId: deliveryInstruction.targetChainId,
                        network: currentNetwork,
                      })}
                    </div>
                  }
                  type="info"
                >
                  <div className="tx-overview-graph-step-iconContainer">
                    <BlockchainIcon
                      chainId={deliveryInstruction.targetChainId}
                      network={currentNetwork}
                      size={32}
                    />
                  </div>
                </Tooltip>
              </div>
              <div className="tx-overview-graph-step-data-container">
                <div>
                  <div className="tx-overview-graph-step-title">Target Address</div>
                  <div className="tx-overview-graph-step-description">
                    <div className="tx-overview-graph-step-description">
                      <Tooltip
                        maxWidth={false}
                        tooltip={<div>{deliveryParsedTargetAddress.toUpperCase()}</div>}
                        type="info"
                      >
                        <a
                          href={getExplorerLink({
                            network: currentNetwork,
                            chainId: deliveryInstruction.targetChainId,
                            value: deliveryParsedTargetAddress,
                            base: "address",
                            isNativeAddress: true,
                          })}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {shortAddress(deliveryParsedTargetAddress).toUpperCase()}
                        </a>
                      </Tooltip>
                      <CopyToClipboard toCopy={deliveryParsedTargetAddress}>
                        <CopyIcon height={20} width={20} />
                      </CopyToClipboard>
                      {ARKHAM_CHAIN_NAME[deliveryInstruction.targetChainId as ChainId] &&
                        addressesInfo?.[deliveryParsedTargetAddress.toLowerCase()] && (
                          <AddressInfoTooltip
                            info={addressesInfo[deliveryParsedTargetAddress.toLowerCase()]}
                            chain={deliveryInstruction.targetChainId}
                          />
                        )}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="tx-overview-graph-step-title">Delivery Provider</div>
                  <div className="tx-overview-graph-step-description">
                    <Tooltip
                      maxWidth={false}
                      tooltip={<div>{deliveryParsedSourceProviderAddress.toUpperCase()}</div>}
                      type="info"
                    >
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
                          mainnetDefaultDeliveryProviderContractAddress.toLowerCase()
                          ? "xLabs"
                          : shortAddress(deliveryParsedSourceProviderAddress).toUpperCase()}
                      </a>
                    </Tooltip>
                    <CopyToClipboard toCopy={deliveryParsedSourceProviderAddress}>
                      <CopyIcon height={20} width={20} />
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
            </div>

            {deliveryStatus && (
              <div className={`tx-overview-graph-step green source`}>
                <div className="tx-overview-graph-step-name">
                  <div>RELAY STATUS</div>
                </div>
                <div className="tx-overview-graph-step-iconWrapper">
                  <div className="tx-overview-graph-step-iconContainer">
                    <ArrowRightIcon height={24} width={24} />
                  </div>
                </div>

                {deliveryStatus.status === "failed" && (
                  <div className={`tx-overview-graph-step-data-container`}>
                    <div>
                      <div className="tx-overview-graph-step-title">STATUS</div>
                      <div className="tx-overview-graph-step-description red">FAILED</div>
                    </div>
                    <div>
                      <div className="tx-overview-graph-step-title">Failed at</div>
                      <div className="tx-overview-graph-step-description">
                        {formatDate(deliveryStatus.failedAt)}
                      </div>
                    </div>
                  </div>
                )}

                {deliveryStatus?.status === "waiting" && (
                  <div className={`tx-overview-graph-step-data-container`}>
                    <div>
                      <div className="tx-overview-graph-step-title">STATUS</div>
                      <div className="tx-overview-graph-step-description">WAITING..</div>
                    </div>
                    <div>
                      <div className="tx-overview-graph-step-title">Attempts</div>
                      <div className="tx-overview-graph-step-description">
                        {`${deliveryAttempt}/${deliveryStatus?.data?.maxAttempts}`}
                      </div>
                    </div>
                  </div>
                )}

                {deliveryStatus.status !== "failed" &&
                  deliveryStatus.status !== "waiting" &&
                  renderDeliveryStatus(deliveryStatus)}
              </div>
            )}

            {!deliveryStatus && (
              <div className={`tx-overview-graph-step green source`}>
                <div className="tx-overview-graph-step-name">
                  <div>DELIVERY STATUS</div>
                </div>
                <div className="tx-overview-graph-step-iconWrapper">
                  <div className="tx-overview-graph-step-iconContainer">
                    <img src={RelayIcon} alt="" height={32} loading="lazy" />
                  </div>
                </div>

                <div className={`tx-overview-graph-step-data-container`}>
                  <div>
                    <div className="tx-overview-graph-step-title">STATUS</div>
                    <div className="tx-overview-graph-step-description red">
                      We were not able to get the status of your relay.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {!isDelivery && originalVAA && (
        <div className="redelivery-info">
          <div className="redelivery-info-container">
            <div>This VAA its a Redelivery for the following transaction:</div>
            <NavLink target="_blank" to={`/tx/${originalVAA}`} className="redelivery-info-btn">
              <div>View Original Delivery</div>
              <ExternalLinkIcon height={15} width={15} />
            </NavLink>
            <div>It should contain all the information regarding this Delivery.</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RelayerOverview;
