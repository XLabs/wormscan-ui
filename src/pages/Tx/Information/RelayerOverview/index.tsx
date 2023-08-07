import { CopyIcon } from "@radix-ui/react-icons";
import { BlockchainIcon, SignatureCircle, Tooltip } from "src/components/atoms";
import { CopyToClipboard } from "src/components/molecules";
import RelayIcon from "src/icons/relayIcon.svg";
import { ChainId, VAADetail } from "@xlabs-libs/wormscan-sdk";
import { getChainName, getExplorerLink } from "src/utils/wormhole";
import { shortAddress } from "src/utils/crypto";
import { parseVaa } from "@certusone/wormhole-sdk";
import { colorStatus, getGuardianSet } from "src/consts";
import { parseAddress } from "src/utils/crypto";
import "./styles.scss";
import { ethers } from "ethers";
import {
  DeliveryLifecycleRecord,
  isRedelivery,
  parseGenericRelayerVaa,
} from "src/utils/genericRelayerVaaUtils";
import { useEnvironment } from "src/context/EnvironmentContext";

import {
  DeliveryInstruction,
  RedeliveryInstruction,
  parseEVMExecutionInfoV1,
} from "@certusone/wormhole-sdk/lib/cjs/relayer";
import { Fragment } from "react";
import {
  mainnetDefaultDeliveryProviderContractAddress,
  testnetDefaultDeliveryProviderContractAddress,
} from "src/utils/environment";

// eslint-disable-next-line no-var
var gasUsed: any;
// eslint-disable-next-line no-var
var maxRefund: any;

type Props = {
  lifecycleRecord: DeliveryLifecycleRecord;
  VAAData: VAADetail & { vaa: any; decodedVaa: any };
};

