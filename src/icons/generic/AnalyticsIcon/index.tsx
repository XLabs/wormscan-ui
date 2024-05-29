const AnalyticsIcon = ({ style, width }: { style?: any; width: number }) => (
  <svg
    fill="none"
    height={width / 1.04166666667}
    style={style}
    viewBox="0 0 25 24"
    width={width}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M7.5 19L7.5 15" stroke="currentColor" strokeWidth="1.5" />
    <path d="M12.5 19L12.5 10" stroke="currentColor" strokeWidth="1.5" />
    <path d="M17.5 19L17.5 5" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

export default AnalyticsIcon;
