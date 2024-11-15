import ReactApexChart from "react-apexcharts";
import { useState, useMemo, useRef, useEffect } from "react";
import { GetTransferByTimeResult } from "src/api/native-token-transfer/types";
import { Loader, ToggleGroup, Select, Fullscreenable } from "src/components/atoms";
import { ErrorPlaceholder, WormholeScanBrand } from "src/components/molecules";
import { BREAKPOINTS } from "src/consts";
import {
  ActivityIcon,
  AnalyticsIcon,
  FullscreenIcon,
  LinearIcon,
  LogarithmicIcon,
} from "src/icons/generic";
import { useWindowSize } from "src/utils/hooks";
import { formatNumber } from "src/utils/number";
import { getNextDate } from "src/utils/date";
import { changePathOpacity, formatterYAxis, updatePathStyles } from "src/utils/apexChartUtils";
import { TimeRange, ByType } from "./index";
import analytics from "src/analytics";
import { useParams } from "react-router-dom";

type TransfersOverTimeProps = {
  transfers: GetTransferByTimeResult;
  isLoading: boolean;
  isError: boolean;
  timeSpan: "1h" | "1d" | "1mo";
  setTimeRange: (value: TimeRange) => void;
  timeRange: TimeRange;
  by: ByType;
  setBy: (value: ByType) => void;
  currentNetwork: "Mainnet" | "Testnet" | "Devnet";
};

const TYPE_CHART_LIST = [
  { label: <ActivityIcon width={24} />, value: "area", ariaLabel: "Area" },
  { label: <AnalyticsIcon width={24} />, value: "bar", ariaLabel: "Bar" },
];

const SCALE_CHART_LIST = [
  { label: <LogarithmicIcon width={22} />, value: "logarithmic", ariaLabel: "Logarithmic" },
  { label: <LinearIcon width={22} />, value: "linear", ariaLabel: "Linear" },
];

const RANGE_LIST = [
  { label: "Last 24 hours", value: "1d" },
  { label: "Last week", value: "1w" },
  { label: "Last month", value: "1m" },
  { label: "Last year", value: "1y" },
];

const BY_TYPE_LIST = [
  { label: "Transfers", value: "tx" },
  { label: "Volume", value: "notional" },
];

