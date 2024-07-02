const VAAEmittedIcon = ({ style, width }: { style?: any; width: number }) => (
  <svg
    fill="none"
    height={width}
    style={style}
    viewBox="0 0 24 24"
    width={width}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M16 12C16 14.2091 14.2091 16 12 16C9.79086 16 8 14.2091 8 12L12 12L12 8C14.2091 8 16 9.79086 16 12Z"
      fill="currentColor"
    />
    <path
      d="M5 12C5 15.866 8.13401 19 12 19C15.866 19 19 15.866 19 12C19 8.13401 15.866 5 12 5C8.13401 5 5 8.13401 5 12Z"
      stroke="currentColor"
      strokeWidth="1.5"
    />
  </svg>
);

export default VAAEmittedIcon;
