import { CopyIcon, InfoCircledIcon } from "@radix-ui/react-icons";
import { Alert, BlockchainIcon, Loader, SignatureCircle, Tooltip } from "src/components/atoms";
import { CopyToClipboard } from "src/components/molecules";
import WormIcon from "src/icons/wormIcon.svg";
import RelayIcon from "src/icons/relayIcon.svg";
import { ChainId, GetTransactionsOutput, VAADetail } from "@xlabs-libs/wormscan-sdk";
import { getChainName, getExplorerLink } from "src/utils/wormhole";
import { shortAddress } from "src/utils/crypto";
import { formatCurrency } from "src/utils/number";
import { ParsedVaa, parseVaa, tryNativeToHexString } from "@certusone/wormhole-sdk";
import { useWindowSize } from "src/utils/hooks/useWindowSize";
import { BREAKPOINTS, colorStatus, getGuardianSet, txType } from "src/consts";
import { parseTx, parseAddress } from "src/utils/crypto";
import { getCurrentNetwork } from "src/api/Client";
import "./styles.scss";
import {
  DeliveryLifecycleRecord,
  getDeliveryStatusByVaa,
  isRedelivery,
  manualDeliver,
  parseGenericRelayerVaa,
} from "src/pages/RelayerDashboard/utils/VaaUtils";
import { useEnvironment } from "src/pages/RelayerDashboard/context/EnvironmentContext";

import {
  DeliveryInstruction,
  DeliveryTargetInfo,
  RedeliveryInstruction,
} from "@certusone/wormhole-sdk/lib/cjs/relayer";
import { Fragment, useCallback, useEffect, useState } from "react";
import { Button, CircularProgress, TextField } from "@mui/material";
import { useEthereumProvider } from "src/pages/RelayerDashboard/context/EthereumProviderContext";
import { getChainInfo } from "src/pages/RelayerDashboard/utils/environment";

const Divider = <div className="divider" />;

const NotFinalDestinationTooltip = () => (
  <div>
    Address shown corresponds to a Smart Contract handling the transaction. Funds will be sent to
    your recipient address.
  </div>
);

export function RedeliveryInstructionDisplay({
  instruction,
}: {
  instruction: RedeliveryInstruction;
}) {
  return (
    <div style={{ margin: "10px" }}>
      <h4>Redelivery Instruction</h4>
      <div>Original VAA Key Info</div>
      <div>{"Chain: " + instruction.deliveryVaaKey.chainId}</div>
      <div>
        {"Emitter" + Buffer.from(instruction.deliveryVaaKey.emitterAddress).toString("hex")}
      </div>
      <div>{"Sequence: " + instruction.deliveryVaaKey.sequence}</div>
      <div style={{ height: "10px" }} />
      <div>
        {"Encoded Execution Params: " +
          Buffer.from(instruction.newEncodedExecutionInfo.toString("hex"))}
      </div>
      <div>{"New Receiver Value: " + instruction.newRequestedReceiverValue}</div>
      <div>
        {"New Sender Address: " + Buffer.from(instruction.newSenderAddress).toString("hex")}
      </div>
      <div>
        {"New Delivery Provider: " +
          Buffer.from(instruction.newSourceDeliveryProvider).toString("hex")}
      </div>
      <div>{"Target Chain: " + instruction.targetChainId}</div>
    </div>
  );
}

