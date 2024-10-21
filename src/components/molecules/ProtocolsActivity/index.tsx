import { useState, useMemo, useRef, useEffect } from "react";
import { useQuery } from "react-query";
import ReactApexChart from "react-apexcharts";
import {
  BREAKPOINTS,
  C3_APP_ID,
  CONNECT_APP_ID,
  MAYAN_MCTP_APP_ID,
  MAYAN_SWIFT_APP_ID,
  PORTAL_NFT_APP_ID,
} from "src/consts";
import { Fullscreenable, Loader, Select, ToggleGroup } from "src/components/atoms";
import { ErrorPlaceholder, WormholeScanBrand } from "src/components/molecules";
import { useLockBodyScroll, useWindowSize } from "src/utils/hooks";
import { firstDataAvailableDate, getISODateZeroed, todayISOString } from "src/utils/date";
import { grayColors } from "src/utils/chainActivityUtils";
import { changePathOpacity, formatterYAxis, updatePathStyles } from "src/utils/apexChartUtils";
import { PROTOCOL_LIST } from "src/utils/filterUtils";
import { formatNumber, numberToSuffix } from "src/utils/number";
import { formatAppId } from "src/utils/crypto";
import { getClient } from "src/api/Client";
import {
  ActivityIcon,
  AnalyticsIcon,
  CrossIcon,
  Cube3DIcon,
  FilterListIcon,
  FullscreenIcon,
  GlobeIcon,
  LinearIcon,
  LogarithmicIcon,
} from "src/icons/generic";
import "./styles.scss";
import analytics from "src/analytics";
import { useEnvironment } from "src/context/EnvironmentContext";

interface IAggregations {
  app_id: string;
  total_messages: number;
  total_value_transferred: number;
}

interface ITimeRangeData {
  from: string;
  to: string;
  total_messages: number;
  total_value_transferred: number;
  aggregations: IAggregations[];
}

const METRIC_CHART_LIST = [
  { label: "Volume", value: "volume", ariaLabel: "Volume" },
  { label: "Transfers", value: "transfers", ariaLabel: "Transfers" },
];

const TYPE_CHART_LIST = [
  { label: <ActivityIcon width={24} />, value: "area", ariaLabel: "Area" },
  { label: <AnalyticsIcon width={24} />, value: "bar", ariaLabel: "Bar" },
];

const SCALE_CHART_LIST = [
  { label: <LogarithmicIcon width={22} />, value: "logarithmic", ariaLabel: "Logarithmic" },
  { label: <LinearIcon width={22} />, value: "linear", ariaLabel: "Linear" },
];

const RANGE_LIST = [
  { label: "Last 24 hours", value: getISODateZeroed(1), timespan: "1h" },
  { label: "Last 7 days", value: getISODateZeroed(7), timespan: "1d" },
  { label: "Last 30 days", value: getISODateZeroed(30), timespan: "1d" },
  { label: "Last 365 days", value: getISODateZeroed(365), timespan: "1mo" },
  { label: "All Time", value: firstDataAvailableDate, timespan: "1mo" },
];

