const FilterListIcon = ({ style, width = 24 }: { style?: any; width?: number }) => (
  <svg
    fill="none"
    height={width}
    style={style}
    viewBox="0 0 24 24"
    width={width}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M4 7H20" stroke="currentColor" strokeWidth="1.5" />
    <path d="M7 12H17" stroke="currentColor" strokeWidth="1.5" />
    <path d="M10 17H14" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

export default FilterListIcon;
