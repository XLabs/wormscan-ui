const PercentageIcon = ({ width = 24, style }: { width?: number; style?: any }) => (
  <svg
    fill="none"
    height={width}
    style={style}
    viewBox="0 0 24 24"
    width={width}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M5 19L19 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path
      d="M8.41421 5.58579C9.19526 6.36683 9.19526 7.63317 8.41421 8.41421C7.63317 9.19526 6.36683 9.19526 5.58579 8.41421C4.80474 7.63317 4.80474 6.36683 5.58579 5.58579C6.36683 4.80474 7.63317 4.80474 8.41421 5.58579Z"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M18.4142 15.5858C19.1952 16.3668 19.1952 17.6332 18.4142 18.4142C17.6332 19.1953 16.3668 19.1953 15.5857 18.4142C14.8047 17.6332 14.8047 16.3668 15.5857 15.5858C16.3668 14.8047 17.6332 14.8047 18.4142 15.5858Z"
      stroke="currentColor"
      strokeWidth="1.5"
    />
  </svg>
);

export default PercentageIcon;