export function DeliveryInstructionDisplay({ instruction }: { instruction: DeliveryInstruction }) {
  const spacer = <div style={{ height: "10px" }} />;
  return (
    <div style={{ margin: "10px" }}>
      <h4>Delivery Instruction</h4>
      {Divider}
      <div>{`Target Chain: ${instruction.targetChainId} (${
        ChainId[instruction.targetChainId]
      })`}</div>
      <div>{"Target Address: " + Buffer.from(instruction.targetAddress).toString("hex")}</div>
      <div>{"Extra Receiver Value: " + instruction.extraReceiverValue.toString()}</div>
      <div>{"Refund Address: " + Buffer.from(instruction.refundAddress).toString("hex")}</div>
      <div>{`Refund Chain: ${instruction.refundChainId} (${
        ChainId[instruction.refundChainId]
      })`}</div>
      <div>
        {"Refund Delivery Provider: " +
          Buffer.from(instruction.refundDeliveryProvider).toString("hex")}
      </div>
      <div>{"Receiver Value: " + instruction.requestedReceiverValue.toString()}</div>
      <div>{"Sender Address: " + Buffer.from(instruction.senderAddress).toString("hex")}</div>
      <div>
        {"Source Delivery Provider: " +
          Buffer.from(instruction.sourceDeliveryProvider).toString("hex")}
      </div>

      <h5>Additional Vaa Keys:</h5>
      {instruction.vaaKeys.map(vaaKey => {
        return (
          <div key={vaaKey.chainId}>
            <div>{"Chain: " + vaaKey.chainId}</div>
            <div>{"Emitter" + Buffer.from(vaaKey.emitterAddress).toString("hex")}</div>
            <div>{"Sequence: " + vaaKey.sequence}</div>
          </div>
        );
      })}
      {spacer}
      <div>
        {"Encoded Execution Info: " + Buffer.from(instruction.encodedExecutionInfo).toString("hex")}
      </div>
      <div>{"Payload: " + Buffer.from(instruction.payload).toString("hex")}</div>
    </div>
  );
}

export function PullDeliveryInfo({ rawVaa }: { rawVaa: Uint8Array }) {
  const deliveryVaa = parseVaa(rawVaa);
  const { environment } = useEnvironment();
  const [blockStart, setBlockStart] = useState("-2048");
  const [blockEnd, setBlockEnd] = useState("latest");

  const [deliveryInfoError, setDeliveryInfoError] = useState("");
  const [deliveryInfos, setDeliveryInfos] = useState<DeliveryTargetInfo[]>([]);
  const [isLoadingDeliveryInfo, setIsLoadingDeliveryInfo] = useState(false);

  const onPullDeliveryInfo = async () => {
    setIsLoadingDeliveryInfo(true);
    setDeliveryInfoError("");
    setDeliveryInfos([]);

    const start = parseInt(blockStart);
    const end = blockEnd === "latest" ? "latest" : parseInt(blockEnd);

    if (isNaN(start) || (end !== "latest" && isNaN(end))) {
      setDeliveryInfoError("Invalid block number");
      setIsLoadingDeliveryInfo(false);
      return;
    }

    try {
      const deliveryInfos = await getDeliveryStatusByVaa(environment, deliveryVaa, start, end);

      if (deliveryInfos == null) {
        setDeliveryInfoError("No Delivery Infos were found within the given range");
        setIsLoadingDeliveryInfo(false);
        return;
      } else {
        setDeliveryInfos(deliveryInfos);
        setIsLoadingDeliveryInfo(false);
      }
    } catch (e: any) {
      setDeliveryInfoError(e.message || "An error occurred.");
      setIsLoadingDeliveryInfo(false);
    }
  };

  return (
    <div style={{ margin: "10px", padding: "10px" }}>
      <h4>Pull Delivery Info</h4>
      {Divider}
      <TextField
        label="Block Start"
        value={blockStart}
        onChange={e => setBlockStart(e.target.value)}
        style={{ margin: "10px" }}
      />
      <TextField
        label="Block End"
        value={blockEnd}
        onChange={e => setBlockEnd(e.target.value)}
        style={{ margin: "10px" }}
      />
      <Button
        onClick={onPullDeliveryInfo}
        disabled={isLoadingDeliveryInfo}
        variant="contained"
        style={{ margin: "10px" }}
      >
        Pull Delivery Info
      </Button>
      {deliveryInfoError && <div>{deliveryInfoError}</div>}
      {isLoadingDeliveryInfo && <Loader />}
      {deliveryInfos.map((info, idx) => {
        return <DeliveryInfoDisplay key={idx} info={info} />;
      })}
    </div>
  );
}

