import { CopyIcon, TriangleDownIcon } from "@radix-ui/react-icons";
import { parseVaa } from "@certusone/wormhole-sdk";
import {
  DeliveryInstruction,
  RedeliveryInstruction,
  parseEVMExecutionInfoV1,
} from "@certusone/wormhole-sdk/lib/cjs/relayer";
import { OverviewProps } from "src/pages/Tx/Information/Overview";
import { CopyToClipboard } from "src/components/molecules";
import {
  DeliveryLifecycleRecord,
  isRedelivery,
  parseGenericRelayerVaa,
} from "src/utils/genericRelayerVaaUtils";
import { useLocalStorage } from "src/utils/hooks";
import { GetOperationsOutput } from "src/api/guardian-network/types";
import Details from "./Details";
import RelayerDetails from "./Details/RelayerDetails";
import "./styles.scss";
import { JsonText } from "src/components/atoms";

type Props = {
  data: GetOperationsOutput;
  extraRawInfo: any;
  genericRelayerProps?: any;
  lifecycleRecord: DeliveryLifecycleRecord;
  overviewAndDetailProps?: OverviewProps;
};

const AdvancedView = ({
  data,
  extraRawInfo,
  genericRelayerProps,
  lifecycleRecord,
  overviewAndDetailProps,
}: Props) => {
  const [showDetails, setShowDetails] = useLocalStorage<boolean>("showDetails", true);
  const [showJson, setShowJson] = useLocalStorage<boolean>("showJson", false);
  const payload = data?.content?.payload;

  const noRelayerData = { ...data, relayerInfo: null as any };
  const dataNoPayload = JSON.parse(JSON.stringify(noRelayerData)) as GetOperationsOutput;
  delete dataNoPayload.relayerInfo;
  if (dataNoPayload.content) dataNoPayload.content.payload = undefined;
  if (dataNoPayload.decodedVaa) dataNoPayload.decodedVaa = undefined;

  const signedVAA = data.decodedVaa
    ? Object.values(data.decodedVaa).length > 0
      ? data.decodedVaa
      : null
    : null;

  const readVAA = (record: DeliveryLifecycleRecord) => {
    const vaa = record.vaa;
    const parsedVaa = parseVaa(vaa);
    const instruction: DeliveryInstruction | RedeliveryInstruction | null =
      parseGenericRelayerVaa(parsedVaa);

    const isDelivery = instruction && !isRedelivery(instruction);

    return { parsedVaa, isDelivery, instruction };
  };

  const relayerInfo = !!lifecycleRecord ? readVAA(lifecycleRecord) : null;
  const deliveryInstruction = relayerInfo ? (relayerInfo.instruction as DeliveryInstruction) : null;
  const redeliveryInstruction = relayerInfo
    ? (relayerInfo.instruction as RedeliveryInstruction)
    : null;
  const decodeExecution =
    relayerInfo && deliveryInstruction.encodedExecutionInfo
      ? parseEVMExecutionInfoV1(deliveryInstruction.encodedExecutionInfo, 0)[0]
      : null;

  const handleShowDetails = () => {
    setShowDetails(!showDetails);
  };

  const handleShowJson = () => {
    setShowJson(!showJson);
  };

  return (
    <div className="tx-advanced-view">
      <div className="tx-advanced-view-container">
        <Button show={showDetails} onClick={handleShowDetails}>
          {genericRelayerProps ? "Delivery Details" : "Transfer Details"}
        </Button>

        <div className={`tx-advanced-view-container-details ${showDetails ? "show" : "hide"}`}>
          {genericRelayerProps ? (
            <RelayerDetails {...genericRelayerProps} />
          ) : (
            <Details {...overviewAndDetailProps} />
          )}
        </div>

        <Button show={showJson} onClick={handleShowJson}>
          Raw Data
        </Button>

        <div className={`tx-advanced-view-container-json ${showJson ? "show" : "hide"}`}>
          <BlockSection title="TX DATA" code={JSON.stringify(dataNoPayload, null, 4)} />

          <BlockSection title="PAYLOAD" code={payload && JSON.stringify(payload, null, 4)} />

          {!!extraRawInfo && (
            <BlockSection code={JSON.stringify(extraRawInfo, null, 4)} title="Extra info" />
          )}

          {relayerInfo && (
            <>
              {relayerInfo.isDelivery ? (
                <BlockSection
                  title="DELIVERY INSTRUCTIONS"
                  code={JSON.stringify(
                    {
                      "Target Chain": deliveryInstruction.targetChainId,
                      "Target Address": Buffer.from(deliveryInstruction.targetAddress).toString(
                        "hex",
                      ),
                      "Extra Receiver Value": deliveryInstruction.extraReceiverValue.toString(),
                      "Refund Address": Buffer.from(deliveryInstruction.refundAddress).toString(
                        "hex",
                      ),
                      "Refund Chain": deliveryInstruction.refundChainId,
                      "Refund Delivery Provider": Buffer.from(
                        deliveryInstruction.refundDeliveryProvider,
                      ).toString("hex"),
                      "Receiver Value": deliveryInstruction.requestedReceiverValue.toString(),
                      "Sender Address": Buffer.from(deliveryInstruction.senderAddress).toString(
                        "hex",
                      ),
                      "Source Delivery Provider": Buffer.from(
                        deliveryInstruction.sourceDeliveryProvider,
                      ).toString("hex"),
                      "Encoded Execution Info:": decodeExecution
                        ? {
                            gasLimit: decodeExecution.gasLimit,
                            targetChainRefundPerGasUnused:
                              decodeExecution.targetChainRefundPerGasUnused,
                          }
                        : { gasLimit: null, targetChainRefundPerGasUnused: null },
                      Payload: Buffer.from(deliveryInstruction.payload).toString("hex"),
                    },
                    null,
                    4,
                  )}
                />
              ) : (
                <BlockSection
                  title="VAA REDELIVERY INSTRUCTIONS"
                  code={JSON.stringify(
                    {
                      "Original Chain": redeliveryInstruction.deliveryVaaKey.chainId,
                      "Original Emitter": Buffer.from(
                        redeliveryInstruction.deliveryVaaKey.emitterAddress,
                      ).toString("hex"),
                      "Original Sequence": redeliveryInstruction.deliveryVaaKey.sequence,
                      "Encoded Execution Info": decodeExecution
                        ? {
                            gasLimit: decodeExecution.gasLimit,
                            targetChainRefundPerGasUnused:
                              decodeExecution.targetChainRefundPerGasUnused,
                          }
                        : { gasLimit: null, targetChainRefundPerGasUnused: null },
                      "New Receiver Value": redeliveryInstruction.newRequestedReceiverValue,
                      "New Sender Address": Buffer.from(
                        redeliveryInstruction.newSenderAddress,
                      ).toString("hex"),
                      "New Delivery Provider": Buffer.from(
                        redeliveryInstruction.newSourceDeliveryProvider,
                      ).toString("hex"),
                      "Target Chain": redeliveryInstruction.targetChainId,
                    },
                    null,
                    4,
                  )}
                />
              )}

              {lifecycleRecord.DeliveryStatus && (
                <BlockSection
                  title={"DELIVERY INFO"}
                  code={JSON.stringify(lifecycleRecord.DeliveryStatus, null, 4)}
                />
              )}

              {(lifecycleRecord.sourceTxHash ||
                lifecycleRecord.sourceChainId ||
                lifecycleRecord.sourceSequence ||
                lifecycleRecord.sourceTxReceipt) && (
                <BlockSection
                  title="SOURCE TRANSACTION"
                  code={JSON.stringify(
                    {
                      sourceChain: lifecycleRecord.sourceChainId,
                      sourceReceipt: lifecycleRecord.sourceTxReceipt,
                      sourceSequence: lifecycleRecord.sourceSequence,
                      sourceTransactionHash: lifecycleRecord.sourceTxHash,
                    },
                    null,
                    4,
                  )}
                />
              )}
              {lifecycleRecord.targetTransaction && (
                <BlockSection
                  title={"TARGET TRANSACTION"}
                  code={JSON.stringify(
                    {
                      targetChain: lifecycleRecord.targetTransaction.targetChainId,
                      targetReceipt: lifecycleRecord.targetTransaction.targetTxReceipt,
                      targetTransactionHash: lifecycleRecord.targetTransaction.targetTxHash,
                    },
                    null,
                    4,
                  )}
                />
              )}
            </>
          )}

          <BlockSection title="SIGNED VAA" code={signedVAA && JSON.stringify(signedVAA, null, 4)} />
        </div>
      </div>
    </div>
  );
};

