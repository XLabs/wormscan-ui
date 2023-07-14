import { useState, useEffect } from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import "./styles.scss";

type Props = {
  children: React.ReactNode;
  tooltip: React.ReactNode;
  open?: boolean;
  side?: "top" | "right" | "bottom" | "left";
  type?: "info" | "default";
  controlled?: boolean;
};

const Tooltip = ({
  children,
  tooltip,
  open = false,
  side = "right",
  type = "default",
  controlled = false,
}: Props) => {
  const [isOpen, setIsOpen] = useState(controlled ? open : undefined);
  const selectSide = type === "info" ? "top" : side;

  useEffect(() => {
    controlled && setIsOpen(open);
  }, [open, controlled]);

  const handleSetIsOpen = (isOpen: boolean) => {
    controlled === false && setIsOpen(isOpen);
  };

  return (
    <TooltipPrimitive.Provider>
      <TooltipPrimitive.Root open={isOpen}>
        <TooltipPrimitive.Trigger
          asChild
          onMouseEnter={() => {
            handleSetIsOpen(true);
          }}
          onMouseLeave={() => {
            handleSetIsOpen(false);
          }}
          onFocus={() => {
            handleSetIsOpen(true);
          }}
          onBlur={() => {
            handleSetIsOpen(false);
          }}
        >
          {children}
        </TooltipPrimitive.Trigger>
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
