const AlertTriangle = ({
  className = "",
  style,
  width,
}: {
  className?: string;
  style?: React.CSSProperties;
  width: number;
}) => (
  <svg
    className={`icon ${className}`}
    fill="none"
    height={width}
    style={style}
    viewBox="0 0 24 24"
    width={width}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 10v3.5" stroke="currentColor" strokeWidth={1.5} />
    <circle cx={12} cy={16} r={1} fill="currentColor" />
    <path d="M12 4.75l-7.75 14.5h15.5L12 4.75z" stroke="currentColor" strokeWidth={1.5} />
  </svg>
);

export default AlertTriangle;
