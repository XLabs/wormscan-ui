import { ChainId, parseVaa, tryNativeToHexString } from "@certusone/wormhole-sdk";
import { getChainInfo } from "src/pages/RelayerDashboard/utils/environment";
import { useCallback, useEffect, useState } from "react";
import { Alert, Button, CircularProgress, Divider, TextField, Typography } from "@mui/material";
import {
  DeliveryInstruction,
  DeliveryTargetInfo,
  RedeliveryInstruction,
} from "@certusone/wormhole-sdk/lib/cjs/relayer";
import {
  DeliveryLifecycleRecord,
  getDeliveryStatusByVaa,
  getGenericRelayerVaasFromTransaction,
  getVaa,
  isRedelivery,
  manualDeliver,
  parseGenericRelayerVaa,
  populateDeliveryLifeCycleRecordsByTxHash,
  populateDeliveryLifecycleRecordByEmitterSequence,
  populateDeliveryLifecycleRecordByVaa,
} from "src/pages/RelayerDashboard//utils/VaaUtils";
import { useLogger } from "src/pages/RelayerDashboard//context/LoggerContext";
import { useEnvironment } from "src/pages/RelayerDashboard//context/EnvironmentContext";
import { useEthereumProvider } from "src/pages/RelayerDashboard//context/EthereumProviderContext";
import { getDeliveryProviderStatusBySourceTransaction } from "src/pages/RelayerDashboard//utils/deliveryProviderStatusApi";
import { BlockSection } from "src/pages/Tx/Information/RawData";
import { Loader } from "src/components/atoms";
import "./styles.scss";

