import { ChainId, parseVaa, tryNativeToHexString } from "@certusone/wormhole-sdk";
import { getChainInfo } from "../utils/environment";
import ChainSelector from "./chainSelector";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Button,
  CircularProgress,
  Divider,
  Paper,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import {
  DeliveryInstruction,
  DeliveryTargetInfo,
  RedeliveryInstruction,
} from "@certusone/wormhole-sdk/lib/cjs/relayer";
import {
  getDeliveryStatusByVaa,
  getGenericRelayerVaasFromTransaction,
  getVaa,
  isRedelivery,
  manualDeliver,
  parseGenericRelayerVaa,
} from "../utils/VaaUtils";
import { useLogger } from "../context/LoggerContext";
import { useEnvironment } from "../context/EnvironmentContext";
import { useEthereumProvider } from "../context/EthereumProviderContext";

//test tx hash 0xcf66519f71be66c7ab5582e864a37d686c6164a32b3df22c89b32119ecfcfc5e
//test sequence 1
//test VAA
// 010000000001005867d34b56b4433ad913e6ce2573e09d24c9f1db4317a37cdd55efe7540e1bd461641020a9d916f0eaab764fac84d4a2cb678d34f5704661ed94554e9a7e403e00000002f300000000000600000000000000000000000053855d4b64e9a3cf59a84bc768ada716b5536bc50000000000000001c80100040000000000000000000000000eb0dd3aa41bd15c706bc09bc03c002b7b85aeac00000011000000000849443a2035363537000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001e84800000000000000000000000000000000000000000000000000000004285e6049200040000000000000000000000000eb0dd3aa41bd15c706bc09bc03c002b7b85aeac0000000000000000000000001ef9e15c3bbf0555860b5009b51722027134d53a0000000000000000000000001ef9e15c3bbf0555860b5009b51722027134d53a0000000000000000000000000eb0dd3aa41bd15c706bc09bc03c002b7b85aeac00
//redelivery vaa:
// 01000000000200d92d417b5f6a20e998652d952f3af3926572f7fd143bb7ad393355f8d1bef64e65ed3f4cff4024fec68fb5f47bf557cb435801dd3896b4a9893a3b4cb3603250000147243d7b7b0e4360b3d918b1cf8a9f0cbbd95e42bf14989ecd4319a57726fab4361ab4da00534875ede2cc2e3ac13cb25a43dd583eaa2d654bbc254080a64b710100000263000000000002000000000000000000000000e66c1bc1b369ef4f376b84373e3aa004e8f4c0830000000000000008c802010002000000000000000000000000e66c1bc1b369ef4f376b84373e3aa004e8f4c083000000000000000700040000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000007a1200000000000000000000000000000000000000000000000000000004285e604920000000000000000000000001ef9e15c3bbf0555860b5009b51722027134d53a00000000000000000000000090f8bf6a479f320ead074411a4b0e7944ea8c9c1
// moonbeam mainnet example 0x6a2c36673e8cbbef29cc3bad4eabfb8edb0851c0d27defba300f80561ccecec6
export default function DeliveryStatus() {
  const { environment } = useEnvironment();
  const { log } = useLogger();
  const [chain, setChain] = useState<ChainId>(environment.chainInfos[0].chainId);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [sequence, setSequence] = useState("");
  const [queryType, setQueryType] = useState("txHash");
  const [vaaRaw, setVaaRaw] = useState("");

  const targetContract = environment.chainInfos.find(
    c => c.chainId === chain,
  )?.relayerContractAddress;
  const emitter = targetContract
    ? tryNativeToHexString(targetContract, "ethereum")
    : "Error, unconfigured";

  const [vaaResults, setVaaResults] = useState<Uint8Array[]>([]);

  const handleChange = (event: React.MouseEvent<HTMLElement>, newItem: string) => {
    setQueryType(newItem);
  };

  const toggler = (
    <ToggleButtonGroup
      color="primary"
      value={queryType}
      exclusive
      onChange={handleChange}
      aria-label="Platform"
      style={{ margin: "10px", maxHeight: "55px" }}
    >
      <ToggleButton value="txHash">TxHash</ToggleButton>
      <ToggleButton value="EmitterSeq">EmitterSeq</ToggleButton>
      <ToggleButton value="VAA">VAA</ToggleButton>
    </ToggleButtonGroup>
  );

  useEffect(() => {
    if (queryType === "txHash" && txHash) {
      setVaaResults([]);
      log && log("Fetching VAA for txHash: " + txHash, "DeliveryStatus", "info");
      setError("");
      setLoading(true);
      getGenericRelayerVaasFromTransaction(
        environment,
        getChainInfo(environment, chain as ChainId),
        txHash,
      )
        .then(vaas => {
          log &&
            log(
              "Got VAA for txHash: " + txHash + ", vaas length" + vaas.length,
              "DeliveryStatus",
              "success",
            );
          if (vaas) {
            setVaaResults(vaas);
          }
          setLoading(false);
        })
        .catch(e => {
          log && log("Error getting VAA for txHash: " + txHash, "DeliveryStatus", "error");
          log && log(e.message, "DeliveryStatus", "error");
          setError(e.message);
          setLoading(false);
        });
    } else if (queryType === "EmitterSeq") {
      if (sequence) {
        setVaaResults([]);
        log && log("Fetching VAA for EmitterSeq: " + sequence, "DeliveryStatus", "info");
        setError("");
        setLoading(true);
        getVaa(environment, getChainInfo(environment, chain as ChainId), emitter, sequence)
          .then(vaa => {
            log && log("Got VAA for EmitterSeq: " + sequence, "DeliveryStatus", "success");
            if (vaa) {
              setVaaResults([vaa]);
            }
            setLoading(false);
          })
          .catch(e => {
            log && log("Error getting VAA for EmitterSeq: " + sequence, "DeliveryStatus", "error");
            setError(e.message);
            setLoading(false);
          });
      }
    } else if (queryType === "VAA") {
      if (vaaRaw) {
        try {
          setVaaResults([]);
          setError("");
          let cloned;
          //detect if the string is base64 encoded
          const isBase64 = vaaRaw.match(/^[a-zA-Z0-9+/]+={0,2}$/);
          const isHexEncoded = vaaRaw.match(/^0x[a-fA-F0-9]+$/) || vaaRaw.match(/^[a-fA-F0-9]+$/);
          //if it is, convert it to hex
          if (isHexEncoded) {
            log && log("VAA is hex encoded", "DeliveryStatus", "info");
            cloned = vaaRaw;
          } else if (isBase64) {
            log && log("VAA is base64 encoded", "DeliveryStatus", "info");
            cloned = Buffer.from(vaaRaw, "base64").toString("hex");
          } else {
            setError("Invalid VAA");
            return;
          }
          //remove all whitespace from the hex string, and also remove the 0x prefix if it exists,
          const trimmed = cloned.replace(/\s/g, "").replace(/^0x/, "") || "";

          //convert the trimmed hex string into a Uint8Array
          const vaaBytes = new Uint8Array(
            trimmed.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)),
          );

          setVaaResults([vaaBytes]);
        } catch (e) {
          setError("Invalid VAA");
        }
      }
    } else {
      setError("Invalid query type");
    }
  }, [txHash, sequence, emitter, chain, vaaRaw, environment, queryType, log]);

  const vaaReaders = vaaResults.length > 0 && (
    <div style={{ margin: "10px" }}>
      {vaaResults.map((vaa, idx) => (
        <VaaReader key={idx} rawVaa={vaa} />
      ))}
    </div>
  );

  return (
    <Paper style={{ padding: "10px" }}>
      <Typography variant="h5">Search for Delivery VAAs</Typography>
      <div style={{ display: "flex", margin: "10px" }}>
        {toggler}
        {(queryType === "txHash" || queryType === "EmitterSeq") && (
          <ChainSelector onChainSelected={setChain} />
        )}
        {queryType === "EmitterSeq" && (
          <>
            <TextField
              helperText="Sequence"
              value={sequence}
              onChange={(e: any) => setSequence(e.target.value)}
              variant="outlined"
              style={{ flexGrow: 1, margin: "10px" }}
            />
            <TextField
              helperText="Emitter (WH format)"
              value={emitter}
              variant="outlined"
              disabled
              style={{ flexGrow: 2, margin: "10px" }}
            />
          </>
        )}
        {queryType === "txHash" && (
          <TextField
            helperText="Transaction Hash"
            value={txHash}
            onChange={(e: any) => setTxHash(e.target.value)}
            variant="outlined"
            style={{ flexGrow: 1, margin: "10px" }}
          />
        )}
        {queryType === "VAA" && (
          <TextField
            helperText="Paste either a Hex or Base64 encoded VAA here"
            value={vaaRaw}
            onChange={(e: any) => setVaaRaw(e.target.value)}
            variant="outlined"
            style={{ flexGrow: 1, margin: "10px" }}
          />
        )}
      </div>
      {error && (
        <Alert severity="error" style={{ margin: "10px" }}>
          {error}
        </Alert>
      )}
      {loading && (
        <Alert severity="info" style={{ margin: "10px" }}>
          Loading...
        </Alert>
      )}
      {vaaReaders && vaaReaders}
    </Paper>
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
