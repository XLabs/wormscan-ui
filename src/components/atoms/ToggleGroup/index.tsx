import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import "./styles.scss";

type Props = {
  ariaLabel: string;
  className?: string;
  items: {
    label: string | JSX.Element;
    value: string;
    ariaLabel?: string;
  }[];
  onValueChange: (value: any) => void;
  separatedOptions?: boolean;
  type?: "primary" | "secondary";
  value: string;
};

const ToggleGroup = ({
  ariaLabel,
  className = "",
  items,
  onValueChange,
  type = "primary",
  value,
}: Props) => (
  <div className={`toggle-group ${className} ${type}`}>
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

export default ToggleGroup;
