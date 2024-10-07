const LinearIcon = ({ style, width = 24 }: { style?: React.CSSProperties; width?: number }) => (
  <svg
    fill="none"
    height={width}
    style={style}
    viewBox="0 0 24 24"
    width={width}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M3 21L21 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    {/* <path
      d="M3 21H21V3"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    /> */}
  </svg>
);

export default LinearIcon;
