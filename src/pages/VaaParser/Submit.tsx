import { useEffect, useState } from "react";
import {
  chainToChainId,
  deserializeLayout,
  layoutItems,
  CustomConversion,
  LayoutItem,
  range,
  UniversalAddress,
  chains,
} from "@wormhole-foundation/sdk";
import { deepCloneWithBigInt } from "src/utils/object";
import { Cross2Icon } from "@radix-ui/react-icons";
import { JsonText } from "src/components/atoms";
import "./submitStyles.scss";

type Layouts =
  | "payloadId"
  | "address"
  | "chain"
  | "amount"
  | "fixedLengthString"
  | "variableLengthString"
  | "booleanItem";

export const Submit = ({ resultRaw }: any) => {
  const [userLayout, setUserLayout] = useState([]);
  const [selected, setSelected] = useState<Layouts>(null);
  const [inputName, setInputName] = useState("");

  const [selectionValue, setSelectionValue] = useState("");

  const [result, setResult] = useState({});
  const [resultLength, setResultLength] = useState(0);

  const layouts: { [key in Layouts]: any } = {
    payloadId: (id: string) => layoutItems.payloadIdItem(+id),
    address: () => layoutItems.universalAddressItem,
    chain: () => layoutItems.chainItem(),
    amount: () => layoutItems.amountItem,
    fixedLengthString: (length: string) => fixedLengthStringItem(+length),
    variableLengthString: () => variableLengthStringItem,
    booleanItem: () => booleanItem,
  };

  const resultRawHex = resultRaw ? Buffer.from(resultRaw).toString("hex") : "";
  const resultParsed = resultRawHex.substring(0, resultLength);
  const resultUnparsed = resultRawHex.substring(resultLength);

  useEffect(() => {
    try {
      const result = deserializeLayout(userLayout, resultRaw);
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

            const resultPartial = deserializeLayout(userLayout, resultRawPartial);
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
  }, [resultRaw, resultRawHex.length, userLayout]);

  return (
    <div className="submit">
      PAYLOAD:
      <br />
      <br />
      <span style={{ color: "green" }}>{resultParsed}</span>
      <span style={{ color: "grey" }}>{resultUnparsed}</span>
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
              <Cross2Icon
                onClick={() => {
                  setUserLayout(userLayout.filter(a => a.name !== item.name));
                }}
                className="submit-selectedLayouts-remove"
              />
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
              selectionValue={selectionValue}
              setSelectionValue={setSelectionValue}
              id={item}
              selected={selected}
              setSelected={setSelected}
            />
          </div>
        ))}

        <br />
        <br />
        <button
          onClick={() => {
            if (selected && inputName) {
              if (selected === "payloadId" && !selectionValue) return;
              if (selected === "fixedLengthString" && !selectionValue) return;
              if (userLayout.find(a => a.name === inputName)) return;

              setUserLayout([
                ...userLayout,
                { name: inputName, ...layouts[selected](selectionValue) },
              ]);
            }
          }}
        >
          ADD
        </button>

        <br />
        <br />
        <JsonText data={deepCloneWithBigInt(result)} />
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
}

const LayoutItemButton = ({
  id,
  setSelected,
  selected,
  selectionValue,
  setSelectionValue,
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

    return [key, value];
  });

  const toObjectAgain: any = {};
  entriesProcessed.forEach(([key, value]) => {
    toObjectAgain[key] = value;
  });

  return toObjectAgain;
};
