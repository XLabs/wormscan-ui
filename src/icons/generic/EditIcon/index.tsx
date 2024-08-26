const EditIcon = ({ style, width = 24 }: { style?: any; width?: number }) => (
  <svg
    height={width}
    style={style}
    width={width}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M15 5.5L5.75 14.7501V18.2501H9.25L18.5 9L15 5.5Z" stroke="white" strokeWidth="1.5" />
    <path d="M20 18.25H13" stroke="white" strokeWidth="1.5" />
  </svg>
);

export default EditIcon;
