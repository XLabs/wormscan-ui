import { useState, useMemo } from "react";
import { useQuery } from "react-query";
import ReactApexChart from "react-apexcharts";
import { BREAKPOINTS } from "src/consts";
import { Loader, Select, ToggleGroup } from "src/components/atoms";
import { ErrorPlaceholder, WormholeScanBrand } from "src/components/molecules";
import { useWindowSize } from "src/utils/hooks";
import { firstDataAvailableDate, getISODateZeroed, todayISOString } from "src/utils/date";
import { formatterYAxis } from "src/utils/apexChartUtils";
import { PROTOCOL_LIST } from "src/utils/filterUtils";
import { numberToSuffix } from "src/utils/number";
import { formatAppId } from "src/utils/crypto";
import { getClient } from "src/api/Client";
import { Cube3DIcon } from "src/icons/generic";
import "./styles.scss";

interface TimeRangeData {
  from: string;
  to: string;
  total_messages: number;
  total_value_transferred: number;
}

const METRIC_CHART_LIST = [
  { label: "Volume", value: "volume", ariaLabel: "Volume" },
  { label: "Transactions", value: "transactions", ariaLabel: "Transactions" },
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

  const [metricSelected, setMetricSelected] = useState<"volume" | "transactions">("volume");
  const [data, setData] = useState([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState(RANGE_LIST[0]);
  const [filters, setFilters] = useState({
    from: RANGE_LIST[0].value,
    to: new Date().toISOString(),
    timespan: RANGE_LIST[0].timespan as "1h" | "1d" | "1mo",
    appId: "",
  });

  const series = useMemo(() => {
    if (data.length === 0) return [];
    if (filters.appId) {
      return data.map(item => ({
        name: item.app_id,
        color: "#7abfff",
        data: item.time_range_data.map((dataItem: TimeRangeData) => ({
          x: dataItem.from,
          y:
            metricSelected === "volume"
              ? dataItem.total_value_transferred
              : dataItem.total_messages,
        })),
      }));
    } else {
      const combinedData: { [key: string]: TimeRangeData } = {};

      data.forEach(item => {
        item.time_range_data.forEach((dataItem: TimeRangeData) => {
          const date = dataItem.from;
          if (!combinedData[date]) {
            combinedData[date] = {
              from: date,
              to: dataItem.to,
              total_messages: 0,
              total_value_transferred: 0,
            };
          }
          combinedData[date].total_messages += dataItem.total_messages;
          combinedData[date].total_value_transferred += dataItem.total_value_transferred;
        });
      });

      const combinedDataArray = Object.values(combinedData);

      return [
        {
          name: "All Protocols",
          color: "#7abfff",
          data: combinedDataArray.map(dataItem => ({
            x: dataItem.from,
            y:
              metricSelected === "volume"
                ? dataItem.total_value_transferred
                : dataItem.total_messages,
          })),
        },
      ];
    }
  }, [data, filters.appId, metricSelected]);

  const { isFetching, isError } = useQuery(["getProtocolActivityChart", filters], async () => {
    const res = await getClient().guardianNetwork.getProtocolActivity({
      from: filters.from,
      to: todayISOString,
      timespan: filters.timespan,
      appId: filters.appId,
    });
    setData(res);
  });

  return (
    <div className="protocols-activity">
      <h3 className="protocols-activity-title">
        <Cube3DIcon />
        Protocols Activity
      </h3>

      <div className="protocols-activity-container">
        <div className="protocols-activity-container-top">
          <Select
            ariaLabel="Select Protocol"
            className="protocols-activity-container-top-select-protocol"
            controlStyles={{ minWidth: 256 }}
            isMulti={false}
            items={PROTOCOL_LIST}
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

          <ToggleGroup
            ariaLabel="Select metric type (volume or transactions)"
            className="protocols-activity-container-top-toggle"
            items={METRIC_CHART_LIST}
            onValueChange={value => setMetricSelected(value)}
            value={metricSelected}
          />

          <Select
            ariaLabel="Select Time Range"
            className="protocols-activity-container-top-select-range"
            items={RANGE_LIST}
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
        </div>

        <div className="protocols-activity-container-chart">
          {isError ? (
            <ErrorPlaceholder />
          ) : isFetching ? (
            <Loader />
          ) : (
            <>
              <WormholeScanBrand />

              <ReactApexChart
                series={series}
                type="area"
                height={isDesktop ? 360 : 300}
                options={{
                  chart: {
                    animations: { enabled: true },
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
                    width: 2,
                    dashArray: 0,
                  },
                  fill: {
                    type: "gradient",
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
                  },
                  tooltip: {
                    custom: ({ s, seriesIndex, dataPointIndex, w }) => {
                      const data = w.config.series[seriesIndex].data[dataPointIndex];

                      return `<div class="protocols-activity-container-chart-tooltip">
                              <p class="protocols-activity-container-chart-tooltip-date">
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
                              <div class="protocols-activity-container-chart-tooltip-protocol">
                                <div class="protocols-activity-container-chart-tooltip-protocol-icon">
                                </div>
                                <div class="protocols-activity-container-chart-tooltip-protocol-name">
                                  ${formatAppId(series[0].name)}
                                </div>
                                <div class="protocols-activity-container-chart-tooltip-protocol-number">
                                  ${
                                    metricSelected === "volume"
                                      ? `$${numberToSuffix(data.y, 0)}`
                                      : numberToSuffix(data.y, 0)
                                  }
                                </div>    
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
    </div>
  );
};

export default ProtocolsActivity;
