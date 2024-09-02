const DesktopIcon = ({ style, width = 24 }: { style?: any; width?: number }) => (
  <svg
    height={width}
    style={style}
    width={width}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M19.25 5.25H4.75V14.75H19.25V5.25Z" stroke="#666666" strokeWidth="1.5" />
    <path d="M12 14.75V18" stroke="#666666" strokeWidth="1.5" />
    <path d="M8 18.25H16" stroke="#666666" strokeWidth="1.5" />
  </svg>
);

export default DesktopIcon;
