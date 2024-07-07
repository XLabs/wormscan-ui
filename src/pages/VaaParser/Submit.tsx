import { useEffect, useState } from "react";
import {
  ChainId,
  VAA,
  chainToChainId,
  deserialize,
  deserializeLayout,
  deserializePayload,
  layoutItems,
  encoding,
  Layout,
  CustomConversion,
  LayoutItem,
  range,
} from "@wormhole-foundation/sdk";
import { stringifyWithBigInt } from "src/utils/object";
import "./submitStyles.scss";
import { Cross2Icon } from "@radix-ui/react-icons";

type Layouts =
  | "payloadId"
  | "address"
  | "chain"
  | "amount"
  | "fixedLengthString"
  | "variableLengthString";

export const Submit = ({ resultRaw }: any) => {
  const [userLayout, setUserLayout] = useState([]);
  const [selected, setSelected] = useState<Layouts>(null);
  const [inputName, setInputName] = useState("");

  const [selectionValue, setSelectionValue] = useState("");

  const [result, setResult] = useState({});

  const layouts: { [key in Layouts]: any } = {
    payloadId: (id: string) => layoutItems.payloadIdItem(+id),
    address: () => layoutItems.universalAddressItem,
    chain: () => layoutItems.chainItem(),
    amount: () => layoutItems.amountItem,
    fixedLengthString: (length: string) => fixedLengthStringItem(+length),
    variableLengthString: () => variableLengthStringItem,
  };

  useEffect(() => {
    try {
      const prueba = deserializeLayout(userLayout, resultRaw);
      console.log({ prueba });
      setResult(prueba);
    } catch (e) {
      setResult({});
      console.log({ e });
    }
  }, [resultRaw, userLayout]);

  return (
    <div className="submit">
      PAYLOAD:
      <br />
      <br />
      {resultRaw}
      <br />
      <br />
      Create your layout
      <br />
      <br />
      <div>
        {userLayout.map((item, i) => {
          console.log({ item });
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
        {stringifyWithBigInt(result)}
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
