import { ChainId } from "src/api";
import { CrossChainActivity } from "src/api/guardian-network/types";
import { getChainName } from "src/utils/wormhole";

interface ChainEndpoints {
  [key: number]: { volume: string; destinations: any[]; chain: ChainId; percentage: number };
}

type AggregatedDestinations = {
  [key in ChainId]: {
    volume: number;
    percentage: number;
  };
};

const PERCENTAGE_THRESHOLD = 0.001;

export const processData = (
  initialData: CrossChainActivity,
  showOthers: boolean,
  selectedDestination: string,
) => {
  const data = initialData
    // .map(item => ({
    //   ...item,
    //   destinations: item.destinations.filter(dest => dest.percentage !== 0),
    // }))
    // TODO: when the endpoint works correctly, remove the following .map
    .map(item => {
      const aggregatedDestinations = item.destinations.reduce<AggregatedDestinations>(
        (acc, dest) => {
          if (!acc[dest.chain]) {
            acc[dest.chain] = { volume: 0, percentage: 0 };
          }
          acc[dest.chain].volume += +dest.volume;
          acc[dest.chain].percentage += dest.percentage;
          return acc;
        },
        {} as AggregatedDestinations,
      );

      const newDestinations = Object.keys(aggregatedDestinations).map(chain => {
        const chainId = +chain as ChainId;

        return {
          chain: chainId,
          volume: aggregatedDestinations[chainId].volume,
          percentage: aggregatedDestinations[chainId].percentage,
        };
      });

      return {
        ...item,
        destinations: newDestinations.filter(dest => dest.percentage !== 0),
      };
    })
    .filter(item => item.percentage > PERCENTAGE_THRESHOLD)
    .filter(item => getChainName({ chainId: item.chain, network: "MAINNET" }) !== "Unset");

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
          chain: dest.chain as ChainId,
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
      .filter(item => getChainName({ chainId: item.chain, network: "MAINNET" }) !== "Unset");

    return (showOthers ? newData.slice(10) : newData.slice(0, 10)) as CrossChainActivity;
  }
};