const Button = ({
  children,
  onClick,
  show,
}: {
  children: React.ReactNode;
  onClick: () => void;
  show: boolean;
}) => (
  <button className={`tx-advanced-view-container-btn ${show ? "show" : "hide"}`} onClick={onClick}>
    {children}
    <div className="tx-advanced-view-container-btn-icon">
      <TriangleDownIcon height={24} width={24} />
    </div>
  </button>
);

const BlockSection = ({ title, code }: { title: string; code: any }) => {
  if (!code) return null;
  const jsonParsed = JSON.parse(code);

  const addQuotesInKeys = (obj: any): any => {
    if (Array.isArray(obj)) {
      return obj.map(addQuotesInKeys);
    } else if (typeof obj === "object" && obj !== null) {
      // newObj = keys with quotes
      const newObj: any = {};

      for (const key in obj) {
        // add quotes to key
        const newKey = `"${key}"`;
        newObj[newKey] = addQuotesInKeys(obj[key]);
      }

      return newObj;
    } else {
      return obj;
    }
  };

  return (
    <div className="tx-advanced-view-container-block">
      <div className="tx-advanced-view-container-block-top">
        <div className="tx-advanced-view-container-block-title">{title}</div>
        <div className="tx-advanced-view-container-block-copy">
          <CopyToClipboard toCopy={code}>
            <>
              Copy <CopyIcon />
            </>
          </CopyToClipboard>
        </div>
      </div>

      <div className="tx-advanced-view-container-block-body">
        <JsonText data={jsonParsed} />
      </div>
    </div>
  );
};

export default AdvancedView;
