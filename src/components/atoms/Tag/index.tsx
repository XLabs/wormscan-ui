import React from "react";
import "./styles.scss";

type Props = {
  children: React.ReactNode;
  color?: string;
  className?: string;
};

const Tag = ({ children, color, className }: Props) => {
  return <div className={`tag ${className}`}>{children}</div>;
};

export default Tag;
