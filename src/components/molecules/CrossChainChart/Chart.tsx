import { ChainId, CrossChainActivity, CrossChainBy } from "@xlabs-libs/wormscan-sdk";
import { useCallback, useEffect, useRef, useState } from "react";
import { BlockchainIcon } from "src/components/atoms";
import { formatCurrency } from "src/utils/number";
import { useWindowSize } from "src/utils/hooks/useWindowSize";
import { useTranslation } from "react-i18next";
import { BREAKPOINTS } from "src/consts";

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
const MARGIN_SIZE = 2;

type Props = {
  data: CrossChainActivity;
  selectedType: CrossChainBy;
};

export const Chart = ({ data, selectedType }: Props) => {
  const filteredData = data.sort((a, b) => b.volume - a.volume).slice(0, 10);
  const [chartData] = useState(filteredData);

  const [selectedChain, setSelectedChain] = useState(chartData[0].chain);
  const [destinations, setDestinations] = useState([]);
  const [originChainsHeight, setOriginChainsHeight] = useState<IOriginChainsHeight[]>([]);
  const [destinyChainsHeight, setDestinyChainsHeight] = useState<IDestinyChainsHeight[]>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const originChainsRef = useRef<HTMLDivElement>(null);
  const destinyChainsRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  // DRAWING GRAPH FUNCTION
  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, frameCount: number) => {
      // selected blockchain
      let selectedIdx: number;
      const selected = originChainsHeight.find((item, idx) => {
        selectedIdx = idx;
        return !!item.selected;
      });

      // start point: the Y position from where to start the graphs (count previous items heights)
      const START_POINT = originChainsHeight.slice(0, selectedIdx).reduce(
        (prev, curr) => ({
          itemHeight: prev.itemHeight + curr.itemHeight + MARGIN_SIZE * 2,
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
        const END = END_POINTS[i] + i * MARGIN_SIZE * 2;

        ctx.moveTo(0, START);
        ctx.bezierCurveTo(CHART_SIZE / 2, START, CHART_SIZE / 2, END, CHART_SIZE, END);

        const excess = (selected.itemHeight * +destinyChainsHeight[i].percentage) / 100;
        const START2 = START + excess - MARGIN_SIZE * 2;
        counter += excess;

        const DESTINY_CHAIN_HEIGHT = destinyChainsHeight[i].itemHeight;
        const END2 = END + DESTINY_CHAIN_HEIGHT;

        ctx.lineTo(CHART_SIZE, END2);
        ctx.bezierCurveTo(CHART_SIZE / 2, END2, CHART_SIZE / 2, START2, 0, START2);
        ctx.lineTo(0, START);

        // painting graph
        let halfStop = frameCount <= 100 ? frameCount / 100 : 1 - (frameCount - 100) / 100;
        if (halfStop < 0.01) halfStop = 0.01;

        const grad = ctx.createLinearGradient(0, START, CHART_SIZE, END);
        grad.addColorStop(0, "rgb(49, 52, 124)");
        grad.addColorStop(halfStop, "rgb(44, 45, 116)");
        grad.addColorStop(1, "rgb(74, 34, 105)");

        ctx.strokeStyle = grad;
        ctx.fillStyle = grad;

        ctx.stroke();
        ctx.fill();
      }
    },
    [destinyChainsHeight, originChainsHeight],
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

  // chart graph creation effect, runs as an animation
  useEffect(() => {
    if (originChainsHeight.length && destinyChainsHeight.length) {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      // prevent pixelated canvas on high quality resolution devices
      canvas.width = CHART_SIZE * window.devicePixelRatio;
      canvas.height = CHART_SIZE * window.devicePixelRatio;
      context.scale(window.devicePixelRatio, window.devicePixelRatio);

      // run animated canvas
      let frameCount = 0;
      let animationFrameId: number;
      const render = () => {
        frameCount++;
        if (frameCount >= 599) frameCount = 0;
        draw(context, frameCount / 3);
        animationFrameId = window.requestAnimationFrame(render);
      };
      render();
      return () => {
        window.cancelAnimationFrame(animationFrameId);
      };
    }
  }, [originChainsHeight, destinyChainsHeight, draw]);

  useEffect(() => {
    const newDestinationChains = chartData
      .find(item => item.chain === selectedChain)
      .destinations.sort((a, b) => b.volume - a.volume)
      .slice(0, 10);

    setDestinations(newDestinationChains);
  }, [chartData, selectedChain]);

  const size = useWindowSize();
  const [isDesktop, setIsDesktop] = useState(size.width >= BREAKPOINTS.desktop);

  useEffect(() => {
    if (size.width >= 1024 && !isDesktop) setIsDesktop(true);
    else if (size.width < 1024 && isDesktop) setIsDesktop(false);
  }, [isDesktop, size]);

  // re-render canvas when destinations or isDesktop changes.
  useEffect(updateChainsHeight, [destinations, isDesktop]);

  return (
    <>
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
                marginTop: idx === 0 ? 0 : MARGIN_SIZE,
                marginBottom: MARGIN_SIZE,
              }}
            >
              <BlockchainIcon className="chain-icon" dark={true} size={24} chainId={item.chain} />
              <span className="chain-name">{ChainId[item.chain]}</span>
              <div className="chain-freespace" />
              <span className="chain-infoTxt percentage">{item.percentage.toFixed(2)}%</span>
              <span className="chain-separator onlyBig">|</span>
              <span className="chain-infoTxt onlyBig">
                {selectedType === "tx" ? item.volume : "$" + formatCurrency(+item.volume, 0)}
              </span>
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
                marginTop: idx === 0 ? 0 : MARGIN_SIZE,
                marginBottom: MARGIN_SIZE,
              }}
            >
              <BlockchainIcon className="chain-icon" dark={true} size={24} chainId={item.chain} />
              <span className="chain-name">{ChainId[item.chain] ?? "Unset"}</span>
              <div className="chain-freespace" />
              <span className="chain-infoTxt percentage">{item.percentage.toFixed(2)}%</span>
              <span className="chain-separator onlyBig">|</span>
              <span className="chain-infoTxt onlyBig">
                {selectedType === "tx" ? item.volume : "$" + formatCurrency(+item.volume, 0)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
