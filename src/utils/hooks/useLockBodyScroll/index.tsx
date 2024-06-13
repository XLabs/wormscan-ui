import { useEffect, useRef } from "react";

const useLockBodyScroll = ({
  isLocked,
  scrollableClasses = [],
}: {
  isLocked: boolean;
  scrollableClasses?: string[];
}) => {
  const scrollYRef = useRef(0);

  useEffect(() => {
    const lockScroll = () => {
      scrollYRef.current = window.scrollY;
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollYRef.current}px`;
      document.body.style.width = "100%";
    };

    const unlockScroll = () => {
      const scrollY = parseInt(document.body.style.top || "0", 10) * -1;
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      window.scrollTo({ top: scrollY, behavior: "instant" });
    };

    const preventScroll = (e: TouchEvent) => {
      const isScrollable = scrollableClasses.some(className =>
        (e.target as HTMLElement).classList.contains(className),
      );

      if (isLocked && !isScrollable) {
        e.preventDefault();
      }
    };

    if (isLocked) {
      lockScroll();
      document.addEventListener("touchmove", preventScroll, { passive: false });
    }

    return () => {
      if (isLocked) {
        unlockScroll();
        document.removeEventListener("touchmove", preventScroll);
      }
    };
  }, [isLocked, scrollableClasses]);
};

export default useLockBodyScroll;
