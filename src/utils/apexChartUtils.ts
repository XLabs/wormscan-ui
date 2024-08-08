import { numberToSuffix } from "./number";

export const formatterYAxis = (() => {
  let allBillionsYIncludePointZero = false;
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

      allBillionsYIncludePointZero = allYAxisFormatted
        .filter((value: string) => value.includes("B"))
        .every((value: string) => value.includes(".0"));

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

    if (vol >= 1000000000 && allBillionsYIncludePointZero) {
      result = result.replace(".0", "");
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

    return result;
  };
})();

export const changePathOpacity = ({
  opacity,
  ref,
}: {
  opacity: number;
  ref: React.RefObject<HTMLDivElement>;
}) => {
  const paths = ref.current.querySelectorAll("path[val]");

  paths.forEach((path: any) => {
    path.style.opacity = opacity;
  });
};

export const updatePathStyles = ({
  chartRef,
  dataPointIndex,
}: {
  chartRef: any;
  dataPointIndex: number;
}) => {
  const pathsWithThisJ = chartRef.current.querySelectorAll(`path[j="${dataPointIndex}"]`);
  const restOfPaths = chartRef.current.querySelectorAll(`path[val]:not([j="${dataPointIndex}"])`);

  pathsWithThisJ.forEach((path: any) => {
    path.style.opacity = 1;
  });
  restOfPaths.forEach((path: any) => {
    path.style.opacity = 0.3;
  });
};
