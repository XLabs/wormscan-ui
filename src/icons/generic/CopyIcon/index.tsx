const CopyIcon = ({ style, width }: { style?: any; width: number }) => (
  <svg
    fill="none"
    height={width}
    style={style}
    viewBox="0 0 24 24"
    width={width}
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="8.5" y="8.5" width={10} height={10} stroke="currentColor" strokeWidth="1.5" />
    <path d="M16.5 5.5H5.5V16.5" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

export default CopyIcon;
