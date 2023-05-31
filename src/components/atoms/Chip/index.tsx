import React from "react";
import "./styles.scss";

type Props = {
  children: React.ReactNode;
  color?: string;
  className?: string;
};

const Chip = ({ children, className }: Props) => {
  return <div className={`chip ${className}`}>{children}</div>;
};

export default Chip;
