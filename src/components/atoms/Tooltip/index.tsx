import { useState, useEffect, useRef } from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { BREAKPOINTS } from "src/consts";
import "./styles.scss";

type Props = {
  children: React.ReactNode;
  className?: string;
  controlled?: boolean;
  enableTooltip?: boolean;
  maxWidth?: boolean;
  onClickOutside?: () => void;
  open?: boolean;
  side?: "top" | "right" | "bottom" | "left";
  tooltip: React.ReactNode;
  type?: "info" | "default" | "onlyContent";
};

const Tooltip = ({
  children,
  className = "",
  controlled = false,
  enableTooltip = true,
  maxWidth = true,
  onClickOutside,
  open = false,
  side = "right",
  tooltip,
  type = "default",
}: Props) => {
  const [isOpen, setIsOpen] = useState(controlled ? open : undefined);
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);
  const selectSide = type === "info" ? "top" : side;

  useEffect(() => {
    controlled && setIsOpen(open);
  }, [open, controlled]);

  useEffect(() => {
    if (controlled || window.innerWidth >= BREAKPOINTS.desktop) return;

    const handleInteraction = (e: MouseEvent | TouchEvent) => {
      if (triggerRef?.current && !triggerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleInteraction);
    document.addEventListener("touchstart", handleInteraction);

    return () => {
      document.removeEventListener("mousedown", handleInteraction);
      document.removeEventListener("touchstart", handleInteraction);
    };
  }, [controlled]);

  useEffect(() => {
    const handleClickOutside = (e: any) => {
      if (!tooltipRef?.current?.contains(e?.target)) {
        if (onClickOutside) onClickOutside();
      }
    };

    window.addEventListener("mouseup", handleClickOutside, true);
    return () => {
      window.removeEventListener("mouseup", handleClickOutside, true);
    };
  }, [onClickOutside]);

  const handleSetIsOpen = (isOpen: boolean) => {
    controlled === false && setIsOpen(isOpen);
  };

  if (!enableTooltip) {
    return <>{children}</>;
  }

  return (
    <TooltipPrimitive.Provider>
      <TooltipPrimitive.Root open={isOpen}>
        <TooltipPrimitive.Trigger
          asChild
          ref={triggerRef}
          onMouseEnter={() => handleSetIsOpen(true)}
          onMouseLeave={() => handleSetIsOpen(false)}
          onFocus={() => handleSetIsOpen(true)}
          onClick={() => handleSetIsOpen(true)}
          onBlur={() => handleSetIsOpen(false)}
        >
          {children}
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal className="tooltip">
          <TooltipPrimitive.Content
            ref={tooltipRef}
            className={`tooltip-container ${type} ${maxWidth ? "max-width" : ""} ${className}`}
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
