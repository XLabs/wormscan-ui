import { MutableRefObject, useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Network } from "@certusone/wormhole-sdk";
import { BREAKPOINTS } from "src/consts";
import { BlockchainIcon, Pagination } from "src/components/atoms";
import { WormholeBrand } from "src/components/molecules";
import { formatNumber } from "src/utils/number";
import { getChainName } from "src/utils/wormhole";
import { useWindowSize } from "src/utils/hooks/useWindowSize";
import { ChainId } from "src/api";
import { CrossChainActivity, CrossChainBy } from "src/api/guardian-network/types";
import { StickyInfo } from "./StickyInfo";
import { processData } from "./chartUtils";
import analytics from "src/analytics";

interface IChartChain {
  itemHeight: number;
  selected: boolean;
  percentage: string;
}

// CHART CONSTANTS
const CHART_SIZE = 650;
const MARGIN_SIZE_CANVAS = 2;

type Props = {
  currentNetwork: Network;
  data: CrossChainActivity;
  selectedType: CrossChainBy;
  selectedDestination: "sources" | "destinations";
  selectedTimeRange: string;
  prevChain: MutableRefObject<ChainId>;
};
export type Info = { percentage: number; volume: number };

const getAbbreviatedName = ({
  abbreviateIf = false,
  chainName,
}: {
  abbreviateIf: boolean;
  chainName: string;
}) => {
  if (abbreviateIf && chainName === "WH Gateway") {
    return "Gateway";
  }

  if (abbreviateIf) {
    const nameParts = chainName.split(" ");
    return nameParts.length > 1 ? nameParts[0] : chainName;
  }

  return chainName;
};

