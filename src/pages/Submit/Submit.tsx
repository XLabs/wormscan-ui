import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import {
  chainToChainId,
  deserializeLayout,
  layoutItems,
  CustomConversion,
  LayoutItem,
  range,
  UniversalAddress,
  chains,
  bitsetItem,
  encoding,
} from "@wormhole-foundation/sdk";
import { deepCloneWithBigInt } from "src/utils/object";
import { JsonText } from "src/components/atoms";
import { useLocalStorage } from "src/utils/hooks";
import { toast } from "react-toastify";
import { TrashIcon, CheckIcon, CheckCircle2, EnterIcon } from "src/icons/generic";
import "./styles.scss";

type Layouts =
  | "payloadId"
  | "address"
  | "chain"
  | "amount"
  | "fixedLengthString"
  | "variableLengthString"
  | "booleanItem"
  | "custom"
  | "bitsetItem";

type Binaries = "uint" | "int" | "bytes" | "array" | "switch";
type Endianness = "default" | "little";

type UserLayout = {
  selected: Layouts;
  inputName: string;
  id?: string;
  size?: string;
  lengthSize?: string;
  binarySelected?: Binaries;
  endianness?: Endianness;
  bitsetValues?: string[];
  omit?: boolean;
  layout?: UserLayout[];
  layouts?: ISwitchLayouts;
};

type SubmitProps = {
  resultRaw: Uint8Array;
  renderExtras: () => void;
  setVaaSubmit?: (a: any) => void;
  setParsedVAA?: (a: any) => void;
  isInternal?: boolean;
  internalLayoutName?: string;
  setSwitchLayout?: (u: UserLayout[]) => void;
  setInternalLayout?: (u: UserLayout[]) => void;
};

const DEFINED_LAYOUTS = [
  "Clear All",
  "Portal Bridge",
  "CCTP Wormhole Integration",
  "Standard Relayer",
];

