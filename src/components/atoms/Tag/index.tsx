import React from "react";
import "./styles.scss";

type Props = {
  children: React.ReactNode;
  color?: string;
  className?: string;
  type?: "chip" | "default";
  size?: "small" | "default";
};

const Tag = ({
  children,
  color = "",
  className = "",
  type = "default",
  size = "default",
}: Props) => {
  return <div className={`tag ${color} ${type} ${size} ${className}`}>{children}</div>;
};

export default Tag;
