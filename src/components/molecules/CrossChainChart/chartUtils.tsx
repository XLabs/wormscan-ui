import { ChainId } from "@wormhole-foundation/sdk";
import { CrossChainActivity } from "src/api/guardian-network/types";
import { getChainName } from "src/utils/wormhole";

interface ChainEndpoints {
  [key: number]: { volume: string; destinations: any[]; chain: ChainId; percentage: number };
}

const PERCENTAGE_THRESHOLD = 0.001;

export const processData = (
  initialData: CrossChainActivity,
  showOthers: boolean,
  selectedDestination: string,
) => {
  const data = initialData
    .map(item => ({
      ...item,
      destinations: item.destinations.filter(dest => dest.percentage !== 0),
    }))
    .filter(item => item.percentage > PERCENTAGE_THRESHOLD)
    .filter(item => getChainName({ chainId: item.chain, network: "Mainnet" }) !== "Unset");

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
    const newData = [...finalInvertedData]
      .sort((a, b) => +b.volume - +a.volume)
      .filter(a => a.percentage > PERCENTAGE_THRESHOLD)
      .filter(item => getChainName({ chainId: item.chain, network: "Mainnet" }) !== "Unset");

    return (showOthers ? newData.slice(10) : newData.slice(0, 10)) as CrossChainActivity;
  }
};

export const blendColors = (color1: string, color2: string, percentage: number) => {
  const f = parseInt(color1.slice(1), 16);
  const t = parseInt(color2.slice(1), 16);
  const R1 = f >> 16;
  const G1 = (f >> 8) & 0x00ff;
  const B1 = f & 0x0000ff;
  const R2 = t >> 16;
  const G2 = (t >> 8) & 0x00ff;
  const B2 = t & 0x0000ff;
  const R = Math.round(R2 + (R1 - R2) * percentage)
    .toString(16)
    .padStart(2, "0");
  const G = Math.round(G2 + (G1 - G2) * percentage)
    .toString(16)
    .padStart(2, "0");
  const B = Math.round(B2 + (B1 - B2) * percentage)
    .toString(16)
    .padStart(2, "0");
  return `#${R}${G}${B}`;
};