const ProtocolsActivity = () => {
  const { width } = useWindowSize();
  const isTablet = width >= BREAKPOINTS.tablet;
  const isDesktop = width >= BREAKPOINTS.desktop;

  const { environment } = useEnvironment();
  const currentNetwork = environment.network;
  const isMainnet = currentNetwork === "Mainnet";

  const chartRef = useRef(null);

  const [someZeroValue, setSomeZeroValue] = useState(false);
  const [scaleSelected, setScaleSelectedState] = useState<"linear" | "logarithmic">("linear");
  const setScaleSelected = (value: "linear" | "logarithmic") => {
    setScaleSelectedState(value);
    analytics.track("scaleSelected", {
      selected: value,
      selectedType: "protocolsActivity",
    });
  };
  const [chartSelected, setChartSelected] = useState<"area" | "bar">("area");

  const [metricSelected, setMetricSelected] = useState<"volume" | "transfers">(
    isMainnet ? "volume" : "transfers",
  );
  const [totalVolumeValue, setTotalVolumeValue] = useState(0);
  const [totalMessagesValue, setTotalMessagesValue] = useState(0);
  const [data, setData] = useState([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState(RANGE_LIST[0]);
  const [openFilters, setOpenFilters] = useState(false);
  const [filters, setFilters] = useState({
    from: RANGE_LIST[0].value,
    to: new Date().toISOString(),
    timespan: RANGE_LIST[0].timespan as "1h" | "1d" | "1mo",
    appId: "",
  });

  const series = useMemo(() => {
    if (data.length === 0) {
      setTotalVolumeValue(0);
      setTotalMessagesValue(0);
      return [];
    }

    const dataFiltered = data.filter(item => item.app_id !== "STABLE");
    let totalVolume = 0;
    let totalMessages = 0;

    if (filters.appId) {
      const result = dataFiltered.map(item => ({
        app_id: item.app_id,
        color: "var(--color-lime)",
        data: item.time_range_data.map((dataItem: ITimeRangeData) => {
          totalVolume += dataItem.total_value_transferred;
          totalMessages += dataItem.total_messages;

          const filteredAndSortedAggregations = [...dataItem.aggregations]
            .filter(agg => {
              if (metricSelected === "volume") {
                return agg.total_value_transferred !== 0;
              } else {
                return agg.total_messages !== 0;
              }
            })
            .sort((a, b) => {
              if (metricSelected === "volume") {
                return b.total_value_transferred - a.total_value_transferred;
              } else {
                return b.total_messages - a.total_messages;
              }
            });

          return {
            aggregations: filteredAndSortedAggregations,
            x: dataItem.from,
            to: dataItem.to,
            y:
              metricSelected === "volume"
                ? dataItem.total_value_transferred
                : dataItem.total_messages,
          };
        }),
      }));

      setTotalVolumeValue(totalVolume);
      setTotalMessagesValue(totalMessages);

      return result;
    } else {
      const combinedData: { [key: string]: ITimeRangeData } = {};

      dataFiltered.forEach(item => {
        item.time_range_data.forEach((dataItem: ITimeRangeData) => {
          const date = dataItem.from;
          if (!combinedData[date]) {
            combinedData[date] = {
              from: date,
              to: dataItem.to,
              total_messages: 0,
              total_value_transferred: 0,
              aggregations: [],
            };
          }
          combinedData[date].total_messages += dataItem.total_messages;
          combinedData[date].total_value_transferred += dataItem.total_value_transferred;

          const aggIndex = combinedData[date].aggregations.findIndex(
            agg => agg.app_id === item.app_id,
          );
          if (aggIndex === -1) {
            combinedData[date].aggregations.push({
              app_id: item.app_id,
              total_messages: dataItem.total_messages,
              total_value_transferred: dataItem.total_value_transferred,
            });
          } else {
            combinedData[date].aggregations[aggIndex].total_messages += dataItem.total_messages;
            combinedData[date].aggregations[aggIndex].total_value_transferred +=
              dataItem.total_value_transferred;
          }
        });
      });

      const combinedDataArray = Object.values(combinedData).map(dataItem => {
        const maxItems = 10;

        const filteredAndSortedAggregations = dataItem.aggregations
          .filter(agg => {
            if (metricSelected === "volume") {
              return agg.total_value_transferred > 0;
            } else {
              return agg.total_messages > 0;
            }
          })
          .sort((a, b) => {
            if (metricSelected === "volume") {
              return b.total_value_transferred - a.total_value_transferred;
            } else {
              return b.total_messages - a.total_messages;
            }
          });

        const aggregations = filteredAndSortedAggregations.slice(0, maxItems);
        const others = filteredAndSortedAggregations.slice(maxItems);

        const othersTotalMessages = others.reduce((acc, agg) => acc + agg.total_messages, 0);
        const othersTotalValueTransferred = others.reduce(
          (acc, agg) => acc + agg.total_value_transferred,
          0,
        );

        if (othersTotalMessages > 0 || othersTotalValueTransferred > 0) {
          aggregations.push({
            app_id: "Others",
            total_messages: othersTotalMessages,
            total_value_transferred: othersTotalValueTransferred,
          });
        }

        totalVolume += dataItem.total_value_transferred;
        totalMessages += dataItem.total_messages;

        return {
          aggregations,
          x: dataItem.from,
          to: dataItem.to,
          y:
            metricSelected === "volume"
              ? dataItem.total_value_transferred
              : dataItem.total_messages,
        };
      });

      setTotalVolumeValue(totalVolume);
      setTotalMessagesValue(totalMessages);

      return [
        {
          app_id: "All Protocols",
          color: "var(--color-lime)",
          data: combinedDataArray,
        },
      ];
    }
  }, [data, filters.appId, metricSelected]);

  useEffect(() => {
    const checkForZeroValues = (obj: any, path = "") => {
      let hasZeroValue = false;
      let hasNonZeroValue = false;

      const checkValue = (value: any, currentPath: string) => {
        if (typeof value === "object" && value !== null) {
          Object.entries(value).forEach(([key, val]) => {
            const newPath = currentPath ? `${currentPath}.${key}` : key;
            checkValue(val, newPath);
          });
        } else if (value === 0) {
          hasZeroValue = true;
          // console.log("zero value found at", currentPath);
        } else if (typeof value === "number" && value !== 0) {
          hasNonZeroValue = true;
        }
      };

      checkValue(obj, path);
      return { hasZeroValue, hasNonZeroValue };
    };

    let seriesHasZeroValue = false;
    let seriesHasNonZeroValue = false;

    series.forEach((seriesItem, index) => {
      const { hasZeroValue, hasNonZeroValue } = checkForZeroValues(seriesItem, `series[${index}]`);
      seriesHasZeroValue = seriesHasZeroValue || hasZeroValue;
      seriesHasNonZeroValue = seriesHasNonZeroValue || hasNonZeroValue;
    });

    setSomeZeroValue(seriesHasZeroValue);
    if (seriesHasZeroValue) {
      setScaleSelected("linear");
    } else if (seriesHasNonZeroValue) {
      setScaleSelected("logarithmic");
    }
  }, [series]);

  const { isFetching, isError } = useQuery(["getProtocolActivityChart", filters], async () => {
    const res = await getClient().guardianNetwork.getProtocolActivity({
      from: filters.from,
      to: todayISOString,
      timespan: filters.timespan,
      appId: filters.appId,
    });
    setData(res);
  });

  const handleReset = () => {
    setSelectedTimeRange(RANGE_LIST[0]);
    setFilters({
      from: RANGE_LIST[0].value,
      to: new Date().toISOString(),
      timespan: RANGE_LIST[0].timespan as "1h" | "1d" | "1mo",
      appId: "",
    });
    setOpenFilters(false);
  };

  const handleFiltersOpened = () => {
    setOpenFilters(prev => !prev);
  };

  useEffect(() => {
    if (!isMainnet) {
      setMetricSelected("transfers");
    }
  }, [isMainnet]);

  useLockBodyScroll({
    isLocked: !isDesktop && openFilters,
    scrollableClasses: ["select__option"],
  });

  const fullscreenBtnRef = useRef(null);

  return (
    <Fullscreenable className="protocols-activity" buttonRef={fullscreenBtnRef}>
      {openFilters && <div className="chain-activity-bg" onClick={handleFiltersOpened} />}

      <h3 className="protocols-activity-title">
        <Cube3DIcon />
        Protocols Activity
        <div className="protocols-activity-title-fullscreen" ref={fullscreenBtnRef}>
          <FullscreenIcon width={20} />
        </div>
      </h3>

      <div className="protocols-activity-container">
        <div className="protocols-activity-container-top">
          <button
            className="protocols-activity-container-top-mobile-filters-btn"
            onClick={handleFiltersOpened}
          >
            <FilterListIcon width={24} /> Filters
          </button>

          <div className={`protocols-activity-container-top-filters ${openFilters ? "open" : ""}`}>
            <div className="protocols-activity-container-top-filters-title">
              <p>Filters</p>
              <button onClick={handleFiltersOpened}>
                <CrossIcon width={24} />
              </button>
            </div>

            <Select
              ariaLabel="Select Protocol"
              className="protocols-activity-container-top-filters-protocol"
              closeOnSelect
              controlStyles={{ minWidth: 256 }}
              menuPortalTarget={document.querySelector(".protocols-activity")}
              isMulti={false}
              items={[
                {
                  label: "All Protocols",
                  value: "",
                  icon: <GlobeIcon width={28} />,
                  showMinus: filters.appId.length > 0,
                  disabled: false,
                },
                ...PROTOCOL_LIST.filter(
                  protocol =>
                    protocol.value !== PORTAL_NFT_APP_ID &&
                    protocol.value !== CONNECT_APP_ID &&
                    protocol.value !== C3_APP_ID &&
                    protocol.value !== MAYAN_MCTP_APP_ID &&
                    protocol.value !== MAYAN_SWIFT_APP_ID,
                ),
              ]}
              menuFixed={!isDesktop}
              menuListStyles={{ maxHeight: isDesktop ? 264 : 180 }}
              menuPortalStyles={{ zIndex: 100 }}
              name="protocol"
              onValueChange={protocol => {
                setFilters(prevFilters => ({
                  ...prevFilters,
                  appId: protocol?.value === filters.appId ? "" : protocol.value,
                }));
              }}
              text={filters.appId ? formatAppId(filters.appId) : "All Protocols"}
              type="searchable"
              value={{
                label: filters.appId,
                value: filters.appId,
              }}
            />

            <Select
              ariaLabel="Select Time Range"
              className="protocols-activity-container-top-filters-range"
              items={RANGE_LIST}
              menuFixed={!isDesktop}
              menuPortalStyles={{ zIndex: 100 }}
              menuPortalTarget={document.querySelector(".protocols-activity")}
              name="timeRange"
              onValueChange={timeRange => {
                setSelectedTimeRange(timeRange);
                setFilters(prevFilters => ({
                  ...prevFilters,
                  from: timeRange.value,
                  timespan: timeRange.timespan,
                }));
              }}
              value={selectedTimeRange}
            />

            <ToggleGroup
              ariaLabel="Select metric type (volume or transfers)"
              className="protocols-activity-container-top-filters-metric"
              items={isMainnet ? METRIC_CHART_LIST : [METRIC_CHART_LIST[1]]}
              onValueChange={value => setMetricSelected(value)}
              value={metricSelected}
            />

            <div className="protocols-activity-container-top-filters-btns">
              <button
                className="protocols-activity-container-top-filters-btns-apply"
                onClick={handleFiltersOpened}
              >
                Apply Filters
              </button>

              <button
                className="protocols-activity-container-top-filters-btns-reset"
                disabled={!filters.appId && filters.from === RANGE_LIST[0].value}
                onClick={handleReset}
              >
                Reset Filters
              </button>
            </div>
          </div>

          <ToggleGroup
            ariaLabel="Select type"
            className="protocols-activity-container-top-toggle-design"
            items={TYPE_CHART_LIST}
            onValueChange={value => setChartSelected(value)}
            value={chartSelected}
          />
        </div>

        <div className="protocols-activity-container-chart" ref={chartRef}>
          {isError ? (
            <ErrorPlaceholder />
          ) : isFetching ? (
            <Loader />
          ) : (
            <>
              <WormholeScanBrand />

              <div className="protocols-activity-container-chart-header">
                {filters.appId && (
                  <div className="protocols-activity-container-chart-header-total-txt">
                    {selectedTimeRange.label === "Last 24 hours"
                      ? "Daily"
                      : selectedTimeRange.label === "Last 7 days"
                      ? "Weekly"
                      : selectedTimeRange.label === "Last 30 days"
                      ? "Monthly"
                      : selectedTimeRange.label === "Last 365 days"
                      ? "Yearly"
                      : "All Time"}{" "}
                    Total{" "}
                    {metricSelected === "volume" ? (
                      <>
                        Volume: <span>${formatNumber(totalVolumeValue)}</span>
                      </>
                    ) : (
                      <>
                        Transfers: <span>{formatNumber(totalMessagesValue)}</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {chartSelected === "area" && !someZeroValue && (
                <ToggleGroup
                  ariaLabel="Select scale"
                  className="protocols-activity-container-chart-scale"
                  items={SCALE_CHART_LIST}
                  onValueChange={value => setScaleSelected(value)}
                  value={scaleSelected}
                />
              )}

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
                  },
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
                  xaxis: {
                    axisBorder: { show: true, strokeWidth: 4, color: "var(--color-gray-10)" },
                    axisTicks: { show: false },
                    crosshairs: {
                      position: "front",
                    },
                    tickAmount: isDesktop ? 12 : isTablet ? 6 : 3,
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
                    tooltip: { enabled: false },
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
                    custom: ({ s, seriesIndex, dataPointIndex, w }) => {
                      const data = w.config.series[seriesIndex].data[dataPointIndex];

                      if (chartSelected === "bar") {
                        updatePathStyles({ chartRef, dataPointIndex });
                      }

                      return `<div class="protocols-activity-container-chart-tooltip">
                              <div class="protocols-activity-container-chart-tooltip-date">
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
                              <div class="protocols-activity-container-chart-tooltip-protocol">
                                <div class="protocols-activity-container-chart-tooltip-protocol-icon">
                                </div>
                                <div class="protocols-activity-container-chart-tooltip-protocol-name">
                                  ${formatAppId(series[0].app_id)}
                                </div>
                                <div class="protocols-activity-container-chart-tooltip-protocol-number">
                                  ${
                                    metricSelected === "volume"
                                      ? `$${numberToSuffix(data.y)}`
                                      : numberToSuffix(data.y)
                                  }
                                </div>    
                              </div>
                              ${
                                data?.aggregations?.length > 0
                                  ? `
                                  <p 
                                    class="protocols-activity-container-chart-tooltip-date"
                                    style="margin-top: 24px;"
                                  >
                                    PROTOCOLS:
                                  </p>
                                `
                                  : ""
                              }
                              ${data?.aggregations
                                ?.map((agg: IAggregations, i: number) => {
                                  const percentage =
                                    metricSelected === "volume"
                                      ? (agg.total_value_transferred / data.y) * 100
                                      : (agg.total_messages / data.y) * 100;

                                  return `
                                          <div 
                                            class="protocols-activity-container-chart-tooltip-protocol"
                                            style="margin-bottom: 8px;"
                                          >
                                            <div 
                                              class="protocols-activity-container-chart-tooltip-protocol-icon" 
                                              style="background-color: ${grayColors[i]};"
                                            >
                                            </div>
                                            <div class="protocols-activity-container-chart-tooltip-protocol-name">
                                              ${formatAppId(agg.app_id)}

                                              <div class="protocols-activity-container-chart-tooltip-protocol-name-percentage">
                                                ${formatNumber(
                                                  percentage,
                                                  percentage < 1 ? 2 : undefined,
                                                )}%
                                              </div>
                                            </div>
                                            <div class="protocols-activity-container-chart-tooltip-protocol-number">
                                              ${
                                                metricSelected === "volume"
                                                  ? `$${numberToSuffix(
                                                      agg.total_value_transferred,
                                                    )}`
                                                  : numberToSuffix(agg.total_messages)
                                              }
                                            </div>
                                          </div>
                                          `;
                                })
                                .join("")}
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

export default ProtocolsActivity;
