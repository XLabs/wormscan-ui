const SearchIcon = ({ style, width }: { style?: any; width: number }) => (
  <svg
    fill="none"
    height={width / 1.04166666667}
    style={style}
    viewBox="0 0 25 24"
    width={width}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M15.75 10.25C15.75 13.0114 13.5114 15.25 10.75 15.25C7.98858 15.25 5.75 13.0114 5.75 10.25C5.75 7.48858 7.98858 5.25 10.75 5.25C13.5114 5.25 15.75 7.48858 15.75 10.25Z"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M13.7548 14.3155L19.4693 20.03L20.53 18.9693L14.8155 13.2548L13.7548 14.3155Z"
      fill="currentColor"
    />
  </svg>
);

export default SearchIcon;
