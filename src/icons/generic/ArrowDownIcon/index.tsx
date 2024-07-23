const ArrowDownIcon = ({ style, width = 24 }: { style?: React.CSSProperties; width?: number }) => (
  <svg
    fill="none"
    height={width}
    style={style}
    viewBox="0 0 24 24"
    width={width}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M16.5 13.5L12 18L7.5 13.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M12 18L12 6" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

export default ArrowDownIcon;
