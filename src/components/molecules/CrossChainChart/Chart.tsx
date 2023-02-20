import { ChainId, CrossChainActivity } from "@xlabs-libs/wormscan-sdk";
import { useEffect, useRef, useState } from "react";

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

type Props = { data: CrossChainActivity };

export const Chart = ({ data }: Props) => {
  const filteredData = data.sort((a, b) => b["num-txs"] - a["num-txs"]).slice(0, 10);
  const [chartData] = useState(filteredData);

  const [selectedChain, setSelectedChain] = useState(chartData[0].chainId);
  const [destinations, setDestinations] = useState([]);
  const [originChainsHeight, setOriginChainsHeight] = useState<IOriginChainsHeight[]>([]);
  const [destinyChainsHeight, setDestinyChainsHeight] = useState<IDestinyChainsHeight[]>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const originChainsRef = useRef<HTMLDivElement>(null);
  const destinyChainsRef = useRef<HTMLDivElement>(null);

  // DRAWING GRAPH FUNCTION
  const draw = (ctx: CanvasRenderingContext2D, frameCount: number) => {
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
    for (let i = 0; i < 10; i++) {
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
      grad.addColorStop(0, "rgb(44,51,110)");
      grad.addColorStop(halfStop, "rgb(54,51,110)");
      grad.addColorStop(1, "rgb(69,51,110)");

      ctx.strokeStyle = grad;
      ctx.fillStyle = grad;

      ctx.stroke();
      ctx.fill();
    }
  };

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

  useEffect(() => {
    updateChainsHeight();
  }, [destinations]);

  // chart graph creation effect, runs an animation
  useEffect(() => {
    if (originChainsHeight.length && destinyChainsHeight.length) {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

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
  }, [originChainsHeight, destinyChainsHeight]);

  useEffect(() => {
    const newDestinationChains = chartData
      .find(item => item.chainId === selectedChain)
      .destination.sort((a, b) => b["num-txs"] - a["num-txs"])
      .slice(0, 10);

    setDestinations(newDestinationChains);
  }, [selectedChain]);

  return (
    <div className="cross-chain-chart">
      <div className="cross-chain-chart-side" ref={originChainsRef}>
        {chartData.map((item, idx) => (
          <div
            key={item.chainId}
            className="cross-chain-chart-side-item left"
            onClick={() => setSelectedChain(item.chainId)}
            data-selected={selectedChain === item.chainId}
            style={{
              height: (item.percentage * CHART_SIZE) / 100,
              marginTop: idx === 0 ? 0 : MARGIN_SIZE,
              marginBottom: MARGIN_SIZE,
            }}
          >
            <span>{ChainId[item.chainId]}</span>
            <span>({item.percentage.toFixed(2)}%)</span>
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
            key={item.chainId}
            className="cross-chain-chart-side-item right"
            data-percentage={item.percentage}
            style={{
              height: (item.percentage * CHART_SIZE) / 100,
              marginTop: idx === 0 ? 0 : MARGIN_SIZE,
              marginBottom: MARGIN_SIZE,
            }}
          >
            <span>{ChainId[item.chainId]}</span>
            <span>({item.percentage.toFixed(2)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
};
