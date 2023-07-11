import { ChainId, CrossChainActivity, CrossChainBy } from "@xlabs-libs/wormscan-sdk";
import { useCallback, useEffect, useRef, useState } from "react";
import { BlockchainIcon } from "src/components/atoms";
import { formatCurrency } from "src/utils/number";
import { useWindowSize } from "src/utils/hooks/useWindowSize";
import { useTranslation } from "react-i18next";
import { BREAKPOINTS } from "src/consts";
import { StickyInfo } from "./StickyInfo";

interface IOriginChainsHeight {
  itemHeight: number;
  selected: boolean;
}
interface IDestinyChainsHeight {
  itemHeight: number;
  percentage: string;
}

// CHART CONSTANTS
const CHART_SIZE = 650;
const MARGIN_SIZE_CANVAS = 2;

type Props = {
  data: CrossChainActivity;
  selectedType: CrossChainBy;
};
export type Info = { percentage: number; volume: number };

export const Chart = ({ data, selectedType }: Props) => {
  const filteredData = processData(data);
  const [chartData] = useState(filteredData);

  const [selectedChain, setSelectedChain] = useState(chartData[0].chain);
  const [selectedInfo, setSelectedInfo] = useState<Info>({
    percentage: chartData[0].percentage,
    volume: chartData[0].volume,
  });
  const [destinations, setDestinations] = useState([]);
  const [originChainsHeight, setOriginChainsHeight] = useState<IOriginChainsHeight[]>([]);
  const [destinyChainsHeight, setDestinyChainsHeight] = useState<IDestinyChainsHeight[]>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const originChainsRef = useRef<HTMLDivElement>(null);
  const destinyChainsRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  const size = useWindowSize();
  const [isDesktop, setIsDesktop] = useState(size.width >= BREAKPOINTS.desktop);

  const MARGIN_SIZE_ELEMENTS = isDesktop ? 2 : 4;
  const devicePixelRatio = window.devicePixelRatio * 2;

  // DRAWING GRAPH FUNCTION
  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      // selected blockchain
      let selectedIdx: number;
      const selected = originChainsHeight.find((item, idx) => {
        selectedIdx = idx;
        return !!item.selected;
      });

      // start point: the Y position from where to start the graphs (count previous items heights)
      const START_POINT = originChainsHeight.slice(0, selectedIdx).reduce(
        (prev, curr) => ({
          itemHeight: prev.itemHeight + curr.itemHeight + MARGIN_SIZE_ELEMENTS * 2,
        }),
        { itemHeight: 0 },
      ).itemHeight;

      // end points: the Y position where to go for each graph (count previous items heights)
      const END_POINTS: number[] = [];
      let counter = 0;
      destinyChainsHeight.forEach(item => {
        END_POINTS.push(counter);
        counter += item.itemHeight;
      });

      // empty the canvas
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.beginPath();

      counter = 0;
      // we have top 10 blockchains so we need 10 graphs
      for (let i = 0; i < Math.min(10, destinyChainsHeight.length); i++) {
        // drawing graph
        const START = START_POINT + counter;
        const END = END_POINTS[i] + i * MARGIN_SIZE_ELEMENTS * 2;

        ctx.moveTo(0, START);
        ctx.bezierCurveTo(CHART_SIZE / 2, START, CHART_SIZE / 2, END, CHART_SIZE, END);

        const excess = (selected.itemHeight * +destinyChainsHeight[i].percentage) / 100;
        const START2 = START + excess - MARGIN_SIZE_CANVAS * 2;
        counter += excess;

        const DESTINY_CHAIN_HEIGHT = destinyChainsHeight[i].itemHeight;
        const END2 = END + DESTINY_CHAIN_HEIGHT;

        ctx.lineTo(CHART_SIZE, END2);
        ctx.bezierCurveTo(CHART_SIZE / 2, END2, CHART_SIZE / 2, START2, 0, START2);
        ctx.lineTo(0, START);

        // painting graph
        const grad = ctx.createLinearGradient(0, START, CHART_SIZE, END);
        grad.addColorStop(0, "rgb(49, 52, 124)");
        grad.addColorStop(0.2, "rgb(44, 45, 116)");
        grad.addColorStop(1, "rgb(74, 34, 105)");

        ctx.strokeStyle = grad;
        ctx.fillStyle = grad;

        ctx.stroke();
        ctx.fill();
      }
    },
    [MARGIN_SIZE_ELEMENTS, destinyChainsHeight, originChainsHeight],
  );

  // update arrays containing height of items on both sides of the graphics
  const updateChainsHeight = () => {
    setOriginChainsHeight(
      Array.from(originChainsRef.current.children).map(item => ({
        itemHeight: item.getBoundingClientRect().height,
        selected: item.getAttribute("data-selected") === "true",
      })),
    );
    setDestinyChainsHeight(
      Array.from(destinyChainsRef.current.children).map(item => ({
        itemHeight: item.getBoundingClientRect().height,
        percentage: item.getAttribute("data-percentage"),
      })),
    );
  };

  // chart graph creation effect
  useEffect(() => {
    if (originChainsHeight.length && destinyChainsHeight.length) {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      canvas.width = Math.floor(CHART_SIZE * devicePixelRatio);
      canvas.height = Math.floor(CHART_SIZE * devicePixelRatio);
      context.scale(devicePixelRatio, devicePixelRatio);

      draw(context);
    }
  }, [destinyChainsHeight.length, devicePixelRatio, draw, originChainsHeight.length]);

  useEffect(() => {
    const newDestinationChains = chartData
      .find(item => item.chain === selectedChain)
      .destinations.sort((a, b) => b.volume - a.volume)
      .slice(0, 10);
    const selected = chartData.find(a => a.chain === selectedChain);

    setDestinations(newDestinationChains);
    setSelectedInfo({
      percentage: selected.percentage,
      volume: selected.volume,
    });
  }, [chartData, selectedChain]);

  useEffect(() => {
    if (size.width >= 1024 && !isDesktop) setIsDesktop(true);
    else if (size.width < 1024 && isDesktop) setIsDesktop(false);
  }, [isDesktop, size]);

  // re-render canvas when destinations or isDesktop changes.
  useEffect(updateChainsHeight, [destinations, isDesktop]);

  const getAmount = (vol: string | number) =>
    selectedType === "tx" ? vol : "$" + formatCurrency(+vol, 0);

  return (
    <div className="cross-chain-relative">
      <div className="cross-chain-header-container cross-chain-header-title">
        <div>{t("home.crossChain.source")}</div>
        <div>{t("home.crossChain.destination")}</div>
      </div>
      <div className="cross-chain-chart">
        <div className="cross-chain-chart-side" ref={originChainsRef}>
          {chartData.map((item, idx) => (
            <div
              key={item.chain}
              className="cross-chain-chart-side-item left"
              onClick={() => setSelectedChain(item.chain)}
              data-selected={selectedChain === item.chain}
              style={{
                height: (item.percentage * CHART_SIZE) / 100,
                marginTop: idx === 0 ? 0 : MARGIN_SIZE_ELEMENTS,
                marginBottom: MARGIN_SIZE_ELEMENTS,
              }}
            >
              <div data-selected={selectedChain === item.chain} className="volume-info">
                {getAmount(item.volume)}
              </div>
              <BlockchainIcon className="chain-icon" dark={true} size={19} chainId={item.chain} />
              <span className="chain-name">{getChainName(item.chain)}</span>
              {!isDesktop && <span className="mobile-separator">|</span>}
              <span className="chain-infoTxt percentage">{item.percentage.toFixed(2)}%</span>
              <span className="chain-separator onlyBig">|</span>
              <span className="chain-infoTxt onlyBig">{getAmount(item.volume)}</span>
            </div>
          ))}
        </div>
        <canvas
          className="cross-chain-chart-graph"
          ref={canvasRef}
          height={CHART_SIZE}
          width={CHART_SIZE}
        />
        <div className="cross-chain-chart-side" ref={destinyChainsRef}>
          {destinations.map((item, idx) => (
            <div
              key={item.chain}
              className="cross-chain-chart-side-item right"
              data-percentage={item.percentage}
              style={{
                height: (item.percentage * CHART_SIZE) / 100,
                marginTop: idx === 0 ? 0 : MARGIN_SIZE_ELEMENTS,
                marginBottom: MARGIN_SIZE_ELEMENTS,
              }}
            >
              <div data-selected={true} className="volume-info">
                {getAmount(item.volume)}
              </div>
              <BlockchainIcon className="chain-icon" dark={true} size={19} chainId={item.chain} />
              <span className="chain-name">{getChainName(item.chain)}</span>
              {!isDesktop && <span className="mobile-separator">|</span>}
              <span className="chain-infoTxt percentage">{item.percentage.toFixed(2)}%</span>
              <span className="chain-separator onlyBig">|</span>
              <span className="chain-infoTxt onlyBig">{getAmount(item.volume)}</span>
            </div>
          ))}
        </div>
      </div>

      <StickyInfo
        chainName={getChainName(selectedChain)}
        selectedInfo={selectedInfo}
        selectedType={selectedType}
        destinations={destinations}
      />
    </div>
  );
};

