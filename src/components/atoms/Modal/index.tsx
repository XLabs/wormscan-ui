import { ReactNode } from "react";
import "./styles.scss";

interface ModalProps {
  shouldShow: boolean;
  setShouldShow: (shouldShow: boolean) => void;
  children: ReactNode;
}

const Modal = ({ shouldShow, setShouldShow, children }: ModalProps) => {
  if (!shouldShow) return null;

  return (
    <div className={"modal_overlay"}>
      <div className={"modal_content"}>
        {children}
        <button className={"modal_close"} onClick={() => setShouldShow(false)}>
          X
        </button>
      </div>
    </div>
  );
};

export default Modal;
