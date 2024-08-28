const UploadIcon = ({ style, width = 24 }: { style?: any; width?: number }) => (
  <svg
    height={width}
    style={style}
    width={width}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M4.75 14L4.75 18.25L19.25 18.25L19.25 14" stroke="#666666" strokeWidth="1.5" />
    <path d="M15.5 8.5L12 5L8.5 8.5" stroke="#666666" strokeWidth="1.5" />
    <path d="M12 5L12 15" stroke="#666666" strokeWidth="1.5" />
  </svg>
);

export default UploadIcon;
