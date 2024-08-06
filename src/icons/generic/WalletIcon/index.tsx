const WalletIcon = ({ width = 24 }: { width?: number }) => (
  <svg
    fill="none"
    height={width}
    viewBox="0 0 24 24"
    width={width}
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx={12} cy={12} r={12} fill="#333333" />
    <rect x={6} y={9} width={12} height={9} rx={2} stroke="currentColor" strokeWidth="1.5" />
    <path d="M14 13.5H15.5" stroke="currentColor" strokeWidth="1.5" />
    <path
      d="M16 8.6V8C16 6.89543 15.1046 6 14 6H8C6.89543 6 6 6.89543 6 8V11"
      stroke="currentColor"
      strokeWidth="1.5"
    />
  </svg>
);

export default WalletIcon;
