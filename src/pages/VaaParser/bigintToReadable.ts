// Function to transform all bigint fields in an object to number or string
export function bigintToReadable(obj: any): any {
  for (const key in obj) {
    if (typeof obj[key] === "bigint") {
      // Check if the bigint can be safely converted to a number
      try {
        if (obj[key] <= Number.MAX_SAFE_INTEGER && obj[key] >= Number.MIN_SAFE_INTEGER) {
          obj[key] = Number(obj[key]);
        } else {
          throw new Error("BigInt too large");
        }
      } catch {
        obj[key] = obj[key].toString();
      }
    } else if (obj[key] && typeof obj[key] === "object") {
      // Recursively transform for nested objects
      bigintToReadable(obj[key]);
    }
  }
  return obj;
}
