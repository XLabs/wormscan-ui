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
import { CheckCircledIcon, CheckIcon, Cross2Icon, PlusIcon } from "@radix-ui/react-icons";
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
  id?: string;
  size?: string;
  lengthSize?: string;
  binarySelected?: Binaries;
  endianness?: Endianness;
  bitsetValues?: string[];
  omit?: boolean;
};

export const Submit = ({ resultRaw }: any) => {
  const [userLayout, setUserLayout] = useState<UserLayout[]>([]);
  const [parsingLayout, setParsingLayout] = useState([]);

  const [selected, setSelected] = useState<Layouts>(null);
  const [inputName, setInputName] = useState("");

  const [inputValue, setInputValue] = useState("");
  const [binarySelected, setBinarySelected] = useState<Binaries>(null);
  const [endianness, setEndianness] = useState<Endianness>("default");
  const [bitsetValues, setBitsetValues] = useState<string[]>([]);
  const [isLengthSize, setIsLengthSize] = useState(false);
  const [shouldOmit, setShouldOmit] = useState(false);

  const [result, setResult] = useState({});
  const [resultLength, setResultLength] = useState(0);

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
      custom: (size: string, lengthSize: string, binary: Binaries, endian: Endianness) => {
        const newLayout: any = {
          binary: binary,
          endianness: endian === "default" ? "big" : "little",
        };
        if (size) {
          newLayout.size = +size;
        }
        if (lengthSize) {
          newLayout.lengthSize = +lengthSize;
        }
        return newLayout;
      },
    }),
    [],
  );

  useEffect(() => {
    console.log({ userLayout });

    setParsingLayout(
      userLayout.map(layout => {
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
            ),
          };
        }

        if (layout.selected === "bitsetItem") {
          parsedLayout = { ...parsedLayout, ...layouts["bitsetItem"](layout.bitsetValues) };
        }

        console.log("here", { parsedLayout });
        return parsedLayout;
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
    "Standard Relayer": () =>
      [
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
        { inputName: "refundChain", selected: "chain" },
        { inputName: "refundAddress", selected: "address" },
        { inputName: "refundDeliveryProvider", selected: "address" },
        { inputName: "sourceDeliveryProvider", selected: "address" },
        { inputName: "senderAddress", selected: "address" },
      ] as UserLayout[],
  };

  const resultRawHex = resultRaw ? encoding.hex.encode(resultRaw) : "";
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
            />
          </div>
        ))}

        <br />
        <div className="submit-options">
          <div onClick={() => setShouldOmit(!shouldOmit)} className="submit-options-checkbox">
            {shouldOmit && <CheckIcon />}
          </div>
          <div>omit from payload parsing</div>
        </div>

        <div className="submit-options">
          <div onClick={() => setShouldOmit(!shouldOmit)} className="submit-options-checkbox">
            {shouldOmit && <CheckIcon />}
          </div>
          <div>create a layout for this item</div>
        </div>

        <div
          onClick={() => {
            if (selected && inputName) {
              if (selected === "payloadId" && !inputValue) return;
              if (selected === "fixedLengthString" && !inputValue) return;
              if (selected === "bitsetItem" && bitsetValues.length === 0) return;
              if (selected === "custom" && (!binarySelected || !inputValue)) return;
              if (userLayout.find(a => a.inputName === inputName)) return;

              const newUserLayout: UserLayout = { inputName, selected };
              if (selected === "payloadId") {
                newUserLayout.id = inputValue;
              }
              if (selected === "custom") {
                if (isLengthSize) {
                  newUserLayout.lengthSize = inputValue;
                } else {
                  newUserLayout.size = inputValue;
                }

                newUserLayout.binarySelected = binarySelected;
                newUserLayout.endianness = endianness;
              }
              if (selected === "bitsetItem") {
                newUserLayout.bitsetValues = bitsetValues;
              }
              if (selected === "fixedLengthString") {
                newUserLayout.size = inputValue;
              }

              if (shouldOmit) newUserLayout.omit = true;

              setUserLayout([...userLayout, newUserLayout]);

              setShouldOmit(false);
              setInputValue("");
              setBitsetValues([]);
              setInputName("");
              setIsLengthSize(false);
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

          <div>{isLengthSize ? "lengthSize" : "size"}:</div>
          <input
            className="submit-layout-input"
            placeholder="size"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
          />
          <span onClick={() => setIsLengthSize(!isLengthSize)} className="submit-switch-size-text">
            switch to {isLengthSize ? "size" : "lengthSize"}
          </span>
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
