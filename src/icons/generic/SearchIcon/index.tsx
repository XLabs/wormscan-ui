const SearchIcon = ({ style, width = 24 }: { style?: React.CSSProperties; width?: number }) => (
  <svg
    width={width}
    height={width}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M15.25 10.25C15.25 13.0114 13.0114 15.25 10.25 15.25C7.48858 15.25 5.25 13.0114 5.25 10.25C5.25 7.48858 7.48858 5.25 10.25 5.25C13.0114 5.25 15.25 7.48858 15.25 10.25Z"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path d="M13.7855 13.7855L19.5 19.5" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

export default SearchIcon;
