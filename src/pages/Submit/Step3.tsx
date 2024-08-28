import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { Select, Tooltip } from "src/components/atoms";
import { ArrowRightIcon, ChevronLeftIcon, TrashIcon } from "src/icons/generic";

const STANDARD_DESCRIPTIONS: any = {
  tokenChain: "Origin chain id of the token that's being sent.",
  tokenAddress: "Native address format for the address of the token being sent in its origin chain",
  amount:
    "Number formatted as a string with the decimal zeros of the token; ex: if you're sending 1 USDC this should be 1000000",
  feeChain: "Origin chain id of the fee that's being charged",
  feeAddress: "Native address format for the address of the fee being sent in its origin chain",
  fee: "Number formatted as a string with the decimal zeros of the token being used as fee; ex: if you're charging 1 USDC this should be 1000000",
  fromChain: "Wormhole chain id of source chain. Ex: 1 for Solana, 2 for Ethereum, etc",
  fromAddress: "Native address format for the origin chain",
  toChain: "Wormhole chain id of target chain. Ex: 1 for Solana, 2 for Ethereum, etc",
  toAddress: "Native address format for the destination chain",
};

interface Step3Props {
  allKeys: (obj: any) => Array<any>;
  finishedParsings: any[];
  payloadOptionsStd: any;
  parsedStandardizedProperties: any;
  propertyName: string;
  setStdProperties: (a: any) => void;
  setStep: (n: number) => void;
  stdProperties: {
    tokenChain: any;
    tokenAddress: any;
    amount: any;
    feeChain: any;
    feeAddress: any;
    fee: any;
    fromChain: any;
    fromAddress: any;
    toChain: any;
    toAddress: any;
  };
}

export const Step3 = ({
  allKeys,
  finishedParsings,
  parsedStandardizedProperties,
  payloadOptionsStd,
  propertyName,
  setStdProperties,
  setStep,
  stdProperties,
}: Step3Props) => {
  const [selected, setSelected] = useState("");

  const getOptions = useMemo(() => {
    const firstOptions = allKeys(payloadOptionsStd).map(a => ({
      label: a,
      value: a,
    }));

    const secondOptions = finishedParsings[1]
      ? allKeys(finishedParsings[1].parsedPayload).map(a => ({
          label: propertyName + "." + String(a),
          value: propertyName + "." + String(a),
        }))
      : [];

    const allOptions = [...firstOptions, ...secondOptions];

    return (
      <>
        {Object.entries(stdProperties).map(([stdProp, stdValue]) => (
          <div key={stdProp} className="submit-standard-stdProps">
            <Tooltip
              enableTooltip={!stdValue}
              tooltip={<div>{STANDARD_DESCRIPTIONS[stdProp]}</div>}
              maxWidth={false}
              type="info"
            >
              <div
                onClick={() => setSelected(stdProp)}
                className={`submit-standard-btn ${stdValue ? "disabled" : ""}`}
              >
                {stdProp}
              </div>
            </Tooltip>
            {selected === stdProp && !stdValue && (
              <Select
                value={{
                  label: stdValue || "Select",
                  value: stdValue || "Select",
                }}
                onValueChange={val => {
                  console.log({ val, stdProp, stdValue });

                  if (stdProp === "toAddress" && !stdProperties.toChain) {
                    toast("You need toChain first to modify toAddress", {
                      type: "error",
                      theme: "dark",
                    });
                    return;
                  }

                  setStdProperties({
                    ...stdProperties,
                    [stdProp]: val.value,
                  });
                }}
                ariaLabel="Payload properties"
                name="payloadProperties"
                placeholder="Select"
                items={allOptions}
                controlStyles={{
                  width: 300,
                  display: "flex",
                  justifyContent: "center",
                }}
              />
            )}

            {stdValue && (
              <>
                <div className="submit-standard-btn disabled">{stdValue}</div>
                <ArrowRightIcon style={{ color: "gray" }} />
                <div className="submit-standard-value">
                  {stdProp}: {"" + parsedStandardizedProperties[stdProp]}
                </div>
                <TrashIcon
                  width={22}
                  style={{
                    color: "gray",
                    marginLeft: 8,
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    const newStdProperties: any = { ...stdProperties, [stdProp]: null };

                    if (stdProp === "toChain") {
                      newStdProperties["toAddress"] = null;
                    }

                    setStdProperties(newStdProperties);
                  }}
                />
              </>
            )}
          </div>
        ))}
      </>
    );
  }, [
    allKeys,
    finishedParsings,
    parsedStandardizedProperties,
    payloadOptionsStd,
    propertyName,
    selected,
    setStdProperties,
    stdProperties,
  ]);

  return (
    <>
      <div className="parse-submit">
        <div className="parse-submit-progress">
          <div className={"parse-submit-progress-line active"} />
          <div className={"parse-submit-progress-line active"} />
          <div className={"parse-submit-progress-line active"} />
          <div className={"parse-submit-progress-line"} />
        </div>

        <div className="parse-submit-step">STEP 03</div>
        <div className="parse-submit-title">Standardized Properties</div>

        <div className="submit-standard">
          <div className="submit-standard-description">
            <p>
              Standardized properties are properties that are usually displayed in the main view of
              WormholeScan.
            </p>
            <p>
              You can select a field of your payload and link it with one of the
              standardizedProperties if it makes sense.
            </p>
            <p>
              Example: If there{"'"}s a field in your VAA payload that represents a token that was
              sent, you can press it and select tokenAddress
            </p>
            <p>
              This step its optional but without selecting anything we are just going to be able to
              show your info as raw data in the details of the transaction
            </p>
          </div>

          <div className="submit-standard-container">{getOptions}</div>

          <div style={{ marginTop: 36, width: 2, height: 2 }} />
          <div className="parse-submit-line" />

          <div className="submit-steps">
            <div
              className="submit-steps-btn-prev"
              onClick={() => {
                setStep(2);
                window.scrollTo(0, 0);
              }}
            >
              <ChevronLeftIcon />
              Previous Step
            </div>
            <div
              onClick={() => {
                setStep(4);
                window.scrollTo(0, 0);
              }}
              className={"submit-steps-btn-next"}
            >
              Next Step
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
