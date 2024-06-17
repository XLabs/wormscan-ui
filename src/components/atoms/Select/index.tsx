import { useRef, useState } from "react";
import SelectPrimitive, { components } from "react-select";
import { Checkbox } from "src/components/atoms";
import { OverviewIcon, ChevronDownIcon, TriangleDownIcon } from "src/icons/generic";
import { useOutsideClick } from "src/utils/hooks";
import "./styles.scss";

interface Props {
  ariaLabel: string;
  className?: string;
  isClearable?: boolean;
  items: {
    label: string;
    value: string | boolean;
    icon?: JSX.Element;
  }[];
  menuFixed?: boolean;
  menuPlacement?: "auto" | "bottom" | "top";
  menuStyles?: React.CSSProperties;
  name: string;
  noOptionsMessage?: string;
  onValueChange: (value: any) => void;
  optionStyles?: React.CSSProperties;
  placeholder?: string;
  text?: string;
  type?: "primary" | "searchable" | "secondary";
  value: any;
}

const Select = ({
  ariaLabel,
  className = "",
  isClearable = false,
  items,
  menuFixed = false,
  menuPlacement = "auto",
  menuStyles,
  name,
  noOptionsMessage = "No Options",
  onValueChange,
  optionStyles,
  placeholder = "Select...",
  text = "",
  type = "primary",
  value,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleOutsideClick = () => {
    setIsOpen(false);
  };

  useOutsideClick(ref, handleOutsideClick);

  if (type === "searchable") {
    return (
      <div className="select-searchable" ref={ref}>
        <button
          className={`select-searchable-dropdown ${isOpen ? "open" : ""}`}
          onClick={() => setIsOpen(prev => !prev)}
        >
          {text}
          <ChevronDownIcon width={24} />
        </button>

        {isOpen ? (
          <div className="select-searchable-menu">
            {
              <SelectPrimitive
                aria-label={ariaLabel}
                backspaceRemovesValue={false}
                className={`select ${className}`}
                classNamePrefix="select"
                components={{
                  IndicatorSeparator: null,
                  DropdownIndicator: null,
                  Option: ({ children, ...props }: any) => (
                    <components.Option {...props}>
                      <div className="select-custom-option">
                        <div className="select-custom-option-container">
                          {props.data.icon}
                          {children}
                        </div>
                        <Checkbox checked={props.isSelected} />
                      </div>
                    </components.Option>
                  ),
                }}
                controlShouldRenderValue={false}
                hideSelectedOptions={false}
                isClearable={isClearable}
                isMulti
                defaultMenuIsOpen={false}
                isSearchable
                menuIsOpen
                menuPortalTarget={document.body}
                name={name}
                noOptionsMessage={() => noOptionsMessage}
                onChange={onValueChange}
                options={items}
                placeholder="Search..."
                styles={{
                  menuPortal: base => ({
                    ...base,
                    position: menuFixed ? "fixed" : "absolute",
                    zIndex: 95,
                  }),
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
                  }),
                  menuList: base => ({
                    ...base,
                    borderRadius: "0 0 24px 24px",
                  }),
                  option: base => ({
                    ...base,
                    backgroundColor: "transparent",
                    padding: "16px",
                    position: "relative",
                    "&:hover": {
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
                autoFocus
              />
            }
          </div>
        ) : null}
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
            {type === "secondary" ? (
              <TriangleDownIcon width={10} />
            ) : (
              <ChevronDownIcon width={24} />
            )}
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
      menuPortalTarget={document.body}
      name={name}
      noOptionsMessage={() => noOptionsMessage}
      onChange={value => onValueChange(value)}
      options={items}
      placeholder={placeholder}
      styles={{
        menuPortal: base => ({
          ...base,
          position: menuFixed ? "fixed" : "absolute",
          zIndex: 95,
          ...menuStyles,
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
