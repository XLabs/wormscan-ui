import { useEffect, useState } from "react";

interface Size {
  width: number;
  height: number;
}

function useWindowSize(): Size {
  const [windowSize, setWindowSize] = useState<Size>({
    width: screen.width || 0,
    height: screen.height || 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
}

export default useWindowSize;
