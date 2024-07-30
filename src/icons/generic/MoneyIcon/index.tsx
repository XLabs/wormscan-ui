const MoneyIcon = ({ width = 24, style }: { width?: number; style?: any }) => (
  <svg
    fill="none"
    height={width}
    style={style}
    viewBox="0 0 24 24"
    width={width}
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="4.25" y="7.25" width="15.5" height="9.5" stroke="currentColor" strokeWidth="1.5" />
    <circle cx={12} cy={12} r="1.75" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

export default MoneyIcon;
