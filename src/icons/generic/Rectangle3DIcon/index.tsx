const Rectangle3DIcon = ({ width = 24 }: { width?: number }) => (
  <svg
    fill="none"
    height={width}
    viewBox="0 0 24 24"
    width={width}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4.25 9.5L12 5L19.75 9.5V14.5L12 19L4.25 14.5V9.5Z"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path d="M12 14L19.75 9.5M12 14L4.25 9.5M12 14V19" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

export default Rectangle3DIcon;