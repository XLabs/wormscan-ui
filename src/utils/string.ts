export const removeLeadingZeros = (str: string) => {
  if (!str) return "";
  return str.replace(/^0+/, "");
};

const getWidthOfText = (text: string): number => {
  const span = document.createElement("span");
  span.textContent = text;
  span.style.fontSize = "16px";
  span.style.fontWeight = "400";
  span.style.position = "absolute";
  span.style.visibility = "hidden";
  span.style.whiteSpace = "nowrap";
  span.style.top = "-200px";

  document.body.appendChild(span);
  const textWidth = span.getBoundingClientRect().width;
  document.body.removeChild(span);

  return textWidth;
};

export const TruncateText = ({
  containerWidth, // container width for text and extraWidth
  extraWidth = 30, // width for gap and copy icon for example
  text,
}: {
  containerWidth: number;
  extraWidth?: number;
  text: string;
}) => {
  if (!text) return;

  const textWidth = getWidthOfText(text);
  const textWidthExtras = textWidth + extraWidth;

  if (textWidthExtras <= containerWidth) return text;

  const availableWidth = containerWidth - extraWidth;
  const averageCharacterWidth = textWidth / text.length;
  const maxLength = Math.floor(availableWidth / averageCharacterWidth);
  const ellipsis = "...";
  const ellipsisLength = ellipsis.length;
  const availableSpace = maxLength - ellipsisLength;
  const halfLength = Math.floor(availableSpace / 2) > 6 ? Math.floor(availableSpace / 2) : 6;
  const start = text.slice(0, halfLength);
  const end = text.slice(-halfLength);

  return `${start}${ellipsis}${end}`;
};
