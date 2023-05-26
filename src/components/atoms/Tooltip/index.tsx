import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import "./styles.scss";

type Props = {
  children: React.ReactNode;
  tooltip: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  side?: "top" | "right" | "bottom" | "left";
};

const Tooltip = ({ children, tooltip, open, onOpenChange, side }: Props) => {
  return (
    <TooltipPrimitive.Provider delayDuration={250}>
      <TooltipPrimitive.Root open={open} onOpenChange={onOpenChange}>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal className="tooltip">
          <TooltipPrimitive.Content className="tooltip-container" sideOffset={5} side={side}>
            {tooltip}
            <TooltipPrimitive.Arrow className="tooltip-arrow" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
};

export default Tooltip;
