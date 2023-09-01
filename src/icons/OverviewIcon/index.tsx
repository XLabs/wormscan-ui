type Props = {
  height: number;
  width: number;
};

const OverviewIcon = ({ width, height }: Props) => (
  <svg
    fill="none"
    height={height}
    viewBox="0 0 12 30"
    width={width}
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="6" cy="6" r="2" fill="currentColor" />
    <path d="M6 8L6 13" stroke="currentColor" />
    <circle cx="6" cy="15" r="2" fill="currentColor" />
    <path d="M6 17L6 22" stroke="currentColor" />
    <circle cx="6" cy="24" r="2" fill="currentColor" />
  </svg>
);

export default OverviewIcon;
