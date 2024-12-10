import { useState, useEffect, useRef } from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { useWindowSize } from "src/utils/hooks";
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
  side = "top",
  tooltip,
  type = "default",
}: Props) => {
  const [isOpen, setIsOpen] = useState(controlled ? open : undefined);
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);
  const { width } = useWindowSize();
  const isDesktop = width >= BREAKPOINTS.desktop;

  useEffect(() => {
    controlled && setIsOpen(open);
  }, [open, controlled]);

  useEffect(() => {
    if (controlled || window.innerWidth >= BREAKPOINTS.desktop) return;

    const handleInteraction = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement;
      if (
        triggerRef?.current &&
        !triggerRef.current.contains(target) &&
        !target.closest(".tooltip-container")
      ) {
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
    window.addEventListener("scroll", handleClickOutside, true);
    return () => {
      window.removeEventListener("mouseup", handleClickOutside, true);
      window.removeEventListener("scroll", handleClickOutside, true);
    };
  }, [onClickOutside]);

  const handleSetIsOpen = (isOpen: boolean) => {
    controlled === false && setIsOpen(isOpen);
  };

  if (!enableTooltip) {
    return <>{children}</>;
  }

  return (
    <TooltipPrimitive.Provider delayDuration={0}>
      <TooltipPrimitive.Root open={isDesktop && !controlled ? undefined : isOpen}>
        <TooltipPrimitive.Trigger
          asChild
          ref={triggerRef}
          onMouseEnter={isDesktop ? undefined : () => handleSetIsOpen(true)}
          onFocus={isDesktop ? undefined : () => handleSetIsOpen(true)}
          onClick={isDesktop ? undefined : () => handleSetIsOpen(true)}
        >
          {children}
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal className="tooltip">
          <TooltipPrimitive.Content
            ref={tooltipRef}
            className={`tooltip-container ${type} ${side} ${
              maxWidth ? "max-width" : ""
            } ${className}`}
            sideOffset={8}
            side={side}
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
