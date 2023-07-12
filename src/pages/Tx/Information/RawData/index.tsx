import { CopyIcon } from "@radix-ui/react-icons";
import { VAADetail } from "@xlabs-libs/wormscan-sdk";
import SyntaxHighlighter from "react-syntax-highlighter";
import { vs2015 } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { CopyToClipboard } from "src/components/molecules";
import "./styles.scss";

const CodeBlockStyles = {
  ...vs2015,
  "hljs-string": { color: "var(--color-white-90)" },
  "hljs-number": { color: "var(--color-alert-100)" },
  "hljs-attr": { color: "var(--color-primary-90)" },
  "hljs-literal": { color: "var(--color-information-100)" },
};

const BlockSection = ({ title, code }: { title: string; code: string }) => {
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
  VAAData: Omit<VAADetail, "vaa"> & { vaa: any };
};

const RawData = ({ VAAData }: Props) => {
  const { payload, vaa, ...rest } = VAAData || {};
  const rawData = { ...rest };
  const { payload: nestedVAAPayload, ...nestedVAARest } = vaa;
  const signedVAA = { ...nestedVAARest };
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
  ];

  return (
    <div className="tx-raw-data">
      <div className="tx-raw-data-container">
        {CODE_BLOCKS?.length > 0 &&
          CODE_BLOCKS.map(({ title, code }, index) => {
            return code && <BlockSection key={index} title={title} code={code} />;
          })}
      </div>
    </div>
  );
};

export default RawData;
