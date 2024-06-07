const TwitterIcon = ({ color = "#ffffff99", width = 20 }: { color?: string; width?: number }) => (
  <svg
    fill="none"
    height={width / 1.125}
    viewBox="0 0 18 16"
    width={width}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M10.7349 6.71836L17 0H15.4004L10.015 5.75859L5.80273 0H0.470703L7.0291 8.95781L0.470703 15.9961H2.07031L7.74892 9.91758L12.2012 15.9961H17.5332L10.7349 6.71836ZM2.84346 1.06641H4.97627L15.1338 14.9297H13.001L2.84346 1.06641Z"
      fill={color}
    />
  </svg>
);

export default TwitterIcon;