const RelayerOverview = ({ lifecycleRecord, VAAData }: Props) => {
  const { environment } = useEnvironment();
  const currentNetwork = environment.network;

  if (!lifecycleRecord?.vaa) return <div>No VAA was found</div>;

  const vaa = lifecycleRecord.vaa;
  const parsedVaa = parseVaa(vaa);

  const { guardianSetIndex, emitterAddress, emitterChain, guardianSignatures, hash, sequence } =
    parsedVaa || {};
  const guardianSetList = getGuardianSet(guardianSetIndex);

  const bufferEmitterAddress = Buffer.from(emitterAddress).toString("hex");
  const parsedEmitterAddress = parseAddress({
    value: bufferEmitterAddress,
    chainId: emitterChain as ChainId,
  });
  const parsedHash = Buffer.from(hash).toString("hex");

  const parsedSequence = Number(sequence);
  const parsedGuardianSignatures = guardianSignatures?.map(({ index, signature }) => ({
    index,
    signature: Buffer.from(signature).toString("hex"),
    name: guardianSetList?.[index]?.name,
  }));

  const totalGuardiansNeeded = currentNetwork === "MAINNET" ? 13 : 1;
  const guardianSignaturesCount = guardianSignatures?.length || 0;

  const fromChain = emitterChain;

  const parseDate = (timestamp: number | string) => {
    const date = new Date(timestamp).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    return date.replace(/(.+),\s(.+),\s/g, "$1, $2 at ");
  };

  const instruction = parseGenericRelayerVaa(parsedVaa);
  const deliveryInstruction = instruction as DeliveryInstruction | null;
  const redeliveryInstruction = instruction as RedeliveryInstruction | null;
  const isDelivery = deliveryInstruction && !isRedelivery(deliveryInstruction);

  const decodeExecution = deliveryInstruction.encodedExecutionInfo
    ? parseEVMExecutionInfoV1(deliveryInstruction.encodedExecutionInfo, 0)[0]
    : null;
  const gasLimit = decodeExecution ? decodeExecution.gasLimit : null;

  if (!deliveryInstruction?.targetAddress) {
    console.log({ deliveryInstruction });
    return (
      <div className="relayer-tx-overview">
        <div className="errored-info">
          This is either not an Automatic Relayer VAA or something&apos;s wrong with it
        </div>
      </div>
    );
  }

  const deliveryParsedTargetAddress = parseAddress({
    value: Buffer.from(deliveryInstruction?.targetAddress).toString("hex"),
    chainId: deliveryInstruction?.targetChainId as ChainId,
  });

  const deliveryParsedRefundAddress = parseAddress({
    value: Buffer.from(deliveryInstruction?.refundAddress).toString("hex"),
    chainId: deliveryInstruction?.refundChainId as ChainId,
  });

  const deliveryParsedRefundProviderAddress = parseAddress({
    value: Buffer.from(deliveryInstruction?.refundDeliveryProvider).toString("hex"),
    chainId: deliveryInstruction?.refundChainId as ChainId,
  });

  const deliveryParsedSenderAddress = parseAddress({
    value: Buffer.from(deliveryInstruction?.senderAddress).toString("hex"),
    chainId: fromChain as ChainId,
  });

  const deliveryParsedSourceProviderAddress = parseAddress({
    value: Buffer.from(deliveryInstruction?.sourceDeliveryProvider).toString("hex"),
    chainId: fromChain as ChainId,
  });

  const trunkStringsDecimal = (num: string, decimals: number) => {
    const [whole, fraction] = num.split(".");
    if (!fraction) return whole;
    return `${whole}.${fraction.slice(0, decimals)}`;
  };

  const maxRefundText = (deliveryStatus: any) => {
    maxRefund = trunkStringsDecimal(
      ethers.utils.formatUnits(
        deliveryStatus.metadata?.deliveryRecord?.maxRefund,
        deliveryStatus.metadata?.deliveryRecord?.targetChainDecimals || 18,
      ),
      3,
    );

    return deliveryStatus.metadata?.deliveryRecord?.maxRefundUsd
      ? `${maxRefund} ${
          environment.chainInfos.find(chain => chain.chainId === deliveryInstruction.targetChainId)
            .nativeCurrencyName
        } (${trunkStringsDecimal(
          "" + deliveryStatus.metadata?.deliveryRecord?.maxRefundUsd,
          4,
        )} USD)`
      : `${maxRefund} ${
          environment.chainInfos.find(chain => chain.chainId === deliveryInstruction.targetChainId)
            .nativeCurrencyName
        }`;
  };

  const gasUsedText = (deliveryStatus: any) => {
    gasUsed = `${deliveryStatus.metadata?.deliveryRecord?.resultLog?.gasUsed}`;
    return isNaN(gasUsed) ? `${gasLimit}` : `${gasUsed}/${gasLimit}`;
  };

  const receiverValueText = (deliveryStatus: any) => {
    const receiverValue = trunkStringsDecimal(
      ethers.utils.formatUnits(
        deliveryStatus.metadata?.deliveryRecord?.receiverValue,
        deliveryStatus.metadata?.deliveryRecord?.targetChainDecimals || 18,
      ),
      3,
    );

    const receiverValueUsd = trunkStringsDecimal(
      "" + deliveryStatus.metadata?.deliveryRecord?.receiverValueUsd,
      4,
    );

    return deliveryStatus.metadata?.deliveryRecord?.receiverValueUsd
      ? `
  ${receiverValue} ${
          environment.chainInfos.find(chain => chain.chainId === deliveryInstruction.targetChainId)
            .nativeCurrencyName
        } (${receiverValueUsd} USD)`
      : `
  ${receiverValue} ${
          environment.chainInfos.find(chain => chain.chainId === deliveryInstruction.targetChainId)
            .nativeCurrencyName
        }`;
  };

  const budgetText = (deliveryStatus: any) =>
    deliveryStatus.metadata?.deliveryRecord?.budgetUsd
      ? `
    ${`${trunkStringsDecimal(
      ethers.utils.formatUnits(
        deliveryStatus.metadata?.deliveryRecord?.budget,
        deliveryStatus.metadata?.deliveryRecord?.targetChainDecimals || 18,
      ),
      3,
    )} ${
      environment.chainInfos.find(chain => chain.chainId === deliveryInstruction.targetChainId)
        .nativeCurrencyName
    } (${deliveryStatus.metadata?.deliveryRecord?.budgetUsd.toFixed(3)} USD)`}
    `
      : `
    ${trunkStringsDecimal(
      ethers.utils.formatUnits(
        deliveryStatus.metadata?.deliveryRecord?.budget,
        deliveryStatus.metadata?.deliveryRecord?.targetChainDecimals || 18,
      ),
      3,
    )} ${
          environment.chainInfos.find(chain => chain.chainId === deliveryInstruction.targetChainId)
            .nativeCurrencyName
        }
    `;

  const refundText = () =>
    `${(1 - gasUsed / Number(gasLimit)) * maxRefund} ${
      environment.chainInfos.find(chain => chain.chainId === deliveryInstruction.targetChainId)
        .nativeCurrencyName
    }`;

  const copyBudgetText = (deliveryStatus: any) =>
    `Budget: ${budgetText(deliveryStatus)}\nMax Refund:\n${maxRefundText(deliveryStatus)}\n\n${
      !isNaN(gasUsed) ? "Gas Used/" : ""
    }Gas limit\n${gasUsedText(deliveryStatus)}\n\n${
      !isNaN(gasUsed) ? "Refund Amount\n" + refundText() : ""
    }\n\nReceiver Value: ${receiverValueText(deliveryStatus)}`
      .replaceAll("  ", "")
      .replaceAll("\n\n\n\n", "\n\n");

  return (
    <Fragment key={parsedHash}>
      <div className="relayer-tx-overview">
        <div className="relayer-tx-overview-graph">
          <div className={`relayer-tx-overview-graph-step green source`}>
            <div className="relayer-tx-overview-graph-step-name">
              <div>APP CONTRACT</div>
            </div>
            <div className="relayer-tx-overview-graph-step-iconWrapper">
              <div className="relayer-tx-overview-graph-step-iconContainer">
                {fromChain && <BlockchainIcon chainId={fromChain} size={32} />}
              </div>
            </div>
            <div className={`relayer-tx-overview-graph-step-data-container`}>
              <div>
                <div className="relayer-tx-overview-graph-step-title">Sent from</div>
                <div className="relayer-tx-overview-graph-step-description">
                  <div className="relayer-tx-overview-graph-step-description">
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
                      <CopyIcon />
                    </CopyToClipboard>
                  </div>
                  <div>
                    (
                    {fromChain && getChainName({ chainId: fromChain, acronym: true }).toUpperCase()}
                    )
                  </div>
                </div>
              </div>
              <div>
                <div className="relayer-tx-overview-graph-step-title">Source Tx Hash</div>
                <div className="relayer-tx-overview-graph-step-description">
                  <a
                    href={getExplorerLink({
                      network: currentNetwork,
                      chainId: fromChain,
                      value: lifecycleRecord.sourceTxHash,
                      base: "tx",
                      isNativeAddress: true,
                    })}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {shortAddress(lifecycleRecord.sourceTxHash).toUpperCase()}
                  </a>{" "}
                  <CopyToClipboard toCopy={lifecycleRecord.sourceTxHash}>
                    <CopyIcon />
                  </CopyToClipboard>
                </div>
              </div>
              <div>
                <div className="relayer-tx-overview-graph-step-title">Time</div>
                <div className="relayer-tx-overview-graph-step-description">
                  {parseDate(parsedVaa.timestamp * 1000)}
                </div>
              </div>
            </div>
          </div>

          <div className="relayer-tx-overview-graph-step green">
            <div className="relayer-tx-overview-graph-step-name">
              <div>AUTOMATIC RELAYER CONTRACT</div>
            </div>
            <div className="relayer-tx-overview-graph-step-iconWrapper">
              <div className="relayer-tx-overview-graph-step-iconContainer">
                {fromChain && <BlockchainIcon chainId={fromChain} size={32} />}
              </div>
            </div>
            <div className="relayer-tx-overview-graph-step-data-container">
              <div>
                <div className="relayer-tx-overview-graph-step-title">Contract Address</div>
                <div className="relayer-tx-overview-graph-step-description">
                  <div className="relayer-tx-overview-graph-step-description">
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
                      <CopyIcon />
                    </CopyToClipboard>
                  </div>
                  <div>
                    (
                    {fromChain && getChainName({ chainId: fromChain, acronym: true }).toUpperCase()}
                    )
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={`relayer-tx-overview-graph-step signatures ${colorStatus["COMPLETED"]}`}>
            <div className="relayer-tx-overview-graph-step-name">
              <div>SIGNED VAA</div>
            </div>
            <div className="relayer-tx-overview-graph-step-iconWrapper">
              <div className="relayer-tx-overview-graph-step-signaturesContainer">
                <SignatureCircle guardianSignatures={parsedGuardianSignatures} />
                <div className="relayer-tx-overview-graph-step-signaturesContainer-text">
                  <div className="relayer-tx-overview-graph-step-signaturesContainer-text-number">
                    {guardianSignaturesCount}/{totalGuardiansNeeded}
                  </div>
                  <div className="relayer-tx-overview-graph-step-signaturesContainer-text-description">
                    Signatures
                  </div>
                </div>
              </div>
            </div>

            <div className="relayer-tx-overview-graph-step-data-container signatures">
              <div>
                <div className="relayer-tx-overview-graph-step-title">VAA ID</div>
                <div className="relayer-tx-overview-graph-step-description">
                  {shortAddress(VAAData.id)}
                  <CopyToClipboard toCopy={VAAData.id}>
                    <CopyIcon />
                  </CopyToClipboard>
                </div>
              </div>
              {lifecycleRecord.DeliveryStatuses &&
                lifecycleRecord.DeliveryStatuses[0]?.receivedAt && (
                  <div>
                    <div className="relayer-tx-overview-graph-step-title">Time</div>
                    <div className="relayer-tx-overview-graph-step-description">
                      {parseDate(lifecycleRecord.DeliveryStatuses?.[0]?.receivedAt)}
                    </div>
                  </div>
                )}
            </div>
          </div>

          {isDelivery && (
            <>
              <div className="relayer-tx-overview-graph-step green">
                <div className="relayer-tx-overview-graph-step-name">
                  <div>VAA DELIVERY INSTRUCTIONS</div>
                </div>
                <div className="relayer-tx-overview-graph-step-iconWrapper">
                  <div className="relayer-tx-overview-graph-step-iconContainer">
                    <BlockchainIcon chainId={deliveryInstruction.targetChainId} size={32} />
                  </div>
                </div>
                <div className="relayer-tx-overview-graph-step-data-container">
                  <div>
                    <div className="relayer-tx-overview-graph-step-title">Target Address</div>
                    <div className="relayer-tx-overview-graph-step-description">
                      <div className="relayer-tx-overview-graph-step-description">
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
                          <CopyIcon />
                        </CopyToClipboard>
                      </div>
                      <div className="relayer-tx-overview-graph-step-description">
                        (
                        {getChainName({
                          chainId: deliveryInstruction.targetChainId,
                          acronym: true,
                        }).toUpperCase()}
                        )
                      </div>
                    </div>
                  </div>
                  {/* <div>
                      <div className="relayer-tx-overview-graph-step-title">MORE INFO</div>
                      <div className="relayer-tx-overview-graph-step-description">ASD</div>
                    </div> */}
                  <div>
                    <div className="relayer-tx-overview-graph-step-title">Delivery Provider</div>
                    <div className="relayer-tx-overview-graph-step-description">
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
                        <CopyIcon />
                      </CopyToClipboard>
                    </div>
                  </div>
                  {lifecycleRecord.DeliveryStatuses &&
                    lifecycleRecord.DeliveryStatuses.map((deliveryStatus, idx) =>
                      deliveryStatus.metadata ? (
                        <Fragment key={`texts-tool-${idx}`}>
                          <Tooltip
                            tooltip={
                              <div className="budget-tooltip">
                                <div className="budget-tooltip-title">Max Refund:</div>
                                <div>{maxRefundText(deliveryStatus)}</div>

                                {decodeExecution && gasUsedText(deliveryStatus) && (
                                  <>
                                    <div className="budget-tooltip-title">
                                      {isNaN(gasUsed) ? "Gas Limit" : "Gas Used/Gas Limit"}
                                    </div>
                                    <div>{gasUsedText(deliveryStatus)}</div>
                                  </>
                                )}

                                {!isNaN(gasUsed) && (
                                  <>
                                    <div className="budget-tooltip-title">Refund amount:</div>
                                    <div>{refundText()}</div>
                                  </>
                                )}

                                <div className="budget-tooltip-title">Receiver Value:</div>
                                <div>{receiverValueText(deliveryStatus)}</div>
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
                              <div className="relayer-tx-overview-graph-step-title budget-copy">
                                <div>Budget</div>
                                <CopyToClipboard toCopy={copyBudgetText(deliveryStatus)}>
                                  <CopyIcon />
                                </CopyToClipboard>
                              </div>

                              <div
                                key={"deliv" + idx}
                                className="relayer-tx-overview-graph-step-description"
                              >
                                <div>{budgetText(deliveryStatus)}</div>
                              </div>
                            </div>
                          </Tooltip>
                        </Fragment>
                      ) : null,
                    )}
                </div>
              </div>

              {deliveryParsedRefundAddress !== deliveryParsedTargetAddress && (
                <div className="relayer-tx-overview-graph-step green">
                  <div className="relayer-tx-overview-graph-step-name">
                    <div></div>
                  </div>
                  <div className="relayer-tx-overview-graph-step-iconWrapper">
                    <div className="relayer-tx-overview-graph-step-iconContainer">
                      <BlockchainIcon chainId={deliveryInstruction.refundChainId} size={32} />
                    </div>
                  </div>
                  <div className="relayer-tx-overview-graph-step-data-container">
                    <div>
                      <div className="relayer-tx-overview-graph-step-title">Refund Address</div>
                      <div className="relayer-tx-overview-graph-step-description">
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
                          <CopyIcon />
                        </CopyToClipboard>
                        <div className="relayer-tx-overview-graph-step-description">
                          (
                          {getChainName({
                            chainId: deliveryInstruction.refundChainId,
                            acronym: true,
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
                          <div className="relayer-tx-overview-graph-step-title">
                            Refund Provider
                          </div>
                          <div className="relayer-tx-overview-graph-step-description">
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
                              <CopyIcon />
                            </CopyToClipboard>
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              )}

              {lifecycleRecord.DeliveryStatuses &&
                lifecycleRecord.DeliveryStatuses?.map((deliveryStatus, deliveryStatusIdx) => {
                  return (
                    <div
                      key={`deliver-status-${deliveryStatusIdx}`}
                      className={`relayer-tx-overview-graph-step green source`}
                    >
                      <div className="relayer-tx-overview-graph-step-name">
                        <div>DELIVERY STATUS</div>
                      </div>
                      <div className="relayer-tx-overview-graph-step-iconWrapper">
                        <div className="relayer-tx-overview-graph-step-iconContainer">
                          <img src={RelayIcon} alt="" height={32} loading="lazy" />
                        </div>
                      </div>

                      {deliveryStatus.status === "failed" && (
                        <div className={`relayer-tx-overview-graph-step-data-container`}>
                          <div>
                            <div className="relayer-tx-overview-graph-step-title">STATUS</div>
                            <div className="relayer-tx-overview-graph-step-description red">
                              FAILED
                            </div>
                          </div>
                          <div>
                            <div className="relayer-tx-overview-graph-step-title">Failed at</div>
                            <div className="relayer-tx-overview-graph-step-description">
                              {parseDate(deliveryStatus.failedAt)}
                            </div>
                          </div>
                        </div>
                      )}

                      {deliveryStatus.status === "waiting" && (
                        <div className={`relayer-tx-overview-graph-step-data-container`}>
                          <div>
                            <div className="relayer-tx-overview-graph-step-title">STATUS</div>
                            <div className="relayer-tx-overview-graph-step-description">
                              WAITING..
                            </div>
                          </div>
                          <div>
                            <div className="relayer-tx-overview-graph-step-title">Attempts</div>
                            <div className="relayer-tx-overview-graph-step-description">
                              {`${deliveryStatus.attempts}/${deliveryStatus.maxAttempts}`}
                            </div>
                          </div>
                        </div>
                      )}

                      {deliveryStatus.status !== "failed" &&
                        deliveryStatus.status !== "waiting" && (
                          <div className={`relayer-tx-overview-graph-step-data-container`}>
                            <div>
                              <div className="relayer-tx-overview-graph-step-title">STATUS</div>
                              <div
                                className={`relayer-tx-overview-graph-step-description ${
                                  typeof deliveryStatus.metadata?.deliveryRecord?.resultLog ===
                                  "string"
                                    ? deliveryStatus.metadata?.deliveryRecord?.resultLog ===
                                      "Delivery Success"
                                      ? "green"
                                      : deliveryStatus.metadata?.deliveryRecord?.resultLog ===
                                        "Receiver Failure"
                                      ? "red"
                                      : "white"
                                    : deliveryStatus.metadata?.deliveryRecord?.resultLog?.status ===
                                      "Delivery Success"
                                    ? "green"
                                    : deliveryStatus.metadata?.deliveryRecord?.resultLog?.status ===
                                      "Receiver Failure"
                                    ? "red"
                                    : "white"
                                }`}
                              >
                                {typeof deliveryStatus.metadata?.deliveryRecord?.resultLog ===
                                "string"
                                  ? deliveryStatus.metadata?.deliveryRecord?.resultLog
                                  : deliveryStatus.metadata?.deliveryRecord?.resultLog?.status}
                              </div>
                              {deliveryStatus.metadata?.deliveryRecord?.resultLog?.refundStatus && (
                                <div
                                  className={`relayer-tx-overview-graph-step-description ${
                                    deliveryStatus.metadata?.deliveryRecord?.resultLog
                                      ?.refundStatus === ("Refund Sent" as any)
                                      ? "green"
                                      : deliveryStatus.metadata?.deliveryRecord?.resultLog
                                          ?.refundStatus === ("Refund Fail" as any)
                                      ? "red"
                                      : "white"
                                  }`}
                                >
                                  {deliveryStatus.metadata?.deliveryRecord?.resultLog?.refundStatus}
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="relayer-tx-overview-graph-step-title">
                                Target Tx Hash
                              </div>
                              <div className="relayer-tx-overview-graph-step-description">
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
                                  <CopyIcon />
                                </CopyToClipboard>
                              </div>
                            </div>
                            {!!lifecycleRecord?.targetTransactions[
                              lifecycleRecord?.targetTransactions?.length - 1
                            ]?.targetTxTimestamp && (
                              <div>
                                <div className="relayer-tx-overview-graph-step-title">Time</div>
                                <div className="relayer-tx-overview-graph-step-description">
                                  {parseDate(
                                    lifecycleRecord.targetTransactions[
                                      lifecycleRecord.targetTransactions.length - 1
                                    ].targetTxTimestamp * 1000,
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                    </div>
                  );
                })}

              {!lifecycleRecord.DeliveryStatuses && (
                <div className={`relayer-tx-overview-graph-step green source`}>
                  <div className="relayer-tx-overview-graph-step-name">
                    <div>DELIVERY STATUS</div>
                  </div>
                  <div className="relayer-tx-overview-graph-step-iconWrapper">
                    <div className="relayer-tx-overview-graph-step-iconContainer">
                      <img src={RelayIcon} alt="" height={32} loading="lazy" />
                    </div>
                  </div>

                  <div className={`relayer-tx-overview-graph-step-data-container`}>
                    <div>
                      <div className="relayer-tx-overview-graph-step-title">STATUS</div>
                      <div className="relayer-tx-overview-graph-step-description red">
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
    </Fragment>
  );
};

export default RelayerOverview;
