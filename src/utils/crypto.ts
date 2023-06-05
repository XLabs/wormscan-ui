export const formatUnits = (value: number, tokenDecimals = 8) => {
  if (!value) return 0;

  const maxDecimals = Math.min(8, tokenDecimals);
  const valueString = String(value);
  const decimalLength = valueString.length - maxDecimals;
  const startAmount = valueString.substring(0, decimalLength);
  const endAmount = valueString.substring(decimalLength);
  const parsedAmount = `${startAmount}.${endAmount}`;

  return parsedAmount;
};
