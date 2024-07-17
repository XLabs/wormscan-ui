import { useCallback, useEffect, useMemo, useState } from "react";
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
import { CheckCircledIcon, CheckIcon, Cross2Icon, PlusIcon } from "@radix-ui/react-icons";
import { JsonText } from "src/components/atoms";
import { useLocalStorage } from "src/utils/hooks";
import { toast } from "react-toastify";
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
      console.log({ selectedBaseLayout, result, userLayout });

      const newParsedPayload = deepCloneWithBigInt(result);
      newParsedPayload.callerAppId = selectedBaseLayout;

      setParsedVAA({
        parsedPayload: newParsedPayload,
        userLayout: userLayout,
      });
    }
  }, [selectedBaseLayout, result, userLayout, resultUnparsed, setParsedVAA]);

  useEffect(() => {
    console.log({ userLayout });
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
      // "NFT Bridge": () =>
      //   [
      //     { inputName: "payloadId", selected: "payloadId", id: "1" },
      //     { inputName: "tokenAddress", selected: "address" },
      //     { inputName: "tokenChain", selected: "chain" },
      //     { inputName: "symbol", selected: "fixedLengthString", size: "32" },
      //     { inputName: "name", selected: "fixedLengthString", size: "32" },
      //     { inputName: "tokenId", selected: "amount" },
      //     { inputName: "uri", selected: "variableLengthString" },
      //     { inputName: "destAddress", selected: "address" },
      //     { inputName: "destChain", selected: "chain" },
      //   ] as UserLayout[],
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
      // NTT: () =>
      //   [
      //     {
      //       inputName: "prefix",
      //       selected: "custom",
      //       binarySelected: "bytes",
      //       size: "4",
      //     },
      //     {
      //       inputName: "sourceNttManager",
      //       selected: "address",
      //     },
      //     {
      //       inputName: "recipientNttManager",
      //       selected: "address",
      //     },
      //     {
      //       inputName: "waste1",
      //       selected: "custom",
      //       size: "2",
      //       binarySelected: "bytes",
      //       endianness: "default",
      //       omit: true,
      //     },
      //     {
      //       inputName: "nttManagerPayload",
      //       selected: "custom",
      //       binarySelected: "bytes",
      //       endianness: "default",
      //       layout: [
      //         {
      //           inputName: "id",
      //           selected: "custom",
      //           size: "32",
      //           binarySelected: "bytes",
      //           endianness: "default",
      //         },
      //         {
      //           inputName: "sender",
      //           selected: "address",
      //         },
      //         {
      //           inputName: "waste2",
      //           selected: "custom",
      //           size: "2",
      //           binarySelected: "bytes",
      //           endianness: "default",
      //           omit: true,
      //         },
      //         {
      //           inputName: "payload",
      //           selected: "custom",
      //           binarySelected: "bytes",
      //           endianness: "default",
      //           layout: [
      //             {
      //               inputName: "prefix2",
      //               selected: "custom",
      //               size: "4",
      //               binarySelected: "bytes",
      //               endianness: "default",
      //               omit: true,
      //             },
      //             {
      //               inputName: "trimmedAmount",
      //               selected: "custom",
      //               binarySelected: "bytes",
      //               endianness: "default",
      //               layout: [
      //                 {
      //                   inputName: "decimals",
      //                   selected: "custom",
      //                   size: "1",
      //                   binarySelected: "uint",
      //                   endianness: "default",
      //                 },
      //                 {
      //                   inputName: "amount",
      //                   selected: "custom",
      //                   size: "8",
      //                   binarySelected: "uint",
      //                   endianness: "default",
      //                 },
      //               ],
      //             },
      //             {
      //               inputName: "sourceToken",
      //               selected: "address",
      //             },
      //             {
      //               inputName: "recipientAddress",
      //               selected: "address",
      //             },
      //             {
      //               inputName: "recipientChain",
      //               selected: "chain",
      //             },
      //           ],
      //         },
      //       ],
      //     },
      //     {
      //       inputName: "transceiverPayload",
      //       selected: "custom",
      //       lengthSize: "2",
      //       binarySelected: "bytes",
      //       endianness: "default",
      //     },
      //   ] as UserLayout[],
    };

    savedLayouts?.forEach(LAY => {
      BASE_LAYOUTS[LAY[0]] = () => LAY[1];
    });

    return BASE_LAYOUTS;
  }, [savedLayouts]);

  useEffect(() => {
    try {
      console.log({ parsingLayout });
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

            console.log({ expected, current });

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

  return (
    <div className="submit">
      PAYLOAD:
      <br />
      <br />
      <span style={{ color: "green" }}>{resultParsed}</span>
      <span style={{ color: "#ffffff40" }}>{resultUnparsed}</span>
      {finishedParsing && (
        <CheckCircledIcon style={{ marginLeft: 6 }} color="green" width={20} height={20} />
      )}
      <br />
      <br />
      {!isInternal && (
        <>
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
                      }
                    }}
                    className="submit-btn"
                  >
                    {item}
                  </div>
                  {!DEFINED_LAYOUTS.includes(item) && (
                    <div
                      onClick={() => {
                        setSavedLayouts(savedLayouts.filter(a => a[0] !== item));
                      }}
                      className="submit-base-layouts-delete"
                    >
                      <Cross2Icon color="red" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <br />
          <br />
        </>
      )}
      Create your layout
      <br />
      <br />
      <div>
        {userLayout.map((item, i) => {
          return (
            <div key={i} className="submit-selectedLayouts">
              {JSON.stringify(item)}
              {userLayout.length - 1 === i && (
                <Cross2Icon
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

        <br />
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

        {(Object.keys(layouts) as Layouts[]).map(item => (
          <div key={item}>
            <LayoutItemButton
              binarySelected={binarySelected}
              setBinarySelected={setBinarySelected}
              inputValue={inputValue}
              setInputValue={setInputValue}
              id={item}
              selected={selected}
              setSelected={setSelected}
              endianness={endianness}
              setEndianness={setEndianness}
              bitsetValues={bitsetValues}
              setBitsetValues={setBitsetValues}
              isLengthSize={isLengthSize}
              setIsLengthSize={setIsLengthSize}
              tagIdValue={tagIdValue}
              setTagIdValue={setTagIdValue}
              tagNameValue={tagNameValue}
              setTagNameValue={setTagNameValue}
              resultUnparsed={resultUnparsedArray}
              inputName={inputName}
              switchLayouts={switchLayouts}
              setSwitchLayouts={setSwitchLayouts}
              internalLayouts={internalLayouts}
              setInternalLayouts={setInternalLayouts}
              isAboutToLayout={isAboutToLayout}
              renderExtras={renderExtras}
            />
          </div>
        ))}

        <br />
        {selected === "custom" && (binarySelected === "bytes" || binarySelected === "array") && (
          <div className="submit-options">
            <div
              onClick={() => {
                setShouldOmit(false);
                setIsAboutToLayout(!isAboutToLayout);
              }}
              className="submit-options-checkbox"
            >
              {isAboutToLayout && <CheckIcon />}
            </div>
            <div>create a layout for this item</div>
          </div>
        )}

        {!isAboutToLayout && binarySelected !== "switch" && (
          <div className="submit-options">
            <div onClick={() => setShouldOmit(!shouldOmit)} className="submit-options-checkbox">
              {shouldOmit && <CheckIcon />}
            </div>
            <div>omit from payload parsing</div>
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
          className="submit-btn"
        >
          ADD
        </div>

        <br />
        <br />
        {isInternal && internalLayoutName && setSwitchLayout && (
          <>
            <div
              onClick={() => {
                // if (binarySelected === "switch") {
                setSwitchLayout(userLayout);
                // }
              }}
              className="submit-btn"
            >
              FINISH LAYOUT FOR {internalLayoutName}
            </div>
            <br />
            <br />
          </>
        )}
        <JsonText data={deepCloneWithBigInt(result)} />
        <br />
        <br />

        {!isInternal && (
          <div>
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
              className="submit-btn"
            >
              SAVE
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
                className="submit-btn"
              >
                FINISH PARSING
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

interface ILayoutItemButtonProps {
  id: Layouts;
  selected: Layouts;
  setSelected: (a: Layouts) => void;
  inputValue: string;
  setInputValue: (str: string) => void;
  binarySelected: Binaries;
  setBinarySelected: (binary: Binaries) => void;
  endianness: Endianness;
  setEndianness: (end: Endianness) => void;
  bitsetValues: string[];
  setBitsetValues: (a: string[]) => void;
  isLengthSize: boolean;
  setIsLengthSize: (b: boolean) => void;
  tagIdValue: string;
  setTagIdValue: (str: string) => void;
  tagNameValue: string;
  setTagNameValue: (str: string) => void;
  inputName: string;
  resultUnparsed: Uint8Array;
  switchLayouts: ISwitchLayouts;
  setSwitchLayouts: (a: ISwitchLayouts) => void;
  internalLayouts: UserLayout[];
  setInternalLayouts: (u: UserLayout[]) => void;
  isAboutToLayout: boolean;
  renderExtras: () => void;
}

const LayoutItemButton = ({
  id,
  setSelected,
  selected,
  inputValue,
  setInputValue,
  binarySelected,
  setBinarySelected,
  endianness,
  setEndianness,
  bitsetValues,
  setBitsetValues,
  isLengthSize,
  setIsLengthSize,
  tagIdValue,
  setTagIdValue,
  tagNameValue,
  setTagNameValue,
  inputName,
  resultUnparsed,
  switchLayouts,
  setSwitchLayouts,
  internalLayouts,
  setInternalLayouts,
  isAboutToLayout,
  renderExtras,
}: ILayoutItemButtonProps) => {
  const isSelected = selected === id;

  const toRemoveFromPayload = +inputValue;
  const resultUnparsedProcessed = resultUnparsed.slice(toRemoveFromPayload);

  const [newSwitchLayout, setNewSwitchLayout] = useState<UserLayout[]>([]);
  const [newInternalLayout, setNewInternalLayout] = useState<UserLayout[]>([]);

  useEffect(() => {
    if (newInternalLayout.length) {
      console.log({ newInternalLayout, internalLayouts });
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
    <>
      <button
        className="submit-layout-button"
        onClick={() => {
          setSelected(id);
        }}
        style={{ backgroundColor: isSelected ? "green" : "#ffffff40" }}
      >
        {id}
      </button>

      {id === "bitsetItem" && isSelected && (
        <div className="submit-layout-bitset">
          {bitsetValues.map((bit, i) => (
            <div key={i}>
              <span>{bit}</span>
              <Cross2Icon
                className="submit-layout-bitset-close"
                onClick={() => {
                  setBitsetValues(bitsetValues.filter((_val, idx) => i !== idx));
                }}
              />
            </div>
          ))}

          <input
            className="submit-layout-input"
            placeholder={`bitset item #${bitsetValues.length + 1}`}
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
          />
          <div
            onClick={() => {
              setBitsetValues([...bitsetValues, inputValue]);
              setInputValue("");
            }}
            className="submit-layout-plus"
          >
            <PlusIcon />
          </div>
        </div>
      )}
      {id === "payloadId" && isSelected && (
        <input
          className="submit-layout-input"
          placeholder="id"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
        />
      )}
      {id === "fixedLengthString" && isSelected && (
        <input
          className="submit-layout-input"
          placeholder="length"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
        />
      )}
      {id === "custom" && isSelected && (
        <>
          <div style={{ marginTop: 16 }}>binary:</div>
          <button
            className="submit-layout-button"
            onClick={() => {
              setBinarySelected("uint");
            }}
            style={{ backgroundColor: binarySelected === "uint" ? "green" : "#ffffff40" }}
          >
            uint
          </button>
          <button
            className="submit-layout-button"
            onClick={() => {
              setBinarySelected("int");
            }}
            style={{ backgroundColor: binarySelected === "int" ? "green" : "#ffffff40" }}
          >
            int
          </button>
          <button
            className="submit-layout-button"
            onClick={() => {
              setBinarySelected("bytes");
            }}
            style={{ backgroundColor: binarySelected === "bytes" ? "green" : "#ffffff40" }}
          >
            bytes
          </button>
          <button
            className="submit-layout-button"
            onClick={() => {
              setBinarySelected("array");
            }}
            style={{ backgroundColor: binarySelected === "array" ? "green" : "#ffffff40" }}
          >
            array
          </button>
          <button
            className="submit-layout-button"
            onClick={() => {
              setBinarySelected("switch");
            }}
            style={{ backgroundColor: binarySelected === "switch" ? "green" : "#ffffff40" }}
          >
            switch
          </button>

          <div>endianness:</div>
          <button
            className="submit-layout-button"
            onClick={() => {
              setEndianness("default");
            }}
            style={{ backgroundColor: endianness === "default" ? "green" : "#ffffff40" }}
          >
            default
          </button>
          <button
            className="submit-layout-button"
            onClick={() => {
              setEndianness("little");
            }}
            style={{ backgroundColor: endianness === "little" ? "green" : "#ffffff40" }}
          >
            little
          </button>

          <div>{isLengthSize ? "lengthSize" : "size"}:</div>
          <input
            className="submit-layout-input"
            placeholder="size"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
          />
          {binarySelected !== "switch" && (
            <span
              onClick={() => setIsLengthSize(!isLengthSize)}
              className="submit-switch-size-text"
            >
              switch to {isLengthSize ? "size" : "lengthSize"}
            </span>
          )}
          <br />
          <br />

          {(binarySelected === "bytes" || binarySelected === "array") && isAboutToLayout && (
            <div className="submit-layout-switch-menu">
              <div>layout:</div>
              {internalLayouts.map((lay, i) => (
                <div key={i}>{JSON.stringify(lay)}</div>
              ))}
              <Submit
                renderExtras={renderExtras}
                setInternalLayout={setNewInternalLayout}
                isInternal
                internalLayoutName={inputName}
                resultRaw={resultUnparsedProcessed}
              />
            </div>
          )}

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
    </>
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

export const fixedLengthStringItem = (size: number) =>
  ({
    binary: "bytes",
    size,
    custom: stringConversion(size),
  } as const satisfies LayoutItem);

export const variableLengthStringItem = {
  binary: "bytes",
  lengthSize: 1,
  custom: stringConversion(),
} as const satisfies LayoutItem;

export const booleanItem = {
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
