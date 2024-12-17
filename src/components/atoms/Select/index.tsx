import { useRef, useState } from "react";
import { chainToChainId } from "@wormhole-foundation/sdk";
import SelectPrimitive, { components } from "react-select";
import { Checkbox } from "src/components/atoms";
import { OverviewIcon, ChevronDownIcon, TriangleDownIcon, SearchIcon } from "src/icons/generic";
import { useOutsideClick } from "src/utils/hooks";
import "./styles.scss";

interface Props {
  ariaLabel: string;
  buttonStyles?: React.CSSProperties;
  className?: string;
  controlStyles?: React.CSSProperties;
  isClearable?: boolean;
  isMulti?: boolean;
  items: {
    disabled?: boolean;
    icon?: JSX.Element;
    label: string;
    showMinus?: boolean;
    value: string | boolean;
  }[];
  keepOpen?: boolean;
  menuFixed?: boolean;
  menuListStyles?: React.CSSProperties;
  menuPlacement?: "auto" | "bottom" | "top";
  name: string;
  noOptionsMessage?: string;
  onValueChange: (value: any) => void;
  optionStyles?: React.CSSProperties;
  placeholder?: string;
  text?: string | JSX.Element;
  type?: "primary" | "searchable" | "secondary";
  value: any;
  closeOnSelect?: boolean;
}

const Select = ({
  ariaLabel,
  buttonStyles,
  className = "",
  controlStyles,
  isClearable = false,
  isMulti = true,
  items,
  keepOpen = false,
  menuFixed = false,
  menuListStyles,
  menuPlacement = "auto",
  name,
  noOptionsMessage = "No Options",
  onValueChange,
  optionStyles,
  placeholder = "Select...",
  text = "",
  type = "primary",
  closeOnSelect,
  value,
}: Props) => {
  const [isOpen, setIsOpen] = useState(keepOpen);
  const [inputValue, setInputValue] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const handleOutsideClick = () => {
    if (keepOpen) return;
    setIsOpen(false);
  };

  useOutsideClick({ ref, callback: handleOutsideClick });

  if (type === "searchable") {
    return (
      <div className={`select-searchable ${className}`} ref={ref}>
        <button
          className={`select-searchable-dropdown ${isOpen ? "open" : ""}`}
          style={{ ...buttonStyles }}
          onClick={() => {
            if (keepOpen) return;
            return setIsOpen(prev => !prev);
          }}
        >
          {text}
          <ChevronDownIcon width={24} />
        </button>

        {isOpen && (
          <div className="select-searchable-menu">
            <SelectPrimitive
              aria-label={ariaLabel}
              backspaceRemovesValue={false}
              blurInputOnSelect
              className="select"
              classNamePrefix="select"
              components={{
                IndicatorSeparator: null,
                DropdownIndicator: null,
                Option: ({ children, ...props }: any) => {
                  return (
                    <components.Option {...props}>
                      <div className="select-custom-option">
                        <div className="select-custom-option-container">
                          {props.data.icon}
                          <div className="select-custom-option-text">
                            {children}
                            {props.data.value === String(chainToChainId("Wormchain")) &&
                              !!props.data.searchableBy && (
                                <div className="select-custom-option-text-subtitle">
                                  <p>Includes Evmos, Kujira,</p>
                                  <p>Injective, Osmosis</p>
                                </div>
                              )}
                          </div>
                        </div>
                        <Checkbox checked={props.isSelected} locked={props.data.showMinus} />
                      </div>
                    </components.Option>
                  );
                },
              }}
              filterOption={(option, value) => {
                if (
                  option.data?.searchableBy?.toLowerCase().includes(value.toLowerCase()) ||
                  option.data?.label?.toLowerCase().includes(value.toLowerCase()) ||
                  option.data?.value?.toLowerCase().includes(value.toLowerCase())
                ) {
                  return true;
                }

                return false;
              }}
              controlShouldRenderValue={false}
              defaultMenuIsOpen={false}
              hideSelectedOptions={false}
              isClearable={isClearable}
              isMulti={isMulti}
              isOptionDisabled={option => option?.disabled}
              isSearchable
              menuIsOpen
              name={name}
              noOptionsMessage={() => noOptionsMessage}
              onChange={v => {
                onValueChange(v);
                if (closeOnSelect) setIsOpen(false);
              }}
              onInputChange={newValue => setInputValue(newValue)}
              onKeyDown={e => {
                if (e.key === "Enter" && !inputValue.trim()) {
                  e.preventDefault();
                }
              }}
              options={items}
              placeholder="Search"
              styles={{
                menu: base => ({
                  ...base,
                  borderRadius: 0,
                  left: -16,
                  marginTop: 16,
                  width: "calc(100% + 32px)",
                  zIndex: 95,
                }),
                control: base => ({
                  cursor: "text !important",
                  minWidth: 216,
                  ...controlStyles,
                }),
                menuList: base => ({
                  ...base,
                  borderRadius: "0 0 24px 24px",
                  ...menuListStyles,
                }),
                placeholder: base => ({
                  ...base,
                  alignItems: "center",
                  display: "flex",
                  gap: 4,
                }),
                option: base => ({
                  ...base,
                  backgroundColor: "transparent",
                  padding: "16px",
                  position: "relative",
                  "&:hover:not(.select__option--is-disabled)": {
                    backgroundColor: "var(--color-white-05)",
                  },
                  "&:not(:last-child)::before": {
                    backgroundColor: "var(--color-gray-800)",
                    bottom: 0,
                    content: '""',
                    height: 1,
                    left: 16,
                    position: "absolute",
                    right: 16,
                  },
                }),
              }}
              tabSelectsValue={false}
              unstyled
              value={value}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <SelectPrimitive
      aria-label={ariaLabel}
      className={`select ${type} ${className}`}
      classNamePrefix="select"
      components={{
        IndicatorSeparator: () => null,
        DropdownIndicator: props => (
          <components.DropdownIndicator {...props}>
            {type === "secondary" ? <TriangleDownIcon /> : <ChevronDownIcon width={24} />}
          </components.DropdownIndicator>
        ),
        SingleValue:
          type === "secondary"
            ? ({ children, ...props }: any) => (
                <components.SingleValue {...props}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <OverviewIcon width={16} />
                    <span>{children}</span>
                  </div>
                </components.SingleValue>
              )
            : components.SingleValue,
      }}
      isClearable={isClearable}
      isSearchable={false}
      menuPlacement={menuPlacement}
      name={name}
      noOptionsMessage={() => noOptionsMessage}
      onChange={value => onValueChange(value)}
      options={items}
      placeholder={placeholder}
      styles={{
        control(base, props) {
          return {
            ...base,
            minHeight: 36,
            cursor: "pointer",
            ...controlStyles,
          };
        },
        menu: base => ({
          ...base,
          zIndex: 95,
        }),
        menuList: base => ({
          ...base,
          ...menuListStyles,
        }),
        option: base => ({
          ...base,
          ...optionStyles,
        }),
      }}
      unstyled
      value={value}
    />
  );
};

export default Select;
