const ThumbsUpIcon = ({ style, width = 24 }: { style?: any; width?: number }) => (
  <svg
    width={width}
    height={width}
    style={style}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M9 16.4334L11.631 18.4867C11.9705 18.8289 12.7344 19 13.2436 19H16.4688C17.4872 19 18.5906 18.23 18.8452 17.2034L20.8821 10.9581C21.3065 9.76036 20.5426 8.73373 19.2696 8.73373H15.8747C15.3654 8.73373 14.9411 8.30597 15.0259 7.7071L15.4503 4.96943C15.62 4.19946 15.1108 3.34394 14.347 3.08728C13.668 2.83062 12.8193 3.17283 12.4798 3.68615L9 8.90483"
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

export default ThumbsUpIcon;
