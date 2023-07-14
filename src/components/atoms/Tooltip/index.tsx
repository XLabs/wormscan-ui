import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import "./styles.scss";

type Props = {
  children: React.ReactNode;
  tooltip: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  side?: "top" | "right" | "bottom" | "left";
  type?: "info" | "default";
};

const Tooltip = ({
  children,
  tooltip,
  open,
  onOpenChange,
  side = "right",
  type = "default",
}: Props) => {
  const selectSide = type === "info" ? "top" : side;

  return (
    <TooltipPrimitive.Provider delayDuration={250}>
      <TooltipPrimitive.Root open={open} onOpenChange={onOpenChange}>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal className="tooltip">
          <TooltipPrimitive.Content
            className={`tooltip-container ${type}`}
            sideOffset={5}
            side={selectSide}
          >
            {tooltip}
            <TooltipPrimitive.Arrow className="tooltip-arrow" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
};

export default Tooltip;
