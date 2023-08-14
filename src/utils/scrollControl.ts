import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Component that scrolls to the top of the page and handle scrollbarGutter whenever the route changes.
export const ScrollControl: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    if (pathname === "/" || pathname === "/txs") {
      document.documentElement.style.scrollbarGutter = "stable";
    } else {
      document.documentElement.style.scrollbarGutter = "inherit";
    }
  }, [pathname]);

  return null;
};
