import { MutableRefObject, useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Network, ChainId, chainToChainId } from "@wormhole-foundation/sdk";
import { BREAKPOINTS } from "src/consts";
import { BlockchainIcon, Pagination } from "src/components/atoms";
import { WormholeScanBrand } from "src/components/molecules";
import { formatNumber } from "src/utils/number";
import { getChainName } from "src/utils/wormhole";
import { useWindowSize } from "src/utils/hooks";
import { CrossChainActivity, CrossChainBy } from "src/api/guardian-network/types";
import { blendColors, processData } from "./chartUtils";
import analytics from "src/analytics";
import { InfoCircleIcon, MoneyIcon, PercentageIcon, SwapVerticalIcon } from "src/icons/generic";

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
  const [showPercentage, setShowPercentage] = useState(true);

  useEffect(() => {
    const chainToSearch = prevChain?.current || selectedChain;

    let newChartData = processData(data, false, selectedDestination);
    if (newChartData.find(a => a.chain === chainToSearch)) {
      setIsShowingOthers(false);
    } else {
      newChartData = processData(data, true, selectedDestination);
      if (newChartData.find(a => a.chain === chainToSearch)) {
        setIsShowingOthers(true);
      } else {
        return;
      }
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

  const { width } = useWindowSize();
  const isDesktop = width >= BREAKPOINTS.desktop;
  const isBigDesktop = width >= BREAKPOINTS.bigDesktop;

  const MARGIN_SIZE_ELEMENTS = isDesktop ? 0 : 2;
  const devicePixelRatio = window.devicePixelRatio * 2;

  const isSourcesSelected = selectedDestination === "sources";

  const handleGoPage = (pageNumber: number) => {
    if (pageNumber === 1) {
      setIsShowingOthers(false);
      setChartData(processData(data, false, selectedDestination));
    } else {
      setIsShowingOthers(true);
      setChartData(processData(data, true, selectedDestination));
    }
  };

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
          const END = END_POINTS[i] + (isDesktop ? 2 : i * MARGIN_SIZE_ELEMENTS * 2);

          ctx.moveTo(0, START);
          ctx.bezierCurveTo(CHART_SIZE / 2, START, CHART_SIZE / 2, END, CHART_SIZE, END);

          const excess = (selected?.itemHeight * +destinyChainsHeight[i]?.percentage) / 100;
          const START2 = START + excess - MARGIN_SIZE_CANVAS * 2;
          counter += excess;

          const DESTINY_CHAIN_HEIGHT = destinyChainsHeight[i].itemHeight;
          const END2 = END + DESTINY_CHAIN_HEIGHT - (isDesktop ? 4 : 0);

          ctx.lineTo(CHART_SIZE, END2);
          ctx.bezierCurveTo(
            CHART_SIZE / 2,
            END2,
            CHART_SIZE / 2,
            START2,
            0,
            START2 - START < 0 ? START : START2,
          );
          ctx.lineTo(0, START);

          // painting graph
          const grad = ctx.createLinearGradient(
            0,
            isDesktop ? 0 : START,
            CHART_SIZE,
            isDesktop ? 0 : END,
          );

          const opacity = 1 - i * 0.08;
          const blendedColor = blendColors(
            isBigDesktop ? "#c1bbf6" : "#bebbea",
            "#121212",
            opacity,
          );

          grad.addColorStop(0, isDesktop ? blendedColor : "#4d4a67");
          grad.addColorStop(1, isDesktop ? "#121212" : "#4d4a67");

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
          const END = END_POINTS[i] + (isDesktop ? 2 : i * MARGIN_SIZE_ELEMENTS * 2);

          ctx.moveTo(CHART_SIZE, START);
          ctx.bezierCurveTo(CHART_SIZE / 2, START, CHART_SIZE / 2, END, 0, END);

          const excess = (selected?.itemHeight * +originChainsHeight[i]?.percentage) / 100;
          const START2 = START + excess - MARGIN_SIZE_CANVAS * 2;
          counter += excess;

          const DESTINY_CHAIN_HEIGHT = originChainsHeight[i].itemHeight;
          const END2 = END + DESTINY_CHAIN_HEIGHT - (isDesktop ? 4 : 0);

          ctx.lineTo(0, END2);
          ctx.bezierCurveTo(
            CHART_SIZE / 2,
            END2,
            CHART_SIZE / 2,
            START2,
            CHART_SIZE,
            START2 - START < 0 ? START : START2,
          );
          ctx.lineTo(CHART_SIZE, START);

          // painting graph
          const grad = ctx.createLinearGradient(
            0,
            isDesktop ? 0 : START,
            CHART_SIZE,
            isDesktop ? 0 : END,
          );

          const opacity = 1 - i * 0.08;
          const blendedColor = blendColors(
            isBigDesktop ? "#c1bbf6" : "#bebbea",
            "#121212",
            opacity,
          );

          grad.addColorStop(0, isDesktop ? "#121212" : "#4d4a67");
          grad.addColorStop(1, isDesktop ? blendedColor : "#4d4a67");

          ctx.strokeStyle = grad;
          ctx.fillStyle = grad;

          ctx.stroke();
          ctx.fill();
        }
      }
    },
    [
      MARGIN_SIZE_ELEMENTS,
      destinyChainsHeight,
      isDesktop,
      isBigDesktop,
      isSourcesSelected,
      originChainsHeight,
    ],
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

    setDestinations(newDestinationChains);
  }, [chartData, prevChain, selectedChain]);

  // re-render canvas when destinations or isDesktop changes.
  useEffect(updateChainsHeight, [destinations, isDesktop, selectedDestination]);

  const getAmount = useCallback(
    (vol: string | number) => (selectedType === "tx" ? vol : "$" + formatNumber(+vol, 0)),
    [selectedType],
  );

  const renderDestinations = useCallback(
    (item: any, idx: number) => (
      <div
        key={`${item.chain}${idx}`}
        className={`cross-chain-chart-side-item nonSelectable ${
          isSourcesSelected ? "right" : "left"
        } ${!isDesktop ? (showPercentage ? "showPercentageMobile" : "showMoneyMobile") : ""}`}
        data-network={currentNetwork}
        data-percentage={item.percentage * scalingFactor.current}
        style={{
          height: (item.percentage * CHART_SIZE) / 100 + 50,
          marginTop: idx === 0 ? 0 : MARGIN_SIZE_ELEMENTS,
          marginBottom: MARGIN_SIZE_ELEMENTS,
        }}
      >
        <div className="volume-info" data-selected={true}>
          {getAmount(item.volume)}
        </div>

        <BlockchainIcon
          chainId={item.chain}
          className="chain-icon"
          network={currentNetwork}
          size={24}
        />

        <span className="chain-name" style={{ direction: "rtl" }}>
          {getAbbreviatedName({
            abbreviateIf: !isDesktop,
            chainName: getChainName({
              acronym: item.chain === chainToChainId("Bsc"),
              chainId: item.chain,
              network: currentNetwork,
            }),
          })}
        </span>
        {!isDesktop && <span className="mobile-separator">|</span>}
        <span className="volume">{getAmount(item.volume)}</span>
        <span className="percentage">{item.percentage.toFixed(2).replace("00.00", "00.0")}%</span>
      </div>
    ),
    [MARGIN_SIZE_ELEMENTS, currentNetwork, getAmount, isDesktop, isSourcesSelected, showPercentage],
  );

  const renderChartData = useCallback(
    (item: CrossChainActivity[0], idx: number) => (
      <div
        key={`${item.chain}${idx}`}
        className={`cross-chain-chart-side-item selectable ${
          isSourcesSelected ? "left" : "right"
        } ${!isDesktop ? (showPercentage ? "showPercentageMobile" : "showMoneyMobile") : ""}`}
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
          chainId={item.chain}
          className="chain-icon"
          network={currentNetwork}
          size={24}
        />

        <span className="chain-name">
          {getAbbreviatedName({
            abbreviateIf: !isDesktop,
            chainName: getChainName({
              acronym: item.chain === chainToChainId("Bsc"),
              chainId: item.chain,
              network: currentNetwork,
            }),
          })}
        </span>

        {!isDesktop && <span className="mobile-separator">|</span>}
        <span className="volume">{getAmount(item.volume)}</span>
        <span className="percentage">{item.percentage.toFixed(2)}%</span>
      </div>
    ),
    [
      MARGIN_SIZE_ELEMENTS,
      currentNetwork,
      getAmount,
      isDesktop,
      isSourcesSelected,
      prevChain,
      selectedChain,
      selectedDestination,
      selectedTimeRange,
      selectedType,
      showPercentage,
    ],
  );

  return (
    <>
      <div className="cross-chain-header-container title">
        <div className={isSourcesSelected ? "selected" : ""}>
          {t("home.crossChain.source").toUpperCase()}
        </div>
        <div className={isSourcesSelected ? "" : "selected"}>
          {t("home.crossChain.destination").toUpperCase()}
        </div>
      </div>
      <div className="cross-chain-chart">
        <WormholeScanBrand />

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

      <div
        className={`cross-chain-relative-pagination ${isSourcesSelected ? "" : "targetSelected"}`}
      >
        {data?.length > 10 && (
          <Pagination
            currentPage={isShowingOthers ? 2 : 1}
            visiblePages={2}
            goNextPage={() => {
              setIsShowingOthers(true);
              setChartData(processData(data, true, selectedDestination));
            }}
            goPage={handleGoPage}
            goPrevPage={() => {
              setIsShowingOthers(false);
              setChartData(processData(data, false, selectedDestination));
            }}
            disableNextButton={isShowingOthers}
          />
        )}

        <div className="cross-chain-relative-pagination-message">
          <InfoCircleIcon />

          {selectedDestination === "destinations" && (
            <div>{t("home.crossChain.bottomMessageDestinations")}</div>
          )}

          {selectedDestination === "sources" && (
            <div>{t("home.crossChain.bottomMessageSources")}</div>
          )}
        </div>

        <div className="cross-chain-relative-pagination-mobile">
          <button
            className={`cross-chain-relative-pagination-mobile-btn ${
              showPercentage ? "active" : ""
            }`}
            onClick={() => {
              setShowPercentage(true);
            }}
          >
            <PercentageIcon />
          </button>

          <button
            className={`cross-chain-relative-pagination-mobile-btn ${
              !showPercentage ? "active" : ""
            }`}
            onClick={() => {
              setShowPercentage(false);
            }}
          >
            {selectedType === "tx" ? <SwapVerticalIcon /> : <MoneyIcon />}
          </button>
        </div>
      </div>
    </>
  );
};
