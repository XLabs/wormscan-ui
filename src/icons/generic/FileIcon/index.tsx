const FileIcon = ({ style, width = 24 }: { style?: any; width?: number }) => (
  <svg
    height={width}
    style={style}
    width={width}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M6.75 18.25V4.75H13.5L17.25 8.5V18.25H6.75Z" stroke="#999999" strokeWidth="1.5" />
  </svg>
);

export default FileIcon;