//test tx hash 0xcf66519f71be66c7ab5582e864a37d686c6164a32b3df22c89b32119ecfcfc5e
//test sequence 1
//test VAA
// 010000000001005867d34b56b4433ad913e6ce2573e09d24c9f1db4317a37cdd55efe7540e1bd461641020a9d916f0eaab764fac84d4a2cb678d34f5704661ed94554e9a7e403e00000002f300000000000600000000000000000000000053855d4b64e9a3cf59a84bc768ada716b5536bc50000000000000001c80100040000000000000000000000000eb0dd3aa41bd15c706bc09bc03c002b7b85aeac00000011000000000849443a2035363537000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001e84800000000000000000000000000000000000000000000000000000004285e6049200040000000000000000000000000eb0dd3aa41bd15c706bc09bc03c002b7b85aeac0000000000000000000000001ef9e15c3bbf0555860b5009b51722027134d53a0000000000000000000000001ef9e15c3bbf0555860b5009b51722027134d53a0000000000000000000000000eb0dd3aa41bd15c706bc09bc03c002b7b85aeac00
//redelivery vaa:
// 01000000000200d92d417b5f6a20e998652d952f3af3926572f7fd143bb7ad393355f8d1bef64e65ed3f4cff4024fec68fb5f47bf557cb435801dd3896b4a9893a3b4cb3603250000147243d7b7b0e4360b3d918b1cf8a9f0cbbd95e42bf14989ecd4319a57726fab4361ab4da00534875ede2cc2e3ac13cb25a43dd583eaa2d654bbc254080a64b710100000263000000000002000000000000000000000000e66c1bc1b369ef4f376b84373e3aa004e8f4c0830000000000000008c802010002000000000000000000000000e66c1bc1b369ef4f376b84373e3aa004e8f4c083000000000000000700040000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000007a1200000000000000000000000000000000000000000000000000000004285e604920000000000000000000000001ef9e15c3bbf0555860b5009b51722027134d53a00000000000000000000000090f8bf6a479f320ead074411a4b0e7944ea8c9c1
// moonbeam mainnet example 0x6a2c36673e8cbbef29cc3bad4eabfb8edb0851c0d27defba300f80561ccecec6
// moonbeam testnet example 0x9e6e57b40afc622f66c7f29613e71da25e0137e45a3582043058527c13501c86
export default function DeliveryStatus() {
  const { environment, userInput } = useEnvironment();
  const { log } = useLogger();

  const [chain, setChain] = useState<ChainId>(environment.chainInfos[0].chainId);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  // const [txHash, setTxHash] = useState("");
  // const [sequence, setSequence] = useState("");
  // const [vaaRaw, setVaaRaw] = useState("");

  const targetContract = environment.chainInfos.find(
    c => c.chainId === chain,
  )?.relayerContractAddress;

  const emitter = targetContract
    ? tryNativeToHexString(targetContract, "ethereum")
    : "Error, unconfigured";

  const [lifecycleRecords, setLifecycleRecords] = useState<DeliveryLifecycleRecord[]>([]);

  const handleSearch = useCallback(() => {
    setError("");
    setLoading(true);
    setLifecycleRecords([]);

    let queryType;

    if (userInput.startsWith("0x")) {
      queryType = "txHash";
    } else if (!isNaN(+userInput)) {
      const maxUint64 = BigInt("18446744073709551615");
      const inputNumber = BigInt(userInput);
      if (inputNumber > 0 && inputNumber < maxUint64) {
        queryType = "EmitterSeq";
      }
    } else {
      queryType = "VAA";
    }

    console.log("User input query type:", queryType);

    if (queryType === "txHash") {
      // populateDeliveryLifeCycleRecordsByTxHash(environment, txHash)
      populateDeliveryLifeCycleRecordsByTxHash(environment, userInput)
        .then((results: DeliveryLifecycleRecord[]) => {
          setLoading(false);
          setLifecycleRecords(results);
        })
        .catch((e: any) => {
          setLoading(false);
          setError(e.message || "An error occurred.");
        });
    } else if (queryType === "EmitterSeq") {
      populateDeliveryLifecycleRecordByEmitterSequence(
        environment,
        getChainInfo(environment, chain),
        emitter,
        parseInt(userInput),
        // parseInt(sequence),
      )
        .then((results: DeliveryLifecycleRecord) => {
          setLoading(false);
          setLifecycleRecords([results]);
        })
        .catch((e: any) => {
          setLoading(false);
          setError(e.message || "An error occurred.");
        });
    } else if (queryType === "VAA") {
      // populateDeliveryLifecycleRecordByVaa(environment, vaaRaw)
      populateDeliveryLifecycleRecordByVaa(environment, userInput)
        .then((results: DeliveryLifecycleRecord) => {
          setLoading(false);
          setLifecycleRecords([results]);
        })
        .catch((e: any) => {
          setLoading(false);
          setError(e.message || "An error occurred.");
        });
    } else {
      setError("Invalid query type");
    }
  }, [chain, emitter, environment, userInput]);

  useEffect(() => {
    if (userInput) {
      handleSearch();
    }
  }, [handleSearch, userInput]);

  const vaaReaders = lifecycleRecords.map((record, idx) => {
    return record.vaa ? (
      <div key={"record" + idx} style={{ margin: "10px" }}>
        <VaaReader key={idx} rawVaa={record.vaa} />
      </div>
    ) : null;
  });

  const lifecycleRecordDisplays = lifecycleRecords.map((record, idx) => {
    return (
      <div
        key={"lifecycle" + idx}
        style={{
          display: "flex",
          whiteSpace: "normal",
          wordWrap: "break-word",
          overflowWrap: "break-word",
        }}
      >
        <div style={{ margin: "10px", maxWidth: "100%" }}>
          {
            <BlockSection
              title="Source Transaction"
              code={JSON.stringify(
                {
                  sourceTransactionHash: record.sourceTxHash,
                  sourceChain: record.sourceChainId,
                  sourceSequence: record.sourceSequence,
                  sourceReceipt: record.sourceTxReceipt,
                },
                null,
                2,
              )}
            />
          }
          {record.targetTransactions &&
            record.targetTransactions.map((tx, idx) => {
              return (
                <BlockSection
                  key={idx}
                  title={"Target Transaction " + idx}
                  code={JSON.stringify(
                    {
                      targetTransactionHash: tx.targetTxHash,
                      targetChain: tx.targetChainId,
                      targetReceipt: tx.targetTxReceipt,
                    },
                    null,
                    2,
                  )}
                />
              );
            })}

          {record.DeliveryStatuses &&
            record.DeliveryStatuses.map((info, idx) => {
              return (
                <BlockSection
                  key={idx}
                  title={"Delivery Info " + idx}
                  code={JSON.stringify(info, null, 2)}
                />
              );
            })}
        </div>
      </div>
    );
  });

  return (
    <div className="relayer-delivery-status">
      {error && (
        <Alert severity="error" style={{ margin: "10px" }}>
          {error}
        </Alert>
      )}
      {loading && (
        <div>
          <Loader />
        </div>
      )}
      {vaaReaders && vaaReaders}
      {lifecycleRecordDisplays ? lifecycleRecordDisplays : null}
    </div>
  );
}

