export const removeLeadingZeros = (str: string) => {
  if (!str) return "";
  return str.replace(/^0+/, "");
};
