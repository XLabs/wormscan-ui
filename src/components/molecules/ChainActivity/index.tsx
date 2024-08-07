import { useCallback, useEffect, useRef, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { useQuery } from "react-query";
import "react-datepicker/dist/react-datepicker.css";
import { useEnvironment } from "src/context/EnvironmentContext";
import { BlockchainIcon, Loader, Select, ToggleGroup } from "src/components/atoms";
import { ErrorPlaceholder, WormholeScanBrand } from "src/components/molecules";
import { changePathOpacity, formatterYAxis, updatePathStyles } from "src/utils/apexChartUtils";
import { getChainName } from "src/utils/wormhole";
import { ChainId, chainToChainId } from "@wormhole-foundation/sdk";
import { getClient } from "src/api/Client";
import { ChainFilterMainnet, ChainFilterTestnet } from "src/pages/Txs/Information/Filters";
import { useWindowSize, useLockBodyScroll } from "src/utils/hooks";
import { formatNumber } from "src/utils/number";
import {
  ActivityIcon,
  AnalyticsIcon,
  CrossIcon,
  FilterListIcon,
  GlobeIcon,
} from "src/icons/generic";
import { IChainActivity, IChainActivityInput } from "src/api/guardian-network/types";
import { calculateDateDifferenceInDays, startOfDayUTC, startOfMonthUTC } from "src/utils/date";
import {
  colors,
  DAY_IN_MILLISECONDS,
  formatXaxisLabels,
  grayColors,
  IAccumulator,
  IChainList,
  ICompleteData,
  MEDIUM_TIMESPAN_LIMIT,
  SHORT_TIMESPAN_LIMIT,
  TSelectedPeriod,
} from "src/utils/chainActivityUtils";
import { BREAKPOINTS } from "src/consts";
import { Calendar } from "./Calendar";
import "./styles.scss";

const TYPE_CHART_LIST = [
  { label: <ActivityIcon width={24} />, value: "area", ariaLabel: "Area" },
  { label: <AnalyticsIcon width={24} />, value: "bar", ariaLabel: "Bar" },
];

const ChainActivity = () => {
  const { width } = useWindowSize();
  const isTablet = width >= BREAKPOINTS.tablet;
  const isDesktop = width >= BREAKPOINTS.desktop;
  const isBigDesktop = width >= BREAKPOINTS.bigDesktop;

  const chainsContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef(null);
  const [chartSelected, setChartSelected] = useState<"area" | "bar">("area");

  const initialDataDate = new Date(2021, 7, 1);

  const [startDate, setStartDate] = useState(initialDataDate);
  const [endDate, setEndDate] = useState(new Date());
  const [startDateDisplayed, setStartDateDisplayed] = useState(initialDataDate);
  const [endDateDisplayed, setEndDateDisplayed] = useState(new Date());

  const [showAllChains, setShowAllChains] = useState(true);
  const [allChainsSerie, setAllChainsSerie] = useState([]);
  const [series, setSeries] = useState([]);
  const [messagesNumber, setMessagesNumber] = useState(0);
  const [allMessagesNumber, setAllMessagesNumber] = useState(0);

  const [lastBtnSelected, setLastBtnSelected] = useState<TSelectedPeriod>("all");
  const [openFilters, setOpenFilters] = useState(false);

  useLockBodyScroll({
    isLocked: !isDesktop && openFilters,
    scrollableClasses: [
      "blockchain-icon",
      "custom-checkbox",
      "select__option",
      "select-custom-option-container",
      "select-custom-option",
      "btn",
      "show-date",
      "chain-activity-chart-top-section-box-date-calendar",
      "react-datepicker",
    ],
  });

  const { environment } = useEnvironment();
  const currentNetwork = environment.network;
  const orderedChains = currentNetwork === "Mainnet" ? ChainFilterMainnet : ChainFilterTestnet;
  const ALL_CHAINS = {
    label: "All Chains",
    value: "All Chains",
    icon: <GlobeIcon width={24} style={{ color: "#fff" }} />,
    showMinus: !showAllChains,
    disabled: false,
  };
  const [chainListSelected, setChainListSelected] = useState([ALL_CHAINS]);

  const CHAIN_LIST = [
    ALL_CHAINS,
    ...orderedChains.map(chainId => ({
      label: getChainName({
        network: currentNetwork,
        chainId: chainId,
      }),
      value: `${chainId}`,
      icon: (
        <BlockchainIcon
          background="var(--color-white-10)"
          chainId={chainId}
          className="chain-icon"
          colorless={true}
          lazy={false}
          network={currentNetwork}
          size={24}
        />
      ),
      showMinus: false,
      disabled:
        chainListSelected.length >= 10 && !chainListSelected.some(item => +item.value === chainId),
    })),
  ];

  const [filters, setFilters] = useState<IChainActivityInput>({
    from: startDate?.toISOString(),
    to: endDate?.toISOString(),
    timespan: "1mo",
    sourceChain: [],
  });

  const isUTC00 = new Date().getTimezoneOffset() === 0;
  const isUTCPositive = new Date().getTimezoneOffset() < 0;

  const tickAmount =
    allChainsSerie?.[0]?.data?.length > 0
      ? isBigDesktop
        ? Math.min(allChainsSerie[0].data.length, 19)
        : isTablet
        ? Math.min(allChainsSerie[0].data.length, 10)
        : 4
      : null;

  const {
    data: dataAllChains,
    isError: isErrorAllChains,
    isFetching: isFetchingAllChains,
  } = useQuery(["getChainActivity", filters.from, filters.to], () =>
    getClient().guardianNetwork.getChainActivity({
      from: filters.from,
      to: filters.to,
      timespan: filters.timespan,
      sourceChain: [],
    }),
  );

  const { data, isError, isFetching } = useQuery(["getChainActivity", filters], () => {
    if (filters?.sourceChain?.length === 0) {
      return Promise.resolve([]);
    }

    return getClient().guardianNetwork.getChainActivity({
      from: filters.from,
      to: filters.to,
      timespan: filters.timespan,
      sourceChain: filters.sourceChain,
    });
  });

  const getDateList = useCallback(() => {
    let start = new Date(filters.from);
    let end = new Date(filters.to);
    const dateList: string[] = [];
    const dateDifferenceInDays = calculateDateDifferenceInDays(start, end);

    if (dateDifferenceInDays < SHORT_TIMESPAN_LIMIT) {
      start.setUTCHours(start.getUTCHours(), 0, 0, 0);
      end.setUTCHours(end.getUTCHours(), 0, 0, 0);
      while (start < end) {
        dateList.push(start.toISOString());
        start.setUTCHours(start.getUTCHours() + 1, 0, 0, 0);
      }
    } else if (dateDifferenceInDays < MEDIUM_TIMESPAN_LIMIT) {
      start = startOfDayUTC(start);
      start.setUTCHours(0, 0, 0, 0);
      while (
        start < end &&
        (isUTC00 ? true : start.getTime() < end.getTime() - DAY_IN_MILLISECONDS) &&
        start.getTime() < new Date().getTime() - DAY_IN_MILLISECONDS
      ) {
        dateList.push(start.toISOString());
        start.setUTCDate(start.getUTCDate() + 1);
      }
    } else {
      start = startOfMonthUTC(start);
      start.setUTCHours(0, 0, 0, 0);
      end = startOfMonthUTC(end);
      end.setUTCHours(0, 0, 0, 0);

      const lastMonthRemoved = new Date();
      lastMonthRemoved.setMonth(lastMonthRemoved.getMonth() - 1);
      while (
        start.getTime() < end.getTime() &&
        (!isUTC00 && !isUTCPositive
          ? !(
              start.getFullYear() === new Date().getFullYear() &&
              start.getMonth() === lastMonthRemoved.getMonth()
            )
          : true)
      ) {
        dateList.push(start.toISOString());
        start.setUTCMonth(start.getUTCMonth() + 1);
      }
    }

    return dateList;
  }, [filters.from, filters.to, isUTC00, isUTCPositive]);

  const handleChainSelection = (value: IChainList[]) => {
    if (
      value.length === 0 &&
      chainListSelected.length === 1 &&
      chainListSelected[0].value === "All Chains"
    ) {
      return;
    }

    const lastChainSelected = value?.[value.length - 1]?.value;

    if (value.length === 0 || lastChainSelected === "All Chains") {
      value = [CHAIN_LIST[0]];
    } else {
      value = value.filter(item => item.value !== "All Chains");
    }

    setChainListSelected(value);
    const chainsSelected = value.map((item: IChainList) => item.value);
    const chainsSelectedWithoutAll = chainsSelected.filter(
      (chain: string) => chain !== "All Chains",
    );
    const isAllChainsSelected = chainsSelected.includes("All Chains");

    if (isAllChainsSelected) {
      setShowAllChains(true);
    } else {
      setShowAllChains(false);
    }

    setFilters({
      ...filters,
      sourceChain: chainsSelectedWithoutAll,
    });
  };

  const handleFiltersOpened = () => {
    setOpenFilters(prev => !prev);
  };

  const applyFilters = () => {
    setOpenFilters(false);
  };

  const resetFilters = () => {
    setStartDate(initialDataDate);
    setEndDate(new Date());
    setStartDateDisplayed(initialDataDate);
    setEndDateDisplayed(new Date());
    setLastBtnSelected("all");
    setShowAllChains(true);
    setChainListSelected([ALL_CHAINS]);
    setFilters({
      from: initialDataDate?.toISOString(),
      to: new Date()?.toISOString(),
      timespan: "1mo",
      sourceChain: [],
    });
    setOpenFilters(false);
  };

  const groupDataByDate = (data: IChainActivity[]) => {
    return data.reduce((acc: IAccumulator, curr) => {
      const key = `${curr.from}-${curr.to}`;
      if (!acc[key]) {
        acc[key] = {
          from: curr.from.slice(0, -1) + ".000Z",
          to: curr.to,
          emitter_chain: "allChains",
          volume: 0,
          count: 0,
          details: [],
        };
      }
      acc[key].volume += curr.volume;
      acc[key].count += curr.count;

      const index = acc[key].details.findIndex(detail => detail.count < curr.count);
      const detail = {
        emitter_chain: curr.emitter_chain,
        volume: curr.volume,
        count: curr.count,
      };

      if (index === -1) {
        acc[key].details.push(detail);
      } else {
        acc[key].details.splice(index, 0, detail);
      }

      return acc;
    }, {});
  };

  useEffect(() => {
    if (startDate && endDate) {
      const dateDifferenceInDays = calculateDateDifferenceInDays(startDate, endDate);

      const timespan =
        dateDifferenceInDays < SHORT_TIMESPAN_LIMIT
          ? "1h"
          : dateDifferenceInDays < MEDIUM_TIMESPAN_LIMIT
          ? "1d"
          : "1mo";

      const newFrom = new Date(startDate);

      timespan === "1d"
        ? newFrom.setDate(isUTC00 ? newFrom.getDate() : newFrom.getDate() + 1)
        : timespan === "1mo"
        ? newFrom.setMonth(isUTC00 || isUTCPositive ? newFrom.getMonth() : newFrom.getMonth() + 1)
        : null;

      const newTo = new Date(endDate);
      timespan === "1d" && !isUTC00
        ? newTo.setDate(newTo.getDate() + 1)
        : timespan === "1mo" && !isUTCPositive && !isUTC00
        ? newTo.setMonth(newTo.getMonth() + 1)
        : null;

      setStartDateDisplayed(startDate);
      setEndDateDisplayed(endDate);

      setFilters(prevFilters => ({
        ...prevFilters,
        from: newFrom.toISOString(),
        to: newTo.toISOString(),
        timespan: timespan,
      }));
    }
  }, [endDate, isUTC00, isUTCPositive, startDate]);

  useEffect(() => {
    if (dataAllChains) {
      const groupedByDate = groupDataByDate(dataAllChains);
      const totalVolumeAndCountPerDay = Object.values(groupedByDate);
      const seriesForAllChains = [
        {
          name: "All Chains",
          data: totalVolumeAndCountPerDay.map(item => ({
            x: item.from,
            y: item.count,
            volume: item.volume,
            count: item.count,
            emitter_chain: item.emitter_chain,
            details: item.details,
            color: "#7abfff",
          })),
          color: "#7abfff",
        },
      ];

      const dateList = getDateList();
      const completeData = dateList.reduce((obj: ICompleteData, date: string) => {
        obj[date] = {
          color: "#fff",
          count: 0,
          details: [],
          emitter_chain: "allChains",
          volume: 0,
          x: date,
          y: 0,
        };
        return obj;
      }, {});

      seriesForAllChains[0].data.forEach(item => {
        completeData[item.x] = item;
      });

      seriesForAllChains[0].data = Object.values(completeData);
      seriesForAllChains[0].data.sort((a, b) => new Date(a.x).getTime() - new Date(b.x).getTime());

      const totalMessages = dataAllChains.reduce((acc, item) => acc + item.count, 0);

      setAllMessagesNumber(totalMessages);
      setAllChainsSerie(seriesForAllChains);
    }
  }, [dataAllChains, getDateList]);

  useEffect(() => {
    if (!data) return;

    const dataByChain: { [key: string]: any[] } = {};
    const allDates: { [key: string]: boolean } = {};
    const chainIndices: { [key: string]: number } = {};
    chainListSelected.forEach((chain: IChainList, i: number) => {
      chainIndices[chain.value] = i;
    });

    // Group by emitter_chain and extract all dates
    data.forEach(item => {
      // formatDate to add milliseconds and match dates when using .toISOString()
      const formatDate = item.from.slice(0, -1) + ".000Z";

      if (!dataByChain[item.emitter_chain]) {
        dataByChain[item.emitter_chain] = [];
      }

      dataByChain[item.emitter_chain].push({
        x: formatDate,
        y: item.count,
        volume: item.volume,
        count: item.count,
        emitter_chain: item.emitter_chain,
        color: colors[chainIndices[item.emitter_chain]] || "#fff",
      });

      allDates[formatDate] = true;
    });

    const selectedChains = filters?.sourceChain?.length > 0 ? filters.sourceChain : [];
    const dateList = getDateList();

    // When there were no movements in that time range, the endpoint does not bring
    // information for that chain, so we need to add it manually
    selectedChains.forEach(chain => {
      dataByChain[chain] = dateList.map((date: string) => {
        const existingData = dataByChain[chain]?.find(item => item.x === date);
        return (
          existingData || {
            x: date,
            y: 0,
            volume: 0,
            count: 0,
            emitter_chain: chain,
            color: colors[chainIndices[chain]] || "#fff",
          }
        );
      });
    });

    // Sort by date
    Object.keys(dataByChain).forEach(chain => {
      Object.keys(allDates).forEach(date => {
        if (!dataByChain[chain].some(item => item.x === date)) {
          dataByChain[chain].push({ x: date, y: 0, volume: 0, count: 0, emitter_chain: chain });
        }
      });
      dataByChain[chain].sort((a, b) => new Date(a.x).getTime() - new Date(b.x).getTime());
    });

    const newSeries = Object.keys(dataByChain)
      .map(chain => {
        return {
          name: getChainName({
            network: currentNetwork,
            chainId: +chain as ChainId,
          }),
          data: dataByChain[chain],
          color: colors[chainIndices[chain]] || "#fff",
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    const sumOfMessages = data.reduce((acc, item) => acc + item.count, 0);
    setMessagesNumber(sumOfMessages);

    if (showAllChains) {
      setSeries([...allChainsSerie, ...newSeries]);
    } else {
      setSeries(newSeries);
    }
  }, [
    allChainsSerie,
    chainListSelected,
    currentNetwork,
    data,
    filters.sourceChain,
    getDateList,
    showAllChains,
  ]);

  return (
    <div className="chain-activity">
      {openFilters && <div className="chain-activity-bg" onClick={handleFiltersOpened} />}

      <h2 className="chain-activity-title">
        <AnalyticsIcon width={24} /> Chains Activity
      </h2>

      <div className="chain-activity-chart" ref={chartRef}>
        <div className="chain-activity-chart-top">
          <div className="chain-activity-chart-top-filters">
            <button onClick={handleFiltersOpened}>
              <FilterListIcon width={24} />
              Filters {filters.sourceChain.length > 0 && `(${filters.sourceChain.length})`}
            </button>
          </div>

          <div className="chain-activity-chart-top-design">
            <ToggleGroup
              ariaLabel="Select type"
              className="chain-activity-chart-top-design-toggle"
              items={TYPE_CHART_LIST}
              onValueChange={value => setChartSelected(value)}
              value={chartSelected}
            />
          </div>

          <div className={`chain-activity-chart-top-mobile ${openFilters ? "open" : ""}`}>
            <div className="chain-activity-chart-top-mobile-title">
              <p>Filters</p>
              <button onClick={handleFiltersOpened}>
                <CrossIcon width={24} />
              </button>
            </div>

            <div className="chain-activity-chart-top-section" ref={chainsContainerRef}>
              <Select
                text={
                  showAllChains || filters?.sourceChain?.length > 0
                    ? showAllChains
                      ? `All chains${
                          filters?.sourceChain?.length > 0
                            ? ` and (${filters.sourceChain.length})`
                            : ""
                        }`
                      : filters.sourceChain.length === 1
                      ? getChainName({
                          network: currentNetwork,
                          chainId: filters.sourceChain[0] as ChainId,
                        })
                      : `Custom (${filters.sourceChain.length})`
                    : "Select chains"
                }
                ariaLabel="Select Chains"
                items={CHAIN_LIST}
                menuFixed={isDesktop ? false : true}
                menuPortalStyles={{ zIndex: 100 }}
                name="timeRange"
                onValueChange={(value: any) => handleChainSelection(value)}
                type="searchable"
                value={chainListSelected}
              />
            </div>

            <Calendar
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
              lastBtnSelected={lastBtnSelected}
              setLastBtnSelected={setLastBtnSelected}
              startDateDisplayed={startDateDisplayed}
              endDateDisplayed={endDateDisplayed}
              isDesktop={isDesktop}
            />

            <div className="chain-activity-chart-top-mobile-buttons">
              <button className="apply-btn" onClick={applyFilters}>
                Apply Filters
              </button>

              <button className="reset-btn" onClick={resetFilters}>
                Reset Filters
              </button>
            </div>

            <div
              className={`chain-activity-chart-top-legends ${
                isFetching || isFetchingAllChains || isError || isErrorAllChains ? "hidden" : ""
              }`}
            >
              <div className="chain-activity-chart-top-legends-container">
                <span>Messages: </span>
                <p>
                  {showAllChains
                    ? formatNumber(allMessagesNumber, 0)
                    : formatNumber(messagesNumber, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {isError || isErrorAllChains ? (
          <ErrorPlaceholder errorType="chart" />
        ) : isFetching || isFetchingAllChains ? (
          <Loader />
        ) : (
          <>
            <WormholeScanBrand />

            <ReactApexChart
              key={chartSelected}
              series={
                chartSelected === "area"
                  ? series
                  : series.map(serie => {
                      return {
                        name: serie.name,
                        data: serie.data,
                        color: serie.color,
                      };
                    })
              }
              type={chartSelected}
              height={isDesktop ? 400 : 300}
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
                  stacked: chartSelected === "bar",
                },
                dataLabels: { enabled: false },
                grid: {
                  borderColor: "var(--color-gray-900)",
                  strokeDashArray: 6,
                  xaxis: {
                    lines: { show: true },
                  },
                  yaxis: {
                    lines: { show: false },
                  },
                  padding: {
                    top: isDesktop ? 80 : 0,
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
                legend: {
                  show: isDesktop,
                  fontFamily: "Roboto",
                  fontSize: "14px",
                  fontWeight: 400,
                  floating: true,
                  labels: {
                    colors: "var(--color-white)",
                  },
                  markers: {
                    width: 4,
                    height: 12,
                    radius: 3,
                  },
                  onItemClick: { toggleDataSeries: false },
                  position: "top",
                  offsetY: 40,
                  horizontalAlign: "left",
                  showForSingleSeries: true,
                  itemMargin: {
                    horizontal: 10,
                  },
                },
                xaxis: {
                  axisBorder: { show: true, strokeWidth: 4, color: "var(--color-gray-10)" },
                  axisTicks: { show: false },
                  crosshairs: {
                    position: "front",
                  },
                  tickAmount,
                  labels: {
                    formatter: (value: string) =>
                      formatXaxisLabels(value, new Date(filters.from), new Date(filters.to)),
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
                  custom: ({ series, seriesIndex, dataPointIndex, w }) => {
                    const data = w.config.series[seriesIndex].data[dataPointIndex];

                    const allDataForDate = w.config.series
                      .map((serie: any) => serie.data[dataPointIndex])
                      .sort((a: any, b: any) => b.y - a.y);

                    const totalMessages = allChainsSerie[0].data[dataPointIndex]?.y || 0;

                    if (chartSelected === "bar") {
                      updatePathStyles({ chartRef, dataPointIndex });
                    }

                    return `<div class="chain-activity-chart-tooltip">
                      <p class="chain-activity-chart-tooltip-date">
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
                      <div class="chain-activity-chart-tooltip-total-msg">
                        ${
                          showAllChains
                            ? "<div class='chain-activity-chart-tooltip-container-each-msg-icon' style='background-color: var(--color-primary-100)'></div>"
                            : ""
                        }
                      Total Messages: <span>${formatNumber(totalMessages, 0)}</span></div>
                      <p class="chain-activity-chart-tooltip-chains">Chains:</p>
                      <div class="chain-activity-chart-tooltip-container">
                        ${allDataForDate
                          .map((item: any) => {
                            return `
                                ${
                                  item?.emitter_chain === "allChains"
                                    ? ``
                                    : `
                                      <div class="chain-activity-chart-tooltip-container-each-msg">
                                        <div class="chain-activity-chart-tooltip-container-each-msg-icon" style="background-color: ${
                                          item?.color
                                        }">
                                        </div>
                                        <div class="chain-activity-chart-tooltip-container-each-msg-name">
                                          ${getChainName({
                                            network: currentNetwork,
                                            chainId: item?.emitter_chain,
                                            acronym: +item?.emitter_chain === chainToChainId("Bsc"),
                                          })}:
                                        </div>
                                        <div class="chain-activity-chart-tooltip-container-each-msg-number">
                                          ${formatNumber(item?.y)}
                                        </div>
                                      </div>
                                      `
                                }

                          ${
                            item?.details?.length > 0 &&
                            filters.sourceChain.every(chain => chain === "All Chains")
                              ? `
                                  ${item?.details
                                    .map((detail: any, i: number) => {
                                      if (i > 10) return;

                                      if (i > 9) {
                                        return `
                                          <div class="chain-activity-chart-tooltip-container-each-msg">
                                            <div class="chain-activity-chart-tooltip-container-each-msg-icon" style="background-color: ${
                                              grayColors[i]
                                            }">
                                            </div>
                                            <div class="chain-activity-chart-tooltip-container-each-msg-name">
                                              Others:
                                            </div>
                                            <div class="chain-activity-chart-tooltip-container-each-msg-number">
                                              ${formatNumber(
                                                item?.details
                                                  .slice(i)
                                                  .reduce(
                                                    (acc: number, item: any) => acc + item?.count,
                                                    0,
                                                  ),
                                              )}
                                            </div>
                                          </div>
                                          `;
                                      }

                                      return `
                                        <div class="chain-activity-chart-tooltip-container-each-msg">
                                      <div class="chain-activity-chart-tooltip-container-each-msg-icon" style="background-color: ${
                                        grayColors[i]
                                      }">
                                      </div>
                                      <div class="chain-activity-chart-tooltip-container-each-msg-name">
                                        ${getChainName({
                                          acronym: +detail.emitter_chain === chainToChainId("Bsc"),
                                          network: currentNetwork,
                                          chainId: detail.emitter_chain,
                                        })}:
                                      </div>
                                      <div class="chain-activity-chart-tooltip-container-each-msg-number">
                                        ${formatNumber(detail.count)}
                                      </div>
                                      </div>
                                      `;
                                    })
                                    .join("")}
                                   `
                              : ""
                          }
                             `;
                          })
                          .join("")}
                      </div>
                    </div>`;
                  },
                  intersect: false,
                  shared: true,
                  y: {
                    formatter: (value, { seriesIndex, dataPointIndex, w }) => {
                      const data = w.config.series[seriesIndex].data[dataPointIndex];
                      return `Count: ${value}<br>Volume: ${data.volume}`;
                    },
                  },
                },
              }}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default ChainActivity;
