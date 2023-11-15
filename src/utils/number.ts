export const formatNumber = (value: number, decimals?: number) => {
  if (decimals !== undefined) {
    return value.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  const valueWithoutDecimals = Math.floor(value);
  const hasDecimals = value % 1 !== 0;
  const decimalCount = hasDecimals ? 2 : 0;

  // show formatted value without decimals for large values
  if (valueWithoutDecimals.toString().length >= 7) {
    return valueWithoutDecimals.toLocaleString();
  }

  // show formatted value with 7 decimals for small values (zero point something)
  if (valueWithoutDecimals === 0) {
    return value.toLocaleString(undefined, {
      minimumFractionDigits: decimalCount,
      maximumFractionDigits: 7,
    });
  }

  // show formatted value with 2 decimals
  return value.toLocaleString(undefined, {
    minimumFractionDigits: decimalCount,
    maximumFractionDigits: 2,
  });
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
