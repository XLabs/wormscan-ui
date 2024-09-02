const EnterIcon = ({ style, width = 24 }: { style?: any; width?: number }) => (
  <svg
    height={width}
    style={style}
    width={width}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M18 13H7V5" stroke="#999999" strokeWidth="1.5" />
    <path d="M13.5 8.5L18 13L13.5 17.5" stroke="#999999" strokeWidth="1.5" />
  </svg>
);

export default EnterIcon;