export const Submit = ({
  resultRaw,
  renderExtras,
  setParsedVAA,
  isInternal,
  internalLayoutName,
  setSwitchLayout,
  setInternalLayout,
  setVaaSubmit,
}: SubmitProps) => {
  const [userLayout, setUserLayout] = useState<UserLayout[]>([]);
  const [parsingLayout, setParsingLayout] = useState([]);

  const [selected, setSelected] = useState<Layouts>(null);
  const [inputName, setInputName] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [tagIdValue, setTagIdValue] = useState("");
  const [tagNameValue, setTagNameValue] = useState("");
  const [switchLayouts, setSwitchLayouts] = useState<ISwitchLayouts>([]);
  const [internalLayouts, setInternalLayouts] = useState<UserLayout[]>([]);

  const [binarySelected, setBinarySelected] = useState<Binaries>(null);
  const [endianness, setEndianness] = useState<Endianness>("default");
  const [bitsetValues, setBitsetValues] = useState<string[]>([]);
  const [isLengthSize, setIsLengthSize] = useState(false);
  const [shouldOmit, setShouldOmit] = useState(false);
  const [isAboutToLayout, setIsAboutToLayout] = useState(false);

  const [selectedBaseLayout, setSelectedBaseLayout] = useState("");

  const [result, setResult] = useState<any>({});
  const [resultLength, setResultLength] = useState(0);

  const [saveLayoutTitle, setSaveLayoutTitle] = useState("");
  const [savedLayouts, setSavedLayouts] = useLocalStorage<[string, UserLayout[]][]>(
    "savedLayouts",
    null,
  );

  const layouts: { [key in Layouts]: any } = useMemo(
    () => ({
      payloadId: (id: string, name: string, omit: boolean) => ({
        ...layoutItems.payloadIdItem(+id),
        name,
        omit,
      }),
      address: () => layoutItems.universalAddressItem,
      chain: () => layoutItems.chainItem(),
      amount: () => layoutItems.amountItem,
      fixedLengthString: (length: string) => fixedLengthStringItem(+length),
      variableLengthString: () => variableLengthStringItem,
      booleanItem: () => booleanItem,
      bitsetItem: (bitsets: string[]) => bitsetItem(bitsets),
      custom: (
        size: string,
        lengthSize: string,
        binary: Binaries,
        endian: Endianness,
        layout: any,
      ) => {
        const newLayout: any = {
          binary: binary,
          endianness: endian === "default" ? "big" : "little",
        };
        if (size) {
          if (binary === "switch") {
            newLayout.idSize = +size;
          } else {
            newLayout.size = +size;
          }
        }

        if (lengthSize) {
          newLayout.lengthSize = +lengthSize;
        }

        if (layout) {
          newLayout.layout = layout;
        }
        return newLayout;
      },
    }),
    [],
  );

  const readableLayoutToLayout = useCallback(
    (lay: UserLayout[]): any => {
      return lay.map(layout => {
        let parsedLayout: any = {
          name: layout.inputName,
        };

        if (layout.omit) parsedLayout.omit = true;

        if (
          ["address", "chain", "amount", "variableLengthString", "booleanItem"].includes(
            layout.selected,
          )
        ) {
          parsedLayout = { ...parsedLayout, ...layouts[layout.selected]() };
        }

        if (layout.selected === "payloadId") {
          parsedLayout = {
            ...parsedLayout,
            ...layouts["payloadId"](layout.id, layout.inputName, layout.omit),
          };
        }

        if (layout.selected === "fixedLengthString") {
          parsedLayout = { ...parsedLayout, ...layouts["fixedLengthString"](layout.size) };
        }

        if (layout.selected === "custom") {
          parsedLayout = {
            ...parsedLayout,
            ...layouts["custom"](
              layout.size,
              layout.lengthSize,
              layout.binarySelected,
              layout.endianness,
              layout.layout ? readableLayoutToLayout(layout.layout) : null,
            ),
          };

          if (layout.binarySelected === "switch") {
            parsedLayout.idTag = layout.inputName;
            const parsedSwitchLayouts = layout.layouts.map(a => {
              return [[a[0][0], a[0][1]], readableLayoutToLayout(a[1])];
            });

            parsedLayout.layouts = parsedSwitchLayouts;
          }
        }

        if (layout.selected === "bitsetItem") {
          parsedLayout = { ...parsedLayout, ...layouts["bitsetItem"](layout.bitsetValues) };
        }

        return parsedLayout;
      });
    },
    [layouts],
  );

  const resultRawHex = resultRaw ? encoding.hex.encode(resultRaw) : "";
  const resultParsed = resultRawHex.substring(0, resultLength);
  const resultUnparsed = resultRawHex.substring(resultLength);
  const resultUnparsedArray = encoding.hex.decode(`0x${resultUnparsed}`);

  useEffect(() => {
    if (selectedBaseLayout && result && !resultUnparsed) {
      const newParsedPayload = deepCloneWithBigInt(result);
      newParsedPayload.callerAppId = selectedBaseLayout;

      setParsedVAA({
        parsedPayload: newParsedPayload,
        userLayout: userLayout,
      });
    }
  }, [selectedBaseLayout, result, userLayout, resultUnparsed, setParsedVAA]);

  useEffect(() => {
    setParsingLayout(readableLayoutToLayout(userLayout));
  }, [layouts, readableLayoutToLayout, userLayout]);

  const baseLayouts: any = useMemo(() => {
    const BASE_LAYOUTS: any = {
      "Clear All": () => [] as any,
      "Portal Bridge": () =>
        [
          { inputName: "payloadId", selected: "payloadId", id: "3" },
          { inputName: "amount", selected: "amount" },
          { inputName: "tokenAddress", selected: "address" },
          { inputName: "tokenChain", selected: "chain" },
          { inputName: "toAddress", selected: "address" },
          { inputName: "toChain", selected: "chain" },
          { inputName: "fromAddress", selected: "address" },
        ] as UserLayout[],
      "CCTP Wormhole Integration": () => {
        setSelectedBaseLayout("CCTP_WORMHOLE_INTEGRATION");
        return [
          { inputName: "payloadId", selected: "payloadId", id: "1" },
          { inputName: "tokenAddress", selected: "address" },
          { inputName: "amount", selected: "amount" },
          {
            inputName: "sourceDomain",
            selected: "custom",
            size: "4",
            binarySelected: "uint",
            endianness: "default",
          },
          {
            inputName: "targetDomain",
            selected: "custom",
            size: "4",
            binarySelected: "uint",
            endianness: "default",
          },
          {
            inputName: "nonce",
            selected: "custom",
            size: "8",
            binarySelected: "uint",
            endianness: "default",
          },
          { inputName: "caller", selected: "address" },
          { inputName: "mintRecipient", selected: "address" },
          {
            inputName: "parsedPayload",
            selected: "custom",
            lengthSize: "2",
            binarySelected: "bytes",
            endianness: "default",
          },
        ] as UserLayout[];
      },
      "Standard Relayer": () => {
        setSelectedBaseLayout("GENERIC_RELAYER");
        return [
          { inputName: "payloadId", selected: "payloadId", id: "1", omit: true },
          { inputName: "targetChainId", selected: "chain" },
          { inputName: "targetAddress", selected: "address" },
          {
            inputName: "payload",
            selected: "custom",
            lengthSize: "4",
            binarySelected: "bytes",
            endianness: "default",
          },
          { inputName: "requestedReceiverValue", selected: "amount" },
          { inputName: "extraReceiverValue", selected: "amount" },
          {
            inputName: "executionInfo",
            selected: "custom",
            binarySelected: "bytes",
            endianness: "default",
            layout: [
              {
                inputName: "size",
                selected: "custom",
                size: "4",
                binarySelected: "uint",
                endianness: "default",
                omit: true,
              },
              {
                inputName: "waste",
                selected: "custom",
                size: "31",
                binarySelected: "uint",
                endianness: "default",
                omit: true,
              },
              {
                inputName: "version",
                selected: "custom",
                size: "1",
                binarySelected: "uint",
                endianness: "default",
                omit: true,
              },
              { inputName: "gasLimit", selected: "amount" },
              { inputName: "targetChainRefundPerGasUnused", selected: "amount" },
            ],
          },
          { inputName: "refundChainId", selected: "chain" },
          { inputName: "refundAddress", selected: "address" },
          { inputName: "refundDeliveryProvider", selected: "address" },
          { inputName: "sourceDeliveryProvider", selected: "address" },
          { inputName: "senderAddress", selected: "address" },
          {
            inputName: "messageKeys",
            selected: "custom",
            lengthSize: "1",
            binarySelected: "array",
            endianness: "default",
            layout: [
              {
                inputName: "keyType",
                selected: "custom",
                size: "1",
                binarySelected: "switch",
                endianness: "default",
                layouts: [
                  [
                    [1, "VAA"],
                    [
                      { inputName: "chain", selected: "chain" },
                      { inputName: "emitter", selected: "address" },
                      {
                        inputName: "sequence",
                        selected: "custom",
                        size: "8",
                        binarySelected: "uint",
                        endianness: "default",
                      },
                    ],
                  ],
                  [
                    [2, "CCTP"],
                    [
                      {
                        inputName: "size",
                        selected: "custom",
                        size: "4",
                        binarySelected: "uint",
                        endianness: "default",
                        omit: true,
                      },
                      {
                        inputName: "domain",
                        selected: "custom",
                        size: "4",
                        binarySelected: "uint",
                        endianness: "default",
                      },
                      {
                        inputName: "nonce",
                        selected: "custom",
                        size: "8",
                        binarySelected: "uint",
                        endianness: "default",
                      },
                    ],
                  ],
                ],
              },
            ],
          },
        ] as UserLayout[];
      },
    };

    savedLayouts?.forEach(LAY => {
      BASE_LAYOUTS[LAY[0]] = () => LAY[1];
    });

    return BASE_LAYOUTS;
  }, [savedLayouts]);

  useEffect(() => {
    try {
      const result = deserializeLayout(parsingLayout, resultRaw);

      setResultLength(resultRawHex.length);
      setResult(processResult(result));
    } catch (e) {
      const err = e as unknown as Error;

      let partialParsingWorked = false;
      try {
        if (err?.message?.includes("longer than expected: ")) {
          const errStr = err.message.split("longer than expected: ");
          if (errStr?.[1]) {
            const expectedAndCurrent = errStr[1];
            const [expected, current] = expectedAndCurrent.split(" > ");

            const resultRawPartial = resultRaw.slice(0, +current);

            const resultPartial = deserializeLayout(parsingLayout, resultRawPartial);

            Object.entries(resultPartial);

            setResultLength(+current * 2);
            setResult(processResult(resultPartial));
            partialParsingWorked = true;
          }
        }
      } catch (e2) {
        setResult({});
        console.log("error parsing partial payload");
        console.log({ e2 });
      }

      if (!partialParsingWorked) {
        setResult({});
        console.log("error parsing full payload");
        console.log({ e });
      }
    }

    renderExtras();
  }, [resultRaw, resultRawHex.length, parsingLayout, renderExtras]);

  const finishedParsing = Boolean(resultLength && resultUnparsed.length === 0);

  const toRemoveFromPayload = +inputValue;
  const resultUnparsedProcessed = resultUnparsedArray.slice(toRemoveFromPayload);

  const [newSwitchLayout, setNewSwitchLayout] = useState<UserLayout[]>([]);
  const [newInternalLayout, setNewInternalLayout] = useState<UserLayout[]>([]);

  useEffect(() => {
    if (newInternalLayout.length) {
      setInternalLayouts(newInternalLayout);
      setNewInternalLayout([]);
    }
  }, [internalLayouts, newInternalLayout, setInternalLayouts]);

  useEffect(() => {
    if (newSwitchLayout.length) {
      setSwitchLayouts([...switchLayouts, [[+tagIdValue, tagNameValue], newSwitchLayout]]);
      setTagIdValue("");
      setTagNameValue("");
      setNewSwitchLayout([]);
    }
  }, [
    newSwitchLayout,
    setSwitchLayouts,
    setTagIdValue,
    setTagNameValue,
    switchLayouts,
    tagIdValue,
    tagNameValue,
  ]);

  return (
    <div className="submit">
      <span className="submit-title">Payload</span>
      <br />
      <br />
      <span className="submit-parsed">{resultParsed}</span>
      <span className="submit-unparsed">{resultUnparsed}</span>
      {finishedParsing && <CheckCircle2 style={{ marginLeft: 6, color: "green" }} width={20} />}
      <br />
      <br />
      {!isInternal && (
        <>
          <br />
          Select a layout as a base
          <br />
          <br />
          <div>
            {Object.keys(baseLayouts).map(item => {
              return (
                <div key={item} className="submit-base-layouts">
                  <div
                    onClick={() => {
                      setUserLayout(baseLayouts[item]());
                      if (item !== "Portal Bridge" && item !== "Clear All") {
                        setSaveLayoutTitle(item);
                      } else {
                        setSaveLayoutTitle("");
                        setSelectedBaseLayout("");
                      }
                    }}
                    className="submit-btn"
                  >
                    <span>{item}</span>

                    {!DEFINED_LAYOUTS.includes(item) && (
                      <div
                        onClick={() => {
                          setSavedLayouts(savedLayouts.filter(a => a[0] !== item));
                        }}
                        className="submit-base-layouts-delete"
                      >
                        <TrashIcon />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <br />
          <br />
        </>
      )}
      <div className="parse-submit-line" />
      <br />
      <br />
      <span className="submit-title">Create your layout</span>
      <div>
        <br />

        <input
          className="submit-input"
          placeholder="item name"
          value={inputName}
          onChange={ev => {
            setInputName(ev.target.value.replaceAll(".", ""));
          }}
        />

        <br />
        <br />

        <div className="submit-layout-container">
          <div className="submit-layout-container-box">
            <div className="submit-layout-container-subtitle">Type:</div>

            <div className="submit-layout-container-types">
              {(Object.keys(layouts) as Layouts[]).map(item => (
                <button
                  key={item}
                  className="submit-layout-button"
                  onClick={() => {
                    setSelected(item);
                  }}
                  style={{ backgroundColor: selected === item ? "#333" : "#121212" }}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="submit-layout-container-box">
            <div className="submit-layout-container-subtitle">
              {selected === "custom" && "binary"}
              {selected === "payloadId" ||
              selected === "fixedLengthString" ||
              selected === "bitsetItem"
                ? selected
                : ""}
            </div>

            <div className="submit-layout-container-options">
              {selected === "bitsetItem" && (
                <>
                  <div className="submit-layout-bitset">
                    <input
                      className="submit-layout-input"
                      placeholder={`bitset item #${bitsetValues.length + 1}`}
                      value={inputValue}
                      onChange={e => setInputValue(e.target.value)}
                      onKeyDown={event => {
                        if (event.key === "Enter" || event.keyCode === 13) {
                          setBitsetValues([...bitsetValues, inputValue]);
                          setInputValue("");
                        }
                      }}
                    />
                    <div className="submit-layout-plus">press ↵ to add</div>
                  </div>

                  <div className="submit-layout-bitset-options">
                    {bitsetValues.map((bit, i) => (
                      <div key={i} className="submit-btn">
                        <span>{bit}</span>
                        <div
                          onClick={() => {
                            setBitsetValues(bitsetValues.filter((_val, idx) => i !== idx));
                          }}
                          className="submit-base-layouts-delete"
                        >
                          <TrashIcon />
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {selected === "payloadId" && (
                <input
                  className="submit-layout-input"
                  placeholder="id"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                />
              )}

              {selected === "fixedLengthString" && (
                <input
                  className="submit-layout-input"
                  placeholder="length"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                />
              )}

              {selected === "custom" && (
                <>
                  <div className="submit-layout-custom">
                    <button
                      className="submit-layout-button"
                      onClick={() => {
                        setBinarySelected("uint");
                      }}
                      style={{ backgroundColor: binarySelected === "uint" ? "#333" : "#121212" }}
                    >
                      uint
                    </button>
                    <button
                      className="submit-layout-button"
                      onClick={() => {
                        setBinarySelected("int");
                      }}
                      style={{ backgroundColor: binarySelected === "int" ? "#333" : "#121212" }}
                    >
                      int
                    </button>
                    <button
                      className="submit-layout-button"
                      onClick={() => {
                        setBinarySelected("bytes");
                      }}
                      style={{
                        backgroundColor: binarySelected === "bytes" ? "#333" : "#121212",
                      }}
                    >
                      bytes
                    </button>
                    <button
                      className="submit-layout-button"
                      onClick={() => {
                        setBinarySelected("array");
                      }}
                      style={{
                        backgroundColor: binarySelected === "array" ? "#333" : "#121212",
                      }}
                    >
                      array
                    </button>
                    <button
                      className="submit-layout-button"
                      onClick={() => {
                        setBinarySelected("switch");
                      }}
                      style={{
                        backgroundColor: binarySelected === "switch" ? "#333" : "#121212",
                      }}
                    >
                      switch
                    </button>
                  </div>

                  <div className="submit-layout-container-subtitle mtop">endianness:</div>
                  <div className="submit-layout-custom">
                    <button
                      className="submit-layout-button"
                      onClick={() => {
                        setEndianness("default");
                      }}
                      style={{ backgroundColor: endianness === "default" ? "#333" : "#121212" }}
                    >
                      default
                    </button>
                    <button
                      className="submit-layout-button"
                      onClick={() => {
                        setEndianness("little");
                      }}
                      style={{ backgroundColor: endianness === "little" ? "#333" : "#121212" }}
                    >
                      little
                    </button>
                  </div>

                  <div className="submit-layout-container-subtitle mtop">
                    {isLengthSize ? "lengthSize" : "size"}:
                  </div>
                  <div>
                    <input
                      className="submit-layout-input"
                      style={{ width: 140 }}
                      placeholder="size"
                      value={inputValue}
                      onChange={e => setInputValue(e.target.value)}
                    />
                    {binarySelected !== "switch" && (
                      <span
                        onClick={() => setIsLengthSize(!isLengthSize)}
                        className="submit-switch-size-text"
                      >
                        Switch to {isLengthSize ? "size" : "lengthSize"}
                      </span>
                    )}
                  </div>

                  <br />
                  <br />

                  {binarySelected === "switch" && inputValue && (
                    <div className="submit-layout-switch-menu">
                      <div>layouts:</div>
                      {switchLayouts.map((lay, i) => {
                        const [ID, NAME] = lay[0];
                        const LAYOUT = lay[1];

                        return (
                          <div key={ID} className="submit-selectedLayouts">
                            <div>
                              {i === 0 && (
                                <div>
                                  <br />
                                  ADDED SWITCHES:
                                  <br />
                                  <br />
                                </div>
                              )}
                              <div>ID: {ID}</div>
                              <div>NAME: {NAME}</div>
                              <div>LAYOUT: {JSON.stringify(LAYOUT)}</div>
                              <br />
                            </div>
                          </div>
                        );
                      })}

                      <br />
                      <div>ADD NEW SWITCH</div>
                      <input
                        className="submit-layout-input"
                        placeholder="layout id"
                        value={tagIdValue}
                        onChange={e => setTagIdValue(e.target.value)}
                      />
                      <input
                        className="submit-layout-input"
                        placeholder="layout id"
                        value={tagNameValue}
                        onChange={e => setTagNameValue(e.target.value)}
                      />
                      <br />
                      <br />
                      {tagIdValue && tagNameValue && (
                        <Submit
                          renderExtras={renderExtras}
                          setSwitchLayout={setNewSwitchLayout}
                          isInternal
                          internalLayoutName={tagNameValue}
                          resultRaw={resultUnparsedProcessed}
                        />
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {selected === "custom" &&
              (binarySelected === "bytes" || binarySelected === "array") && (
                <div className="submit-options">
                  <div
                    onClick={() => {
                      setShouldOmit(false);
                      setIsAboutToLayout(!isAboutToLayout);
                    }}
                    className={`submit-options-checkbox ${isAboutToLayout ? "checked" : ""}`}
                  >
                    {isAboutToLayout && <CheckIcon />}
                  </div>
                  <div>Create a layout for this item</div>
                </div>
              )}
          </div>
        </div>

        <br />
        {!isAboutToLayout && binarySelected !== "switch" && (
          <div className="submit-options">
            <div
              className={`submit-options-checkbox ${shouldOmit ? "checked" : ""}`}
              onClick={() => setShouldOmit(!shouldOmit)}
            >
              {shouldOmit && <CheckIcon />}
            </div>
            <div className="submit-options-omit">omit from payload parsing</div>
          </div>
        )}

        {(binarySelected === "bytes" || binarySelected === "array") && isAboutToLayout && (
          <div className="submit-layout-switch-menu">
            <div className="submit-layout-switch-menu-title">
              <EnterIcon />
              <span>Create your layout</span>
            </div>
            <Submit
              renderExtras={renderExtras}
              setInternalLayout={setNewInternalLayout}
              isInternal
              internalLayoutName={inputName}
              resultRaw={resultUnparsedProcessed}
            />
          </div>
        )}

        <div
          onClick={() => {
            setSelectedBaseLayout("");

            if (selected && inputName) {
              if (selected === "payloadId" && !inputValue) return;
              if (selected === "fixedLengthString" && !inputValue) return;
              if (selected === "bitsetItem" && bitsetValues.length === 0) return;
              if (userLayout.find(a => a.inputName === inputName)) return;
              if (selected === "custom" && !binarySelected) return;
              if (selected === "custom" && !inputValue && !isAboutToLayout) return;
              if (selected === "custom" && binarySelected === "switch" && !switchLayouts.length)
                return;

              const newUserLayout: UserLayout = { inputName, selected };

              if (selected === "payloadId") {
                newUserLayout.id = inputValue;
              }
              if (selected === "custom") {
                if (inputValue) {
                  if (isLengthSize) {
                    newUserLayout.lengthSize = inputValue;
                  } else {
                    newUserLayout.size = inputValue;
                  }
                }

                newUserLayout.binarySelected = binarySelected;
                newUserLayout.endianness = endianness;

                if (binarySelected === "switch") {
                  newUserLayout.layouts = switchLayouts;
                }

                if ((binarySelected === "array" || binarySelected === "bytes") && isAboutToLayout) {
                  newUserLayout.layout = internalLayouts;
                }
              }
              if (selected === "bitsetItem") {
                newUserLayout.bitsetValues = bitsetValues;
              }
              if (selected === "fixedLengthString") {
                newUserLayout.size = inputValue;
              }

              if (shouldOmit) newUserLayout.omit = true;

              if (isInternal && setInternalLayout)
                setInternalLayout([...userLayout, newUserLayout]);
              setUserLayout([...userLayout, newUserLayout]);

              setShouldOmit(false);
              setInputValue("");
              setBitsetValues([]);
              setInputName("");
              setIsLengthSize(false);
              setIsAboutToLayout(false);
            }
          }}
          className="add-btn"
        >
          Add
        </div>

        <br />
        <br />
        {isInternal && internalLayoutName && setSwitchLayout && (
          <>
            <div
              onClick={() => {
                setSwitchLayout(userLayout);
              }}
              className="submit-btn"
            >
              FINISH LAYOUT FOR {internalLayoutName}
            </div>
            <br />
            <br />
          </>
        )}

        <div className="submit-json-texts">
          <div className="submit-json-texts-item">
            {userLayout.map((item, i) => {
              const entries = Object.entries(item);

              return (
                <div key={i} className="submit-selectedLayouts">
                  {entries.map((entry, idx) => {
                    return (
                      <Fragment key={entry[0]}>
                        {idx === 0 && <span>{"{ "}</span>}

                        <span className="submit-json-texts-item-key">{'"' + entry[0] + '"'}: </span>
                        <span className="submit-json-texts-item-value">
                          {'"' +
                            (typeof entry[1] === "object"
                              ? JSON.stringify(entry[1])
                              : String(entry[1])) +
                            '"'}
                        </span>
                        {idx + 1 !== entries.length && <span>, </span>}
                        {idx + 1 === entries.length && <span>{" }"}</span>}
                      </Fragment>
                    );
                  })}
                  {userLayout.length - 1 === i && (
                    <TrashIcon
                      width={22}
                      onClick={() => {
                        setSelectedBaseLayout("");
                        setUserLayout(userLayout.filter(a => a.inputName !== item.inputName));
                      }}
                      className="submit-selectedLayouts-remove"
                    />
                  )}
                </div>
              );
            })}
          </div>
          <div className="submit-json-texts-item">
            <JsonText data={deepCloneWithBigInt(result)} />
          </div>
        </div>

        <br />
        <br />

        {!isInternal && (
          <div className="submit-save-finish">
            <input
              className="submit-input"
              placeholder="layout name"
              value={saveLayoutTitle}
              onChange={e => setSaveLayoutTitle(e.target.value)}
            />
            <div
              onClick={() => {
                if (saveLayoutTitle) {
                  if (savedLayouts) {
                    setSavedLayouts([...savedLayouts, [saveLayoutTitle, userLayout]]);
                  } else {
                    setSavedLayouts([[saveLayoutTitle, userLayout]]);
                  }
                } else {
                  toast("layout name missing", {
                    type: "error",
                    theme: "dark",
                    position: "bottom-center",
                  });
                }
              }}
              className="submit-btn save"
            >
              Save
            </div>

            {finishedParsing && (
              <div
                onClick={() => {
                  if (saveLayoutTitle) {
                    if (savedLayouts) {
                      setSavedLayouts([...savedLayouts, [saveLayoutTitle, userLayout]]);
                    } else {
                      setSavedLayouts([[saveLayoutTitle, userLayout]]);
                    }

                    const newParsedPayload = deepCloneWithBigInt(result);
                    newParsedPayload.callerAppId = saveLayoutTitle;
                    setParsedVAA({
                      parsedPayload: newParsedPayload,
                      userLayout: userLayout,
                    });
                  } else {
                    toast("layout name missing", {
                      type: "error",
                      theme: "dark",
                      position: "bottom-center",
                    });
                  }
                }}
                className="submit-btn primary"
              >
                Finish Parsing
              </div>
            )}

            {resultRaw && (
              <>
                <div className="submit-start-parsing">
                  <div onClick={() => setVaaSubmit(null)} className="submit-btn">
                    Cancel Parsing
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

type ISwitchLayouts = [[number, string], any][];

// utils
const toString = (val: Uint8Array) =>
  range(val.byteLength)
    .map(i => (val[i] ? String.fromCharCode(val[i]!) : ""))
    .join("");

const fromString = (n?: number) => (str: string) =>
  new Uint8Array(
    str
      .padEnd(n ?? str.length, "\x00")
      .split("")
      .map(c => c.charCodeAt(0)),
  );

const stringConversion = (n?: number) =>
  ({
    to: toString,
    from: fromString(n),
  } satisfies CustomConversion<Uint8Array, string>);

const fixedLengthStringItem = (size: number) =>
  ({
    binary: "bytes",
    size,
    custom: stringConversion(size),
  } as const satisfies LayoutItem);

const variableLengthStringItem = {
  binary: "bytes",
  lengthSize: 1,
  custom: stringConversion(),
} as const satisfies LayoutItem;

const booleanItem = {
  binary: "uint",
  size: 1,
  custom: {
    to: (val: bigint) => Boolean(val),
    from: (val: boolean) => (val ? 1n : 0n),
  },
} as const satisfies LayoutItem;

// parse UniversalAddress to address, chainNames to chainId, etc.
const processResult = (result: object) => {
  const entries = Object.entries(result);

  const entriesProcessed = entries.map(([key, value]) => {
    if (value instanceof UniversalAddress) {
      return [key, value.toString()];
    }

    if (value instanceof Uint8Array) {
      return [key, encoding.hex.encode(value)];
    }

    if (chains.includes(value)) {
      return [key, chainToChainId(value)];
    }

    if (Buffer.isBuffer(value)) {
      let bufferHex: string;

      if (value.every(byte => byte === 0)) {
        bufferHex = "";
      } else {
        bufferHex = value.toString("hex");
      }

      return [key, bufferHex];
    }

    if (typeof value === "object") {
      if (Array.isArray(value)) {
        return [key, value.map(a => processResult(a))];
      } else {
        return [key, processResult(value)];
      }
    }

    return [key, value];
  });

  const toObjectAgain: any = {};
  entriesProcessed.forEach(([key, value]) => {
    toObjectAgain[key] = value;
  });

  return toObjectAgain;
};
