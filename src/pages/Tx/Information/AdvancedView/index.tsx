import { CopyIcon, TriangleDownIcon } from "@radix-ui/react-icons";
import { OverviewProps } from "src/pages/Tx/Information/Overview";
import { CopyToClipboard } from "src/components/molecules";
import { useLocalStorage } from "src/utils/hooks";
import { GetOperationsOutput } from "src/api/guardian-network/types";
import { JsonText } from "src/components/atoms";
import { deepCloneWithBigInt, stringifyWithBigInt } from "src/utils/object";
import Details from "./Details";
import RelayerDetails from "./Details/RelayerDetails";
import "./styles.scss";

type Props = {
  data: GetOperationsOutput;
  extraRawInfo: any;
  genericRelayerProps?: any;
  overviewAndDetailProps?: OverviewProps;
};

const AdvancedView = ({
  data,
  extraRawInfo,
  genericRelayerProps,
  overviewAndDetailProps,
}: Props) => {
  const [showDetails, setShowDetails] = useLocalStorage<boolean>("showDetails", true);
  const [showJson, setShowJson] = useLocalStorage<boolean>("showJson", false);
  const payload = data?.content?.payload;

  const lifecycleRecord = data.relayerInfo;
  const relayerInfo = data.relayerInfo?.props;
  const deliveryInstruction = relayerInfo?.deliveryInstruction;
  const decodeExecution = relayerInfo?.decodeExecution;

  const dataNoPayload = deepCloneWithBigInt(data) as GetOperationsOutput;
  delete dataNoPayload.relayerInfo;
  if (dataNoPayload.content) dataNoPayload.content.payload = undefined;
  if (dataNoPayload.decodedVaa) dataNoPayload.decodedVaa = undefined;

  const signedVAA = data.decodedVaa
    ? Object.values(data.decodedVaa).length > 0
      ? data.decodedVaa
      : null
    : null;
  if (signedVAA?.signatures) {
    delete signedVAA.signatures;
    delete signedVAA.protocolName;
    delete signedVAA.payloadName;
    delete signedVAA.payloadLiteral;
  }

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
          <BlockSection title="TX DATA" code={stringifyWithBigInt(dataNoPayload, 4)} />

          <BlockSection title="PAYLOAD" code={payload && stringifyWithBigInt(payload, 4)} />

          {!!extraRawInfo && (
            <BlockSection
              id="signatures2"
              code={stringifyWithBigInt(extraRawInfo, 4)}
              title="Extra info"
            />
          )}

          {relayerInfo && (
            <>
              {relayerInfo.isDelivery ? (
                <BlockSection
                  title="DELIVERY INSTRUCTIONS"
                  code={stringifyWithBigInt(
                    {
                      "Target Chain": deliveryInstruction.targetChainId,
                      "Target Address": deliveryInstruction.targetAddress,
                      "Extra Receiver Value": BigInt(
                        deliveryInstruction.extraReceiverValue?._hex || 0,
                      )?.toString(),
                      "Refund Address": deliveryInstruction.refundAddress,
                      "Refund Chain": deliveryInstruction.refundChainId,
                      "Refund Delivery Provider": deliveryInstruction.refundDeliveryProvider,
                      "Receiver Value": deliveryInstruction.requestedReceiverValue.toString(),
                      "Sender Address": deliveryInstruction.senderAddress,
                      "Source Delivery Provider": Buffer.from(
                        deliveryInstruction.sourceDeliveryProvider,
                      ).toString("hex"),
                      "Encoded Execution Info:": decodeExecution
                        ? decodeExecution
                        : { gasLimit: null, targetChainRefundPerGasUnused: null },
                      Payload: deliveryInstruction.payload,
                    },
                    4,
                  )}
                />
              ) : (
                <BlockSection
                  title="VAA REDELIVERY INSTRUCTIONS"
                  code={stringifyWithBigInt(
                    {
                      "Original Chain": deliveryInstruction.deliveryVaaKey.chainId,
                      "Original Emitter": deliveryInstruction.deliveryVaaKey.emitterAddress,
                      "Original Sequence": deliveryInstruction.deliveryVaaKey.sequence,
                      "Encoded Execution Info": decodeExecution
                        ? {
                            gasLimit: decodeExecution.gasLimit,
                            targetChainRefundPerGasUnused:
                              decodeExecution.targetChainRefundPerGasUnused,
                          }
                        : { gasLimit: null, targetChainRefundPerGasUnused: null },
                      "New Receiver Value": deliveryInstruction.newRequestedReceiverValue,
                      "New Sender Address": deliveryInstruction.newSenderAddress,
                      "New Delivery Provider": deliveryInstruction.newSourceDeliveryProvider,
                      "Target Chain": deliveryInstruction.targetChainId,
                    },
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

          <BlockSection
            id="signatures"
            title="SIGNED VAA"
            code={signedVAA && stringifyWithBigInt(signedVAA, 4)}
          />
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

export const BlockSection = ({ title, code, id }: { title: string; code: any; id?: string }) => {
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
    <div className="tx-advanced-view-container-block" id={id || title.replaceAll(" ", "")}>
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
