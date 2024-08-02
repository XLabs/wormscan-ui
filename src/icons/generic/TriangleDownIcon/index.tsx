const TriangleDownIcon = ({
  className = "",
  width = 10,
}: {
  className?: string;
  width?: number;
}) => (
  <svg
    fill="none"
    className={className}
    height={width / 2}
    viewBox="0 0 10 5"
    width={width}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M5 5L0.669873 0.499999L9.33013 0.5L5 5Z" fill="currentColor" />
  </svg>
);

export default TriangleDownIcon;
