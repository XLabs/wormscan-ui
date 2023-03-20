import { CSSProperties } from "react";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import "./styles.scss";

type Props = {
  items: {
    label: string;
    value: string;
    ariaLabel?: string;
  }[];
  value: string;
  onValueChange: (value: string) => void;
  ariaLabel: string;
  className?: string;
  style?: CSSProperties;
};

const ToggleGroup = ({
  value,
  onValueChange,
  items,
  ariaLabel,
  className = "",
  style = {},
}: Props) => {
  return (
    <div className={`toggle-group ${className}`} style={style}>
      <ToggleGroupPrimitive.Root
        type="single"
        className="toggle-group-root"
        value={value}
        onValueChange={value => value && onValueChange(value)}
        aria-label={ariaLabel}
      >
        {items.map(({ label, value, ariaLabel = "" }) => (
          <ToggleGroupPrimitive.Item
            key={value}
            className="toggle-group-item"
            value={value}
            aria-label={ariaLabel}
          >
            {label}
          </ToggleGroupPrimitive.Item>
        ))}
      </ToggleGroupPrimitive.Root>
    </div>
  );
};

export default ToggleGroup;
