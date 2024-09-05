const ActivityIcon = ({ style, width = 24 }: { style?: any; width?: number }) => (
  <svg
    fill="none"
    height={width}
    style={style}
    viewBox="0 0 24 24"
    width={width}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M4 12.0001H8L10 7L14 17.0001L16 12.0001H20" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

export default ActivityIcon;
