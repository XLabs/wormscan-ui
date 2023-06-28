import { RefObject, useCallback, useEffect } from "react";

type CallbackType = (event?: MouseEvent | TouchEvent) => void;

const useOutsideClick = (ref: RefObject<HTMLElement>, callback: CallbackType): void => {
  const handleClick = useCallback(
    (event: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback(event);
      }
    },
    [callback, ref],
  );

  useEffect(() => {
    document.addEventListener("touchstart", handleClick, { passive: false });
    document.addEventListener("mousedown", handleClick, { passive: false });

    return () => {
      document.removeEventListener("touchstart", handleClick);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [handleClick]);
};

export default useOutsideClick;
