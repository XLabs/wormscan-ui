const MenuIcon = ({ style, width }: { style?: any; width: number }) => (
  <svg
    fill="none"
    height={width}
    style={style}
    viewBox="0 0 24 24"
    width={width}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M5 17.75H19V16.25H5V17.75Z" fill="white" />
    <path d="M5 12.75H19V11.25H5V12.75Z" fill="white" />
    <path d="M5 7.75H19V6.25H5V7.75Z" fill="white" />
  </svg>
);

export default MenuIcon;
