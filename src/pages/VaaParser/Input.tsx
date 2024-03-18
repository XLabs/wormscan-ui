import { CopyIcon } from "@radix-ui/react-icons";
import { useRef } from "react";
import { CopyToClipboard } from "src/components/molecules";
import { useNavigateCustom } from "src/utils/hooks/useNavigateCustom";
import { base64ToHex } from "src/utils/string";
import { processInputType, processInputValue } from ".";

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
  const textareaRef = useRef(null);
  const navigate = useNavigateCustom();

  return (
    <div className="parse-input-container">
      <label htmlFor="parse-input">Encoded VAA</label>
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
      {input && (
        <>
          <div className="parse-input-container-format">
            <span
              onClick={() => {
                setInputType("hex");
              }}
              className={inputType === "hex" ? "active" : ""}
            >
              Hex
            </span>
            <span
              onClick={() => {
                setInputType("base64");
              }}
              className={inputType === "base64" ? "active" : ""}
            >
              Base64
            </span>
          </div>
          <div className="parse-input-container-copy">
            <CopyToClipboard toCopy={inputType === "base64" ? input : base64ToHex(input)}>
              <CopyIcon height={24} width={24} />
            </CopyToClipboard>
          </div>
        </>
      )}
    </div>
  );
};

export default VaaInput;
