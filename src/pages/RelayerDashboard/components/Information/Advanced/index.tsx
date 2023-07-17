import { ChainId, parseVaa } from "@certusone/wormhole-sdk";
import "./styles.scss";
import {
  DeliveryLifecycleRecord,
  getDeliveryStatusByVaa,
  isRedelivery,
  manualDeliver,
  parseGenericRelayerVaa,
} from "src/pages/RelayerDashboard/utils/VaaUtils";
import { useEnvironment } from "src/pages/RelayerDashboard/context/EnvironmentContext";
import { Fragment, useCallback, useState } from "react";
import {
  DeliveryInstruction,
  DeliveryTargetInfo,
  RedeliveryInstruction,
  parseEVMExecutionInfoV1,
} from "@certusone/wormhole-sdk/lib/cjs/relayer";
import { Button, TextField } from "@mui/material";
import { Loader } from "src/components/atoms";
import { useEthereumProvider } from "src/pages/RelayerDashboard/context/EthereumProviderContext";
import { getChainInfo } from "src/pages/RelayerDashboard/utils/environment";
import { shortAddress } from "src/utils/crypto";
import { ChainId as ChainIds } from "@xlabs-libs/wormscan-sdk";

const Divider = <div className="divider" />;

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
      <h4>Search Delivery Info</h4>
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
      <div style={{ width: 200 }}>
        <button
          onClick={onPullDeliveryInfo}
          disabled={isLoadingDeliveryInfo}
          className="manual-delivery-btn"
        >
          PULL DELIVERY INFO
        </button>
      </div>
      {deliveryInfoError && <div>{deliveryInfoError}</div>}
      {isLoadingDeliveryInfo && <Loader />}
      {deliveryInfos.map((info, idx) => {
        return <DeliveryInfoDisplay key={idx} info={info} />;
      })}
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
      <div style={{ marginBottom: "6px" }}>
        <button
          className="manual-delivery-btn"
          onClick={onManualDeliver}
          disabled={!correctChain || isManualDelivering || !walletIsConnected}
        >
          Manual Deliver
        </button>
      </div>
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
      {isManualDelivering && <Loader />}
      {manualDeliverTxHash && (
        <div>{"Successfully landed the delivery: " + manualDeliverTxHash}</div>
      )}
    </div>
  );
}

type Props = {
  lifecycleRecords: DeliveryLifecycleRecord[];
};

const Advanced = ({ lifecycleRecords }: Props) => {
  const { environment } = useEnvironment();
  const { connect, disconnect, signerAddress, providerError } = useEthereumProvider();
  const isConnected = !!signerAddress;

  const lifecycleVaas = lifecycleRecords.filter(record => !!record.vaa);
  if (lifecycleVaas.length <= 0) return <div>No VAA was found</div>;

  const render = lifecycleVaas.map((lifecycleRecord, idx) => {
    const parsedVaa = parseVaa(lifecycleRecord.vaa);
    const instruction = parseGenericRelayerVaa(parsedVaa);
    const deliveryInstruction = instruction as DeliveryInstruction | null;
    const redeliveryInstruction = instruction as RedeliveryInstruction | null;
    const isDelivery = deliveryInstruction && !isRedelivery(deliveryInstruction);

    const decodeExecution = parseEVMExecutionInfoV1(deliveryInstruction.encodedExecutionInfo, 0)[0];

    return (
      <div key={`advanced-${idx}`} className="relayer-advanced">
        <div
          style={{
            marginTop: "24px",
            display: "flex",
            flexDirection: "column",
            textAlign: "center",
            width: "100%",
          }}
        >
          <div
            style={{
              fontSize: 24,
              borderTop: "1px solid black",
              borderBottom: "1px solid black",
              paddingTop: 12,
              paddingBottom: 12,
            }}
          >
            Advanced transaction view coming soon. Full transaction data is available on the RAW
            DATA tab.
          </div>
          <div style={{ height: 10 }} />

          {/* <div>Gas Limit: {"" + decodeExecution.gasLimit}</div>
          <div>
            Target Chain Refund Per Gas Unused: {"" + decodeExecution.targetChainRefundPerGasUnused}
          </div>
          <div style={{ height: 10 }} />
          {!!deliveryInstruction.vaaKeys.length && (
            <>
              <div>VAA Keys:</div>
              {deliveryInstruction.vaaKeys.map((ins, idx) => (
                <div key={idx}>
                  <div>
                    Chain Id: {ins.chainId}
                    {ChainIds[ins.chainId]}
                  </div>
                  <div>{Buffer.from(ins.emitterAddress).toString("hex")}</div>
                  <div>Chain Id: {"" + ins.sequence}</div>
                </div>
              ))}
            </>
          )}

          <div>Extra Receiver Value: {"" + deliveryInstruction.extraReceiverValue}</div>
          <div>Payload: {deliveryInstruction.payload}</div>
          <div>Requested Receiver Value: {"" + deliveryInstruction.requestedReceiverValue}</div>

          <div style={{ height: 15 }} />

          {lifecycleRecord.DeliveryStatuses.map((deliveryStatus, idx) => {
            const refundAddress: any = deliveryStatus.metadata?.instructions?.refundAddress;
            const refundDeliveryProvider: any =
              deliveryStatus.metadata?.instructions?.refundDeliveryProvider;
            const refundChainId = deliveryStatus.metadata?.instructions?.refundChainId;

            return (
              <Fragment key={`deliver-${idx}`}>
                {deliveryStatus.metadata.deliveryRecord && (
                  <>
                    <div>
                      Has additional VAAS:{" "}
                      {deliveryStatus.metadata.deliveryRecord.hasAdditionalVaas ? "true" : "false"}
                    </div>

                    <div>
                      Additional VAA Keys is valid format:{" "}
                      {deliveryStatus.metadata.deliveryRecord.additionalVaaKeysFormatValid
                        ? "true"
                        : "false"}
                    </div>

                    <div>
                      Has additional VAAs Hex:{" "}
                      {deliveryStatus.metadata.deliveryRecord.additionalVaasHex ? "true" : "false"}
                    </div>

                    <div style={{ height: 15 }} />

                    <div>
                      Refund Chain: {refundChainId} ({ChainIds[refundChainId]})
                    </div>
                    <div>
                      Refund Address: {Buffer.from(refundAddress, "base64").toString("hex")}
                    </div>
                    <div>
                      Refund Delivery Provider:{" "}
                      {Buffer.from(refundDeliveryProvider, "base64").toString("hex")}
                    </div>
                  </>
                )}
              </Fragment>
            );
          })} */}

          <div style={{ height: 40 }} />
          <div
            style={{
              paddingTop: "24px",
              paddingBottom: "24px",
              borderTop: "1px solid black",
              borderBottom: "1px solid black",
            }}
          >
            <h4>Manual Delivery</h4>
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
              <ManualDeliverDeliveryVaa rawVaa={lifecycleRecord.vaa} />
            </div>
          </div>
        </div>

        {environment.network === "DEVNET" && <PullDeliveryInfo rawVaa={lifecycleRecord.vaa} />}
      </div>
    );
  });

  return render;
};

export default Advanced;
