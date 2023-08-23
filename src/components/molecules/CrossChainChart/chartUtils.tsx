import { ChainId, CrossChainActivity } from "@xlabs-libs/wormscan-sdk";

const OTHERS_FAKE_CHAIN_ID = 123123123 as ChainId;
export const getChainName = (id: ChainId) => {
  if (id === OTHERS_FAKE_CHAIN_ID) return "Others";
  return ChainId[id] ?? "Unset";
};

interface ChainEndpoints {
  [key: number]: { volume: string; destinations: any[]; chain: ChainId; percentage: number };
}

export const processData = (
  data: CrossChainActivity,
  showOthers: boolean,
  selectedDestination: string,
) => {
  // if showing sources -> destinations, just cut the 'data' depending on page:
  if (selectedDestination === "sources") {
    const newData = [...data].sort((a, b) => b.percentage - a.percentage);
    return showOthers ? newData.slice(10) : newData.slice(0, 10);
  }

  // if showing destinations -> sources, we create an object with the same structure
  // but representing destinations to sources
  else {
    const invertedData: ChainEndpoints = {};
    data.forEach(src => {
      src.destinations.forEach(dest => {
        invertedData[dest.chain] = {
          percentage: 0,
          chain: dest.chain,
          volume: String(+dest.volume + (+invertedData[dest.chain]?.volume || 0)),
          destinations: (invertedData[dest.chain]?.destinations || []).concat({
            chain: src.chain,
            volume: src.destinations.find(a => a.chain === dest.chain).volume,
          }),
        };
      });
    });

    // once we have the object, we should calculate percentages:
    const invertedAsArray = Object.values(invertedData);
    let totalVolume = 0;

    invertedAsArray.forEach(value => {
      totalVolume += +value.volume;
    });
    invertedAsArray.forEach(value => {
      invertedData[value.chain].percentage = Math.max((+value.volume / totalVolume) * 100, 0.001);

      let totalDestinationVolume = 0;
      const invertedDestinationAsArray = Object.values(invertedData[value.chain].destinations);
      invertedDestinationAsArray.forEach(dest => {
        totalDestinationVolume += +dest.volume;
      });
      invertedDestinationAsArray.forEach((dest, idx) => {
        invertedData[value.chain].destinations[idx].percentage = Math.max(
          (+dest.volume / totalDestinationVolume) * 100,
          0.001,
        );
      });
    });

    // and finally return the similar-look array but inverted to dest -> sources:
    const finalInvertedData = Object.values(invertedData);
    const newData = [...finalInvertedData].sort((a, b) => +b.volume - +a.volume);

    return (showOthers ? newData.slice(10) : newData.slice(0, 10)) as CrossChainActivity;
  }
};

// Calculate the coordinates of a point on the Bezier curve
// and the angle of the tangent line at that point
export const calculateBezierPointAndAngle = (
  startX: number,
  startY: number,
  cp1X: number,
  cp1Y: number,
  cp2X: number,
  cp2Y: number,
  endX: number,
  endY: number,
  t: number,
) => {
  const u = 1 - t;
  const tt = t * t;
  const uu = u * u;
  const uuu = uu * u;
  const ttt = tt * t;

  const x = uuu * startX + 3 * uu * t * cp1X + 3 * u * tt * cp2X + ttt * endX;
  const y = uuu * startY + 3 * uu * t * cp1Y + 3 * u * tt * cp2Y + ttt * endY;

  // Calculate the derivative of the Bezier curve at the given t
  const dx =
    -3 * startX * uu +
    3 * cp1X * uu -
    6 * cp1X * t * u +
    6 * cp2X * t * u -
    3 * cp2X * tt +
    3 * endX * tt;
  const dy =
    -3 * startY * uu +
    3 * cp1Y * uu -
    6 * cp1Y * t * u +
    6 * cp2Y * t * u -
    3 * cp2Y * tt +
    3 * endY * tt;

  // Calculate the angle in radians
  const angle = Math.atan2(dy, dx);

  return { x, y, angle };
};
