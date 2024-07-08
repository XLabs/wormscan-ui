import { useEffect, useMemo, useState } from "react";
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
import { CheckCircledIcon, Cross2Icon, PlusIcon } from "@radix-ui/react-icons";
import { JsonText } from "src/components/atoms";
import "./submitStyles.scss";

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

type Binaries = "uint" | "int" | "bytes";
type Endianness = "default" | "little";

type UserLayout = {
  selected: Layouts;
  inputName: string;
  selectionValue?: string;
  binarySelected?: Binaries;
  endianness?: Endianness;
  bitsetValues?: string[];
};

export const Submit = ({ resultRaw }: any) => {
  const [userLayout, setUserLayout] = useState<UserLayout[]>([]);
  const [parsingLayout, setParsingLayout] = useState([]);

  const [selected, setSelected] = useState<Layouts>(null);
  const [inputName, setInputName] = useState("");

  const [selectionValue, setSelectionValue] = useState("");
  const [binarySelected, setBinarySelected] = useState<Binaries>(null);
  const [endianness, setEndianness] = useState<Endianness>("default");
  const [bitsetValues, setBitsetValues] = useState<string[]>([]);

  const [result, setResult] = useState({});
  const [resultLength, setResultLength] = useState(0);

  const layouts: { [key in Layouts]: any } = useMemo(
    () => ({
      payloadId: (id: string, name: string) => ({ ...layoutItems.payloadIdItem(+id), name }),
      address: () => layoutItems.universalAddressItem,
      chain: () => layoutItems.chainItem(),
      amount: () => layoutItems.amountItem,
      fixedLengthString: (length: string) => fixedLengthStringItem(+length),
      variableLengthString: () => variableLengthStringItem,
      booleanItem: () => booleanItem,
      bitsetItem: (bitsets: string[]) => bitsetItem(bitsets),
      custom: (size: string, binary: Binaries, endian: Endianness) => ({
        binary: binary,
        size: +size,
        endianness: endian === "default" ? "big" : "little",
      }),
    }),
    [],
  );

  useEffect(() => {
    console.log({ userLayout });

    setParsingLayout(
      userLayout.map(layout => {
        if (
          ["address", "chain", "amount", "variableLengthString", "booleanItem"].includes(
            layout.selected,
          )
        ) {
          return { name: layout.inputName, ...layouts[layout.selected]() };
        }

        if (layout.selected === "payloadId") {
          return {
            name: layout.inputName,
            ...layouts["payloadId"](layout.selectionValue, layout.inputName),
          };
        }

        if (layout.selected === "fixedLengthString") {
          return { name: layout.inputName, ...layouts["fixedLengthString"](layout.selectionValue) };
        }

        if (layout.selected === "custom") {
          return {
            name: layout.inputName,
            ...layouts["custom"](layout.selectionValue, layout.binarySelected, layout.endianness),
          };
        }

        if (layout.selected === "bitsetItem") {
          return { name: layout.inputName, ...layouts["bitsetItem"](layout.bitsetValues) };
        }
      }),
    );
  }, [layouts, userLayout]);

  const baseLayouts: any = {
    "Clear All": () => [] as any,
    "Portal Bridge": () =>
      [
        { inputName: "payloadId", selected: "payloadId", selectionValue: "3" },
        { inputName: "amount", selected: "amount" },
        { inputName: "tokenAddress", selected: "address" },
        { inputName: "tokenChain", selected: "chain" },
        { inputName: "toAddress", selected: "address" },
        { inputName: "toChain", selected: "chain" },
        { inputName: "fromAddress", selected: "address" },
      ] as UserLayout[],
    "NFT Bridge": () =>
      [
        { inputName: "payloadId", selected: "payloadId", selectionValue: "1" },
        { inputName: "tokenAddress", selected: "address" },
        { inputName: "tokenChain", selected: "chain" },
        { inputName: "symbol", selected: "fixedLengthString", selectionValue: "32" },
        { inputName: "name", selected: "fixedLengthString", selectionValue: "32" },
        { inputName: "tokenId", selected: "amount" },
        { inputName: "uri", selected: "variableLengthString" },
        { inputName: "destAddress", selected: "address" },
        { inputName: "destChain", selected: "chain" },
      ] as UserLayout[],
    "CCTP Wormhole Integration": () =>
      [
        { inputName: "payloadId", selected: "payloadId", selectionValue: "1" },
        { inputName: "tokenAddress", selected: "address" },
        { inputName: "amount", selected: "amount" },
        {
          inputName: "sourceDomain",
          selected: "custom",
          selectionValue: "4",
          binarySelected: "uint",
          endianness: "default",
        },
        {
          inputName: "targetDomain",
          selected: "custom",
          selectionValue: "4",
          binarySelected: "uint",
          endianness: "default",
        },
        {
          inputName: "nonce",
          selected: "custom",
          selectionValue: "8",
          binarySelected: "uint",
          endianness: "default",
        },
        { inputName: "caller", selected: "address" },
        { inputName: "mintRecipient", selected: "address" },
        {
          inputName: "length",
          selected: "custom",
          selectionValue: "2",
          binarySelected: "uint",
          endianness: "default",
        },
      ] as UserLayout[],
  };

  const resultRawHex = resultRaw ? encoding.hex.encode(resultRaw) : "";
  // const resultRawHex = resultRaw ? Buffer.from(resultRaw).toString("hex") : "";
  const resultParsed = resultRawHex.substring(0, resultLength);
  const resultUnparsed = resultRawHex.substring(resultLength);

  useEffect(() => {
    try {
      console.log({ parsingLayout });
      const result = deserializeLayout(parsingLayout, resultRaw);
      console.log(processResult(result));

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

            const resultRawPartial = resultRaw.slice(0, current);

            const resultPartial = deserializeLayout(parsingLayout, resultRawPartial);
            console.log(processResult(resultPartial));

            Object.entries(resultPartial);

            setResultLength(+current * 2);
            setResult(processResult(resultPartial));
            partialParsingWorked = true;
          }
        }
      } catch (e2) {
        setResult({});
        console.log("error parsing partial payload");
        console.log({ err: e2 });
      }

      if (!partialParsingWorked) {
        setResult({});
        console.log("error parsing full payload");
        console.log({ err: e });
      }
    }
  }, [resultRaw, resultRawHex.length, parsingLayout]);

  const finishedParsing = resultLength && resultUnparsed.length === 0;

  return (
    <div className="submit">
      PAYLOAD:
      <br />
      <br />
      <span style={{ color: "green" }}>{resultParsed}</span>
      <span style={{ color: "grey" }}>{resultUnparsed}</span>
      {finishedParsing && (
        <CheckCircledIcon style={{ marginLeft: 6 }} color="green" width={20} height={20} />
      )}
      <br />
      <br />
      Select a layout as a base
      <br />
      <br />
      <div>
        {Object.keys(baseLayouts).map(item => {
          return (
            <div
              onClick={() => setUserLayout(baseLayouts[item]())}
              className="submit-btn"
              key={item}
            >
              {item}
            </div>
          );
        })}
      </div>
      <br />
      <br />
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
          placeholder="item name"
          value={inputName}
          onChange={ev => setInputName(ev.target.value)}
        />

        <br />
        <br />

        {(Object.keys(layouts) as Layouts[]).map(item => (
          <div key={item}>
            <LayoutItemButton
              binarySelected={binarySelected}
              setBinarySelected={setBinarySelected}
              selectionValue={selectionValue}
              setSelectionValue={setSelectionValue}
              id={item}
              selected={selected}
              setSelected={setSelected}
              endianness={endianness}
              setEndianness={setEndianness}
              bitsetValues={bitsetValues}
              setBitsetValues={setBitsetValues}
            />
          </div>
        ))}

        <br />
        <div
          onClick={() => {
            if (selected && inputName) {
              if (selected === "payloadId" && !selectionValue) return;
              if (selected === "fixedLengthString" && !selectionValue) return;
              if (selected === "bitsetItem" && bitsetValues.length === 0) return;
              if (selected === "custom" && (!binarySelected || !selectionValue)) return;
              if (userLayout.find(a => a.inputName === inputName)) return;

              const newUserLayout: UserLayout = { inputName, selected };
              if (selected === "payloadId") {
                newUserLayout.selectionValue = selectionValue;
              }
              if (selected === "custom") {
                newUserLayout.selectionValue = selectionValue;
                newUserLayout.binarySelected = binarySelected;
                newUserLayout.endianness = endianness;
              }
              if (selected === "bitsetItem") {
                newUserLayout.bitsetValues = bitsetValues;
              }
              if (selected === "fixedLengthString") {
                newUserLayout.selectionValue = selectionValue;
              }

              setUserLayout([...userLayout, newUserLayout]);

              setSelectionValue("");
              setBitsetValues([]);
              setInputName("");
            }
          }}
          className="submit-btn"
        >
          ADD
        </div>

        <br />
        <br />
        <JsonText data={deepCloneWithBigInt(result)} />
        <br />
        <br />
        {finishedParsing && <div className="submit-btn">SUBMIT</div>}
      </div>
    </div>
  );
};

