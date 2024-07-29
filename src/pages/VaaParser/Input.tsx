import { useRef, useState } from "react";
import { CopyToClipboard } from "src/components/molecules";
import { useNavigateCustom } from "src/utils/hooks";
import { base64ToHex } from "src/utils/string";
import { processInputType, processInputValue } from ".";
import { CopyIcon, InfoCircleIcon, TriangleDownIcon } from "src/icons/generic";

type Props = {
  inputType: "base64" | "hex";
  input: string;
  setInput: (str: string) => void;
  setInputType: (str: "base64" | "hex") => void;
  setTxSearch: (str: string) => void;
  setInputs: (a: any) => void;
  setInputsIndex: (a: number) => void;
};

const VaaInput = ({
  input,
  inputType,
  setInput,
  setInputType,
  setTxSearch,
  setInputs,
  setInputsIndex,
}: Props) => {
  const [hideTextarea, setHideTextarea] = useState(false);
  const textareaRef = useRef(null);
  const navigate = useNavigateCustom();

  return (
    <div className="parse-content">
      <span
        className={`parse-content-title ${hideTextarea ? "" : "rotate"}`}
        onClick={() => setHideTextarea(!hideTextarea)}
      >
        Encoded VAA <TriangleDownIcon />
      </span>

      <div
        className={`parse-input-container ${input ? "with-data" : ""} ${
          hideTextarea ? "hide" : ""
        }`}
      >
        <div className="parse-input-container-top">
          <button
            className={`parse-input-container-top-btn ${inputType === "base64" ? "active" : ""}`}
            onClick={() => {
              setInputType("base64");
            }}
          >
            Base64
          </button>
          <button
            className={`parse-input-container-top-btn ${inputType === "hex" ? "active" : ""}`}
            onClick={() => {
              setInputType("hex");
            }}
          >
            HEX
          </button>

          <div className="parse-input-container-top-copy">
            <CopyToClipboard toCopy={inputType === "base64" ? input : base64ToHex(input)}>
              Copy all
              <CopyIcon width={24} />
            </CopyToClipboard>
          </div>
        </div>

        {!input && (
          <div className="devtools-page-alert encoded">
            <div className="devtools-page-alert-info">
              <InfoCircleIcon />
              <p>Encoded VAA data will be displayed here</p>
            </div>
          </div>
        )}

        <textarea
          className="parse-input"
          id="parse-input"
          disabled={false}
          value={inputType === "base64" ? input : base64ToHex(input)}
          ref={textareaRef}
          onChange={e => {
            const targetValue = e.target.value;

            const newInput = processInputValue(targetValue);
            setInput(newInput);
            setInputType(processInputType(targetValue));

            setInputs(null);
            setInputsIndex(0);

            setTxSearch("");

            navigate(`/vaa-parser/${newInput}`, { replace: true });
            textareaRef?.current?.blur();
          }}
          name="VAA-Input"
          placeholder={`base64/hex vaa..`}
          aria-label="Base64 VAA input"
          draggable={false}
          spellCheck={false}
        />
      </div>
    </div>
  );
};

export default VaaInput;
