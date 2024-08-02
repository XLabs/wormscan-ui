const AnalyticsIcon = ({ style, width = 24 }: { style?: React.CSSProperties; width?: number }) => (
  <svg
    fill="none"
    height={width}
    style={style}
    viewBox="0 0 24 24"
    width={width}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M7 19L7 15" stroke="currentColor" strokeWidth="1.5" />
    <path d="M12 19L12 10" stroke="currentColor" strokeWidth="1.5" />
    <path d="M17 19L17 5" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

export default AnalyticsIcon;
