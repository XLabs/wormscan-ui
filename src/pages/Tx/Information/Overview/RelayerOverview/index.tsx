import { ArrowDownIcon, CheckboxIcon, CopyIcon } from "@radix-ui/react-icons";
import { Network } from "@certusone/wormhole-sdk";
import { colorStatus } from "src/consts";
import { BlockchainIcon, Tooltip } from "src/components/atoms";
import { CopyToClipboard } from "src/components/molecules";
import RelayIcon from "src/icons/relayIcon.svg";
import { getChainName, getExplorerLink } from "src/utils/wormhole";
import { shortAddress, shortVaaId } from "src/utils/crypto";
import { DeliveryMetaData, DeliveryProviderStatus } from "src/utils/deliveryProviderStatusApi";
import {
  mainnetDefaultDeliveryProviderContractAddress,
  testnetDefaultDeliveryProviderContractAddress,
} from "src/utils/environment";
import { formatDate } from "src/utils/date";
import "../styles.scss";
import { DeliveryInstruction } from "@certusone/wormhole-sdk/lib/cjs/relayer";

type Props = {
  budgetText: (metadata: DeliveryMetaData) => string;
  copyBudgetText: (metadata: DeliveryMetaData) => string;
  currentNetwork: Network;
  decodeExecution: any;
  deliveryInstruction: DeliveryInstruction;
  deliveryParsedRefundAddress: string;
  deliveryParsedRefundProviderAddress: string;
  deliveryParsedSenderAddress: string;
  deliveryParsedSourceProviderAddress: string;
  deliveryParsedTargetAddress: string;
  deliveryStatus: DeliveryProviderStatus;
  fromChain: number;
  gasUsed: number;
  gasUsedText: (metadata: DeliveryMetaData) => string;
  guardianSignaturesCount: number;
  isDelivery: boolean;
  maxRefundText: (metadata: DeliveryMetaData) => string;
  metadata: DeliveryMetaData;
  parsedEmitterAddress: string;
  parsedVaa: any;
  receiverValueText: (metadata: DeliveryMetaData) => string;
  refundText: () => string;
  resultLog: any;
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
  metadata,
  parsedEmitterAddress,
  parsedVaa,
  receiverValueText,
  refundText,
  resultLog,
  sourceTxHash,
  targetTxTimestamp,
  totalGuardiansNeeded,
  VAAId,
}: Props) => {
  const renderDeliveryStatus = (deliveryStatus: DeliveryProviderStatus) => {
    return (
      <div className={`tx-overview-graph-step-data-container`}>
        <div>
          <div className="tx-overview-graph-step-title">STATUS</div>
          <div
            className={`tx-overview-graph-step-description ${
              typeof resultLog === "string"
                ? resultLog === "Delivery Success"
                  ? "green"
                  : resultLog === "Receiver Failure"
                  ? "red"
                  : "white"
                : resultLog?.status === "Delivery Success"
                ? "green"
                : resultLog?.status === "Receiver Failure"
                ? "red"
                : "white"
            }`}
          >
            {typeof resultLog === "string" ? resultLog : resultLog?.status}
          </div>
          {resultLog?.refundStatus && (
            <div
              className={`tx-overview-graph-step-description ${
                resultLog?.refundStatus === ("Refund Sent" as any)
                  ? "green"
                  : resultLog?.refundStatus === ("Refund Fail" as any)
                  ? "red"
                  : "white"
              }`}
            >
              {resultLog?.refundStatus}
            </div>
          )}
        </div>
        <div>
          <div className="tx-overview-graph-step-title">Target Tx Hash</div>
          <div className="tx-overview-graph-step-description">
            <a
              href={getExplorerLink({
                network: currentNetwork,
                chainId: deliveryInstruction.targetChainId,
                value: deliveryStatus.toTxHash,
                isNativeAddress: true,
              })}
              target="_blank"
              rel="noopener noreferrer"
            >
              {shortAddress(deliveryStatus.toTxHash).toUpperCase()}
            </a>{" "}
            <CopyToClipboard toCopy={deliveryStatus.toTxHash}>
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
                  </a>{" "}
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
                </a>{" "}
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
                  </a>{" "}
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
                {shortVaaId(VAAId)}
                <CopyToClipboard toCopy={VAAId}>
                  <CopyIcon height={20} width={20} />
                </CopyToClipboard>
              </div>
            </div>
            {deliveryStatus.receivedAt && (
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
                      </a>{" "}
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
                    </a>{" "}
                    <CopyToClipboard toCopy={deliveryParsedSourceProviderAddress}>
                      <CopyIcon height={20} width={20} />
                    </CopyToClipboard>
                  </div>
                </div>
                {deliveryStatus && metadata ? (
                  <Tooltip
                    tooltip={
                      <div className="budget-tooltip">
                        <div className="budget-tooltip-title">Max Refund:</div>
                        <div>{maxRefundText(metadata)}</div>

                        {decodeExecution && gasUsedText(metadata) && (
                          <>
                            <div className="budget-tooltip-title">
                              {isNaN(gasUsed) ? "Gas Limit" : "Gas Used/Gas Limit"}
                            </div>
                            <div>{gasUsedText(metadata)}</div>
                          </>
                        )}

                        {!isNaN(gasUsed) && (
                          <>
                            <div className="budget-tooltip-title">Refund amount:</div>
                            <div>{refundText()}</div>
                          </>
                        )}

                        <div className="budget-tooltip-title">Receiver Value:</div>
                        <div>{receiverValueText(metadata)}</div>
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
                        <CopyToClipboard toCopy={copyBudgetText(metadata)}>
                          <CopyIcon height={20} width={20} />
                        </CopyToClipboard>
                      </div>

                      <div className="tx-overview-graph-step-description">
                        <div>{budgetText(metadata)}</div>
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
                      </a>{" "}
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
                          </a>{" "}
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
                        {`${deliveryStatus.attempts}/${deliveryStatus.maxAttempts}`}
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
