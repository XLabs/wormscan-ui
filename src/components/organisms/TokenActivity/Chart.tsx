import { useRef, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { BREAKPOINTS } from "src/consts";
import { Loader, ToggleGroup } from "src/components/atoms";
import { ErrorPlaceholder, WormholeScanBrand } from "src/components/molecules";
import { changePathOpacity, formatterYAxis, updatePathStyles } from "src/utils/apexChartUtils";
import { TokensSymbolActivityOutput } from "src/api/guardian-network/types";
import { useWindowSize } from "src/utils/hooks";
import { ActivityIcon, AnalyticsIcon } from "src/icons/generic";
import { formatNumber } from "src/utils/number";
import "./styles.scss";

type Props = {
  data: TokensSymbolActivityOutput;
  isError: boolean;
  isLoading: boolean;
  metricSelected: "volume" | "transactions";
  rowSelected: number;
  filters: {
    timespan: string;
  };
};

const TYPE_CHART_LIST = [
  { label: <ActivityIcon width={24} />, value: "area", ariaLabel: "Area" },
  { label: <AnalyticsIcon width={24} />, value: "bar", ariaLabel: "Bar" },
];

export const Chart = ({ data, filters, isError, isLoading, metricSelected }: Props) => {
  const [chartSelected, setChartSelected] = useState<"area" | "bar">("area");
  const chartRef = useRef(null);

  const { width } = useWindowSize();
  const isTablet = width >= BREAKPOINTS.tablet;
  const isDesktop = width >= BREAKPOINTS.desktop;
  const isBigDesktop = width >= BREAKPOINTS.bigDesktop;

  const token = data?.tokens?.length ? data.tokens[0] : null;

  const dataTransformed = token
    ? token.time_range_data?.map(item => ({
        from: new Date(item.from).toLocaleString(),
        symbol: token.token_symbol,
        volume: item.total_value_transferred,
        transactions: item.total_messages,
      }))
    : null;

  return (
    <div className="token-activity-chart" ref={chartRef}>
      <div className="token-activity-chart-title">Token Activity</div>

      <div className="token-activity-chart-graph">
        {isError ? (
          <ErrorPlaceholder errorType="chart" />
        ) : isLoading ? (
          <Loader />
        ) : (
          <>
            <WormholeScanBrand />

            <div className="token-activity-chart-top">
              <div className="token-activity-chart-top-box">
                <span className="token-activity-chart-top-box-key">
                  {metricSelected === "volume" ? "Total volume" : "Total transfers"}:
                </span>
                <span className="token-activity-chart-top-box-value">
                  {dataTransformed &&
                    (metricSelected === "volume"
                      ? `$${formatNumber(token.total_value_transferred)}`
                      : formatNumber(token.total_messages))}
                </span>
              </div>

              <div className="token-activity-chart-top-box">
                <span className="token-activity-chart-top-box-key">
                  {filters.timespan === "1h" ? "Hourly" : "Daily"} average:
                </span>
                <span className="token-activity-chart-top-box-value">
                  {dataTransformed &&
                    (metricSelected === "volume"
                      ? `$${formatNumber(
                          token.total_value_transferred / token.time_range_data.length,
                          0,
                        )}`
                      : formatNumber(token.total_messages / token.time_range_data.length, 0))}
                </span>
              </div>

              <ToggleGroup
                ariaLabel="Select type"
                className="token-activity-chart-top-toggle"
                items={TYPE_CHART_LIST}
                onValueChange={value => setChartSelected(value)}
                value={chartSelected}
              />
            </div>

            <ReactApexChart
              key={chartSelected}
              type={chartSelected}
              height={isDesktop ? 630 : 415}
              width="100%"
              series={[
                {
                  name: "Volume or Transactions",
                  color: "#7BFFB0",
                  data: dataTransformed
                    ? metricSelected === "volume"
                      ? dataTransformed?.map(({ volume }) => volume)
                      : dataTransformed?.map(({ transactions }) => transactions)
                    : [],
                },
              ]}
              options={{
                chart: {
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
                },
                dataLabels: { enabled: false },
                fill: {
                  type: chartSelected === "area" ? "gradient" : "solid",
                  gradient: {
                    opacityFrom: 0.4,
                    opacityTo: 0,
                    shadeIntensity: 0,
                    stops: [0, 100],
                    type: "vertical",
                  },
                },
                grid: {
                  borderColor: "var(--color-gray-900)",
                  padding: {
                    bottom: 0,
                    left: 32,
                    right: 16,
                    top: 64,
                  },
                  show: true,
                  strokeDashArray: 5,
                },
                labels: dataTransformed?.map(({ from }) => from),
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
                  width: chartSelected === "area" ? 2 : 0,
                },
                tooltip: {
                  custom: function ({ series, seriesIndex, dataPointIndex, w }) {
                    const dataPoint = dataTransformed[dataPointIndex];
                    const { from, volume, symbol, transactions } = dataPoint;

                    if (chartSelected === "bar") {
                      updatePathStyles({ chartRef, dataPointIndex });
                    }

                    return `<div class='token-activity-chart-tooltip'>
                              <div class='token-activity-chart-tooltip-date'>
                                ${new Date(from).toLocaleString("en-GB", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })},
                                ${new Date(from).toLocaleString("en-GB", {
                                  day: "2-digit",
                                  month: "long",
                                  year: "numeric",
                                })}
                              </div>
                              <div class='token-activity-chart-tooltip-info'>
                                ${symbol} Transferred:
                                <span>
                                  ${
                                    metricSelected === "volume"
                                      ? `$${formatNumber(volume)}`
                                      : transactions
                                  }
                                </span>
                              </div>
                            </div>`;
                  },
                  followCursor: isDesktop,
                  intersect: false,
                  shared: true,
                },
                xaxis: {
                  axisBorder: {
                    show: false,
                  },
                  axisTicks: { show: false },
                  crosshairs: {
                    show: true,
                  },
                  labels: {
                    formatter: value => {
                      let date = "";

                      if (filters.timespan === "1h") {
                        date = new Date(value).toLocaleString("en-GB", {
                          hour: "2-digit",
                          minute: "2-digit",
                        });
                      } else if (filters.timespan === "1d") {
                        date = new Date(value).toLocaleString("en-GB", {
                          day: "2-digit",
                          month: "short",
                        });
                      } else {
                        date = new Date(value).toLocaleString("en-GB", {
                          month: "short",
                          year: "2-digit",
                        });
                      }

                      return date;
                    },
                    hideOverlappingLabels: true,
                    offsetX: 0,
                    rotate: 0,
                    style: {
                      colors: "var(--color-gray-400)",
                      fontFamily: "Roboto Mono, Roboto, sans-serif",
                      fontSize: "12px",
                      fontWeight: 400,
                    },
                    trim: false,
                  },
                  tickAmount: isBigDesktop ? 10 : isDesktop ? 6 : isTablet ? 4 : 2,
                  tooltip: {
                    enabled: false,
                  },
                },
                yaxis: {
                  axisBorder: {
                    show: false,
                  },
                  axisTicks: { show: false },
                  labels: {
                    formatter: (val, opts) => {
                      if (metricSelected === "volume") {
                        return `$${formatterYAxis(val, opts)}`;
                      } else {
                        return formatterYAxis(val, opts);
                      }
                    },
                    align: "left",
                    style: {
                      colors: "var(--color-gray-400)",
                      fontFamily: "Roboto Mono, Roboto, sans-serif",
                      fontSize: "12px",
                      fontWeight: 400,
                    },
                  },
                  min: 0,
                  opposite: true,
                  tickAmount: 8,
                },
              }}
            />
          </>
        )}
      </div>
    </div>
  );
};