import { TriangleDownIcon } from "@radix-ui/react-icons";
import SelectPrimitive, { components } from "react-select";
import "./styles.scss";

type Props = {
  name: string;
  items: {
    label: string;
    value: string;
  }[];
  value: any;
  onValueChange: (value: any) => void;
  ariaLabel: string;
  className?: string;
  placeholder?: string;
  isSearchable?: boolean;
  isClearable?: boolean;
  noOptionsMessage?: string;
};

const Select = ({
  name,
  value,
  onValueChange,
  items,
  ariaLabel,
  className = "",
  placeholder = "Select...",
  isSearchable = false,
  isClearable = false,
  noOptionsMessage = "No Options",
}: Props) => {
  return (
    <SelectPrimitive
      // menuIsOpen
      name={name}
      classNamePrefix="select"
      className={`select ${className}`}
      aria-label={ariaLabel}
      placeholder={placeholder}
      isSearchable={isSearchable}
      isClearable={isClearable}
      options={items}
      value={value}
      onChange={value => onValueChange(value)}
      noOptionsMessage={() => noOptionsMessage}
      menuPortalTarget={document.body}
      styles={{ menuPortal: base => ({ ...base, zIndex: 1000 }) }}
      components={{
        IndicatorSeparator: () => null,
        DropdownIndicator: props => (
          <components.DropdownIndicator {...props}>
            <TriangleDownIcon />
          </components.DropdownIndicator>
        ),
      }}
      unstyled
    />
  );
};

export default Select;
