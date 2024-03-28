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

export const addQuotesInKeys = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(addQuotesInKeys);
  } else if (typeof obj === "object" && obj !== null) {
    // newObj = keys with quotes
    const newObj: any = {};

    for (const key in obj) {
      // add quotes to key
      const newKey = `"${key}"`;
      newObj[newKey] = addQuotesInKeys(obj[key]);
    }

    return newObj;
  } else {
    return obj;
  }
};

export const hexToBase64 = (hexString: string) => {
  // Convert the hex string to a byte array.
  const byteArray = new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));

  // Convert the byte array to a string.
  const binaryString = Array.from(byteArray)
    .map(byte => String.fromCharCode(byte))
    .join("");

  // Encode the binary string to Base64.
  const base64String = btoa(binaryString);

  return base64String;
};

export const base64ToHex = (base64String: string) => {
  try {
    // Decode the Base64 string to a binary string.
    const binaryString = atob(base64String);

    // Convert each character to its char code, then to its Hex representation, and pad with zeros if necessary.
    const hexString = Array.from(binaryString)
      .map(char => char.charCodeAt(0).toString(16).padStart(2, "0"))
      .join("");

    return hexString;
  } catch (e) {
    return "";
  }
};

export const hexToBase58 = (hexString: string) => {
  // base58 alphabet
  const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  const BASE = BigInt(ALPHABET.length);

  // remove the "0x" prefix if present and initialize the result
  hexString = hexString.startsWith("0x") ? hexString.substring(2) : hexString;
  let result = "";

  // hex to BigInt
  let decimal = BigInt("0x" + hexString);

  // BigInt to base58
  while (decimal > 0) {
    const remainder = decimal % BASE;
    decimal /= BASE;
    result = ALPHABET.charAt(Number(remainder)) + result;
  }

  // Handle leading zeros in the hex string
  for (let i = 0; i < hexString.length && hexString[i] === "0"; i += 2) {
    result = "1" + result;
  }

  return result;
};
