import React from "react";
import "./styles.scss";

type Props = {
  children: React.ReactNode;
  color?: string;
  className?: string;
};

const Chip = ({ children, color = "", className = "" }: Props) => {
  return <div className={`chip ${color} ${className}`}>{children}</div>;
};

export default Chip;
