const SwapSmallVerticalIcon = ({ style, width }: { style?: any; width: number }) => (
  <svg
    fill="none"
    height={width}
    style={style}
    viewBox="0 0 24 24"
    width={width}
    xmlns="http://www.w3.org/2000/svg"
  >
    <g opacity="0.6">
      <path d="M8.5 12.5L5 9L8.5 5.5" stroke="white" strokeWidth="1.5" />
      <path d="M15.5 18.5L19 15L15.5 11.5" stroke="white" strokeWidth="1.5" />
      <path d="M19 15L10 15" stroke="white" strokeWidth="1.5" />
      <path d="M5 9L14 9" stroke="white" strokeWidth="1.5" />
    </g>
  </svg>
);

export default SwapSmallVerticalIcon;
