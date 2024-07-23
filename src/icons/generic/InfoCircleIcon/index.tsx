const InfoCircleIcon = ({ style, width = 24 }: { style?: React.CSSProperties; width?: number }) => (
  <svg
    fill="none"
    height={width}
    style={style}
    viewBox="0 0 24 24"
    width={width}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M19.25 12C19.25 16.0041 16.0041 19.25 12 19.25C7.99594 19.25 4.75 16.0041 4.75 12C4.75 7.99594 7.99594 4.75 12 4.75C16.0041 4.75 19.25 7.99594 19.25 12Z"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path d="M12.75 16V11.5H11.25V16H12.75Z" fill="currentColor" />
    <circle cx={12} cy={9} r={1} fill="currentColor" />
  </svg>
);

export default InfoCircleIcon;
