import { useState, useEffect } from "react";
import Tooltip from "../../atoms/Tooltip";
import "./styles.scss";

type Props = {
  children: React.ReactNode;
  toCopy: string;
  tooltip?: React.ReactNode;
};

const CopyToClipboard = ({ children, tooltip, toCopy }: Props) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const timeout = setTimeout(() => {
      setOpen(false);
    }, 1500);

    return () => {
      clearTimeout(timeout);
    };
  }, [open]);

  const copyText = async (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(toCopy);
    openTooltip();
  };

  const openTooltip = () => {
    setOpen(true);
  };

  return (
    <div className="copy-to-clipboard" onClick={copyText}>
      <Tooltip tooltip={tooltip || "Copied!"} side="right" open={open}>
        <div className="copy-to-clipboard-children">{children}</div>
      </Tooltip>
    </div>
  );
};

export default CopyToClipboard;
