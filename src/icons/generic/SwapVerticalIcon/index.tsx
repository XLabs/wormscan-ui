const SwapVerticalIcon = ({ style, width = 24 }: { style?: any; width?: number }) => (
  <svg
    fill="none"
    height={width}
    style={style}
    viewBox="0 0 24 24"
    width={width}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M15.5 12.5L19 16L15.5 19.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M19 16H5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M8.5 4.5L5 8L8.5 11.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M5 8H19" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

export default SwapVerticalIcon;
