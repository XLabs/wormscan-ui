import React from "react";
import { InfoCircleIcon } from "src/icons/generic";
import "./styles.scss";

type Props = {
  children: React.ReactNode;
  type?: "info";
  className?: string;
};

const Alert = ({ children, type = "info", className }: Props) => {
  return (
    <div className={`alert ${type} ${className}`}>
      <div>
        <InfoCircleIcon />
      </div>
      <div className="alert-text">{children}</div>
    </div>
  );
};

export default Alert;
