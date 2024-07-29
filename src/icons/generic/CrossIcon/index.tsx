const CrossIcon = ({ style, width = 24 }: { style?: React.CSSProperties; width?: number }) => (
  <svg
    fill="none"
    height={width}
    style={style}
    viewBox="0 0 24 24"
    width={width}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M15.7123 7.22702L7.22703 15.7123L8.28769 16.773L16.773 8.28768L15.7123 7.22702Z"
      fill="currentColor"
    />
    <path
      d="M7.22702 8.28768L15.7123 16.773L16.773 15.7123L8.28768 7.22702L7.22702 8.28768Z"
      fill="currentColor"
    />
  </svg>
);

export default CrossIcon;
