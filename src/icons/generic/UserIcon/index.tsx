const UserIcon = ({ style, width = 24 }: { style?: any; width?: number }) => (
  <svg
    height={width}
    style={style}
    width={width}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M5.75 19V16.25C5.75 15.1454 6.64543 14.25 7.75 14.25H16.25C17.3546 14.25 18.25 15.1454 18.25 16.25V19M15.25 8C15.25 9.79493 13.7949 11.25 12 11.25C10.2051 11.25 8.75 9.79493 8.75 8C8.75 6.20507 10.2051 4.75 12 4.75C13.7949 4.75 15.25 6.20507 15.25 8Z"
      stroke="#666666"
      strokeWidth="1.5"
    />
  </svg>
);

export default UserIcon;
