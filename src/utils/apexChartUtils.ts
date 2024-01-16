import { numberToSuffix } from "./number";

export const formatterYAxisTopAssets = (() => {
  let allMillionsYIncludePointZero = false;
  let allThousandsYIncludePointZero = false;
  let allUnderThousandYIncludePointZero = false;

  return function (vol: number, opts: any) {
    let result = vol < 1000 && vol > 0 ? Number(vol).toFixed(1) : numberToSuffix(vol);
    const allYAxis = opts?.w?.globals?.yAxisScale?.[0]?.result;

    if (allYAxis && Array.isArray(allYAxis)) {
      const allYAxisFormatted = allYAxis?.map((value: number) => {
        return value < 1000 ? Number(value).toFixed(1) : numberToSuffix(value);
      });

      allMillionsYIncludePointZero = allYAxisFormatted
        .filter((value: string) => value.includes("M"))
        .every((value: string) => value.includes(".0"));

      allThousandsYIncludePointZero = allYAxisFormatted
        .filter((value: string) => value.includes("K"))
        .every((value: string) => value.includes(".0"));

      allUnderThousandYIncludePointZero = allYAxisFormatted
        .filter((value: string) => !value.includes("K") && !value.includes("M"))
        .every((value: string) => value.includes(".0"));
    }

    if (vol >= 1000000 && allMillionsYIncludePointZero) {
      result = result.replace(".0", "");
    }

    if (vol >= 1000 && vol < 1000000 && allThousandsYIncludePointZero) {
      result = result.replace(".0", "");
    }

    if (vol >= 1 && vol < 1000 && allUnderThousandYIncludePointZero) {
      result = result.replace(".0", "");
    }

    if (vol < 1 && vol > 0) {
      result = Number(result).toFixed(1);
    }

    return `$${result}`;
  };
})();

export const formatterYAxisTransactionHistory = (() => {
  let allYIncludesPointZero = false;

  return function (val: number, opts: any) {
    let result = numberToSuffix(val);

    const allYAxis = opts?.w?.globals?.yAxisScale?.[0]?.result;

    if (allYAxis && Array.isArray(allYAxis)) {
      const allYAxisFormatted = allYAxis?.map((value: number) => {
        return numberToSuffix(value);
      });

      allYIncludesPointZero = allYAxisFormatted.every(
        (item: string) => item.includes(".0") || item === "0",
      );
    }

    if (allYIncludesPointZero) {
      result = result.replace(".0", "");
    }

    return result;
  };
})();