export const TransfersOverTime = ({
  transfers,
  isLoading,
  isError,
  setTimeRange,
  timeRange,
  timeSpan,
  by,
  setBy,
  currentNetwork,
}: TransfersOverTimeProps) => {
  const { width } = useWindowSize();
  const isTablet = width >= BREAKPOINTS.tablet;
  const isDesktop = width >= BREAKPOINTS.desktop;
  const { symbol } = useParams();

  const [scaleSelected, setScaleSelectedState] = useState<"linear" | "logarithmic">("linear");
  const setScaleSelected = (value: "linear" | "logarithmic", track: boolean) => {
    setScaleSelectedState(value);

    if (track) {
      analytics.track("scaleSelected", {
        selected: value,
        selectedType: "transfersOverTime",
      });
    }
  };
  const [chartSelected, setChartSelected] = useState<"area" | "bar">("area");
  const chartRef = useRef(null);

  useEffect(() => {
    if (by === "tx") {
      setScaleSelected("linear", false);
    }
  }, [by]);

  const series = useMemo(() => {
    if (!transfers || transfers.length === 0) return [];

    return [
      {
        name: `${symbol} Token Transfers`,
        color: "var(--color-lime)",
        totalValue: transfers.reduce((acc, item) => acc + +item.value, 0),
        data: transfers.map(item => ({
          x: item.time,
          to: getNextDate(item.time, timeSpan),
          y: +item.value,
        })),
      },
    ];
  }, [symbol, timeSpan, transfers]);

  const formatDate = (date: Date) => {
    if (timeSpan === "1h") {
      return date.toLocaleString("en-GB", { hour: "2-digit", minute: "2-digit" });
    }
    if (timeSpan === "1d") {
      return date.toLocaleString("en-GB", { day: "2-digit", month: "short" }).toUpperCase();
    }
    if (timeSpan === "1mo") {
      return date.toLocaleString("en-GB", { month: "short", year: "2-digit" }).toUpperCase();
    }
    // Default format for other cases
    return date.toLocaleString("en-GB", { day: "2-digit", month: "short", year: "2-digit" });
  };

  const fullscreenBtnRef = useRef(null);

  return (
    <Fullscreenable
      className="transfers-over-time"
      buttonRef={fullscreenBtnRef}
      itemName="transfersOverTime"
    >
      <div className="transfers-over-time-header">
        <h3 className="transfers-over-time-title">
          <ActivityIcon />
          <span>Cross-Chain {symbol} Token Transfers Over Time</span>
          <div className="transfers-over-time-title-fullscreen" ref={fullscreenBtnRef}>
            <FullscreenIcon width={20} />
          </div>
        </h3>
      </div>

      <div className="transfers-over-time-container">
        <div className="transfers-over-time-container-chart" ref={chartRef}>
          <div className="transfers-over-time-filters">
            <div className="transfers-over-time-select-range">
              <Select
                name="timeRange"
                value={timeRange}
                onValueChange={value => {
                  setTimeRange(value);

                  analytics.track("transfersOverTimeTimeRange", {
                    network: currentNetwork,
                    selected: value.label,
                  });
                }}
                items={RANGE_LIST}
                ariaLabel="Select Time Range"
              />
            </div>

            <ToggleGroup
              ariaLabel="Select data type"
              items={BY_TYPE_LIST}
              onValueChange={value => {
                setBy(value as ByType);

                analytics.track("metricSelected", {
                  network: currentNetwork,
                  selected: value,
                  selectedType: "transfersOverTime",
                });
              }}
              value={by}
            />

            <div className="transfers-over-time-toggles">
              {chartSelected === "area" && by === "notional" && (
                <ToggleGroup
                  ariaLabel="Select scale"
                  items={SCALE_CHART_LIST}
                  onValueChange={value => setScaleSelected(value, true)}
                  type="secondary"
                  value={scaleSelected}
                />
              )}

              <ToggleGroup
                ariaLabel="Select chart type"
                items={TYPE_CHART_LIST}
                onValueChange={value => {
                  setChartSelected(value as "area" | "bar");

                  analytics.track("transfersOverTimeChartType", {
                    network: currentNetwork,
                    selected: value,
                  });
                }}
                type="secondary"
                value={chartSelected}
              />
            </div>
          </div>

          {isError ? (
            <ErrorPlaceholder />
          ) : isLoading ? (
            <Loader />
          ) : (
            <>
              <WormholeScanBrand />

              <div className="transfers-over-time-filters-legends">
                <div className="transfers-over-time-filters-legends-total">
                  <span>
                    {timeRange.value === "1d"
                      ? "Daily"
                      : timeRange.value === "1w"
                      ? "Weekly"
                      : timeRange.value === "1m"
                      ? "Monthly"
                      : timeRange.value === "1y"
                      ? "Yearly"
                      : timeRange.value === "custom"
                      ? ""
                      : "All Time"}{" "}
                    Total {by === "tx" ? "Transfers" : "Volume"}:
                  </span>
                  <p>
                    {by === "tx" ? "" : "$"}
                    {series?.[0]?.totalValue ? formatNumber(series[0].totalValue, 0) : 0}
                  </p>
                </div>
              </div>

              <ReactApexChart
                key={chartSelected}
                series={series}
                type={chartSelected}
                height={isDesktop ? 360 : 300}
                options={{
                  chart: {
                    animations: { enabled: true },
                    events:
                      chartSelected === "bar"
                        ? {
                            mouseLeave: () => {
                              changePathOpacity({ ref: chartRef, opacity: 1 });
                            },
                            mouseMove(e, chart, options) {
                              if (options.dataPointIndex < 0) {
                                changePathOpacity({
                                  ref: chartRef,
                                  opacity: 1,
                                });
                              }
                            },
                          }
                        : {},
                    toolbar: { show: false },
                    zoom: { enabled: false },
                    stacked: chartSelected === "bar",
                  },
                  dataLabels: { enabled: false },
                  grid: {
                    borderColor: "var(--color-gray-900)",
                    strokeDashArray: 6,
                    xaxis: {
                      lines: { show: false },
                    },
                    yaxis: {
                      lines: { show: true },
                    },
                    padding: {
                      top: isDesktop ? 16 : 0,
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
                  stroke: {
                    curve: "smooth",
                    width: chartSelected === "area" ? 2 : 0,
                    dashArray: 0,
                  },
                  fill: {
                    type: chartSelected === "area" ? "gradient" : "solid",
                    gradient: {
                      type: "vertical",
                      shadeIntensity: 0,
                      opacityFrom: 0.4,
                      opacityTo: 0,
                      stops: [0, 100],
                    },
                  },
                  xaxis: {
                    axisBorder: { show: true, strokeWidth: 4, color: "var(--color-gray-10)" },
                    axisTicks: { show: false },
                    crosshairs: {
                      position: "front",
                    },
                    tickAmount: isDesktop ? 6 : isTablet ? 4 : 3,
                    labels: {
                      rotate: 0,
                      formatter: value => {
                        const date = new Date(value);
                        return formatDate(date);
                      },
                      hideOverlappingLabels: true,
                      style: {
                        colors: "var(--color-gray-400)",
                        fontFamily: "Roboto Mono, Roboto, sans-serif",
                        fontSize: "12px",
                        fontWeight: 400,
                      },
                    },
                    tooltip: { enabled: false },
                    offsetX: 0,
                  },
                  yaxis: {
                    labels: {
                      offsetX: -8,
                      formatter: formatterYAxis,
                      style: {
                        colors: "var(--color-gray-400)",
                        fontFamily: "Roboto Mono, Roboto, sans-serif",
                        fontSize: "12px",
                        fontWeight: 400,
                      },
                    },
                    opposite: true,
                    logarithmic: scaleSelected === "logarithmic" && chartSelected === "area",
                    forceNiceScale: scaleSelected === "logarithmic" && chartSelected === "area",
                  },
                  tooltip: {
                    custom: ({ seriesIndex, dataPointIndex, w }) => {
                      const data = w.config.series[seriesIndex].data[dataPointIndex];

                      if (chartSelected === "bar") {
                        updatePathStyles({ chartRef, dataPointIndex });
                      }

                      return `
                        <div class="transfers-over-time-container-chart-tooltip">
                          <div class="transfers-over-time-container-chart-tooltip-date">
                            <p>
                              From:
                              ${new Date(data.x).toLocaleString("en-GB", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })},
                              ${new Date(data.x).toLocaleString("en-GB", {
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                              })}
                            </p>
                            <p>
                              To:
                              ${new Date(data.to).toLocaleString("en-GB", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })},
                              ${new Date(data.to).toLocaleString("en-GB", {
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                          <div class="transfers-over-time-container-chart-tooltip-amount">
                            ${
                              by === "notional"
                                ? `Volume: <span>$${formatNumber(
                                    data.y,
                                    data.y > 10000 ? 0 : 2,
                                  )}</span>`
                                : `Transfers: <span>${formatNumber(data.y)}</span>`
                            }
                          </div>
                        </div>
                      `;
                    },
                    intersect: false,
                    shared: true,
                  },
                }}
              />
            </>
          )}
        </div>
      </div>
    </Fullscreenable>
  );
};
