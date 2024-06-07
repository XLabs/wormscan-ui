const ChevronDownIcon = ({ style, width }: { style?: any; width: number }) => (
  <svg
    fill="none"
    height={width / 1.08333333333}
    style={style}
    viewBox="0 0 26 24"
    width={width}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M5.09619 4.75H16.3616V13.25H8.04665L5.09619 16V4.75Z"
      stroke="#666666"
      strokeWidth="1.5"
    />
    <path d="M20.1167 8V19L17.7027 16.75H9.65599" stroke="#666666" strokeWidth="1.5" />
  </svg>
);

export default ChevronDownIcon;
