import { ArrowDownIcon, CheckboxIcon, CopyIcon } from "@radix-ui/react-icons";
import { Network } from "@certusone/wormhole-sdk";
import { DeliveryInstruction } from "@certusone/wormhole-sdk/lib/cjs/relayer";
import { colorStatus } from "src/consts";
import { BlockchainIcon, Tooltip } from "src/components/atoms";
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

export type RelayerOverviewProps = {
  budgetText: () => string;
  copyBudgetText: () => string;
  currentNetwork: Network;
  decodeExecution: any;
  deliveryAttempt: string;
  deliveryInstruction: DeliveryInstruction;
  deliveryParsedRefundAddress: string;
  deliveryParsedRefundProviderAddress: string;
  deliveryParsedSenderAddress: string;
  deliveryParsedSourceProviderAddress: string;
  deliveryParsedTargetAddress: string;
  deliveryStatus: AutomaticRelayOutput;
  fromChain: number;
  gasUsed: number;
  gasUsedText: () => string;
  guardianSignaturesCount: number;
  isDelivery: boolean;
  maxRefundText: () => string;
  parsedEmitterAddress: string;
  parsedVaa: any;
  receiverValueText: () => string;
  refundStatus: string;
  refundText: () => string;
  resultLog: string;
  sourceTxHash: string;
  targetTxTimestamp: number;
  totalGuardiansNeeded: number;
  VAAId: string;
};

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
  maxRefundText,
  parsedEmitterAddress,
  parsedVaa,
  receiverValueText,
  refundStatus,
  refundText,
  resultLog,
  sourceTxHash,
  targetTxTimestamp,
  totalGuardiansNeeded,
  VAAId,
}: RelayerOverviewProps) => {
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
            {resultLog}
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
        <div>
          <div className="tx-overview-graph-step-title">Target Tx Hash</div>
          <div className="tx-overview-graph-step-description">
            <Tooltip
              maxWidth={false}
              tooltip={<div>{deliveryStatus.data?.toTxHash?.toUpperCase()}</div>}
              type="info"
            >
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
                {shortAddress(deliveryStatus.data?.toTxHash).toUpperCase()}
              </a>
            </Tooltip>
            <CopyToClipboard toCopy={deliveryStatus.data?.toTxHash}>
              <CopyIcon height={20} width={20} />
            </CopyToClipboard>
          </div>
        </div>
        {!!targetTxTimestamp && (
          <div>
            <div className="tx-overview-graph-step-title">Time</div>
            <div className="tx-overview-graph-step-description">
              {formatDate(targetTxTimestamp * 1000)}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="tx-overview">
      <div className="tx-overview-graph">
        <div className={`tx-overview-graph-step green source`}>
          <div className="tx-overview-graph-step-name">
            <div>APP CONTRACT</div>
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
                </div>
                <div>
                  (
                  {fromChain &&
                    getChainName({
                      chainId: fromChain,
                      acronym: true,
                      network: currentNetwork,
                    }).toUpperCase()}
                  )
                </div>
              </div>
            </div>
            <div>
              <div className="tx-overview-graph-step-title">Source Tx Hash</div>
              <div className="tx-overview-graph-step-description">
                <Tooltip
                  maxWidth={false}
                  tooltip={<div>{sourceTxHash.toUpperCase()}</div>}
                  type="info"
                >
                  <a
                    href={getExplorerLink({
                      network: currentNetwork,
                      chainId: fromChain,
                      value: sourceTxHash,
                      base: "tx",
                      isNativeAddress: true,
                    })}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {shortAddress(sourceTxHash).toUpperCase()}
                  </a>
                </Tooltip>
                <CopyToClipboard toCopy={sourceTxHash}>
                  <CopyIcon height={20} width={20} />
                </CopyToClipboard>
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

        <div className="tx-overview-graph-step green">
          <div className="tx-overview-graph-step-name">
            <div>AUTOMATIC RELAYER CONTRACT</div>
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
                </div>
                <div>
                  (
                  {fromChain &&
                    getChainName({
                      chainId: fromChain,
                      acronym: true,
                      network: currentNetwork,
                    }).toUpperCase()}
                  )
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={`tx-overview-graph-step signatures ${colorStatus["COMPLETED"]}`}>
          <div className="tx-overview-graph-step-name">
            <div>SIGNED VAA</div>
          </div>
          <div className="tx-overview-graph-step-iconWrapper">
            <div className="tx-overview-graph-step-iconContainer">
              <CheckboxIcon height={24} width={24} />
            </div>
          </div>

          <div className="tx-overview-graph-step-data-container signatures">
            <div>
              <div className="tx-overview-graph-step-title">Signatures</div>
              <div className="tx-overview-graph-step-description">
                {guardianSignaturesCount} / {totalGuardiansNeeded}
              </div>
            </div>
            <div>
              <div className="tx-overview-graph-step-title">VAA ID</div>
              <div className="tx-overview-graph-step-description">
                <Tooltip maxWidth={false} tooltip={<div>{VAAId}</div>} type="info">
                  <p>{shortVaaId(VAAId)}</p>
                </Tooltip>
                <CopyToClipboard toCopy={VAAId}>
                  <CopyIcon height={20} width={20} />
                </CopyToClipboard>
              </div>
            </div>
            {deliveryStatus?.receivedAt && (
              <div>
                <div className="tx-overview-graph-step-title">Time</div>
                <div className="tx-overview-graph-step-description">
                  {formatDate(deliveryStatus?.receivedAt)}
                </div>
              </div>
            )}
          </div>
        </div>

        {isDelivery && (
          <>
            <div className="tx-overview-graph-step green">
              <div className="tx-overview-graph-step-name">
                <div>
                  <span>VAA</span> <span>DELIVERY</span> <span>INSTRUCTIONS</span>
                </div>
              </div>
              <div className="tx-overview-graph-step-iconWrapper">
                <div className="tx-overview-graph-step-iconContainer">
                  <ArrowDownIcon height={24} width={24} />
                </div>
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
                    </div>
                    <div className="tx-overview-graph-step-description">
                      (
                      {getChainName({
                        chainId: deliveryInstruction.targetChainId,
                        acronym: true,
                        network: currentNetwork,
                      }).toUpperCase()}
                      )
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
                  </div>
                </div>
                {deliveryStatus ? (
                  <Tooltip
                    tooltip={
                      <div className="budget-tooltip">
                        <div className="budget-tooltip-title">Max Refund:</div>
                        <div>{maxRefundText()}</div>

                        {decodeExecution && gasUsedText() && (
                          <>
                            <div className="budget-tooltip-title">
                              {isNaN(gasUsed) ? "Gas Limit" : "Gas Used/Gas Limit"}
                            </div>
                            <div>{gasUsedText()}</div>
                          </>
                        )}

                        {!isNaN(gasUsed) && (
                          <>
                            <div className="budget-tooltip-title">Refund amount:</div>
                            <div>{refundText()}</div>
                          </>
                        )}

                        <div className="budget-tooltip-title">Receiver Value:</div>
                        <div>{receiverValueText()}</div>
                      </div>
                    }
                    side="bottom"
                  >
                    <div
                      style={{
                        cursor: "pointer",
                        backgroundColor: "#ddddff05",
                        borderRadius: 6,
                      }}
                    >
                      <div className="tx-overview-graph-step-title budget-copy">
                        <div>Budget</div>
                        <CopyToClipboard toCopy={copyBudgetText()}>
                          <CopyIcon height={20} width={20} />
                        </CopyToClipboard>
                      </div>

                      <div className="tx-overview-graph-step-description">
                        <div>{budgetText()}</div>
                      </div>
                    </div>
                  </Tooltip>
                ) : null}
              </div>
            </div>

            {deliveryParsedRefundAddress !== deliveryParsedTargetAddress && (
              <div className="tx-overview-graph-step green">
                <div className="tx-overview-graph-step-name">
                  <div></div>
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
                      <div className="tx-overview-graph-step-description">
                        (
                        {getChainName({
                          chainId: deliveryInstruction.refundChainId,
                          acronym: true,
                          network: currentNetwork,
                        }).toUpperCase()}
                        )
                      </div>
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

            {deliveryStatus && (
              <div className={`tx-overview-graph-step green source`}>
                <div className="tx-overview-graph-step-name">
                  <div>DELIVERY STATUS</div>
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
    </div>
  );
};

export default RelayerOverview;
