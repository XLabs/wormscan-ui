import { JsonText, Loader, NavLink } from "src/components/atoms";
import { useEnvironment } from "src/context/EnvironmentContext";
import {
  AlertTriangle,
  CopyIcon,
  InfoCircleIcon,
  LinkIcon,
  SearchIcon,
  TriangleDownIcon,
} from "src/icons/generic";
import { CopyToClipboard, InputEncodedVaa } from "src/components/molecules";
import { MutableRefObject } from "react";
import { stringifyWithBigInt } from "src/utils/object";

interface Step2Props {
  hideJson: boolean;
  input: string;
  inputs: Array<string>;
  inputsIndex: number;
  inputTxRef: MutableRefObject<any>;
  inputType: "base64" | "hex";
  isLoading: boolean;
  parsedRaw: boolean;
  renderExtras: () => void;
  resetResult: () => void;
  resetSubmitFields: () => void;
  resultRaw: any;
  setHideJson: (b: boolean) => void;
  setInput: (a: string) => void;
  setInputs: (a: any) => void;
  setInputsIndex: (n: number) => void;
  setInputType: (v: "base64" | "hex") => void;
  setParsedRaw: (b: boolean) => void;
  setTxSearch: (a: string) => void;
  step: number;
  txSearch: string;
  VAA_ID: string;
}

export const Step2 = ({
  hideJson,
  input,
  inputs,
  inputsIndex,
  inputTxRef,
  inputType,
  isLoading,
  parsedRaw,
  renderExtras,
  resetResult,
  resetSubmitFields,
  resultRaw,
  setHideJson,
  setInput,
  setInputs,
  setInputsIndex,
  setInputType,
  setParsedRaw,
  setTxSearch,
  step,
  txSearch,
  VAA_ID,
}: Step2Props) => {
  const { environment } = useEnvironment();

  return (
    <>
      <div className="parse-submit">
        <div className="parse-submit-progress">
          <div className={`parse-submit-progress-line ${step > 0 ? "active" : ""}`} />
          <div className={`parse-submit-progress-line ${step > 1 ? "active" : ""}`} />
          <div className={`parse-submit-progress-line ${step > 2 ? "active" : ""}`} />
          <div className={`parse-submit-progress-line ${step > 3 ? "active" : ""}`} />
        </div>

        <div className="parse-submit-step">STEP 0{step}</div>
        <div className="parse-submit-title">Let&apos;s parse and decode a VAA</div>

        <>
          <div className="parse-txType">
            <SearchIcon width={24} />
            <input
              type="text"
              className={`parse-txType-input ${txSearch && !input && !isLoading ? "error" : ""}`}
              id="parse-txType-input"
              placeholder="txHash/VaaID of transaction created with your app"
              ref={inputTxRef}
              value={txSearch}
              onChange={e => {
                setInput("");
                setInputs(null);
                setInputsIndex(0);
                resetSubmitFields();

                setTxSearch(e.target.value);
                inputTxRef?.current?.blur();
              }}
              name="txType-input"
              aria-label="Transaction hash or VAA ID input"
              spellCheck={false}
            />
          </div>
        </>
      </div>

      {txSearch && !input && !isLoading && (
        <div className="parse-txType-error">
          <AlertTriangle width={24} />
          VAA cannot be found. Please try again or search something different.
        </div>
      )}

      {txSearch && (
        <div className="parse-links">
          <button className="parse-links-reset" onClick={resetResult}>
            Reset search result
          </button>

          {!!resultRaw && input && VAA_ID && (
            <NavLink
              className="parse-links-navlink"
              target="_blank"
              to={`/tx/${txSearch ? txSearch : VAA_ID}`}
            >
              <span>View transaction details</span>
              <LinkIcon width={24} />
            </NavLink>
          )}
        </div>
      )}

      {!!inputs?.length && (
        <div className="parse-multiple">
          <span className="parse-multiple-left">
            <InfoCircleIcon width={24} />
            This txHash has multiple VAAs.
          </span>

          <div
            className="parse-multiple-right"
            onClick={() => {
              if (inputs[inputsIndex + 1]) {
                setInput(inputs[inputsIndex + 1]);
                setInputsIndex(inputsIndex + 1);
              } else {
                setInput(inputs[0]);
                setInputsIndex(0);
              }
            }}
          >
            <span className="vaa-pages">
              {inputsIndex + 1}/{inputs.length}
            </span>
            <TriangleDownIcon className="triangle-icon" width={18} />
          </div>
        </div>
      )}

      <InputEncodedVaa
        input={input}
        inputType={inputType}
        setInput={setInput}
        setInputType={setInputType}
        setTxSearch={setTxSearch}
        setInputs={setInputs}
        setInputsIndex={setInputsIndex}
        resetSubmitFields={resetSubmitFields}
        page="submit"
        network={environment.network}
      />
      <div className="parse-content">
        <span
          className={`parse-content-title ${hideJson ? "" : "rotate"}`}
          onClick={() => setHideJson(!hideJson)}
        >
          Decoded VAA <TriangleDownIcon width={10} />
        </span>

        <div
          className={`parse-result ${input ? "with-data" : ""} ${hideJson ? "hide" : ""}`}
          id="parse-result"
          aria-label="Parsed result"
        >
          <div className="parse-result-top">
            <button
              className={`parse-result-top-btn ${parsedRaw ? "active" : ""}`}
              onClick={() => {
                renderExtras();
                setParsedRaw(true);
              }}
            >
              Raw
            </button>

            <div className="parse-result-top-copy">
              <CopyToClipboard
                toCopy={resultRaw && parsedRaw ? stringifyWithBigInt(resultRaw, 4) : "{}"}
              >
                Copy all
                <CopyIcon width={24} />
              </CopyToClipboard>
            </div>
          </div>

          <div className="parse-result-json">
            {!resultRaw && !!input ? (
              <span className="parse-result-not-found">Parsing failed</span>
            ) : isLoading ? (
              <Loader />
            ) : (
              <>
                {!resultRaw && (
                  <div className="devtools-page-alert">
                    <div className="devtools-page-alert-info">
                      <InfoCircleIcon width={24} />
                      <p>Decoded VAA data will be displayed here</p>
                    </div>
                  </div>
                )}

                {!!resultRaw && input && VAA_ID && (
                  <div className="parse-result-json-text">
                    <JsonText data={resultRaw && parsedRaw ? resultRaw : {}} />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
