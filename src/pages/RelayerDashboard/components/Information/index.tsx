import { useCallback, useState } from "react";
import { Tabs } from "src/components/organisms";
import i18n from "src/i18n";
import Overview from "./Overview/index";
import { GetTransactionsOutput, VAADetail } from "@xlabs-libs/wormscan-sdk";
import { minutesBetweenDates } from "src/utils/date";
import Summary from "./Summary";
import RawData from "./RawData";
import {
  DeliveryLifecycleRecord,
  getDeliveryStatusByVaa,
  isRedelivery,
  manualDeliver,
  parseGenericRelayerVaa,
} from "src/pages/RelayerDashboard/utils/VaaUtils";

import {
  DeliveryInstruction,
  DeliveryTargetInfo,
  RedeliveryInstruction,
} from "@certusone/wormhole-sdk/lib/cjs/relayer";

import "./styles.scss";
import { ChainId, parseVaa } from "@certusone/wormhole-sdk";
import { useEnvironment } from "../../context/EnvironmentContext";
import { Button, CircularProgress, TextField } from "@mui/material";
import { useEthereumProvider } from "../../context/EthereumProviderContext";
import { getChainInfo } from "../../utils/environment";

interface Props {
  lifecycleRecords: DeliveryLifecycleRecord[];
}

const Information = ({ lifecycleRecords }: Props) => {
  const vaaReaders = lifecycleRecords.map((record, idx) => {
    return record.vaa ? (
      <div key={"record" + idx} style={{ margin: "10px" }}>
        <VaaReader key={idx} rawVaa={record.vaa} />
      </div>
    ) : null;
  });

  // const { timestamp, symbol, emitterChain, standardizedProperties, globalTx, payload } =
  //   txData || {};

  // const { originTx, destinationTx } = globalTx || {};

  // const {
  //   fromChain: stdFromChain,
  //   toChain: stdToChain,
  //   fee: stdFee,
  // } = standardizedProperties || {};

  // const { chainId: globalFromChainId, timestamp: globalFromTimestamp } = originTx || {};

  // const {
  //   chainId: globalToChainId,
  //   timestamp: globalToTimestamp,
  //   txHash: globalToRedeemTx,
  // } = destinationTx || {};

  // const fromChain = stdFromChain || globalFromChainId || emitterChain;
  // const toChain = stdToChain || globalToChainId;
  // const startDate = timestamp || globalFromTimestamp;
  // const endDate = globalToTimestamp;
  // const fee = stdFee;
  // const transactionTimeInMinutes = globalToRedeemTx
  //   ? minutesBetweenDates(new Date(startDate), new Date(endDate))
  //   : undefined;

  // const TopSummary = useCallback(() => {
  //   return (
  //     <Summary
  //       startDate={startDate}
  //       transactionTimeInMinutes={transactionTimeInMinutes}
  //       fee={fee}
  //       symbol={symbol}
  //       originChainId={fromChain}
  //       destinationChainId={toChain}
  //     />
  //   );
  // }, [toChain, fromChain, fee, symbol, transactionTimeInMinutes, startDate]);

  return (
    <section className="tx-information">
      <Tabs
        headers={["OVERVIEW", "RAW DATA"]}
        contents={[
          <>
            {/* <TopSummary /> */}
            <div>TODO: SUMMARY HERE</div>
            {vaaReaders}
            {/* <Overview VAAData={VAAData} txData={txData} /> */}
          </>,
          <>
            {/* <TopSummary /> */}
            <div>TODO: SUMMARY HERE</div>
            <RawData lifecycleRecords={lifecycleRecords} />
          </>,
        ]}
      />
    </section>
  );
};

export { Information };

// Chase stuff
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

const Divider = <div style={{ height: 1, width: "100%", background: "grey", marginBottom: 6 }} />;

export function DeliveryInstructionDisplay({ instruction }: { instruction: DeliveryInstruction }) {
  const spacer = <div style={{ height: "10px" }} />;
  return (
    <div style={{ margin: "10px" }}>
      <h4>Delivery Instruction</h4>
      {Divider}
      <div>{"Target Chain: " + instruction.targetChainId}</div>
      <div>{"Target Address: " + Buffer.from(instruction.targetAddress).toString("hex")}</div>
      <div>{"Extra Receiver Value: " + instruction.extraReceiverValue.toString()}</div>
      <div>{"Refund Address: " + Buffer.from(instruction.refundAddress).toString("hex")}</div>
      <div>{"Refund Chain: " + instruction.refundChainId}</div>
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

export function VaaReader({ rawVaa }: { rawVaa: Uint8Array }) {
  const vaa = parseVaa(rawVaa);
  const info: DeliveryInstruction | RedeliveryInstruction | null = parseGenericRelayerVaa(vaa);

  const vaaHeaderInfo = (
    <div style={{ margin: "10px" }}>
      <h4>VAA Info </h4>
      {Divider}
      <div>Chain: {vaa.emitterChain}</div>
      <div>Emitter: {Buffer.from(vaa.emitterAddress).toString("hex")}</div>
      <div>Sequence: {vaa.sequence.toString()}</div>
      <div>Hash: {Buffer.from(vaa.hash).toString("hex")}</div>
      <div>Timestamp: {vaa.timestamp.toString()}</div>
    </div>
  );

  const isDelivery = info && !isRedelivery(info);

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
      {vaaHeaderInfo}
      <div style={{ height: "10px" }} />
      {vaaBodyInfo}
      {isDelivery && <PullDeliveryInfo rawVaa={rawVaa} />}
      {isDelivery && <ManualDeliverDeliveryVaa rawVaa={rawVaa} />}
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
      {isLoadingDeliveryInfo && <CircularProgress />}
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
    <div style={{ margin: "10px", padding: "10px" }}>
      <h4>Manual Deliver</h4>
      <Button
        onClick={onManualDeliver}
        disabled={!correctChain || isManualDelivering}
        variant="contained"
        style={{ margin: "10px" }}
      >
        Manual Deliver
      </Button>
      {!correctChain && <div>Wallet is not connected to the correct EVM network</div>}
      {!correctChain && (
        <div>
          Expected EVM Network: {targetChainInfo.evmNetworkId + " "}
          Actual EVM Network: {chainId}
        </div>
      )}
      {!correctChain && !walletIsConnected && <div>Wallet is not connected</div>}
      {providerError && <div>{"Provider Error: " + providerError}</div>}
      {manualDeliverError && <div>{manualDeliverError}</div>}
      {isManualDelivering && <CircularProgress />}
      {manualDeliverTxHash && (
        <div>{"Successfully landed the delivery: " + manualDeliverTxHash}</div>
      )}
    </div>
  );
}