interface ILayoutItemButtonProps {
  id: Layouts;
  selected: Layouts;
  setSelected: (a: Layouts) => void;
  selectionValue: string;
  setSelectionValue: (str: string) => void;
  binarySelected: Binaries;
  setBinarySelected: (binary: Binaries) => void;
  endianness: Endianness;
  setEndianness: (end: Endianness) => void;
  bitsetValues: string[];
  setBitsetValues: (a: string[]) => void;
}

const LayoutItemButton = ({
  id,
  setSelected,
  selected,
  selectionValue,
  setSelectionValue,
  binarySelected,
  setBinarySelected,
  endianness,
  setEndianness,
  bitsetValues,
  setBitsetValues,
}: ILayoutItemButtonProps) => {
  const isSelected = selected === id;

  return (
    <>
      <button
        className="submit-layout-button"
        onClick={() => {
          setSelected(id);
        }}
        style={{ backgroundColor: isSelected ? "green" : "grey" }}
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
            value={selectionValue}
            onChange={e => setSelectionValue(e.target.value)}
          />
          <div
            onClick={() => {
              setBitsetValues([...bitsetValues, selectionValue]);
              setSelectionValue("");
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
          value={selectionValue}
          onChange={e => setSelectionValue(e.target.value)}
        />
      )}
      {id === "fixedLengthString" && isSelected && (
        <input
          className="submit-layout-input"
          placeholder="length"
          value={selectionValue}
          onChange={e => setSelectionValue(e.target.value)}
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
            style={{ backgroundColor: binarySelected === "uint" ? "green" : "grey" }}
          >
            uint
          </button>
          <button
            className="submit-layout-button"
            onClick={() => {
              setBinarySelected("int");
            }}
            style={{ backgroundColor: binarySelected === "int" ? "green" : "grey" }}
          >
            int
          </button>
          <button
            className="submit-layout-button"
            onClick={() => {
              setBinarySelected("bytes");
            }}
            style={{ backgroundColor: binarySelected === "bytes" ? "green" : "grey" }}
          >
            bytes
          </button>

          <div>endianness:</div>
          <button
            className="submit-layout-button"
            onClick={() => {
              setEndianness("default");
            }}
            style={{ backgroundColor: endianness === "default" ? "green" : "grey" }}
          >
            default
          </button>
          <button
            className="submit-layout-button"
            onClick={() => {
              setEndianness("little");
            }}
            style={{ backgroundColor: endianness === "little" ? "green" : "grey" }}
          >
            little
          </button>

          <div>size:</div>
          <input
            className="submit-layout-input"
            placeholder="size"
            value={selectionValue}
            onChange={e => setSelectionValue(e.target.value)}
          />
          <br />
          <br />
        </>
      )}
    </>
  );
};

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

    return [key, value];
  });

  const toObjectAgain: any = {};
  entriesProcessed.forEach(([key, value]) => {
    toObjectAgain[key] = value;
  });

  return toObjectAgain;
};
