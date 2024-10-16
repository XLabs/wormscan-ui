import React, { useEffect, useRef, useState } from "react";

type FullscreenableProps = React.ComponentPropsWithoutRef<"div"> & {
  children: React.ReactNode;
  buttonRef: React.RefObject<HTMLDivElement>;
  style?: React.CSSProperties;
};

const Fullscreenable: React.FC<FullscreenableProps> = ({
  children,
  buttonRef,
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
  }, [buttonRef, isFullscreen]);

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
