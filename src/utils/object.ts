// Replacer function to convert BigInt to string with 'n' appended
const bigintReplacer = (key: string, value: any): any => {
  if (typeof value === "bigint") {
    return value.toString() + "n";
  }
  return value;
};

// Reviver function to convert strings with 'n' back to BigInt
const bigintReviver = (key: string, value: any): any => {
  if (typeof value === "string" && /^[0-9]+n$/.test(value)) {
    return BigInt(value.slice(0, -1));
  }
  return value;
};

// Function to deep clone an object with BigInt support
export const deepCloneWithBigInt = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj, bigintReplacer), bigintReviver);
};

export const stringifyWithBigInt = (obj: object, space?: number): string => {
  return JSON.stringify(obj, bigintReplacer, space);
};

export const parseWithBigInt = (str: string) => {
  return JSON.parse(str, bigintReviver);
};
