import { useState, useEffect, useRef } from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { BREAKPOINTS } from "src/consts";
import "./styles.scss";

type Props = {
  children: React.ReactNode;
  controlled?: boolean;
  maxWidth?: boolean;
  open?: boolean;
  side?: "top" | "right" | "bottom" | "left";
  tooltip: React.ReactNode;
  type?: "info" | "default" | "onlyContent";
};

const Tooltip = ({
  children,
  controlled = false,
  maxWidth = true,
  open = false,
  side = "right",
  tooltip,
  type = "default",
}: Props) => {
  const [isOpen, setIsOpen] = useState(controlled ? open : undefined);
  const tooltipRef = useRef(null);
  const selectSide = type === "info" ? "top" : side;

  useEffect(() => {
    controlled && setIsOpen(open);
  }, [open, controlled]);

  useEffect(() => {
    if (controlled || window.innerWidth >= BREAKPOINTS.desktop) return;

    const handleScroll = () => {
      if (
        tooltipRef.current &&
        (tooltipRef.current.getBoundingClientRect().top < -50 ||
          tooltipRef.current.getBoundingClientRect().bottom > window.innerHeight + 50)
      ) {
        setIsOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll, true);

    return () => {
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [controlled]);

  const handleSetIsOpen = (isOpen: boolean) => {
    controlled === false && setIsOpen(isOpen);
  };

  return (
    <TooltipPrimitive.Provider>
      <TooltipPrimitive.Root open={isOpen}>
        <TooltipPrimitive.Trigger
          asChild
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
            className={`tooltip-container ${type} ${maxWidth ? "max-width" : ""}`}
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
