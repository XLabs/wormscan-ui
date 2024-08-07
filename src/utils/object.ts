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

export const getNestedProperty = (obj: any, key: string) => {
  if (!key) return;
  return key.split(".").reduce((o, x) => (o == null ? o : o[x]), obj);
};

// Replacer function to convert BigInt to strings
const bigintStringReplacer = (key: string, value: any): any => {
  if (typeof value === "bigint") {
    return value.toString();
  }
  return value;
};

export const stringifyWithStringBigInt = (obj: object, space?: number): string => {
  return JSON.stringify(obj, bigintStringReplacer, space);
};

// return all the keys of an object (deep)
export const allKeys = (obj: any): Array<any> => {
  const keys: any[] = [];

  Object.entries(obj).forEach(([key, value]) => {
    if (typeof value === "object") {
      keys.push(allKeys(value).map(a => `${key}.${a}`));
    } else {
      keys.push(key);
    }
  });

  return keys.flat();
};
