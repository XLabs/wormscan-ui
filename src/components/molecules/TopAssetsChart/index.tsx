import { useEffect, useRef, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { useTranslation } from "react-i18next";
import { useEnvironment } from "src/context/EnvironmentContext";
import { BREAKPOINTS } from "src/consts";
import { BlockchainIcon } from "src/components/atoms";
import { WormholeBrand } from "src/components/molecules";
import { formatterYAxis } from "src/utils/apexChartUtils";
import { AssetsByVolumeTransformed } from "src/api/guardian-network/types";
import NoColorlessIcon from "src/icons/blockchains/colorless/noIcon.svg";
import "./styles.scss";

type Props = {
  rowSelected: number;
  top7AssetsData: AssetsByVolumeTransformed[];
  width: number;
};

const TopAssetsChart = ({ rowSelected, top7AssetsData, width }: Props) => {
  const { t } = useTranslation();
  const [XPositionLabels, setXPositionLabels] = useState([]);
  const { environment } = useEnvironment();
  const chartDomRef = useRef(null);
  const currentNetwork = environment.network;
  const assetsDataForChart = top7AssetsData?.[rowSelected]?.tokens;
  const isMobile = width < BREAKPOINTS.tablet;
  const isTabletOrMobile = width < BREAKPOINTS.desktop;
  const isDesktop = width >= BREAKPOINTS.desktop && width < BREAKPOINTS.bigDesktop;

  useEffect(() => {
    const getLabelsPos = () => {
      const labels = chartDomRef?.current?.querySelectorAll(".apexcharts-xaxis-label");

      const itemsPosition: { x: number; y: number }[] = [];

      labels?.forEach((label: any) => {
        const x = Number(label?.getAttribute("x")) || 0;
        let y = Number(label?.getAttribute("y")) || 0;
        const height = label?.querySelector("tspan").getBoundingClientRect().height;

        if (height <= 18) {
          y -= 6;
        }

        itemsPosition.push({ x, y });
      });

      setXPositionLabels(itemsPosition);
    };

    getLabelsPos();
    const timer = setTimeout(getLabelsPos, 200);

    return () => clearTimeout(timer);
  }, [assetsDataForChart, rowSelected, width]);

  if (!assetsDataForChart?.length) {
    return null;
  }

  return (
    <div className="chart-container" ref={chartDomRef}>
      <WormholeBrand />

      <div>
        {XPositionLabels?.map(({ y, x }, i) => (
          <div
            key={i}
            className="chart-container-chain-icon"
            style={{
              position: "absolute",
              top: isMobile
                ? Number(y) + 60
                : isTabletOrMobile
                ? Number(y) + 68
                : isDesktop
                ? Number(y) + 68
                : Number(y) + 68,
              left: isMobile
                ? Number(x) + 6
                : isTabletOrMobile
                ? Number(x) + 4
                : isDesktop
                ? Number(x) + 3
                : Number(x) + 1.5,
              zIndex: 10,
              pointerEvents: "none",
            }}
          >
            <BlockchainIcon
              background="var(--color-black-25)"
              chainId={assetsDataForChart?.[i]?.emitter_chain}
              colorless={true}
              network={currentNetwork}
              size={24}
            />
          </div>
        ))}
      </div>

      <ReactApexChart
        type="bar"
        height={isTabletOrMobile ? "390px" : "600px"}
        width="100%"
        series={[
          {
            name: "Volume",
            data: assetsDataForChart.map(({ volume }) => volume),
          },
        ]}
        options={{
          title: {
            text: t("home.topAssets.chartTitle") + " " + top7AssetsData?.[rowSelected]?.symbol,
            align: "left",
            margin: isTabletOrMobile ? 49 : 0,
            offsetX: 0,
            offsetY: isTabletOrMobile ? 0 : 19,
            style: {
              color: "var(--color-gray-400)",
              fontFamily: "Roboto",
              fontSize: "14px",
              fontWeight: 400,
            },
          },
          states: {
            hover: {
              filter: {
                type: "none",
              },
            },
            active: {
              filter: {
                type: "none",
              },
            },
          },
          fill: {
            type: "solid",
            colors: ["var(--color-primary-100)"],
          },
          labels: assetsDataForChart.map(({ chainName }) => chainName),
          chart: {
            animations: {
              enabled: !isTabletOrMobile,
              dynamicAnimation: {
                enabled: true,
              },
              speed: 0,
              easing: "easeinout",
              animateGradually: {
                enabled: true,
                delay: 0,
              },
            },
            zoom: { enabled: false },
            toolbar: { show: false },
          },
          grid: {
            show: true,
            borderColor: "var(--color-gray-900)",
            strokeDashArray: 5,
            padding: {
              top: isTabletOrMobile ? -24 : 32,
              right: 4,
            },
          },
          tooltip: {
            intersect: false,
            shared: true,
            fixed: {
              enabled: false,
              position: "topRight",
              offsetX: 0,
              offsetY: 0,
            },
            followCursor: true,
            onDatasetHover: {
              highlightDataSeries: true,
            },
            x: {
              show: false,
            },
            y: {
              formatter: val => String(val),
            },
            custom: function ({ series, seriesIndex, dataPointIndex, w }) {
              const chainName = assetsDataForChart?.[dataPointIndex]?.chainName;
              const txsFormatted = assetsDataForChart?.[dataPointIndex]?.txsFormatted;
              const volumeFormatted = assetsDataForChart?.[dataPointIndex]?.volumeFormatted;
              const chainImageSrc = assetsDataForChart?.[dataPointIndex]?.chainImageSrc;

              return (
                "<div class='chart-container-tooltip'>" +
                `
                      <div>
                        <img class='chart-container-tooltip-img'' src=${
                          chainImageSrc || NoColorlessIcon
                        } alt="${chainName} icon" />
                        <span class='chart-container-tooltip-chain'>${chainName}</span>
                      </div>
                      ` +
                `
                      <div>
                        <span class='chart-container-tooltip-label'>Volume:</span>
                        <span class='chart-container-tooltip-volume'>$${volumeFormatted}</span>
                      </div>
                      ` +
                `
                      <div>
                        <span class='chart-container-tooltip-label'>TXS:</span>
                        <span class='chart-container-tooltip-txs'>${txsFormatted}</span>
                      </div>
                      ` +
                "</div>"
              );
            },
          },
          dataLabels: { enabled: false },
          yaxis: {
            tickAmount: 8,
            opposite: true,
            axisTicks: { show: false },
            labels: {
              formatter: (vol, opts) => `$${formatterYAxis(vol, opts)}`,
              minWidth: isMobile ? 48 : 64,
              maxWidth: isMobile ? 48 : 64,
              align: "left",
              style: {
                colors: "var(--color-gray-400)",
                fontFamily: "Roboto",
                fontSize: isMobile ? "10px" : "14px",
              },
            },
            axisBorder: {
              show: false,
            },
          },
          xaxis: {
            tickAmount: assetsDataForChart.length,
            labels: {
              style: {
                colors: "var(--color-gray-400)",
                fontFamily: "Roboto",
                fontSize: isMobile ? "10px" : "14px",
                cssClass: "chart-container-xaxis-label",
              },
              trim: false,
              rotate: 45,
              maxHeight: isMobile ? 56 : 88,
              minHeight: isMobile ? 56 : 88,
            },
            axisTicks: { show: false },
            axisBorder: {
              show: false,
            },
            crosshairs: {
              show: true,
            },
          },
        }}
      />
    </div>
  );
};

export default TopAssetsChart;