export function VaaReader({ rawVaa }: { rawVaa: Uint8Array }) {
  const vaa = parseVaa(rawVaa);
  const info: DeliveryInstruction | RedeliveryInstruction | null = parseGenericRelayerVaa(vaa);

  const vaaHeaderInfo = (
    <div style={{ margin: "10px" }}>
      <Typography variant="h6">VAA Info </Typography>
      <Divider />
      <Typography>Chain: {vaa.emitterChain}</Typography>
      <Typography>Emitter: {Buffer.from(vaa.emitterAddress).toString("hex")}</Typography>
      <Typography>Sequence: {vaa.sequence.toString()}</Typography>
      <Typography>Hash: {Buffer.from(vaa.hash).toString("hex")}</Typography>
      <Typography>Timestamp: {vaa.timestamp.toString()}</Typography>
    </div>
  );

  const isDelivery = info && !isRedelivery(info);

  const vaaBodyInfo =
    info == null ? (
      <Typography>
        This VAA can&apos;t be parsed. It is likely not a Wormhole relayer VAA.
      </Typography>
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

export function RedeliveryInstructionDisplay({
  instruction,
}: {
  instruction: RedeliveryInstruction;
}) {
  return (
    <div style={{ margin: "10px" }}>
      <Typography variant="h6">Redelivery Instruction</Typography>
      <Typography>Original VAA Key Info</Typography>
      <Typography>{"Chain: " + instruction.deliveryVaaKey.chainId}</Typography>
      <Typography>
        {"Emitter" + Buffer.from(instruction.deliveryVaaKey.emitterAddress).toString("hex")}
      </Typography>
      <Typography>{"Sequence: " + instruction.deliveryVaaKey.sequence}</Typography>
      <div style={{ height: "10px" }} />
      <Typography>
        {"Encoded Execution Params: " +
          Buffer.from(instruction.newEncodedExecutionInfo.toString("hex"))}
      </Typography>
      <Typography>{"New Receiver Value: " + instruction.newRequestedReceiverValue}</Typography>
      <Typography>
        {"New Sender Address: " + Buffer.from(instruction.newSenderAddress).toString("hex")}
      </Typography>
      <Typography>
        {"New Delivery Provider: " +
          Buffer.from(instruction.newSourceDeliveryProvider).toString("hex")}
      </Typography>
      <Typography>{"Target Chain: " + instruction.targetChainId}</Typography>
    </div>
  );
}

export function DeliveryInstructionDisplay({ instruction }: { instruction: DeliveryInstruction }) {
  const spacer = <div style={{ height: "10px" }} />;
  return (
    <div style={{ margin: "10px" }}>
      <Typography variant="h6">Delivery Instruction</Typography>
      <Divider />
      <Typography>{"Target Chain: " + instruction.targetChainId}</Typography>
      <Typography>
        {"Target Address: " + Buffer.from(instruction.targetAddress).toString("hex")}
      </Typography>
      <Typography>
        {"Extra Receiver Value: " + instruction.extraReceiverValue.toString()}
      </Typography>
      <Typography>
        {"Refund Address: " + Buffer.from(instruction.refundAddress).toString("hex")}
      </Typography>
      <Typography>{"Refund Chain: " + instruction.refundChainId}</Typography>
      <Typography>
        {"Refund Delivery Provider: " +
          Buffer.from(instruction.refundDeliveryProvider).toString("hex")}
      </Typography>
      <Typography>{"Receiver Value: " + instruction.requestedReceiverValue.toString()}</Typography>
      <Typography>
        {"Sender Address: " + Buffer.from(instruction.senderAddress).toString("hex")}
      </Typography>
      <Typography>
        {"Source Delivery Provider: " +
          Buffer.from(instruction.sourceDeliveryProvider).toString("hex")}
      </Typography>

      <Typography variant="subtitle1">Additional Vaa Keys:</Typography>
      {instruction.vaaKeys.map(vaaKey => {
        return (
          <div key={vaaKey.chainId}>
            <Typography>{"Chain: " + vaaKey.chainId}</Typography>
            <Typography>
              {"Emitter" + Buffer.from(vaaKey.emitterAddress).toString("hex")}
            </Typography>
            <Typography>{"Sequence: " + vaaKey.sequence}</Typography>
          </div>
        );
      })}
      {spacer}
      <Typography>
        {"Encoded Execution Info: " + Buffer.from(instruction.encodedExecutionInfo).toString("hex")}
      </Typography>
      <Typography>{"Payload: " + Buffer.from(instruction.payload).toString("hex")}</Typography>
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
      <Typography variant="h6">Pull Delivery Info</Typography>
      <Divider />
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
      {deliveryInfoError && <Typography>{deliveryInfoError}</Typography>}
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
      <Divider />
      <Typography>{"GasUsed: " + info.gasUsed.toString()}</Typography>
      <Typography>
        {"New Execution Info: " + info.overrides?.newExecutionInfo?.toString("hex")}
      </Typography>
      <Typography>
        {"New Receiver Value: " + info.overrides?.newReceiverValue.toString()}
      </Typography>
      <Typography>
        {"Redelivery Hash: " + info.overrides?.redeliveryHash?.toString("hex")}
      </Typography>
      <Typography>{"Refund Status: " + info.refundStatus}</Typography>
      <Typography>{"Revert String: " + info.revertString}</Typography>
      <Typography>{"Source Chain: " + info.sourceChain}</Typography>
      <Typography>{"Source VAA Seq: " + info.sourceVaaSequence?.toString()}</Typography>
      <Typography>{"Status: " + info.status}</Typography>
      <Typography>{"TxHash: " + info.transactionHash}</Typography>
      <Typography>{"Vaa Hash: " + info.vaaHash}</Typography>
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
      <Typography variant="h6">Manual Deliver</Typography>
      <Button
        onClick={onManualDeliver}
        disabled={!correctChain || isManualDelivering}
        variant="contained"
        style={{ margin: "10px" }}
      >
        Manual Deliver
      </Button>
      {!correctChain && <Typography>Wallet is not connected to the correct EVM network</Typography>}
      {!correctChain && (
        <Typography>
          Expected EVM Network: {targetChainInfo.evmNetworkId + " "}
          Actual EVM Network: {chainId}
        </Typography>
      )}
      {!correctChain && !walletIsConnected && <Typography>Wallet is not connected</Typography>}
      {providerError && <Typography>{"Provider Error: " + providerError}</Typography>}
      {manualDeliverError && <Typography>{manualDeliverError}</Typography>}
      {isManualDelivering && <CircularProgress />}
      {manualDeliverTxHash && (
        <Typography>{"Successfully landed the delivery: " + manualDeliverTxHash}</Typography>
      )}
    </div>
  );
}
