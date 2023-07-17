import { CopyIcon } from "@radix-ui/react-icons";
import SyntaxHighlighter from "react-syntax-highlighter";
import { vs2015 } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { CopyToClipboard } from "src/components/molecules";
import "./styles.scss";
import {
  DeliveryLifecycleRecord,
  isRedelivery,
  parseGenericRelayerVaa,
} from "src/pages/RelayerDashboard/utils/VaaUtils";
import { parseVaa } from "@certusone/wormhole-sdk";
import {
  DeliveryInstruction,
  RedeliveryInstruction,
  parseEVMExecutionInfoV1,
} from "@certusone/wormhole-sdk/lib/cjs/relayer";

const CodeBlockStyles = {
  ...vs2015,
  "hljs-string": { color: "var(--color-white-90)" },
  "hljs-number": { color: "var(--color-alert-100)" },
  "hljs-attr": { color: "var(--color-primary-90)" },
  "hljs-literal": { color: "var(--color-information-100)" },
};

export const BlockSection = ({ title, code }: { title: string; code: string }) => {
  return (
    <div className="relayer-tx-raw-data-container-block">
      <div className="relayer-tx-raw-data-container-block-top">
        <div className="relayer-tx-raw-data-container-block-title">{title}</div>
        <div className="relayer-tx-raw-data-container-block-copy">
          <CopyToClipboard toCopy={code}>
            <>
              Copy <CopyIcon />
            </>
          </CopyToClipboard>
        </div>
      </div>
      <div className="relayer-tx-raw-data-container-block-body">
        <SyntaxHighlighter
          language="json"
          style={CodeBlockStyles}
          className="relayer-tx-raw-data-container-block-body-code"
          customStyle={{
            padding: "16px",
            backgroundColor: "var(--color-primary-900)",
            color: "var(--color-primary-90)",
            lineHeight: "1.5",
            fontSize: "14px",
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

type Props = {
  lifecycleRecords: DeliveryLifecycleRecord[];
};

const RawData = ({ lifecycleRecords }: Props) => {
  console.log({ lifecycleRecords });

  const readVAA = (record: DeliveryLifecycleRecord) => {
    const vaa = record.vaa;
    const parsedVaa = parseVaa(vaa);
    const instruction: DeliveryInstruction | RedeliveryInstruction | null =
      parseGenericRelayerVaa(parsedVaa);

    const isDelivery = instruction && !isRedelivery(instruction);

    return { parsedVaa, isDelivery, instruction };
  };

  return lifecycleRecords.map((record, idx) => {
    const { parsedVaa, instruction, isDelivery } = readVAA(record);
    const deliveryInstruction = instruction as DeliveryInstruction;
    const redeliveryInstruction = instruction as RedeliveryInstruction;

    const decodeExecution = parseEVMExecutionInfoV1(deliveryInstruction.encodedExecutionInfo, 0)[0];

    return (
      <div key={"lifecycle" + idx} className="relayer-tx-raw-data">
        <div>
          <BlockSection
            title="VAA info"
            code={JSON.stringify(
              {
                emitterAddress: Buffer.from(parsedVaa.emitterAddress).toString("hex"),
                emitterChain: parsedVaa.emitterChain,
                sequence: parsedVaa.sequence.toString(),
                timestamp: parsedVaa.timestamp.toString(),
                vaa: Buffer.from(record.vaa).toString("hex"),
                vaaHash: Buffer.from(parsedVaa.hash).toString("hex"),
              },
              null,
              4,
            )}
          />

          {isDelivery ? (
            <BlockSection
              title="VAA Delivery Instructions"
              code={JSON.stringify(
                {
                  "Target Chain": deliveryInstruction.targetChainId,
                  "Target Address": Buffer.from(deliveryInstruction.targetAddress).toString("hex"),
                  "Extra Receiver Value": deliveryInstruction.extraReceiverValue.toString(),
                  "Refund Address": Buffer.from(deliveryInstruction.refundAddress).toString("hex"),
                  "Refund Chain": deliveryInstruction.refundChainId,
                  "Refund Delivery Provider": Buffer.from(
                    deliveryInstruction.refundDeliveryProvider,
                  ).toString("hex"),
                  "Receiver Value": deliveryInstruction.requestedReceiverValue.toString(),
                  "Sender Address": Buffer.from(deliveryInstruction.senderAddress).toString("hex"),
                  "Source Delivery Provider": Buffer.from(
                    deliveryInstruction.sourceDeliveryProvider,
                  ).toString("hex"),
                  "Additional Vaa Keys": deliveryInstruction.vaaKeys.map(vaaKey => ({
                    Chain: vaaKey.chainId,
                    Emitter: Buffer.from(vaaKey.emitterAddress).toString("hex"),
                    Sequence: vaaKey.sequence,
                  })),
                  "Encoded Execution Info:": {
                    gasLimit: decodeExecution.gasLimit,
                    targetChainRefundPerGasUnused: decodeExecution.targetChainRefundPerGasUnused,
                  },
                  Payload: Buffer.from(deliveryInstruction.payload).toString("hex"),
                },
                null,
                4,
              )}
            />
          ) : (
            <BlockSection
              title="VAA Redelivery Instructions"
              code={JSON.stringify(
                {
                  "Original Chain": redeliveryInstruction.deliveryVaaKey.chainId,
                  "Original Emitter": Buffer.from(
                    redeliveryInstruction.deliveryVaaKey.emitterAddress,
                  ).toString("hex"),
                  "Original Sequence": redeliveryInstruction.deliveryVaaKey.sequence,
                  "Encoded Execution Params": Buffer.from(
                    redeliveryInstruction.newEncodedExecutionInfo.toString("hex"),
                  ),
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

          {(record.sourceTxHash ||
            record.sourceChainId ||
            record.sourceSequence ||
            record.sourceTxReceipt) && (
            <BlockSection
              title="Source Transaction"
              code={JSON.stringify(
                {
                  sourceChain: record.sourceChainId,
                  sourceReceipt: record.sourceTxReceipt,
                  sourceSequence: record.sourceSequence,
                  sourceTransactionHash: record.sourceTxHash,
                },
                null,
                4,
              )}
            />
          )}
          {record.targetTransactions &&
            record.targetTransactions.map((tx, idx) => {
              return (
                <BlockSection
                  key={idx}
                  title={"Target Transaction " + (idx + 1)}
                  code={JSON.stringify(
                    {
                      targetChain: tx.targetChainId,
                      targetReceipt: tx.targetTxReceipt,
                      targetTransactionHash: tx.targetTxHash,
                    },
                    null,
                    4,
                  )}
                />
              );
            })}

          {record.DeliveryStatuses &&
            record.DeliveryStatuses.map((info, idx) => {
              return (
                <BlockSection
                  key={idx}
                  title={"Delivery Info " + (idx + 1)}
                  code={JSON.stringify(info, null, 4)}
                />
              );
            })}
        </div>
      </div>
    );
  });
};

export default RawData;
