import { CopyIcon } from "@radix-ui/react-icons";
import SyntaxHighlighter from "react-syntax-highlighter";
import { vs2015 } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { CopyToClipboard } from "src/components/molecules";
import "./styles.scss";
import { DeliveryLifecycleRecord } from "src/pages/RelayerDashboard/utils/VaaUtils";

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
  return lifecycleRecords.map((record, idx) => {
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
};

export default RawData;
