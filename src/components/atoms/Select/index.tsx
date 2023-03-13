import { forwardRef, CSSProperties } from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { ChevronDownIcon, ChevronUpIcon, TriangleDownIcon } from "@radix-ui/react-icons";
import "./styles.scss";

type Props = {
  items: {
    label: string;
    value: string;
  }[];
  value: string;
  onValueChange: (value: string) => void;
  ariaLabel: string;
  style?: CSSProperties;
};

const Select = ({ value, onValueChange, items, ariaLabel, style = {} }: Props) => {
  return (
    <div className="select">
      <SelectPrimitive.Root value={value} onValueChange={value => onValueChange(value)}>
        <SelectPrimitive.Trigger className="select-trigger" aria-label={ariaLabel} style={style}>
          <SelectPrimitive.Value aria-label={value} />
          <SelectPrimitive.Icon className="select-trigger-selection">
            <TriangleDownIcon />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>

        <SelectPrimitive.Portal>
          <SelectPrimitive.Content className="select-content">
            <SelectPrimitive.ScrollUpButton className="select-content-scroll-button">
              <ChevronUpIcon />
            </SelectPrimitive.ScrollUpButton>

            <SelectPrimitive.Viewport className="select-viewport">
              {items.map(({ label, value }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectPrimitive.Viewport>

            <SelectPrimitive.ScrollDownButton className="select-content-scroll-button">
              <ChevronDownIcon />
            </SelectPrimitive.ScrollDownButton>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    </div>
  );
};

const SelectItem = forwardRef(({ children, className, ...props }: any, forwardedRef) => {
  return (
    <SelectPrimitive.Item className="select-item" {...props} ref={forwardedRef}>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
});

export default Select;
