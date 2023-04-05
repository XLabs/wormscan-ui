import { ChangeEvent, CSSProperties, useState } from "react";
import {
  Combobox as ComboboxPrimitive,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption,
} from "@reach/combobox";
import { TriangleDownIcon } from "@radix-ui/react-icons";

import "./styles.scss";

type Props = {
  items: {
    label: string;
    value: string;
  }[];
  value: string;
  onValueChange: (value: string) => void;
  ariaLabel: string;
  placeholder?: string;
  className?: string;
  style?: CSSProperties;
};

const Combobox = ({
  value,
  onValueChange,
  items,
  ariaLabel,
  placeholder,
  className = "",
  style = {},
}: Props) => {
  const [text, setText] = useState(() => items.find(item => item.value === value).label);
  const [filterValue, setFilterValue] = useState("");

  const filteredItems = items.filter(item => {
    return item.label.toLowerCase().includes(filterValue.toLowerCase());
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    setFilterValue(e.target.value);
  };

  const handleSelect = (value: string) => {
    const item = items.find(item => item.label === value);
    setText(item.label);
    setFilterValue(item.label);
    onValueChange(item.value);
  };

  return (
    <ComboboxPrimitive
      className={`combobox ${className}`}
      aria-label={ariaLabel}
      openOnFocus
      onSelect={handleSelect}
      style={style}
    >
      <div className="combobox-input-wrapper">
        <ComboboxInput
          placeholder={placeholder}
          className="combobox-trigger"
          onChange={handleChange}
          value={text}
        />
        <TriangleDownIcon className="combobox-input-icon" />
      </div>

      <ComboboxPopover className="combobox-popover">
        <ComboboxList persistSelection className="combobox-content">
          {filteredItems?.length > 0 ? (
            filteredItems.map(({ label, value: itemValue }) => (
              <ComboboxOption
                className={`combobox-item ${value === itemValue && "combobox-item--selected"}`}
                key={itemValue}
                value={label}
              >
                {label}
              </ComboboxOption>
            ))
          ) : (
            <div className="combobox-item">No results found</div>
          )}
        </ComboboxList>
      </ComboboxPopover>
    </ComboboxPrimitive>
  );
};

export default Combobox;
