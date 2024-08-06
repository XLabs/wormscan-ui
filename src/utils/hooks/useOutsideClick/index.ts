import { RefObject, useCallback, useEffect } from "react";

type CallbackType = (event?: MouseEvent | TouchEvent) => void;

interface UseOutsideClickProps {
  ref: RefObject<HTMLElement>;
  callback: CallbackType;
  secondRef?: RefObject<HTMLElement>;
}

const useOutsideClick = ({ ref, callback, secondRef }: UseOutsideClickProps): void => {
  const handleClick = useCallback(
    (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (
        ref.current &&
        !ref.current.contains(target) &&
        (!secondRef || (secondRef.current && !secondRef.current.contains(target)))
      ) {
        callback(event);
      }
    },
    [callback, ref, secondRef],
  );

  useEffect(() => {
    document.addEventListener("mousedown", handleClick, { passive: false });

    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, [handleClick]);
};

export default useOutsideClick;
