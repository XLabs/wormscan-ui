export const formatNumber = (value: number, decimals = 2) => {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

export const formatCurrency = (value: number, decimals = 2) => {
  return formatNumber(value, decimals);
};

export const numberToSuffix = (val: number): string => {
  if (val >= 1000000000) {
    return (val / 1000000000).toFixed(1) + "B";
  } else if (val >= 1000000) {
    return (val / 1000000).toFixed(1) + "M";
  } else if (val >= 1000) {
    return (val / 1000).toFixed(1) + "K";
  } else {
    return `${val}`;
  }
};
