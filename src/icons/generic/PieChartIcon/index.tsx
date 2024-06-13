const PieChartIcon = ({ style, width }: { style?: any; width: number }) => (
  <svg
    fill="none"
    height={width}
    style={style}
    viewBox="0 0 24 24"
    width={width}
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx={12} cy={12} r="7.25" stroke="currentColor" strokeWidth="1.5" />
    <path d="M12 4.75V12H19.25" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

export default PieChartIcon;
