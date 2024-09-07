import { useState, useMemo, useRef } from "react";
import { useQuery } from "react-query";
import ReactApexChart from "react-apexcharts";
import { BREAKPOINTS, PORTAL_NFT_APP_ID } from "src/consts";
import { Loader, Select, ToggleGroup } from "src/components/atoms";
import { ErrorPlaceholder, WormholeScanBrand } from "src/components/molecules";
import { useWindowSize } from "src/utils/hooks";
import { firstDataAvailableDate, getISODateZeroed, todayISOString } from "src/utils/date";
import { grayColors } from "src/utils/chainActivityUtils";
import { changePathOpacity, formatterYAxis, updatePathStyles } from "src/utils/apexChartUtils";
import { PROTOCOL_LIST } from "src/utils/filterUtils";
import { formatNumber, numberToSuffix } from "src/utils/number";
import { formatAppId } from "src/utils/crypto";
import { getClient } from "src/api/Client";
import { ActivityIcon, AnalyticsIcon, Cube3DIcon } from "src/icons/generic";
import "./styles.scss";

interface IProtocol {
  name: string;
  color: string;
  total_messages: number;
  total_value_transferred: number;
}

interface ITimeRangeData {
  from: string;
  to: string;
  total_messages: number;
  total_value_transferred: number;
  protocols: IProtocol[];
}

const METRIC_CHART_LIST = [
  { label: "Volume", value: "volume", ariaLabel: "Volume" },
  { label: "Transfers", value: "transfers", ariaLabel: "Transfers" },
];

const TYPE_CHART_LIST = [
  { label: <ActivityIcon width={24} />, value: "area", ariaLabel: "Area" },
  { label: <AnalyticsIcon width={24} />, value: "bar", ariaLabel: "Bar" },
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

  const chartRef = useRef(null);
  const [chartSelected, setChartSelected] = useState<"area" | "bar">("area");
  const [metricSelected, setMetricSelected] = useState<"volume" | "transfers">("volume");
  const [totalVolumeValue, setTotalVolumeValue] = useState(0);
  const [totalMessagesValue, setTotalMessagesValue] = useState(0);
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

    let totalVolume = 0;
    let totalMessages = 0;

    if (filters.appId) {
      const result = data.map(item => ({
        name: item.app_id,
        color: "#7abfff",
        data: item.time_range_data.map((dataItem: ITimeRangeData) => {
          totalVolume += dataItem.total_value_transferred;
          totalMessages += dataItem.total_messages;

          return {
            x: dataItem.from,
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

      data.forEach(item => {
        item.time_range_data.forEach((dataItem: ITimeRangeData) => {
          const date = dataItem.from;
          if (!combinedData[date]) {
            combinedData[date] = {
              from: date,
              to: dataItem.to,
              total_messages: 0,
              total_value_transferred: 0,
              protocols: [],
            };
          }
          combinedData[date].total_messages += dataItem.total_messages;
          combinedData[date].total_value_transferred += dataItem.total_value_transferred;

          const protocolIndex = combinedData[date].protocols.findIndex(
            protocol => protocol.name === item.app_id,
          );
          if (protocolIndex === -1) {
            combinedData[date].protocols.push({
              name: item.app_id,
              color: grayColors[combinedData[date].protocols.length],
              total_messages: dataItem.total_messages,
              total_value_transferred: dataItem.total_value_transferred,
            });
          } else {
            combinedData[date].protocols[protocolIndex].total_messages += dataItem.total_messages;
            combinedData[date].protocols[protocolIndex].total_value_transferred +=
              dataItem.total_value_transferred;
          }
        });
      });

      const combinedDataArray = Object.values(combinedData).map(dataItem => {
        const maxItems = 10;

        const positiveProtocols = dataItem.protocols.filter(protocol => {
          if (metricSelected === "volume") {
            return protocol.total_value_transferred > 0;
          } else {
            return protocol.total_messages > 0;
          }
        });

        positiveProtocols.sort((a, b) => {
          if (metricSelected === "volume") {
            return b.total_value_transferred - a.total_value_transferred;
          } else {
            return b.total_messages - a.total_messages;
          }
        });

        const protocols = positiveProtocols.slice(0, maxItems);
        const others = positiveProtocols.slice(maxItems);

        const othersTotalMessages = others.reduce(
          (acc, protocol) => acc + protocol.total_messages,
          0,
        );
        const othersTotalValueTransferred = others.reduce(
          (acc, protocol) => acc + protocol.total_value_transferred,
          0,
        );

        if (othersTotalMessages > 0 || othersTotalValueTransferred > 0) {
          protocols.push({
            name: "Others",
            color: grayColors[protocols.length],
            total_messages: othersTotalMessages,
            total_value_transferred: othersTotalValueTransferred,
          });
        }

        totalVolume += dataItem.total_value_transferred;
        totalMessages += dataItem.total_messages;

        return {
          protocols,
          x: dataItem.from,
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
          name: "All Protocols",
          color: "#7abfff",
          data: combinedDataArray,
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
            items={PROTOCOL_LIST.filter(protocol => protocol.value !== PORTAL_NFT_APP_ID)}
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

          <div className="protocols-activity-container-top-mid">
            <ToggleGroup
              ariaLabel="Select metric type (volume or transfers)"
              className="protocols-activity-container-top-mid-toggle"
              items={METRIC_CHART_LIST}
              onValueChange={value => setMetricSelected(value)}
              value={metricSelected}
            />

            <ToggleGroup
              ariaLabel="Select type"
              className="protocols-activity-container-top-mid-toggle-type"
              items={TYPE_CHART_LIST}
              onValueChange={value => setChartSelected(value)}
              value={chartSelected}
            />
          </div>

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

        <div className="protocols-activity-container-chart" ref={chartRef}>
          {isError ? (
            <ErrorPlaceholder />
          ) : isFetching ? (
            <Loader />
          ) : (
            <>
              <WormholeScanBrand />

              <div className="protocols-activity-container-chart-header">
                {metricSelected === "volume" ? (
                  <div className="protocols-activity-container-chart-header-total-txt">
                    Volume: <span>${formatNumber(totalVolumeValue)}</span>
                  </div>
                ) : (
                  <div className="protocols-activity-container-chart-header-total-txt">
                    Transfers: <span>{formatNumber(totalMessagesValue)}</span>
                  </div>
                )}
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
                  },
                  tooltip: {
                    custom: ({ s, seriesIndex, dataPointIndex, w }) => {
                      const data = w.config.series[seriesIndex].data[dataPointIndex];

                      if (chartSelected === "bar") {
                        updatePathStyles({ chartRef, dataPointIndex });
                      }

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
                                      ? `$${numberToSuffix(data.y)}`
                                      : numberToSuffix(data.y)
                                  }
                                </div>    
                              </div>
                              ${
                                data?.protocols?.length > 0
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
                              ${
                                data?.protocols?.length > 0
                                  ? data?.protocols
                                      ?.map(
                                        (protocol: IProtocol, i: number) => `
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
                                      ${formatAppId(protocol.name)}
                                    </div>
                                    <div class="protocols-activity-container-chart-tooltip-protocol-number">
                                      ${
                                        metricSelected === "volume"
                                          ? `$${numberToSuffix(protocol.total_value_transferred)}`
                                          : numberToSuffix(protocol.total_messages)
                                      }
                                    </div>
                                  </div>`,
                                      )
                                      .join("")
                                  : ""
                              }  
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