export const Chart = ({
  currentNetwork,
  data,
  selectedType,
  selectedDestination,
  selectedTimeRange,
  prevChain,
}: Props) => {
  const [isShowingOthers, setIsShowingOthers] = useState(false);
  const [chartData, setChartData] = useState(processData(data, false, selectedDestination));

  const [selectedChain, setSelectedChain] = useState(chartData[0]?.chain);
  if (!prevChain?.current) {
    prevChain.current = chartData[0]?.chain;
  }
  const [selectedInfo, setSelectedInfo] = useState<Info>({
    percentage: chartData[0]?.percentage,
    volume: chartData[0]?.volume,
  });

  useEffect(() => {
    const chainToSearch = prevChain?.current || selectedChain;

    let newChartData = processData(data, false, selectedDestination);
    if (newChartData.find(a => a.chain === chainToSearch)) {
      setIsShowingOthers(false);
    } else {
      setIsShowingOthers(true);
      newChartData = processData(data, true, selectedDestination);
    }

    if (selectedChain !== chainToSearch) {
      setSelectedChain(chainToSearch);
    }
    setChartData(newChartData);
  }, [data, prevChain, selectedChain, selectedDestination]);

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

  const isSourcesSelected = selectedDestination === "sources";

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

      if (isSourcesSelected) {
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
          const START = START_POINT + counter || 0;
          const END = END_POINTS[i] + i * MARGIN_SIZE_ELEMENTS * 2;

          ctx.moveTo(0, START);
          ctx.bezierCurveTo(CHART_SIZE / 2, START, CHART_SIZE / 2, END, CHART_SIZE, END);

          const excess = (selected?.itemHeight * +destinyChainsHeight[i]?.percentage) / 100;
          const START2 = START + excess - MARGIN_SIZE_CANVAS * 2;
          counter += excess;

          const DESTINY_CHAIN_HEIGHT = destinyChainsHeight[i].itemHeight;
          const END2 = END + DESTINY_CHAIN_HEIGHT;

          ctx.lineTo(CHART_SIZE, END2);
          ctx.bezierCurveTo(CHART_SIZE / 2, END2, CHART_SIZE / 2, START2, 0, START2);
          ctx.lineTo(0, START);

          // painting graph
          const grad = ctx.createLinearGradient(0, START, CHART_SIZE, END);

          grad.addColorStop(0, "rgb(56, 38, 71)");
          grad.addColorStop(0.6, "rgb(58,43,83)");
          grad.addColorStop(1, "rgb(63,56,124)");

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
          const START = START_POINT + counter || 0;
          const END = END_POINTS[i] + i * MARGIN_SIZE_ELEMENTS * 2;

          ctx.moveTo(CHART_SIZE, START);
          ctx.bezierCurveTo(CHART_SIZE / 2, START, CHART_SIZE / 2, END, 0, END);

          const excess = (selected?.itemHeight * +originChainsHeight[i]?.percentage) / 100;
          const START2 = START + excess - MARGIN_SIZE_CANVAS * 2;
          counter += excess;

          const DESTINY_CHAIN_HEIGHT = originChainsHeight[i].itemHeight;
          const END2 = END + DESTINY_CHAIN_HEIGHT;

          ctx.lineTo(0, END2);
          ctx.bezierCurveTo(CHART_SIZE / 2, END2, CHART_SIZE / 2, START2, CHART_SIZE, START2);
          ctx.lineTo(CHART_SIZE, START);

          // painting graph
          const grad = ctx.createLinearGradient(0, START, CHART_SIZE, END);

          grad.addColorStop(0, "rgb(63,56,124)");
          grad.addColorStop(0.4, "rgb(58,43,83)");
          grad.addColorStop(1, "rgb(56, 38, 71)");

          ctx.strokeStyle = grad;
          ctx.fillStyle = grad;

          ctx.stroke();
          ctx.fill();
        }
      }
    },
    [MARGIN_SIZE_ELEMENTS, destinyChainsHeight, isSourcesSelected, originChainsHeight],
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
      const context = canvas.getContext("2d", { willReadFrequently: true });

      canvas.width = Math.floor(CHART_SIZE * devicePixelRatio);
      canvas.height = Math.floor(CHART_SIZE * devicePixelRatio);
      context.scale(devicePixelRatio, devicePixelRatio);

      draw(context);
    }
  }, [destinyChainsHeight.length, devicePixelRatio, draw, originChainsHeight.length]);

  const scalingFactor = useRef(1);

  useEffect(() => {
    const selectedItem = chartData.find(item => item.chain === selectedChain);

    if (!selectedItem) {
      setSelectedChain(chartData[0]?.chain);
      prevChain.current = chartData[0]?.chain;
      return;
    }

    const newDestinationChains = chartData
      .find(item => item.chain === selectedChain)
      .destinations.sort((a, b) => b.volume - a.volume)
      .slice(0, 10);

    const sumOfFirstTen = newDestinationChains
      .map(a => a.percentage)
      .reduce((prev, curr) => prev + curr, 0);
    scalingFactor.current = 100 / sumOfFirstTen;

    const selected = chartData.find(a => a.chain === selectedChain);

    setDestinations(newDestinationChains);
    setSelectedInfo({
      percentage: selected.percentage,
      volume: selected.volume,
    });
  }, [chartData, prevChain, selectedChain]);

  useEffect(() => {
    if (size.width >= BREAKPOINTS.desktop && !isDesktop) setIsDesktop(true);
    else if (size.width < BREAKPOINTS.desktop && isDesktop) setIsDesktop(false);
  }, [isDesktop, size]);

  // re-render canvas when destinations or isDesktop changes.
  useEffect(updateChainsHeight, [destinations, isDesktop, selectedDestination]);

  const getAmount = useCallback(
    (vol: string | number) => (selectedType === "tx" ? vol : "$" + formatNumber(+vol, 0)),
    [selectedType],
  );

  const renderDestinations = useCallback(
    (item: any, idx: number) => (
      <div
        key={item.chain}
        className={`cross-chain-chart-side-item nonSelectable ${
          isSourcesSelected ? "right" : "left"
        }`}
        data-network={currentNetwork}
        data-percentage={item.percentage * scalingFactor.current}
        style={{
          height: (item.percentage * CHART_SIZE) / 100,
          marginTop: idx === 0 ? 0 : MARGIN_SIZE_ELEMENTS,
          marginBottom: MARGIN_SIZE_ELEMENTS,
        }}
      >
        <div className="volume-info" data-selected={true}>
          {getAmount(item.volume)}
        </div>

        <BlockchainIcon
          background="var(--color-black-25)"
          chainId={item.chain}
          className="chain-icon"
          colorless={true}
          network={currentNetwork}
          size={19}
        />

        <span className="chain-name" style={{ direction: "rtl" }}>
          {getAbbreviatedName({
            abbreviateIf: !isDesktop,
            chainName: getChainName({
              acronym: item.chain === ChainId.BSC,
              chainId: item.chain,
              network: currentNetwork,
            }),
          })}
        </span>
        {!isDesktop && <span className="mobile-separator">|</span>}
        <span className="percentage">{item.percentage.toFixed(2).replace("00.00", "00.0")}%</span>
        <span className="chain-separator onlyBig">|</span>
        <span className="chain-infoTxt onlyBig">{getAmount(item.volume)}</span>
      </div>
    ),
    [MARGIN_SIZE_ELEMENTS, getAmount, isDesktop, isSourcesSelected, currentNetwork],
  );

  const renderChartData = useCallback(
    (item: CrossChainActivity[0], idx: number) => (
      <div
        key={item.chain}
        className={`cross-chain-chart-side-item selectable ${isSourcesSelected ? "left" : "right"}`}
        onClick={() => {
          analytics.track("crossChainChart", {
            chain: getChainName({ chainId: item.chain, network: currentNetwork }),
            network: currentNetwork,
            selectedType,
            selected: selectedDestination,
            selectedTimeRange,
          });
          setSelectedChain(item.chain);
          prevChain.current = item.chain;
        }}
        data-network={currentNetwork}
        data-percentage={item.percentage}
        data-selected={selectedChain === item.chain}
        style={{
          height: (item.percentage * CHART_SIZE) / 100,
          marginTop: idx === 0 ? 0 : MARGIN_SIZE_ELEMENTS,
          marginBottom: MARGIN_SIZE_ELEMENTS,
        }}
      >
        <div className="volume-info" data-selected={selectedChain === item.chain}>
          {getAmount(item.volume)}
        </div>

        <BlockchainIcon
          background="var(--color-white-10)"
          chainId={item.chain}
          className="chain-icon"
          colorless={true}
          network={currentNetwork}
          size={19}
        />

        <span className="chain-name">
          {getAbbreviatedName({
            abbreviateIf: !isDesktop,
            chainName: getChainName({
              acronym: item.chain === ChainId.BSC,
              chainId: item.chain,
              network: currentNetwork,
            }),
          })}
        </span>
        {!isDesktop && <span className="mobile-separator">|</span>}
        <span className="percentage">{item.percentage.toFixed(2)}%</span>
        <span className="chain-separator onlyBig">|</span>
        <span className="chain-infoTxt onlyBig">{getAmount(item.volume)}</span>
      </div>
    ),
    [
      isSourcesSelected,
      currentNetwork,
      selectedChain,
      MARGIN_SIZE_ELEMENTS,
      getAmount,
      isDesktop,
      selectedType,
      selectedDestination,
      selectedTimeRange,
      prevChain,
    ],
  );

  return (
    <div className="cross-chain-relative">
      <div className="cross-chain-header-container title">
        <div>{t("home.crossChain.source").toUpperCase()}</div>
        <div>{t("home.crossChain.destination").toUpperCase()}</div>
      </div>
      <div className="cross-chain-chart">
        <WormholeBrand size="regular" />

        <div className="cross-chain-chart-side" data-network={currentNetwork} ref={originChainsRef}>
          {isSourcesSelected
            ? chartData.map(renderChartData)
            : destinations.map(renderDestinations)}
        </div>
        <canvas
          className="cross-chain-chart-graph"
          data-network={currentNetwork}
          ref={canvasRef}
          height={CHART_SIZE}
          width={CHART_SIZE}
        />
        <div
          className="cross-chain-chart-side"
          data-network={currentNetwork}
          ref={destinyChainsRef}
        >
          {isSourcesSelected
            ? destinations.map(renderDestinations)
            : chartData.map(renderChartData)}
        </div>
      </div>

      <Pagination
        className="cross-chain-relative-pagination"
        style={{ justifyContent: isSourcesSelected ? "flex-start" : "flex-end" }}
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
        chainName={getChainName({
          chainId: selectedChain,
          network: currentNetwork,
        })}
        currentNetwork={currentNetwork}
        destinations={destinations}
        selectedDestination={selectedDestination}
        selectedInfo={selectedInfo}
        selectedType={selectedType}
      />
    </div>
  );
};
