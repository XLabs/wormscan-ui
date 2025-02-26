import { ReactNode } from "react";
import { CrossIcon } from "src/icons/generic";
import "./styles.scss";

interface ModalProps {
  shouldShow: boolean;
  setShouldShow: (shouldShow: boolean) => void;
  children: ReactNode;
}

const Modal = ({ shouldShow, setShouldShow, children }: ModalProps) => {
  if (!shouldShow) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setShouldShow(false);
    }
  };

  return (
    <div className={"modal_overlay"} onClick={handleOverlayClick}>
      <div className={"modal_content"}>
        {children}
        <button className={"modal_close"} onClick={() => setShouldShow(false)}>
          <CrossIcon />
        </button>
      </div>
    </div>
  );
};

export default Modal;
