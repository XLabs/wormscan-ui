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
  separatedOptions?: boolean;
};

const ToggleGroup = ({
  value,
  onValueChange,
  items,
  ariaLabel,
  separatedOptions = false,
}: Props) => (
  <div className="toggle-group">
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
          className={`toggle-group-item ${separatedOptions ? "separated" : ""}`}
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
