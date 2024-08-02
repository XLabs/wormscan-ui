const ArrowRightIcon = ({
  className = "",
  style,
  width = 24,
}: {
  className?: string;
  style?: any;
  width?: number;
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
    <path d="M18 12H6" stroke="currentColor" strokeWidth="1.5" />
    <path d="M13.5 7.5L18 12L13.5 16.5" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

export default ArrowRightIcon;
