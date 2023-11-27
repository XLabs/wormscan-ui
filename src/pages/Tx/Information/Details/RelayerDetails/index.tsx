import { useEffect, useRef, useState } from "react";
import { CopyIcon } from "@radix-ui/react-icons";
import { Network } from "@certusone/wormhole-sdk";
import { DeliveryInstruction } from "@certusone/wormhole-sdk/lib/cjs/relayer";
import { BlockchainIcon, Tooltip } from "src/components/atoms";
import { CopyToClipboard } from "src/components/molecules";
import { getChainName, getExplorerLink } from "src/utils/wormhole";
import { DeliveryMetaData, DeliveryProviderStatus } from "src/utils/deliveryProviderStatusApi";
import { TruncateText } from "src/utils/string";
import {
  mainnetDefaultDeliveryProviderContractAddress,
  testnetDefaultDeliveryProviderContractAddress,
} from "src/utils/environment";
import { formatDate } from "src/utils/date";
import "../styles.scss";

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

const RelayerDetails = ({
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
            {fromChain && (
              <>
                <BlockchainIcon chainId={fromChain} network={currentNetwork} size={24} />
                {getChainName({ chainId: fromChain, network: currentNetwork }).toUpperCase()}
              </>
            )}
          </div>
        </div>

        <div className="tx-details-group-line">
          <div className="tx-details-group-line-key">Time</div>
          <div className="tx-details-group-line-value">
            {formatDate(parsedVaa.timestamp * 1000)}
          </div>
        </div>

        <div className="tx-details-group-line">
          <div className="tx-details-group-line-key">Contract Address</div>
          <div className="tx-details-group-line-value">
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
              <TruncateText
                containerWidth={lineValueWidth}
                text={parsedEmitterAddress.toUpperCase()}
              />
            </a>
            <CopyToClipboard toCopy={parsedEmitterAddress}>
              <CopyIcon height={20} width={20} />
            </CopyToClipboard>
          </div>
        </div>

        <div className="tx-details-group-line">
          <div className="tx-details-group-line-key">From</div>
          <div className="tx-details-group-line-value">
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
              <CopyIcon height={20} width={20} />
            </CopyToClipboard>
          </div>
        </div>

        <div className="tx-details-group-line">
          <div className="tx-details-group-line-key">Source Tx Hash</div>
          <div className="tx-details-group-line-value">
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
              <TruncateText containerWidth={lineValueWidth} text={sourceTxHash.toUpperCase()} />
            </a>
            <CopyToClipboard toCopy={sourceTxHash}>
              <CopyIcon height={20} width={20} />
            </CopyToClipboard>
          </div>
        </div>
      </div>

      <div className="tx-details-group">
        <div className="tx-details-group-line">
          <div className="tx-details-group-line-key">Time</div>
          <div className="tx-details-group-line-value">
            {deliveryStatus.receivedAt && formatDate(deliveryStatus.receivedAt)}
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
            <TruncateText containerWidth={lineValueWidth} text={VAAId} />
            <CopyToClipboard toCopy={VAAId}>
              <CopyIcon height={20} width={20} />
            </CopyToClipboard>
          </div>
        </div>

        {isDelivery && (
          <div className="tx-details-group-line">
            <div className="tx-details-group-line-key">Delivery Provider</div>
            <div className="tx-details-group-line-value">
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
                    text={deliveryParsedSourceProviderAddress.toUpperCase()}
                  />
                )}
              </a>{" "}
              <CopyToClipboard toCopy={deliveryParsedSourceProviderAddress}>
                <CopyIcon height={20} width={20} />
              </CopyToClipboard>
            </div>
          </div>
        )}

        <div className="tx-details-group-line">
          <div className="tx-details-group-line-key">Budget</div>
          <div className="tx-details-group-line-value">
            {metadata ? (
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
                    display: "flex",
                    gap: "8px",
                    alignItems: "center",
                    cursor: "pointer",
                    backgroundColor: "#ddddff05",
                    borderRadius: 6,
                    padding: "2px 8px",
                  }}
                >
                  {budgetText(metadata)}

                  <CopyToClipboard toCopy={copyBudgetText(metadata)}>
                    <CopyIcon height={20} width={20} />
                  </CopyToClipboard>
                </div>
              </Tooltip>
            ) : (
              "N/A"
            )}
          </div>
        </div>

        {isDelivery && deliveryParsedRefundAddress !== deliveryParsedTargetAddress && (
          <div className="tx-details-group-line">
            <div className="tx-details-group-line-key">Refund Address</div>
            <div className="tx-details-group-line-value">
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
                  text={deliveryParsedRefundAddress.toUpperCase()}
                />
              </a>
              <CopyToClipboard toCopy={deliveryParsedRefundAddress}>
                <CopyIcon height={20} width={20} />
              </CopyToClipboard>
            </div>
          </div>
        )}

        {isDelivery &&
          deliveryParsedRefundProviderAddress !== deliveryParsedSourceProviderAddress &&
          deliveryParsedRefundProviderAddress.toLowerCase() !==
            testnetDefaultDeliveryProviderContractAddress.toLowerCase() &&
          deliveryParsedRefundProviderAddress.toLowerCase() !==
            mainnetDefaultDeliveryProviderContractAddress.toLowerCase() && (
            <div className="tx-details-group-line">
              <div className="tx-details-group-line-key">Refund Provider</div>
              <div className="tx-details-group-line-value">
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
                    text={deliveryParsedRefundProviderAddress.toUpperCase()}
                  />
                </a>
                <CopyToClipboard toCopy={deliveryParsedRefundProviderAddress}>
                  <CopyIcon height={20} width={20} />
                </CopyToClipboard>
              </div>
            </div>
          )}
      </div>

      <div className="tx-details-group">
        <div className="tx-details-group-line">
          <div className="tx-details-group-line-key">Target Chain</div>
          <div className="tx-details-group-line-value">
            <BlockchainIcon
              chainId={deliveryInstruction.refundChainId}
              network={currentNetwork}
              size={24}
            />
            {getChainName({
              chainId: deliveryInstruction.refundChainId,
              network: currentNetwork,
            }).toUpperCase()}
          </div>
        </div>

        <div className="tx-details-group-line">
          <div className="tx-details-group-line-key">Time</div>
          <div className="tx-details-group-line-value">
            {!!targetTxTimestamp ? formatDate(targetTxTimestamp * 1000) : "N/A"}
          </div>
        </div>

        <div className="tx-details-group-line">
          <div className="tx-details-group-line-key">To</div>
          <div className="tx-details-group-line-value">
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
              <TruncateText
                containerWidth={lineValueWidth}
                text={deliveryParsedTargetAddress.toUpperCase()}
              />
            </a>
            <CopyToClipboard toCopy={deliveryParsedTargetAddress}>
              <CopyIcon height={20} width={20} />
            </CopyToClipboard>
          </div>
        </div>

        <div className="tx-details-group-line">
          <div className="tx-details-group-line-key">Target Tx Hash</div>
          <div className="tx-details-group-line-value">
            {deliveryStatus?.status !== "failed" &&
            deliveryStatus?.status !== "waiting" &&
            deliveryStatus?.toTxHash ? (
              <>
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
                  <TruncateText
                    containerWidth={lineValueWidth}
                    text={deliveryStatus.toTxHash.toUpperCase()}
                  />
                </a>
                <CopyToClipboard toCopy={deliveryStatus.toTxHash}>
                  <CopyIcon height={20} width={20} />
                </CopyToClipboard>
              </>
            ) : (
              "N/A"
            )}
          </div>
        </div>

        <div className="tx-details-group-line">
          <div className="tx-details-group-line-key">STATUS</div>
          <div className="tx-details-group-line-value">
            {deliveryStatus?.status == "failed" && (
              <>
                <div className="red">FAILED</div>
                {formatDate(deliveryStatus?.failedAt)}
              </>
            )}

            {deliveryStatus?.status === "waiting" && (
              <>
                WAITING.. | Attempts: {`${deliveryStatus?.attempts}/${deliveryStatus?.maxAttempts}`}
              </>
            )}

            {deliveryStatus?.status !== "failed" && deliveryStatus?.status !== "waiting" && (
              <>
                <div
                  className={
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
                  }
                >
                  {typeof resultLog === "string" ? resultLog : resultLog?.status}
                </div>

                {resultLog?.refundStatus && (
                  <>
                    -
                    <div
                      className={
                        resultLog?.refundStatus === ("Refund Sent" as any)
                          ? "green"
                          : resultLog?.refundStatus === ("Refund Fail" as any)
                          ? "red"
                          : "white"
                      }
                    >
                      {resultLog?.refundStatus}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RelayerDetails;
