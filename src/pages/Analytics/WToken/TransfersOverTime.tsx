import ReactApexChart from "react-apexcharts";
import { useState, useMemo } from "react";
import { GetTransferByTimeResult } from "src/api/native-token-transfer/types";
import { Loader, ToggleGroup, Select } from "src/components/atoms";
import { ErrorPlaceholder, WormholeScanBrand } from "src/components/molecules";
import { BREAKPOINTS } from "src/consts";
import { ActivityIcon, AnalyticsIcon } from "src/icons/generic";
import { useWindowSize } from "src/utils/hooks";
import { formatNumber } from "src/utils/number";
import { getTokenIcon } from "src/utils/token";
import { formatterYAxis } from "src/utils/apexChartUtils";
import { TimeRange, ByType } from "./index";

type TransfersOverTimeProps = {
  transfers: GetTransferByTimeResult;
  isLoading: boolean;
  isError: boolean;
  timeSpan: string;
  setTimeRange: (value: TimeRange) => void;
  timeRange: TimeRange;
  by: ByType;
  setBy: (value: ByType) => void;
};

const TYPE_CHART_LIST = [
  { label: <ActivityIcon width={24} />, value: "area", ariaLabel: "Area" },
  { label: <AnalyticsIcon width={24} />, value: "bar", ariaLabel: "Bar" },
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
}: TransfersOverTimeProps) => {
  const { width } = useWindowSize();
  const isTablet = width >= BREAKPOINTS.tablet;
  const isDesktop = width >= BREAKPOINTS.desktop;

  const [chartSelected, setChartSelected] = useState<"area" | "bar">("area");

  const tokenIcon = getTokenIcon("W");

  const series = useMemo(() => {
    if (!transfers || transfers.length === 0) return [];

    return [
      {
        name: "W Token Transfers",
        color: "#7abfff",
        data: transfers.map(item => ({
          x: item.time,
          y: +item.value,
        })),
      },
    ];
  }, [transfers]);

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

  return (
    <div className="transfers-over-time">
      <div className="transfers-over-time-header">
        <h3 className="transfers-over-time-title">
          <ActivityIcon width={20} />
          <span>Cross-Chain W Token Transfers Over Time</span>
        </h3>
      </div>

      <div className="transfers-over-time-container">
        <div className="transfers-over-time-container-chart">
          {isError ? (
            <ErrorPlaceholder />
          ) : (
            <>
              <WormholeScanBrand />

              <div className="transfers-over-time-filters">
                <div className="transfers-over-time-select-range">
                  <Select
                    name="timeRange"
                    value={timeRange}
                    onValueChange={value => setTimeRange(value)}
                    items={RANGE_LIST}
                    ariaLabel="Select Time Range"
                  />
                </div>

                <ToggleGroup
                  ariaLabel="Select data type"
                  className="transfers-over-time-toggle-by"
                  items={BY_TYPE_LIST}
                  onValueChange={value => setBy(value as ByType)}
                  value={by}
                />

                <ToggleGroup
                  ariaLabel="Select chart type"
                  className="transfers-over-time-toggle-type"
                  items={TYPE_CHART_LIST}
                  onValueChange={value => setChartSelected(value as "area" | "bar")}
                  value={chartSelected}
                />
              </div>

              {isLoading ? (
                <Loader />
              ) : (
                <ReactApexChart
                  key={chartSelected}
                  series={series}
                  type={chartSelected}
                  height={isDesktop ? 360 : 300}
                  options={{
                    chart: {
                      animations: { enabled: true },
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
                      curve: "straight",
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
                      offsetX: 15,
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
                    },
                    tooltip: {
                      custom: ({ seriesIndex, dataPointIndex, w }) => {
                        const data = w.config.series[seriesIndex].data[dataPointIndex];
                        const date = new Date(data.x);
                        return `
                        <div class="transfers-over-time-container-chart-tooltip">
                          <p class="transfers-over-time-container-chart-tooltip-date">
                            ${formatDate(date)}
                          </p>
                          <div class="transfers-over-time-container-chart-tooltip-amount">
                            ${
                              by === "notional"
                                ? `<img src="${tokenIcon}" alt="W Token" width="16" height="16" />
                                 <span>${formatNumber(data.y, data.y > 10000 ? 0 : 2)}</span>`
                                : `<span>${formatNumber(data.y)} Transfers</span>`
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
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
