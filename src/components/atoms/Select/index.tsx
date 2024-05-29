import { useRef, useState } from "react";
import SelectPrimitive, { components } from "react-select";
import { Checkbox } from "src/components/atoms";
import useOutsideClick from "src/utils/hooks/useOutsideClick";
import { OverviewIcon, ChevronDownIcon, TriangleDownIcon } from "src/icons/generic";
import "./styles.scss";

interface Props {
  ariaLabel: string;
  className?: string;
  isClearable?: boolean;
  items: {
    label: string;
    value: string;
    icon?: JSX.Element;
  }[];
  name: string;
  noOptionsMessage?: string;
  onValueChange: (value: any) => void;
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
  name,
  noOptionsMessage = "No Options",
  onValueChange,
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
          <ChevronDownIcon width={24} />{" "}
        </button>

        {isOpen && (
          <div className="select-searchable-menu">
            <SelectPrimitive
              aria-label={ariaLabel}
              autoFocus
              backspaceRemovesValue={false}
              className={`select ${className}`}
              classNamePrefix="select"
              components={{
                IndicatorSeparator: () => null,
                DropdownIndicator: props => <></>,
                Option: ({ children, ...props }: any) => (
                  <components.Option {...props}>
                    <div className="custom-option">
                      <div className="custom-option-container">
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
              isSearchable={true}
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
                  zIndex: 1000,
                }),
                menu: base => ({
                  ...base,
                  marginTop: 16,
                  width: "calc(100% + 32px)",
                  left: -16,
                  borderRadius: 0,
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
                  padding: "16px",
                  position: "relative",
                  backgroundColor: "transparent",
                  "&:hover": {
                    backgroundColor: "var(--color-white-05)",
                  },
                  "&:not(:last-child)::before": {
                    backgroundColor: "var(--color-gray-800)",
                    bottom: 0,
                    content: '""',
                    height: 1,
                    position: "absolute",
                    left: 16,
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
      menuPortalTarget={document.body}
      name={name}
      noOptionsMessage={() => noOptionsMessage}
      onChange={value => onValueChange(value)}
      options={items}
      placeholder={placeholder}
      styles={{
        menuPortal: base => ({ ...base, zIndex: 1000 }),
        option: base =>
          type === "secondary"
            ? {
                ...base,
                fontFamily: '"Roboto Mono", "Roboto", sans-serif',
                fontSize: "12px",
                fontWeight: 400,
                letterSpacing: "0.03em",
                lineHeight: "16px",
                textTransform: "uppercase",
              }
            : base,
      }}
      unstyled
      value={value}
    />
  );
};

export default Select;