export function DeliveryInfoDisplay({ info }: { info: DeliveryTargetInfo }) {
  return (
    <div style={{ padding: "10px" }}>
      {Divider}
      <div>{"GasUsed: " + info.gasUsed.toString()}</div>
      <div>{"New Execution Info: " + info.overrides?.newExecutionInfo?.toString("hex")}</div>
      <div>{"New Receiver Value: " + info.overrides?.newReceiverValue.toString()}</div>
      <div>{"Redelivery Hash: " + info.overrides?.redeliveryHash?.toString("hex")}</div>
      <div>{"Refund Status: " + info.refundStatus}</div>
      <div>{"Revert String: " + info.revertString}</div>
      <div>{"Source Chain: " + info.sourceChain}</div>
      <div>{"Source VAA Seq: " + info.sourceVaaSequence?.toString()}</div>
      <div>{"Status: " + info.status}</div>
      <div>{"TxHash: " + info.transactionHash}</div>
      <div>{"Vaa Hash: " + info.vaaHash}</div>
    </div>
  );
}

export function ManualDeliverDeliveryVaa({ rawVaa }: { rawVaa: Uint8Array }) {
  const deliveryVaa = parseVaa(rawVaa);
  const deliveryInstruction = parseGenericRelayerVaa(deliveryVaa) as DeliveryInstruction;
  const { environment } = useEnvironment();

  const [manualDeliverError, setManualDeliverError] = useState("");
  const [isManualDelivering, setIsManualDelivering] = useState(false);
  const [manualDeliverTxHash, setManualDeliverTxHash] = useState("");

  const { chainId, signer, signerAddress, providerError } = useEthereumProvider();

  const targetChainInfo = getChainInfo(environment, deliveryInstruction.targetChainId as ChainId);
  const walletIsConnected = !!signer;
  const correctChain = walletIsConnected && targetChainInfo.evmNetworkId === chainId;
  //TODO this
  const overrides: any = null;

  const onManualDeliver = useCallback(async () => {
    setIsManualDelivering(true);
    setManualDeliverError("");

    if (!walletIsConnected || !correctChain || !signer || !signerAddress) {
      setManualDeliverError("Wallet is not connected to the correct EVM network");
      setIsManualDelivering(false);
      return;
    }

    try {
      const tx = await manualDeliver(
        environment,
        targetChainInfo,
        rawVaa,
        signer,
        signerAddress,
        overrides || undefined,
      );

      //for some reason I'm seeing transactionHash on the actual runtime object after debugging.
      // @ts-ignore
      setManualDeliverTxHash((tx.hash || tx.transactionHash) as string);
      setIsManualDelivering(false);
    } catch (e: any) {
      setManualDeliverError(e.message || "An error occurred.");
      setIsManualDelivering(false);
    }
  }, [
    walletIsConnected,
    correctChain,
    signer,
    signerAddress,
    environment,
    targetChainInfo,
    rawVaa,
    overrides,
  ]);

  return (
    <div style={{ marginTop: "6px" }}>
      {/* <h4>Manual Deliver</h4> */}

      <div style={{ marginBottom: "6px" }}>
        <button
          className="manual-delivery-btn"
          onClick={onManualDeliver}
          disabled={!correctChain || isManualDelivering || !walletIsConnected}
        >
          Manual Deliver
        </button>
      </div>
      {/* <Button
        onClick={onManualDeliver}
        disabled={!correctChain || isManualDelivering}
        variant="contained"
        style={{ margin: "10px" }}
      >
        Manual Deliver
      </Button> */}
      {!correctChain && <div>Wallet is not connected to the correct EVM network</div>}
      {!correctChain && (
        <div>
          Expected EVM Network: {targetChainInfo.evmNetworkId + " "}
          Actual EVM Network: {chainId}
        </div>
      )}
      {!correctChain && !walletIsConnected && <div>Wallet is not connected</div>}
      {providerError && <div className="errored-info">{"Provider Error: " + providerError}</div>}
      {manualDeliverError && (
        <div className="errored-info">{"Manual Delivery Error: " + manualDeliverError}</div>
      )}
      {isManualDelivering && <CircularProgress />}
      {manualDeliverTxHash && (
        <div>{"Successfully landed the delivery: " + manualDeliverTxHash}</div>
      )}
    </div>
  );
}

