import { useEffect, useRef, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { useTranslation } from "react-i18next";
import { useEnvironment } from "src/context/EnvironmentContext";
import { BREAKPOINTS } from "src/consts";
import { BlockchainIcon } from "src/components/atoms";
import { WormholeBrand } from "src/components/molecules";
import { numberToSuffix } from "src/utils/number";
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
    const updateLabels = () => {
      const labels = chartDomRef?.current?.querySelectorAll(".apexcharts-xaxis-label");

      const itemsPosition = [{ x: 0, y: 0 }];

      labels?.forEach((label: any) => {
        const x = Number(label?.getAttribute("x")) || 0;
        let y = Number(label?.getAttribute("y")) || 0;
        const height = label?.querySelector("tspan").getBoundingClientRect().height;

        if (height <= 18) {
          y -= 6;
        }

        itemsPosition.push({ x, y });
      });

      if (itemsPosition.length > 1) {
        setXPositionLabels(itemsPosition);
      }
    };

    updateLabels();
    const timer = setTimeout(updateLabels, 200);

    return () => clearTimeout(timer);
  }, [assetsDataForChart, rowSelected, width]);

  if (!assetsDataForChart?.length) {
    return null;
  }

  return (
    <div className="chart-container" ref={chartDomRef}>
      <WormholeBrand size="regular" />

      <div>
        {XPositionLabels?.map(({ y, x }, i) => {
          if (i === 0) {
            return null;
          }

          return (
            <div
              key={i}
              className="chart-container-chain-icon"
              style={{
                position: "absolute",
                top: isMobile
                  ? Number(y) + 35
                  : isTabletOrMobile
                  ? Number(y) + 30
                  : isDesktop
                  ? Number(y) + 86
                  : Number(y) + 83,
                left: isMobile
                  ? Number(x) + 52
                  : isTabletOrMobile
                  ? Number(x) + 66
                  : isDesktop
                  ? Number(x) + 66
                  : Number(x) + 64,
                zIndex: 10,
                pointerEvents: "none",
              }}
            >
              <BlockchainIcon
                background="var(--color-black-25)"
                chainId={top7AssetsData?.[rowSelected]?.tokens?.[i - 1]?.emitter_chain}
                colorless={true}
                network={currentNetwork}
                size={24}
              />
            </div>
          );
        })}
      </div>

      <ReactApexChart
        type="bar"
        height={isTabletOrMobile ? "390px" : "695px"}
        width="100%"
        series={[
          {
            name: "Volume",
            data: assetsDataForChart.map(({ volume }) => volume),
          },
        ]}
        options={{
          title: {
            text: `${
              isTabletOrMobile
                ? t("home.topAssets.chartTitle")
                : t("home.topAssets.chartTitle").toUpperCase()
            } ${top7AssetsData?.[rowSelected]?.symbol}`,
            align: "left",
            margin: 49,
            offsetX: 0,
            offsetY: 2,
            style: {
              color: "var(--color-primary-150)",
              fontFamily: "IBM Plex Sans",
              fontSize: "14px",
              fontWeight: 500,
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
            type: "gradient",
            gradient: {
              type: "vertical",
              shade: "light",
              inverseColors: false,
              opacityFrom: 1,
              opacityTo: 0,
              stops: [0, 75, 100],
              colorStops: [
                {
                  offset: 0,
                  color: "#09FECB",
                },
                {
                  offset: 100,
                  color: "#09FECB25",
                },
              ],
            },
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
            show: false,
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
                        <span class='chart-container-tooltip-label'>VOLUME</span>
                        <span class='chart-container-tooltip-volume'>$${volumeFormatted}</span>
                      </div>
                      ` +
                `
                      <div>
                        <span class='chart-container-tooltip-label'>TXS</span>
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
            axisTicks: { show: false },
            labels: {
              formatter: function (vol) {
                let result = numberToSuffix(vol);
                if (vol < 1000 && vol > 0) {
                  result = Number(result).toFixed(1);
                }

                return `$${result}`;
              },
              minWidth: isMobile ? 48 : 64,
              maxWidth: isMobile ? 48 : 64,
              align: "right",
              style: {
                colors: "#9295BB",
                fontFamily: "IBM Plex Sans",
                fontSize: isMobile ? "10px" : "14px",
              },
            },
            axisBorder: {
              show: true,
              width: 1,
              color: "#FFFFFF25",
            },
          },
          xaxis: {
            tickAmount: assetsDataForChart.length,
            labels: {
              style: {
                colors: "var(--color-primary-150)",
                fontFamily: "IBM Plex Sans",
                fontSize: isMobile ? "10px" : "14px",
              },
              trim: false,
              rotate: -45,
              maxHeight: isMobile ? 56 : 88,
            },
            axisTicks: { show: false },
            axisBorder: { show: true, strokeWidth: 4, color: "#FFFFFF25" },
          },
        }}
      />
    </div>
  );
};

export default TopAssetsChart;
