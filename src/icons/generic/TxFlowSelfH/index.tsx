const TxFlowSelfH = ({ width = 24 }: { width?: number }) => (
  <svg
    fill="none"
    height={width}
    viewBox="0 0 24 24"
    width={width}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M8.5 15.5L5 12L8.5 8.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M15.5 15.5L19 12L15.5 8.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M5 12L19 12" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

export default TxFlowSelfH;