const VaaReader = ({
  rawVaa,
  vaa,
  info,
  isDelivery,
}: {
  rawVaa: Uint8Array;
  vaa: ParsedVaa;
  info: DeliveryInstruction | RedeliveryInstruction | null;
  isDelivery: boolean;
}) => {
  const vaaHeaderInfo = (
    <div style={{ margin: "10px" }}>
      <h4>VAA Info </h4>
      {Divider}
      <div>
        Chain: {vaa.emitterChain} ({ChainId[vaa.emitterChain]})
      </div>
      <div>Emitter: {Buffer.from(vaa.emitterAddress).toString("hex")}</div>
      <div>Sequence: {vaa.sequence.toString()}</div>
      <div>Hash: {Buffer.from(vaa.hash).toString("hex")}</div>
      <div>Timestamp: {vaa.timestamp.toString()}</div>
    </div>
  );

  const vaaBodyInfo =
    info == null ? (
      <div>This VAA can&apos;t be parsed. It is likely not a Wormhole relayer VAA.</div>
    ) : isRedelivery(info) ? (
      <RedeliveryInstructionDisplay instruction={info as RedeliveryInstruction} />
    ) : (
      <DeliveryInstructionDisplay instruction={info as DeliveryInstruction} />
    );

  return (
    <div style={{ margin: "10px" }}>
      {/* {vaaHeaderInfo}
      <div style={{ height: "10px" }} />
      {vaaBodyInfo} */}

      {isDelivery && <PullDeliveryInfo rawVaa={rawVaa} />}
      {/* {isDelivery && <ManualDeliverDeliveryVaa rawVaa={rawVaa} />} */}
    </div>
  );
};

type Props = {
  lifecycleRecords: DeliveryLifecycleRecord[];
  txsData?: any[];
};

