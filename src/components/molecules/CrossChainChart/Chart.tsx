import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { BREAKPOINTS } from "src/consts";
import { BlockchainIcon, Pagination } from "src/components/atoms";
import { formatCurrency } from "src/utils/number";
import { useWindowSize } from "src/utils/hooks/useWindowSize";
import { CrossChainActivity, CrossChainBy } from "src/api/guardian-network/types";
import { StickyInfo } from "./StickyInfo";
import { getChainName, processData } from "./chartUtils";

interface IChartChain {
  itemHeight: number;
  selected: boolean;
  percentage: string;
}

// CHART CONSTANTS
const CHART_SIZE = 650;
const MARGIN_SIZE_CANVAS = 2;

type Props = {
  data: CrossChainActivity;
  selectedType: CrossChainBy;
  selectedDestination: "sources" | "destinations";
};
export type Info = { percentage: number; volume: number };

export const Chart = ({ data, selectedType, selectedDestination }: Props) => {
  const [isShowingOthers, setIsShowingOthers] = useState(false);
  const [chartData, setChartData] = useState(processData(data, false, selectedDestination));

  const [selectedChain, setSelectedChain] = useState(chartData[0].chain);
  const [selectedInfo, setSelectedInfo] = useState<Info>({
    percentage: chartData[0].percentage,
    volume: chartData[0].volume,
  });

  useEffect(() => {
    let newChartData = processData(data, false, selectedDestination);
    if (newChartData.find(a => a.chain === selectedChain)) {
      setIsShowingOthers(false);
    } else {
      setIsShowingOthers(true);
      newChartData = processData(data, true, selectedDestination);
    }

    setChartData(newChartData);
  }, [data, selectedChain, selectedDestination]);

  const [destinations, setDestinations] = useState([]);
  const [originChainsHeight, setOriginChainsHeight] = useState<IChartChain[]>([]);
  const [destinyChainsHeight, setDestinyChainsHeight] = useState<IChartChain[]>([]);

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
      const selected =
        originChainsHeight.find((item, idx) => {
          selectedIdx = idx;
          return !!item.selected;
        }) ||
        destinyChainsHeight.find((item, idx) => {
          selectedIdx = idx;
          return !!item.selected;
        });

      if (selectedDestination === "sources") {
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
          ctx.beginPath();

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
          grad.addColorStop(0.4, "rgb(44, 45, 116)");
          grad.addColorStop(1, "rgb(74, 34, 105)");

          ctx.strokeStyle = grad;
          ctx.fillStyle = grad;

          ctx.stroke();
          ctx.fill();
        }
      } else {
        // start point: the Y position from where to start the graphs (count previous items heights)
        const START_POINT = destinyChainsHeight.slice(0, selectedIdx).reduce(
          (prev, curr) => ({
            itemHeight: prev.itemHeight + curr.itemHeight + MARGIN_SIZE_ELEMENTS * 2,
          }),
          { itemHeight: 0 },
        ).itemHeight;

        // end points: the Y position where to go for each graph (count previous items heights)
        const END_POINTS: number[] = [];
        let counter = 0;
        originChainsHeight.forEach(item => {
          END_POINTS.push(counter);
          counter += item.itemHeight;
        });

        // empty the canvas
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.beginPath();

        counter = 0;
        // we have top 10 blockchains so we need 10 graphs
        for (let i = 0; i < Math.min(10, originChainsHeight.length); i++) {
          ctx.beginPath();

          // drawing graph
          const START = START_POINT + counter;
          const END = END_POINTS[i] + i * MARGIN_SIZE_ELEMENTS * 2;

          ctx.moveTo(CHART_SIZE, START);
          ctx.bezierCurveTo(CHART_SIZE / 2, START, CHART_SIZE / 2, END, 0, END);

          const excess = (selected.itemHeight * +originChainsHeight[i].percentage) / 100;
          const START2 = START + excess - MARGIN_SIZE_CANVAS * 2;
          counter += excess;

          const DESTINY_CHAIN_HEIGHT = originChainsHeight[i].itemHeight;
          const END2 = END + DESTINY_CHAIN_HEIGHT;

          ctx.lineTo(0, END2);
          ctx.bezierCurveTo(CHART_SIZE / 2, END2, CHART_SIZE / 2, START2, CHART_SIZE, START2);
          ctx.lineTo(CHART_SIZE, START);

          // painting graph
          const grad = ctx.createLinearGradient(0, START, CHART_SIZE, END);

          grad.addColorStop(0, "rgb(74, 34, 105)");
          grad.addColorStop(0.6, "rgb(44, 45, 116)");
          grad.addColorStop(1, "rgb(49, 52, 124)");

          ctx.strokeStyle = grad;
          ctx.fillStyle = grad;

          ctx.stroke();
          ctx.fill();
        }
      }
    },
    [MARGIN_SIZE_ELEMENTS, destinyChainsHeight, originChainsHeight, selectedDestination],
  );

  // update arrays containing height of items on both sides of the graphics
  const updateChainsHeight = () => {
    setOriginChainsHeight(
      Array.from(originChainsRef.current.children).map(item => ({
        itemHeight: item.getBoundingClientRect().height,
        percentage: item.getAttribute("data-percentage"),
        selected: item.getAttribute("data-selected") === "true",
      })),
    );
    setDestinyChainsHeight(
      Array.from(destinyChainsRef.current.children).map(item => ({
        itemHeight: item.getBoundingClientRect().height,
        percentage: item.getAttribute("data-percentage"),
        selected: item.getAttribute("data-selected") === "true",
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
    const selectedItem = chartData.find(item => item.chain === selectedChain);

    if (!selectedItem) {
      setSelectedChain(chartData[0].chain);
      return;
    }

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
    if (size.width >= BREAKPOINTS.desktop && !isDesktop) setIsDesktop(true);
    else if (size.width < BREAKPOINTS.desktop && isDesktop) setIsDesktop(false);
  }, [isDesktop, size]);

  // re-render canvas when destinations or isDesktop changes.
  useEffect(updateChainsHeight, [destinations, isDesktop, selectedDestination]);

  const getAmount = useCallback(
    (vol: string | number) => (selectedType === "tx" ? vol : "$" + formatCurrency(+vol, 0)),
    [selectedType],
  );

  const renderDestinations = useCallback(
    (item: any, idx: number) => (
      <div
        key={item.chain}
        className={`cross-chain-chart-side-item nonSelectable ${
          selectedDestination === "sources" ? "right" : "left"
        }`}
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
        <span className="chain-infoTxt percentage">
          {item.percentage.toFixed(2).replace("00.00", "00.0")}%
        </span>
        <span className="chain-separator onlyBig">|</span>
        <span className="chain-infoTxt onlyBig">{getAmount(item.volume)}</span>
      </div>
    ),
    [MARGIN_SIZE_ELEMENTS, getAmount, isDesktop, selectedDestination],
  );

  const renderChartData = useCallback(
    (item: CrossChainActivity[0], idx: number) => (
      <div
        key={item.chain}
        className={`cross-chain-chart-side-item selectable ${
          selectedDestination === "sources" ? "left" : "right"
        }`}
        onClick={() => setSelectedChain(item.chain)}
        data-percentage={item.percentage}
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
    ),
    [MARGIN_SIZE_ELEMENTS, getAmount, isDesktop, selectedChain, selectedDestination],
  );

  return (
    <div className="cross-chain-relative">
      <div className="cross-chain-header-container title">
        <div>{t("home.crossChain.source").toUpperCase()}</div>
        <div>{t("home.crossChain.destination").toUpperCase()}</div>
      </div>
      <div className="cross-chain-chart">
        <div className="cross-chain-chart-side" ref={originChainsRef}>
          {selectedDestination === "sources"
            ? chartData.map(renderChartData)
            : destinations.map(renderDestinations)}
        </div>
        <canvas
          className="cross-chain-chart-graph"
          ref={canvasRef}
          height={CHART_SIZE}
          width={CHART_SIZE}
        />
        <div className="cross-chain-chart-side" ref={destinyChainsRef}>
          {selectedDestination === "sources"
            ? destinations.map(renderDestinations)
            : chartData.map(renderChartData)}
        </div>
      </div>

      <Pagination
        className="cross-chain-relative-pagination"
        style={{ justifyContent: selectedDestination === "sources" ? "flex-start" : "flex-end" }}
        currentPage={isShowingOthers ? 2 : 1}
        goNextPage={() => {
          setIsShowingOthers(true);
          setChartData(processData(data, true, selectedDestination));
        }}
        goPrevPage={() => {
          setIsShowingOthers(false);
          setChartData(processData(data, false, selectedDestination));
        }}
        disableNextButton={isShowingOthers}
      />

      <StickyInfo
        chainName={getChainName(selectedChain)}
        selectedInfo={selectedInfo}
        selectedType={selectedType}
        destinations={destinations}
        selectedDestination={selectedDestination}
      />
    </div>
  );
};
