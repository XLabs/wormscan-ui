export const formatNumber = (value: number, decimals = 2) => {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

export const formatCurrency = (value: number, decimals = 2) => {
  return formatNumber(value, decimals);
};
