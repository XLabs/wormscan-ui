const ThumbsDownIcon = ({ style, width = 24 }: { style?: any; width?: number }) => (
  <svg
    width={width}
    height={width}
    style={style}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M9 8.56657L11.631 6.51331C11.9705 6.1711 12.7344 6 13.2436 6H16.4688C17.4872 6 18.5906 6.76997 18.8452 7.7966L20.8821 14.0419C21.3065 15.2396 20.5426 16.2663 19.2696 16.2663H15.8747C15.3654 16.2663 14.9411 16.694 15.0259 17.2929L15.4503 20.0306C15.62 20.8005 15.1108 21.6561 14.347 21.9127C13.668 22.1694 12.8193 21.8272 12.4798 21.3139L9 16.0952"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M2 17.3235V8.67647C2 7.44118 2.84 7 4.8 7H6.2C8.16 7 9 7.44118 9 8.67647V17.3235C9 18.5588 8.16 19 6.2 19H4.8C2.84 19 2 18.5588 2 17.3235Z"
      stroke="currentColor"
      strokeWidth="1.5"
    />
  </svg>
);

export default ThumbsDownIcon;
