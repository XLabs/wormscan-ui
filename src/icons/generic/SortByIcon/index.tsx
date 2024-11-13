const SortByIcon = ({ sortBy, width = 24 }: { sortBy?: "ASC" | "DSC" | null; width?: number }) => (
  <svg
    fill="none"
    height={width}
    viewBox="0 0 24 24"
    width={width}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M7.5 13.5L12 18L16.5 13.5"
      stroke={sortBy === "DSC" ? "#fff" : "#4D4D4D"}
      strokeWidth="1.5"
    />
    <path
      d="M7.5 10.5L12 6L16.5 10.5"
      stroke={sortBy === "ASC" ? "#fff" : "#4D4D4D"}
      strokeWidth="1.5"
    />
  </svg>
);

export default SortByIcon;