const Overview = ({ lifecycleRecords, txsData }: Props) => {
  const { environment } = useEnvironment();

  const { connect, disconnect, signerAddress, providerError } = useEthereumProvider();
  const isConnected = !!signerAddress;
  const [manualDeliverVaa, setManualDeliverVaa] = useState<Uint8Array>(null);

  const lifecycleVaas = lifecycleRecords.filter(record => !!record.vaa);
  if (lifecycleVaas.length <= 0) return <div>No VAA was found</div>;

  const render = lifecycleVaas.map((lifecycleRecord, idx) => {
    // const {
    //   id: VAAId,
    //   timestamp,
    //   tokenAmount,
    //   usdAmount,
    //   symbol,
    //   emitterChain: txEmitterChain,
    //   emitterNativeAddress,
    //   standardizedProperties,
    //   globalTx,
    //   payload,
    // } = (txsData[idx].data as GetTransactionsOutput) || {};
    // console.log("VAAId??", VAAId);
    // console.log({ txsData });

    // const { originTx, destinationTx } = globalTx || {};

    // const {
    //   chainId: globalToChainId,
    //   from: globalTo,
    //   timestamp: globalToTimestamp,
    //   txHash: globalToRedeemTx,
    // } = destinationTx || {};

    // const { from: globalFrom, timestamp: globalFromTimestamp } = originTx || {};

    // const {
    //   appIds,
    //   fromChain: stdFromChain,
    //   toChain: stdToChain,
    //   toAddress: stdToAddress,
    //   tokenChain: stdTokenChain,
    //   tokenAddress: stdTokenAddress,
    // } = standardizedProperties || {};

    // const fromAddress = globalFrom;
    // const toChain = stdToChain;
    // const toAddress = stdToAddress;
    // const startDate = timestamp;
    // const endDate = globalToTimestamp;
    // const tokenChain = stdTokenChain;
    // const tokenAddress = stdTokenAddress;

    // const parsedOriginAddress = parseAddress({
    //   value: fromAddress,
    //   chainId: fromChain as ChainId,
    // });

    // const parsedEmitterAddress = parseAddress({
    //   value: emitterNativeAddress,
    //   chainId: emitterChain as ChainId,
    // });

    // const parsedDestinationAddress = parseAddress({
    //   value: toAddress,
    //   chainId: toChain as ChainId,
    // });

    // const parsedRedeemTx = parseTx({ value: globalToRedeemTx, chainId: toChain as ChainId });

    // const originDate = new Date(startDate).toLocaleString("en-US", {
    //   year: "numeric",
    //   month: "short",
    //   day: "numeric",
    //   hour: "2-digit",
    //   minute: "2-digit",
    //   hour12: false,
    // });
    // const destinationDate = new Date(endDate).toLocaleString("en-US", {
    //   year: "numeric",
    //   month: "short",
    //   day: "numeric",
    //   hour: "2-digit",
    //   minute: "2-digit",
    //   hour12: false,
    // });

    // const amountSent = formatCurrency(Number(tokenAmount));
    // const amountSentUSD = formatCurrency(Number(usdAmount));

    // const originDateParsed = originDate.replace(/(.+),\s(.+),\s/g, "$1, $2 at ");
    // const destinationDateParsed = destinationDate.replace(/(.+),\s(.+),\s/g, "$1, $2 at ");

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

    const totalGuardiansNeeded = environment.network === "MAINNET" ? 13 : 1;
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

    return (
      <Fragment key={parsedHash}>
        {/* <Summary
          startDate={startDate}
          transactionTimeInMinutes={transactionTimeInMinutes}
          fee={fee}
          symbol={symbol}
          originChainId={fromChain}
          destinationChainId={toChain}
          payloadType={payloadType}
        /> */}

        <div className="relayer-tx-overview">
          <div className="relayer-tx-overview-graph">
            <div className={`relayer-tx-overview-graph-step green source`}>
              <div className="relayer-tx-overview-graph-step-name">
                <div>SOURCE CHAIN</div>
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
                    {fromChain && getChainName({ chainId: fromChain }).toUpperCase()}
                  </div>
                </div>
              </div>
            </div>

            <div className="relayer-tx-overview-graph-step green">
              <div className="relayer-tx-overview-graph-step-name">
                <div>EMITTER CONTRACT</div>
              </div>
              <div className="relayer-tx-overview-graph-step-iconWrapper">
                <div className="relayer-tx-overview-graph-step-iconContainer">
                  <img src={WormIcon} alt="" height={32} loading="lazy" />
                </div>
              </div>
              <div className="relayer-tx-overview-graph-step-data-container">
                <div>
                  <div className="relayer-tx-overview-graph-step-title">Time</div>
                  <div className="relayer-tx-overview-graph-step-description">
                    {parseDate(parsedVaa.timestamp * 1000)}
                  </div>
                </div>
                <div>
                  <div className="relayer-tx-overview-graph-step-title">Contract Address</div>
                  <div className="relayer-tx-overview-graph-step-description">
                    <a
                      href={getExplorerLink({
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
                </div>
              </div>
            </div>

            <div
              className={`relayer-tx-overview-graph-step signatures ${colorStatus["COMPLETED"]}`}
            >
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
                  <div className="relayer-tx-overview-graph-step-title">VAA</div>
                  <div className="relayer-tx-overview-graph-step-description">
                    {shortAddress(Buffer.from(vaa).toString("hex"))}
                    <CopyToClipboard toCopy={Buffer.from(vaa).toString("hex")}>
                      <CopyIcon />
                    </CopyToClipboard>
                  </div>
                </div>
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
                      <BlockchainIcon chainId={fromChain} size={32} />
                    </div>
                  </div>
                  <div className="relayer-tx-overview-graph-step-data-container">
                    <div>
                      <div className="relayer-tx-overview-graph-step-title">Sender Address</div>
                      <div className="relayer-tx-overview-graph-step-description">
                        <a
                          href={getExplorerLink({
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
                    </div>
                  </div>
                </div>

                <div className="relayer-tx-overview-graph-step green">
                  <div className="relayer-tx-overview-graph-step-name">
                    <div></div>
                  </div>
                  <div className="relayer-tx-overview-graph-step-iconWrapper">
                    <div className="relayer-tx-overview-graph-step-iconContainer">
                      <BlockchainIcon chainId={deliveryInstruction.targetChainId} size={32} />
                    </div>
                  </div>
                  <div className="relayer-tx-overview-graph-step-data-container">
                    <div>
                      <div className="relayer-tx-overview-graph-step-title">Delivery Provider</div>
                      <div className="relayer-tx-overview-graph-step-description">
                        <a
                          href={getExplorerLink({
                            chainId: deliveryInstruction.targetChainId,
                            value: deliveryParsedSourceProviderAddress,
                            base: "address",
                            isNativeAddress: true,
                          })}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {shortAddress(deliveryParsedSourceProviderAddress).toUpperCase()}
                        </a>{" "}
                        <CopyToClipboard toCopy={deliveryParsedSourceProviderAddress}>
                          <CopyIcon />
                        </CopyToClipboard>
                      </div>
                    </div>
                    <div>
                      <div className="relayer-tx-overview-graph-step-title">Send to</div>
                      <div className="relayer-tx-overview-graph-step-description">
                        {getChainName({ chainId: deliveryInstruction.targetChainId }).toUpperCase()}
                      </div>
                    </div>
                    <div>
                      <div className="relayer-tx-overview-graph-step-title">Target Address</div>
                      <div className="relayer-tx-overview-graph-step-description">
                        <a
                          href={getExplorerLink({
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
                    </div>
                  </div>
                </div>

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
                      <div className="relayer-tx-overview-graph-step-title">Refund to</div>
                      <div className="relayer-tx-overview-graph-step-description">
                        {getChainName({ chainId: deliveryInstruction.refundChainId }).toUpperCase()}
                      </div>
                    </div>
                    <div>
                      <div className="relayer-tx-overview-graph-step-title">Refund Address</div>
                      <div className="relayer-tx-overview-graph-step-description">
                        <a
                          href={getExplorerLink({
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
                      </div>
                    </div>
                    <div>
                      <div className="relayer-tx-overview-graph-step-title">Refund Provider</div>
                      <div className="relayer-tx-overview-graph-step-description">
                        <a
                          href={getExplorerLink({
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
                  </div>
                </div>

                {lifecycleRecord.DeliveryStatuses.map((deliveryStatus, deliveryStatusIdx) => {
                  return (
                    <Fragment key={`${idx}-${deliveryStatusIdx}`}>
                      <div className={`relayer-tx-overview-graph-step green source`}>
                        <div className="relayer-tx-overview-graph-step-name">
                          <div>DELIVERY STATUS</div>
                        </div>
                        <div className="relayer-tx-overview-graph-step-iconWrapper">
                          <div className="relayer-tx-overview-graph-step-iconContainer">
                            <img src={RelayIcon} alt="" height={32} loading="lazy" />
                          </div>
                        </div>

                        {deliveryStatus.status === "failed" ? (
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
                        ) : (
                          <div className={`relayer-tx-overview-graph-step-data-container`}>
                            <div>
                              <div className="relayer-tx-overview-graph-step-title">STATUS</div>
                              <div
                                className={`relayer-tx-overview-graph-step-description ${
                                  deliveryStatus.status === "redeemed" ? "green" : "orange"
                                }`}
                              >
                                {deliveryStatus.status.toUpperCase()}
                              </div>
                            </div>
                            <div>
                              <div className="relayer-tx-overview-graph-step-title">More data</div>
                              <div className="relayer-tx-overview-graph-step-description">DATA</div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div
                        onClick={() => {
                          setManualDeliverVaa(vaa);
                        }}
                        className="try-manual-delivery-btn"
                      >
                        Try Manual Deliver
                      </div>
                    </Fragment>
                  );
                })}
              </>
            )}

            {/* 
  
          {globalToRedeemTx && (
            <div className={`relayer-tx-overview-graph-step ${colorStatus["COMPLETED"]}`}>
              <div className="relayer-tx-overview-graph-step-name">
                <div>RELAYING</div>
              </div>
              <div className="relayer-tx-overview-graph-step-iconWrapper">
                <div className="relayer-tx-overview-graph-step-iconContainer">
                  <img src={RelayIcon} alt="" height={32} loading="lazy" />
                </div>
              </div>
              <div className="relayer-tx-overview-graph-step-data-container">
                <div>
                  <div className="relayer-tx-overview-graph-step-title">Time</div>
                  <div className="relayer-tx-overview-graph-step-description">{destinationDateParsed}</div>
                </div>
  
                <div>
                  <div className="relayer-tx-overview-graph-step-title">Redeem Tx</div>
                  <div className="relayer-tx-overview-graph-step-description">
                    <a
                      href={getExplorerLink({
                        chainId: toChain,
                        value: parsedRedeemTx,
                        isNativeAddress: true,
                      })}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {shortAddress(parsedRedeemTx).toUpperCase()}
                    </a>{" "}
                    <CopyToClipboard toCopy={parsedRedeemTx}>
                      <CopyIcon />
                    </CopyToClipboard>
                  </div>
                </div>
              </div>
            </div>
          )}
  
          {toChain && (
            <div className="relayer-tx-overview-graph-step green">
              <div className="relayer-tx-overview-graph-step-name">
                <div>DESTINATION CHAIN</div>
              </div>
              <div className="relayer-tx-overview-graph-step-iconWrapper">
                <div className="relayer-tx-overview-graph-step-iconContainer">
                  {toChain && <BlockchainIcon chainId={toChain} size={32} />}
                </div>
              </div>
              <div className="relayer-tx-overview-graph-step-data-container">
                <div>
                  <div className="relayer-tx-overview-graph-step-title">Sent to</div>
                  <div className="relayer-tx-overview-graph-step-description">
                    {toChain && getChainName({ chainId: toChain }).toUpperCase()}
                  </div>
                </div>
                <div>
                  <div className="relayer-tx-overview-graph-step-title">
                    Destination wallet
                    {isUnknownApp && (
                      <Tooltip tooltip={<NotFinalDestinationTooltip />} type="info">
                        <InfoCircledIcon />
                      </Tooltip>
                    )}
                  </div>
                  <div className="relayer-tx-overview-graph-step-description">
                    <a
                      href={getExplorerLink({
                        chainId: toChain,
                        value: parsedDestinationAddress,
                        base: "address",
                        isNativeAddress: true,
                      })}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {shortAddress(parsedDestinationAddress).toUpperCase()}
                    </a>{" "}
                    <CopyToClipboard toCopy={parsedDestinationAddress}>
                      <CopyIcon />
                    </CopyToClipboard>
                  </div>
                </div>
              </div>
            </div>
          )} */}

            <div
              style={{
                marginTop: "60px",
                display: "flex",
                flexDirection: "column",
                textAlign: "center",
                width: "100%",
              }}
            >
              {manualDeliverVaa && (
                <div
                  style={{
                    paddingTop: "10px",
                    paddingBottom: "10px",
                    borderTop: "1px solid black",
                    borderBottom: "1px solid black",
                  }}
                >
                  <h4>Manual Delivery</h4>
                  <div
                    onClick={() => setManualDeliverVaa(null)}
                    style={{ marginTop: 4, marginBottom: 4, cursor: "pointer" }}
                  >
                    Close
                  </div>
                  <div style={{ width: "50%", marginLeft: "25%" }}>
                    <button
                      onClick={() => {
                        if (isConnected) {
                          disconnect();
                        } else {
                          connect();
                        }
                      }}
                      className="manual-delivery-btn"
                    >
                      {isConnected ? `Disconnect ${shortAddress(signerAddress)}` : "Connect Wallet"}
                    </button>
                  </div>
                  <div style={{ width: "50%", marginLeft: "25%" }}>
                    <ManualDeliverDeliveryVaa rawVaa={manualDeliverVaa} />
                  </div>
                </div>
              )}

              <VaaReader
                rawVaa={vaa}
                vaa={parsedVaa}
                info={deliveryInstruction}
                isDelivery={isDelivery}
              />
            </div>
          </div>
        </div>
      </Fragment>
    );
  });

  return render;
};

export default Overview;
