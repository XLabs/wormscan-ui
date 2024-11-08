import React, { useEffect, useRef, useState } from "react";
import analytics from "src/analytics";

type FullscreenableProps = React.ComponentPropsWithoutRef<"div"> & {
  children: React.ReactNode;
  buttonRef: React.RefObject<HTMLDivElement>;
  itemName: string;
  style?: React.CSSProperties;
};

const Fullscreenable: React.FC<FullscreenableProps> = ({
  children,
  buttonRef,
  itemName,
  style,
  ...props
}) => {
  const fullscreenElemRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    const handleFullscreenClick = () => {
      analytics.track("fullscreen", {
        selected: !isFullscreen,
        selectedType: itemName,
      });

      if (isFullscreen || !fullscreenElemRef.current) {
        document.exitFullscreen();
      } else {
        fullscreenElemRef.current.requestFullscreen &&
          fullscreenElemRef.current.requestFullscreen();
      }
    };

    const button = buttonRef.current;

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    button?.addEventListener("click", handleFullscreenClick);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      button?.removeEventListener("click", handleFullscreenClick);
    };
  }, [buttonRef, isFullscreen, itemName]);

  return (
    <div
      {...props}
      ref={fullscreenElemRef}
      style={{
        ...style,
        padding: isFullscreen ? "4%" : 0,
        paddingTop: isFullscreen ? "6%" : 0,
      }}
    >
      {children}
    </div>
  );
};

export default Fullscreenable;
