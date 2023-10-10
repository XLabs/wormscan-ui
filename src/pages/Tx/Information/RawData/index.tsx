import SyntaxHighlighter from "react-syntax-highlighter";
import { vs2015 } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { CopyIcon } from "@radix-ui/react-icons";
import { parseVaa } from "@certusone/wormhole-sdk";
import {
  DeliveryInstruction,
  RedeliveryInstruction,
  parseEVMExecutionInfoV1,
} from "@certusone/wormhole-sdk/lib/cjs/relayer";
import { CopyToClipboard } from "src/components/molecules";
import {
  DeliveryLifecycleRecord,
  isRedelivery,
  parseGenericRelayerVaa,
} from "src/utils/genericRelayerVaaUtils";
import { GetTransactionsOutput } from "src/api/search/types";
import { VAADetail } from "src/api/guardian-network/types";
import "./styles.scss";

const CodeBlockStyles = {
  ...vs2015,
  "hljs-string": { color: "var(--color-white-90)" },
  "hljs-number": { color: "var(--color-alert-100)" },
  "hljs-attr": { color: "var(--color-primary-90)" },
  "hljs-literal": { color: "var(--color-information-100)" },
};

export const BlockSection = ({ title, code }: { title: string; code: string }) => {
  return (
    <div className="tx-raw-data-container-block">
      <div className="tx-raw-data-container-block-top">
        <div className="tx-raw-data-container-block-title">{title}</div>
        <div className="tx-raw-data-container-block-copy">
          <CopyToClipboard toCopy={code}>
            <>
              Copy <CopyIcon />
            </>
          </CopyToClipboard>
        </div>
      </div>
      <div className="tx-raw-data-container-block-body">
        <SyntaxHighlighter
          language="json"
          style={CodeBlockStyles}
          className="tx-raw-data-container-block-body-code"
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
  extraRawInfo: any;
  lifecycleRecord: DeliveryLifecycleRecord;
  txData: GetTransactionsOutput;
  VAAData: VAADetail & { vaa: any; decodedVaa: any };
};

const RawData = ({ extraRawInfo, VAAData, txData, lifecycleRecord }: Props) => {
  const { payload, decodedVaa, ...rest } = VAAData || {};
  const rawData = { ...rest };
  const signedVAA = Object.values(decodedVaa).length > 0 ? decodedVaa : null;

  const CODE_BLOCKS = [
    {
      title: "RAW MESSAGE DATA",
      code: rawData && JSON.stringify(rawData, null, 4),
    },
    {
      title: "PAYLOAD",
      code: payload && JSON.stringify(payload, null, 4),
    },
    {
      title: "SIGNED VAA",
      code: signedVAA && JSON.stringify(signedVAA, null, 4),
    },
    {
      title: "TX DATA",
      code: !signedVAA && JSON.stringify(txData, null, 4),
    },
  ];

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

  return (
    <div className="tx-raw-data">
      <div className="tx-raw-data-container">
        {CODE_BLOCKS?.length > 0 &&
          CODE_BLOCKS.map(
            ({ title, code }, index) =>
              code && <BlockSection key={index} title={title} code={code} />,
          )}

        {!!extraRawInfo && (
          <BlockSection code={JSON.stringify(extraRawInfo, null, 4)} title="Extra info" />
        )}

        {relayerInfo && (
          <>
            {relayerInfo.isDelivery ? (
              <BlockSection
                title="VAA Delivery Instructions"
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
                    "Additional Vaa Keys": deliveryInstruction.vaaKeys.map(vaaKey => ({
                      Chain: vaaKey.chainId,
                      Emitter: Buffer.from(vaaKey.emitterAddress).toString("hex"),
                      Sequence: vaaKey.sequence,
                    })),
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
                title="VAA Redelivery Instructions"
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

            {(lifecycleRecord.sourceTxHash ||
              lifecycleRecord.sourceChainId ||
              lifecycleRecord.sourceSequence ||
              lifecycleRecord.sourceTxReceipt) && (
              <BlockSection
                title="Source Transaction"
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
            {lifecycleRecord.targetTransactions &&
              lifecycleRecord.targetTransactions.map((tx, idx) => {
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

            {lifecycleRecord.DeliveryStatuses &&
              lifecycleRecord.DeliveryStatuses.map((info, idx) => {
                return (
                  <BlockSection
                    key={idx}
                    title={"Delivery Info " + (idx + 1)}
                    code={JSON.stringify(info, null, 4)}
                  />
                );
              })}
          </>
        )}
      </div>
    </div>
  );
};

export default RawData;
