const NewTabIcon = ({ style, width = 24 }: { style?: any; width?: number }) => (
  <svg
    width={width}
    height={width}
    style={style}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g opacity="0.6">
      <path d="M11 6.75H5.75V18.25H17.25V13" stroke="currentColor" strokeWidth="1.5" />
      <path d="M13.5 4.75H19.25V10.5" stroke="white" strokeWidth="1.5" />
      <path d="M19.25 4.75L11.5 12.5" stroke="white" strokeWidth="1.5" />
    </g>
  </svg>
);

export default NewTabIcon;
