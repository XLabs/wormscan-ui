const DownloadIcon = ({ style, width = 24 }: { style?: any; width?: number }) => (
  <svg
    height={width}
    style={style}
    width={width}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g opacity="1">
      <path d="M4.75 14L4.75 18.25L19.25 18.25L19.25 14" stroke="currentColor" strokeWidth="1.5" />
      <path d="M15.5 10.5L12 14L8.5 10.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 14L12 4" stroke="currentColor" strokeWidth="1.5" />
    </g>
  </svg>
);

export default DownloadIcon;
