const ChevronDownIcon = ({ style, width }: { style?: React.CSSProperties; width: number }) => (
  <svg
    fill="none"
    height={width}
    style={style}
    viewBox="0 0 24 24"
    width={width}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M4.75 4.75H15.25V13.25H7.5L4.75 16V4.75Z" stroke="currentColor" strokeWidth="1.5" />
    <path d="M18.75 8V19L16.5 16.75H9" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

export default ChevronDownIcon;
