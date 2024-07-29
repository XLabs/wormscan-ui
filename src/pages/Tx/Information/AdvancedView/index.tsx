import { GetOperationsOutput } from "src/api/guardian-network/types";
import { deepCloneWithBigInt, stringifyWithBigInt } from "src/utils/object";
import { BlockSection } from "src/components/molecules";
import "./styles.scss";

type Props = {
  data: GetOperationsOutput;
  extraRawInfo: any;
  txIndex: number;
};

const AdvancedView = ({ data, extraRawInfo, txIndex }: Props) => {
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

  return (
    <div className="tx-advanced-view">
      <BlockSection title="Tx data" code={stringifyWithBigInt(dataNoPayload, 4)} />

      <BlockSection title="Payload" code={payload && stringifyWithBigInt(payload, 4)} />

      {!!extraRawInfo && (
        <BlockSection
          id={`signatures2${txIndex}`}
          code={stringifyWithBigInt(extraRawInfo, 4)}
          title="Extra info"
        />
      )}

      {relayerInfo && (
        <>
          {relayerInfo.isDelivery ? (
            <BlockSection
              title="Delivery Instructions"
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
              title="VAA Redelivery Instructions"
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
              title="Delivery info"
              code={JSON.stringify(lifecycleRecord.DeliveryStatus, null, 4)}
            />
          )}

          {(lifecycleRecord.sourceTxHash ||
            lifecycleRecord.sourceChainId ||
            lifecycleRecord.sourceSequence ||
            lifecycleRecord.sourceTxReceipt) && (
            <BlockSection
              title="Source transaction"
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
              title="Target transaction"
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
        id={`signatures${txIndex}`}
        title="Signed VAA"
        code={signedVAA && stringifyWithBigInt(signedVAA, 4)}
      />
    </div>
  );
};

export default AdvancedView;
