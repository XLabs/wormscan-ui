import { useCallback, useEffect, useRef, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { useQuery } from "react-query";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { startOfHour } from "date-fns";
import { useEnvironment } from "src/context/EnvironmentContext";
import { BlockchainIcon, Loader, Select } from "src/components/atoms";
import { ErrorPlaceholder } from "src/components/molecules";
import { formatterYAxis } from "src/utils/apexChartUtils";
import { getChainName } from "src/utils/wormhole";
import { getClient } from "src/api/Client";
import { ChainFilterMainnet, ChainFilterTestnet } from "src/pages/Txs/Information/Filters";
import useOutsideClick from "src/utils/hooks/useOutsideClick";
import { useWindowSize } from "src/utils/hooks/useWindowSize";
import { formatNumber } from "src/utils/number";
import {
  AnalyticsIcon,
  ChevronDownIcon,
  CrossIcon,
  FilterListIcon,
  GlobeIcon,
} from "src/icons/generic";
import { IChainActivity } from "src/api/guardian-network/types";
import "./styles.scss";

interface IColors {
  [key: number]: string;
}

interface IDataDetails {
  from: string;
  to: string;
  emitter_chain: string;
  volume: number;
  count: number;
  details: {
    emitter_chain: string;
    volume: number;
    count: number;
  }[];
}

interface IAccumulator {
  [key: string]: IDataDetails;
}

interface IData {
  x: string;
  y: number;
  volume: number;
  count: number;
  emitter_chain: string;
}

type TCompleteData = Record<string, IData>;

type TSelectedPeriod = "24h" | "week" | "month" | "6months" | "year" | "custom";

const colors: IColors = {
  0: "#FD8058",
  1: "#815AF0",
  2: "#627EEA",
  3: "#5795ED",
  4: "#F0B90B",
  5: "#8247E5",
  6: "#E84142",
  7: "#0089DB",
  8: "#FFFFFF",
  9: "#4AB64B",
  10: "#1969FF",
  11: "#F53447",
  12: "#B72896",
  13: "#FA4212",
  14: "#5EA33B",
  15: "#FFFFFF",
  16: "#53CBC8",
  17: "#df42ab",
  18: "#56B39A",
  19: "#00AEFC",
  20: "#A600C0",
  21: "#2A4362",
  22: "#FFFFFF",
  23: "#405870",
  24: "#FF0420",
  26: "#E6DAFE",
  28: "#00AAFF",
  29: "#F7931A",
  30: "#0052FF",
  32: "#A60B13",
  34: "#FFEEDA",
  35: "#FFFFFF",
  36: "#FCFC03",
  37: "#FFFFFF",
  3104: "#00E6FD",
  4001: "#ed4e33",
  4002: "#e53935",
  4007: "#F1E1D4",
  10002: "#627EEA",
  10003: "#405870",
  10004: "#0052FF",
  10005: "#FF0420",
  10006: "#627EEA",
  10007: "#8247E5",
};

function startOfDayUTC(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function startOfMonthUTC(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

const ChainActivity = () => {
  const { width } = useWindowSize();
  const isDesktop = width >= 1024;

  const chainsContainerRef = useRef<HTMLDivElement>(null);
  const dateContainerRef = useRef<HTMLDivElement>(null);
  const [showCalendar, setShowCalendar] = useState(false);

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const [startDate, setStartDate] = useState(yesterday);
  const [endDate, setEndDate] = useState(new Date());
  const [startDateDisplayed, setStartDateDisplayed] = useState(yesterday);
  const [endDateDisplayed, setEndDateDisplayed] = useState(new Date());

  const [showAllChains, setShowAllChains] = useState(true);
  const [allChainsSerie, setAllChainsSerie] = useState([]);
  const [series, setSeries] = useState([]);
  const [messagesNumber, setMessagesNumber] = useState(0);
  const [allMessagesNumber, setAllMessagesNumber] = useState(0);

  const [lastBtnSelected, setLastBtnSelected] = useState<TSelectedPeriod>("24h");
  const [openFilters, setOpenFilters] = useState(false);

  const { environment } = useEnvironment();
  const currentNetwork = environment.network;
  const orderedChains = currentNetwork === "MAINNET" ? ChainFilterMainnet : ChainFilterTestnet;

  const CHAIN_LIST =
    orderedChains.map(value => ({
      label: getChainName({
        network: currentNetwork,
        chainId: value,
      }),
      value: `${value}`,
      icon: (
        <BlockchainIcon
          background="var(--color-white-10)"
          chainId={value}
          className="chain-icon"
          colorless={true}
          network={currentNetwork}
          size={24}
        />
      ),
    })) || [];

  CHAIN_LIST.unshift({
    label: "All Chains",
    value: "All Chains",
    icon: <GlobeIcon width={24} style={{ color: "#fff" }} />,
  });

  const [selectedTimeRange, setSelectedTimeRange] = useState(CHAIN_LIST[0]);

  const [filters, setFilters] = useState({
    from: startDate?.toISOString(),
    to: endDate?.toISOString(),
    timespan: "1h",
    sourceChain: [],
  });

  const isUTC00 = new Date().getTimezoneOffset() === 0;
  const isUTCPositive = new Date().getTimezoneOffset() < 0;

  const {
    data: dataAllChains,
    isError: isErrorAllChains,
    isLoading: isLoadingAllChains,
    isFetching: isFetchingAllChains,
  } = useQuery(
    ["getChainActivity", filters.from, filters.to],
    () =>
      getClient().guardianNetwork.getChainActivity({
        from: filters.from,
        to: filters.to,
        timespan: filters.timespan,
        sourceChain: [],
      }),
    {
      enabled: showAllChains,
    },
  );

  const { data, isError, isLoading, isFetching } = useQuery(["getChainActivity", filters], () => {
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

  const calculateDateDifferenceInDays = (start: Date, end: Date) => {
    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    return end && start ? Math.floor((end.getTime() - start.getTime()) / millisecondsPerDay) : 0;
  };

  const getDateList = useCallback(() => {
    let currentDate = new Date(filters.from);
    let endDate22 = new Date(filters.to);
    const dateList: any = [];
    const dateDifferenceInDays = calculateDateDifferenceInDays(currentDate, endDate22);

    if (dateDifferenceInDays < 4) {
      currentDate = startOfHour(currentDate);
      currentDate.setUTCHours(currentDate.getUTCHours(), 0, 0, 0);
      endDate22 = startOfHour(endDate22);
      endDate22.setUTCHours(endDate22.getUTCHours(), 0, 0, 0);
      while (currentDate < endDate22) {
        dateList.push(currentDate.toISOString());
        currentDate.setUTCHours(currentDate.getUTCHours() + 1, 0, 0, 0);
      }
    } else if (dateDifferenceInDays < 365) {
      currentDate = startOfDayUTC(currentDate);
      currentDate.setUTCHours(0, 0, 0, 0);
      while (
        currentDate < endDate22 &&
        (isUTC00 ? true : currentDate.getTime() < endDate22.getTime() - 86400000) &&
        currentDate.getTime() < new Date().getTime() - 86400000
      ) {
        dateList.push(currentDate.toISOString());
        currentDate.setUTCDate(currentDate.getUTCDate() + 1);
      }
    } else {
      currentDate = startOfMonthUTC(currentDate);
      currentDate.setUTCHours(0, 0, 0, 0);
      endDate22 = startOfMonthUTC(endDate22);
      endDate22.setUTCHours(0, 0, 0, 0);

      const lastMonthRemoved = new Date();
      lastMonthRemoved.setMonth(lastMonthRemoved.getMonth() - 1);
      while (
        currentDate.getTime() < endDate22.getTime() &&
        (!isUTC00 && !isUTCPositive
          ? !(
              currentDate.getFullYear() === new Date().getFullYear() &&
              currentDate.getMonth() === lastMonthRemoved.getMonth()
            )
          : true)
      ) {
        dateList.push(currentDate.toISOString());
        currentDate.setUTCMonth(currentDate.getUTCMonth() + 1);
      }
    }

    return dateList;
  }, [filters.from, filters.to, isUTC00, isUTCPositive]);

  const setTimePeriod = (
    value: number,
    unit: "days" | "months" | "years",
    resetHours: boolean = true,
    btnSelected: TSelectedPeriod = "custom",
  ) => {
    const start = new Date();
    const end = new Date();
    setLastBtnSelected(btnSelected);

    if (resetHours) {
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
    }

    const timeSetters = {
      days: (date: Date, value: number) => date.setDate(date.getDate() - value),
      months: (date: Date, value: number) => date.setMonth(date.getMonth() - value),
      years: (date: Date, value: number) => date.setFullYear(date.getFullYear() - value),
    };

    timeSetters[unit](start, value);

    setStartDate(start);
    setEndDate(end);
  };

  const handleLast24Hours = () => setTimePeriod(1, "days", false, "24h");
  const handleLastWeekBtn = () => setTimePeriod(7, "days", true, "week");
  const handleLastMonthBtn = () => setTimePeriod(1, "months", true, "month");
  const handleLast6MonthsBtn = () => setTimePeriod(6, "months", true, "6months");
  const handleLastYearBtn = () => setTimePeriod(1, "years", true, "year");

  const handleOutsideClickDate = () => {
    setStartDate(startDateDisplayed);
    setEndDate(endDateDisplayed);
    setShowCalendar(false);
  };

  const handleChainSelection = (value: any) => {
    setSelectedTimeRange(value);
    const chainsSelected = value.map((item: any) => item.value);
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
    setOpenFilters(prev => {
      const newOpenFilters = !prev;

      if (!isDesktop) {
        document.body.style.overflow = newOpenFilters ? "hidden" : "unset";
        document.body.style.height = newOpenFilters ? "100%" : "auto";
      }

      return newOpenFilters;
    });
  };

  const applyFilters = () => {
    document.body.style.overflow = "unset";
    setOpenFilters(false);
  };

  const resetFilters = () => {
    setStartDate(yesterday);
    setEndDate(new Date());
    setStartDateDisplayed(yesterday);
    setEndDateDisplayed(new Date());
    setLastBtnSelected("24h");
    setFilters({
      from: yesterday?.toISOString(),
      to: new Date()?.toISOString(),
      timespan: "1h",
      sourceChain: [],
    });
    document.body.style.overflow = "unset";
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

  const buildSeriesForAllChains = (totalVolumeAndCountPerDay: IDataDetails[]) => {
    return [
      {
        name: "All Chains",
        data: totalVolumeAndCountPerDay.map(item => ({
          x: item.from,
          y: item.count,
          volume: item.volume,
          count: item.count,
          emitter_chain: item.emitter_chain,
          details: item.details,
        })),
        color: "#7abfff",
      },
    ];
  };

  useOutsideClick(dateContainerRef, handleOutsideClickDate);

  useEffect(() => {
    if (startDate && endDate) {
      const dateDifferenceInDays = calculateDateDifferenceInDays(startDate, endDate);

      const timespan =
        dateDifferenceInDays < 4
          ? "1h"
          : dateDifferenceInDays < 365
          ? "1d"
          : dateDifferenceInDays < 1095
          ? "1mo"
          : "1y";

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
      const seriesForAllChains = buildSeriesForAllChains(totalVolumeAndCountPerDay);

      const dateList = getDateList();
      const completeData = dateList.reduce((obj: TCompleteData, date: string) => {
        obj[date] = {
          x: date,
          y: 0,
          volume: 0,
          count: 0,
          emitter_chain: "allChains",
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
    if (!data || !dataAllChains) return;

    const dataByChain: { [key: string]: any[] } = {};
    const allDates: { [key: string]: boolean } = {};

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
          existingData ?? {
            x: date,
            y: 0,
            volume: 0,
            count: 0,
            emitter_chain: chain,
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

    const newSeries = Object.keys(dataByChain).map(chain => ({
      name: getChainName({
        network: currentNetwork,
        chainId: parseInt(chain),
      }),
      data: dataByChain[chain],
      color: colors[parseInt(chain)] ? colors[parseInt(chain)] : "#fff",
    }));

    const sumOfMessages = data.reduce((acc, item) => acc + item.count, 0);
    setMessagesNumber(sumOfMessages);

    if (showAllChains) {
      setSeries([...allChainsSerie, ...newSeries]);
    } else {
      setSeries(newSeries);
    }
  }, [
    dataAllChains,
    allChainsSerie,
    currentNetwork,
    data,
    filters.sourceChain,
    getDateList,
    showAllChains,
  ]);

  useEffect(() => {
    if (!isDesktop) {
      if (showCalendar) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "unset";
      }
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isDesktop, showCalendar]);

  return (
    <div className="chain-activity">
      {openFilters && <div className="chain-activity-bg" onClick={handleFiltersOpened} />}

      <h2 className="chain-activity-title">
        <AnalyticsIcon width={24} /> Transaction Activity
      </h2>

      <div className="chain-activity-chart">
        <div className="chain-activity-chart-top">
          <div className="chain-activity-chart-top-filters">
            <button onClick={handleFiltersOpened}>
              <FilterListIcon width={24} />
              Filters
            </button>
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
                          chainId: filters.sourceChain[0],
                        })
                      : `Custom (${filters.sourceChain.length})`
                    : "Select chains"
                }
                ariaLabel="Select Time Range"
                items={CHAIN_LIST}
                name="timeRange"
                onValueChange={(value: any) => handleChainSelection(value)}
                type="searchable"
                value={selectedTimeRange}
              />
            </div>

            <div className="chain-activity-chart-top-section" ref={dateContainerRef}>
              <button
                className="chain-activity-chart-top-section-btn"
                onClick={() => setShowCalendar(!showCalendar)}
              >
                <span>
                  {lastBtnSelected === "custom" ? (
                    <>
                      {startDateDisplayed &&
                        new Date(startDateDisplayed).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}{" "}
                      -{" "}
                      {endDateDisplayed &&
                        new Date(endDateDisplayed).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                    </>
                  ) : lastBtnSelected === "24h" ? (
                    "Last 24 hours"
                  ) : lastBtnSelected === "week" ? (
                    "Last week"
                  ) : lastBtnSelected === "month" ? (
                    "Last month"
                  ) : lastBtnSelected === "6months" ? (
                    "Last 6 months"
                  ) : lastBtnSelected === "year" ? (
                    "Last year"
                  ) : (
                    ""
                  )}
                </span>

                <ChevronDownIcon
                  style={{ transform: showCalendar ? "rotate(-180deg)" : "" }}
                  width={24}
                />
              </button>

              <div
                className={`chain-activity-chart-top-section-box ${
                  showCalendar ? "show-date" : ""
                }`}
              >
                <div
                  className={`chain-activity-chart-top-section-box-date-calendar ${
                    startDate === endDate
                      ? "chain-activity-chart-top-section-box-date-calendar-one-day-selected"
                      : ""
                  }`}
                >
                  <DatePicker
                    {...({ swapRange: true } as any)}
                    selected={startDate}
                    onChange={(dates: [Date | null, Date | null]) => {
                      const [start, end] = dates;
                      start?.setHours(0, 0, 0, 0);
                      end?.setHours(0, 0, 0, 0);

                      if (start?.getTime() !== end?.getTime()) {
                        setStartDate(start);
                        setEndDate(end);
                        setLastBtnSelected("custom");
                      }
                    }}
                    startDate={startDate}
                    endDate={endDate}
                    selectsRange
                    inline
                    maxDate={new Date()}
                    monthsShown={isDesktop ? 2 : 1}
                    showMonthDropdown
                  />

                  <div className="chain-activity-chart-top-section-box-date-calendar-btns">
                    <button
                      className="done-btn"
                      onClick={() => setShowCalendar(false)}
                      disabled={!startDate || !endDate}
                    >
                      Done
                    </button>
                  </div>
                </div>

                <div className="chain-activity-chart-top-section-box-date-selector">
                  <div>
                    <button
                      className={`btn ${lastBtnSelected === "24h" ? "active" : ""}`}
                      onClick={handleLast24Hours}
                    >
                      Last 24 hours
                    </button>
                    <button
                      className={`btn ${lastBtnSelected === "week" ? "active" : ""}`}
                      onClick={handleLastWeekBtn}
                    >
                      Last week
                    </button>
                    <button
                      className={`btn ${lastBtnSelected === "month" ? "active" : ""}`}
                      onClick={handleLastMonthBtn}
                    >
                      Last month
                    </button>
                    <button
                      className={`btn ${lastBtnSelected === "6months" ? "active" : ""}`}
                      onClick={handleLast6MonthsBtn}
                    >
                      Last 6 months
                    </button>
                    <button
                      className={`btn ${lastBtnSelected === "year" ? "active" : ""}`}
                      onClick={handleLastYearBtn}
                    >
                      Last year
                    </button>
                    <button className={`btn ${lastBtnSelected === "custom" ? "active" : ""}`}>
                      Custom
                    </button>
                  </div>
                </div>
              </div>
            </div>

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
                isLoading ||
                isFetching ||
                isLoadingAllChains ||
                isFetchingAllChains ||
                isError ||
                isErrorAllChains
                  ? "hidden"
                  : ""
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

        {isLoading || isFetching || isLoadingAllChains || isFetchingAllChains ? (
          <Loader />
        ) : isError || isErrorAllChains ? (
          <ErrorPlaceholder errorType="chart" />
        ) : (
          <ReactApexChart
            series={series}
            type="area"
            height={isDesktop ? 400 : 300}
            options={{
              chart: {
                toolbar: { show: false },
                zoom: { enabled: false },
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
                  top: isDesktop ? 50 : 0,
                },
              },
              stroke: {
                curve: "straight",
                width: 2,
                dashArray: 0,
              },
              fill: {
                type: "solid",
                opacity: 0.05,
              },
              legend: {
                show: isDesktop,
                fontFamily: "Roboto",
                fontSize: "14px",
                fontWeight: 400,
                formatter: function (seriesName, opts) {
                  return seriesName.toUpperCase();
                },
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
                stepSize: 1,
                labels: {
                  // datetimeUTC: isUTC00,
                  datetimeFormatter: {
                    hour: "HH:mm",
                    day: "dd MMM",
                    month: "MMM 'yy",
                    year: "yyyy",
                  },
                  datetimeUTC: true,
                  hideOverlappingLabels: true,
                  offsetX: 0,
                  style: {
                    colors: "var(--color-gray-400)",
                    fontFamily: "Roboto Mono, Roboto, sans-serif",
                    fontSize: "12px",
                    fontWeight: 400,
                  },
                },
                // tickPlacement: "on",
                type: "datetime",

                tooltip: { enabled: false },
              },
              yaxis: {
                labels: {
                  // minWidth: 30,
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
                shared: true,
                intersect: false,
                custom: ({ series, seriesIndex, dataPointIndex, w }) => {
                  const data = w.config.series[seriesIndex].data[dataPointIndex];

                  const allDataForDate = w.config.series.map(
                    (serie: any) => serie.data[dataPointIndex],
                  );

                  const totalMessages = allDataForDate.reduce(
                    (acc: any, item: any) => acc + item.y,
                    0,
                  );

                  const totalVolume = allDataForDate.reduce(
                    (acc: any, item: any) => acc + item.volume,
                    0,
                  );

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
                      <p class="chain-activity-chart-tooltip-total-msg">Total Messages: ${totalMessages}</p>
                      <p class="chain-activity-chart-tooltip-chains">Chains:</p>
                      <div class="chain-activity-chart-tooltip-container">
                        ${allDataForDate
                          .map((item: any, index: number) => {
                            return `
                            <div class="chain-activity-chart-tooltip-container-each-msg">
                                <div class="chain-activity-chart-tooltip-container-each-msg-icon" style="background-color: ${
                                  w.config.series[index].color
                                }">
                                </div>
                                <div>
                                  ${
                                    item.emitter_chain === "allChains"
                                      ? "All Chains"
                                      : getChainName({
                                          network: currentNetwork,
                                          chainId: parseInt(item.emitter_chain),
                                        })
                                  }:
                                </div>
                                <div class="chain-activity-chart-tooltip-container-each-msg-number">
                                  ${formatNumber(item.y)}
                                </div>
                                </div>

                                ${
                                  item?.details?.length > 0 &&
                                  filters.sourceChain.every(chain => chain === "All Chains")
                                    ? `
                                   
                                      ${item.details
                                        .map((detail: any, i: number) => {
                                          if (i > 9) return;

                                          if (i > 8) {
                                            return `
                                          <div class="chain-activity-chart-tooltip-container-each-msg">
                                          <div class="chain-activity-chart-tooltip-container-each-msg-icon" style="background-color: #999999">
                                          </div>
                                          <div>
                                            Others:
                                          </div>
                                          <div class="chain-activity-chart-tooltip-container-each-msg-number">
                                            ${formatNumber(
                                              item.details
                                                .slice(i)
                                                .reduce(
                                                  (acc: number, item: any) => acc + item.count,
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
                                        colors[parseInt(detail.emitter_chain)]
                                          ? colors[parseInt(detail.emitter_chain)]
                                          : "#fff"
                                      }">
                                      </div>
                                      <div>
                                        ${getChainName({
                                          network: currentNetwork,
                                          chainId: parseInt(detail.emitter_chain),
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
                x: {
                  format: "dd MMM yyyy",
                },
                y: {
                  formatter: (value, { seriesIndex, dataPointIndex, w }) => {
                    const data = w.config.series[seriesIndex].data[dataPointIndex];
                    return `Count: ${value}<br>Volume: ${data.volume}`;
                  },
                },
              },
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ChainActivity;
