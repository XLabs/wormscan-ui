const CheckCircle2 = ({ style, width }: { style?: any; width: number }) => (
  <svg
    fill="none"
    height={width}
    style={style}
    viewBox="0 0 24 24"
    width={width}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M8.5 10.5L12 14L19.5 6.5" stroke="currentColor" strokeWidth="1.5" />
    <path
      d="M19.25 12C19.25 16.0041 16.0041 19.25 12 19.25C7.99594 19.25 4.75 16.0041 4.75 12C4.75 7.99594 7.99594 4.75 12 4.75C13.1657 4.75 14.2672 5.02512 15.243 5.51398"
      stroke="currentColor"
      strokeWidth="1.5"
    />
  </svg>
);

export default CheckCircle2;
