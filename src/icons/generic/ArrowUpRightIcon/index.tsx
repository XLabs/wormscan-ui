const ArrowUpRightIcon = ({ className, width = 24 }: { className?: string; width?: number }) => (
  <svg
    className={className}
    fill="none"
    height={width}
    viewBox="0 0 24 24"
    width={width}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M16.25 14V7.75H10" stroke="currentColor" strokeWidth="1.5" />
    <path d="M16.25 7.75L6.5 17.5" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

export default ArrowUpRightIcon;