const OTHERS_FAKE_CHAIN_ID = 123123123 as ChainId;
const getChainName = (id: ChainId) => {
  if (id === OTHERS_FAKE_CHAIN_ID) return "Others";
  return ChainId[id] ?? "Unset";
};

const processData = (data: CrossChainActivity) => {
  const newData = data.sort((a, b) => b.percentage - a.percentage);

  // if more than 10 elements, create "Others" section
  if (newData.length > 10) {
    let percentage = 0;
    let volume = 0;
    const destinations: any = {};

    newData.slice(10).forEach(item => {
      // sum the percentage and volume of every other chain
      percentage += item.percentage;
      volume += +item.volume;

      // create an object that sums the volume for the same destiny chain
      item.destinations.forEach(destination => {
        destinations[destination.chain] = {
          volume: (destinations[destination.chain]?.volume ?? 0) + Number(destination.volume),
        };
      });
    });

    // transform the object with destination volumes summed up into an array of chains
    let newDestinations = [];
    for (const [chain, value] of Object.entries(destinations) as any) {
      newDestinations.push({
        chain,
        volume: value.volume,
      });
    }

    // add percentages to that array of destination chains
    let totalVolume = 0;
    newDestinations.forEach(dest => {
      totalVolume += dest.volume;
    });
    newDestinations = newDestinations.map(dest => ({
      chain: dest.chain,
      volume: dest.volume,
      percentage: (dest.volume / totalVolume) * 100,
    }));

    // sort the array and use only the first 10 elements
    newDestinations = newDestinations.sort((a: any, b: any) => b.volume - a.volume).slice(0, 10);
    newData[9] = { chain: OTHERS_FAKE_CHAIN_ID, percentage, volume, destinations: newDestinations };
  }

  return newData.slice(0, 10);
};
