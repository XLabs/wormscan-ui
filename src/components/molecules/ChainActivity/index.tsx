import { useCallback, useEffect, useRef, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { useQuery } from "react-query";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addYears, startOfHour } from "date-fns";
import { useEnvironment } from "src/context/EnvironmentContext";
import { BlockchainIcon, Loader, Select, Tooltip } from "src/components/atoms";
import { ErrorPlaceholder } from "src/components/molecules";
import { formatterYAxis } from "src/utils/apexChartUtils";
import { getChainName } from "src/utils/wormhole";
import { ChainId } from "src/api";
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
import "./styles.scss";

// https://api.staging.wormscan.io/api/v1/x-chain-activity/tops?from=2024-01-02T00:00:00Z&to=2024-01-25T00:00:00Z&timespan=1d&sourceChain=1,28,21&targetChain=&appId=PORTAL_TOKEN_BRIDGE
// timespan = 1h, 1d, 1mo, 1y

interface IColors {
  [key: number]: string;
}

interface IAccumulator {
  [key: string]: {
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
  };
}

interface Data {
  x: string;
  y: number;
  volume: number;
  count: number;
  emitter_chain: string;
}

type TCompleteData = Record<string, Data>;

const colors: IColors = {
  0: "#FD8058",
  1: "#11BBF6",
  2: "#C1BBF6",
  3: "#DDE95A",
  4: "#E35F77",
  5: "#AEC6CF",
  6: "#FDFD96",
  7: "#FFB7C5",
  8: "#77DD77",
  9: "#B39EB5",
  10: "#FF6961",
  11: "#CB99C9",
  12: "#FFD1DC",
  13: "#FFB347",
  14: "#77AADD",
  15: "#CFCFC4",
  16: "#836953",
  17: "#779ECB",
  18: "#03C03C",
  19: "#F49AC2",
  20: "#DEA5A4",
  21: "#B0BBF6",
  22: "#ED8058",
  23: "#CDE95A",
  24: "#D35F77",
  26: "#AFC6CF",
  28: "#F0FD96",
  29: "#70DD77",
  30: "#B09EB5",
  32: "#F06961",
  34: "#CA99C9",
  35: "#F0D1DC",
  36: "#F0B347",
  3104: "#70AADD",
  4001: "#C0CFC4",
  4002: "#836953",
  4007: "#769ECB",
  10002: "#00C03C",
  10003: "#F09AC2",
  10004: "#D0A5A4",
  10005: "#B1BBF6",
  10006: "#DD8058",
  10007: "#CDE85A",
};

function startOfDayUTC(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function startOfMonthUTC(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function startOfYearUTC(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
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
  const [startDate999, setStartDate999] = useState(yesterday);
  const [endDate999, setEndDate999] = useState(new Date());

  const [showAllChains, setShowAllChains] = useState(true);
  const [allChainsChecked, setAllChainsChecked] = useState(true);
  const [allChainsSerie, setAllChainsSerie] = useState([]);
  const [series, setSeries] = useState([]);

  const [lastBtnSelected, setLastBtnSelected] = useState("");

  const { environment } = useEnvironment();
  const currentNetwork = environment.network;
  const orderedChains = currentNetwork === "MAINNET" ? ChainFilterMainnet : ChainFilterTestnet;

  const RANGE_LIST =
    orderedChains.map((value, i) => ({
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

  RANGE_LIST.unshift({
    label: "All Chains",
    value: "All Chains",
    icon: <GlobeIcon width={24} style={{ color: "#fff" }} />,
  });

  const [filters, setFilters] = useState({
    from: startDate?.toISOString(),
    to: endDate?.toISOString(),
    timespan: "1h",
    sourceChain: [],
  });

  const isUTC00 = new Date().getTimezoneOffset() === 0;
  const isUTCPositive = new Date().getTimezoneOffset() < 0;

  const {
    data: allChainsData,
    isError: isError2,
    isLoading: isLoading2,
    isFetching: isFetching2,
  } = useQuery(["getChainActivity", filters.from, filters.to], () =>
    getClient().guardianNetwork.getChainActivity({
      from: filters.from,
      to: filters.to,
      timespan: filters.timespan,
      sourceChain: [],
    }),
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

  const calculateDateDifferenceInDays = (startDate: Date, endDate: Date) => {
    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    return endDate && startDate
      ? Math.floor((endDate.getTime() - startDate.getTime()) / millisecondsPerDay)
      : 0;
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

  useEffect(() => {
    if (!showAllChains) {
      setSeries([]);
    }

    if (allChainsData) {
      const groupedByDate = allChainsData.reduce((acc: IAccumulator, curr) => {
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
        if (index === -1) {
          acc[key].details.push({
            emitter_chain: curr.emitter_chain,
            volume: curr.volume,
            count: curr.count,
          });
        } else {
          acc[key].details.splice(index, 0, {
            emitter_chain: curr.emitter_chain,
            volume: curr.volume,
            count: curr.count,
          });
        }

        return acc;
      }, {});

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
            details: item.details.map(detail => ({
              emitter_chain: detail.emitter_chain,
              volume: detail.volume,
              count: detail.count,
            })),
          })),
          color: "#7abfff",
        },
      ];

      const dateList = getDateList();
      // When there were no movements in that time range, the endpoint does not bring
      // information for that chain, so we need to add it manually
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

      // order by date
      seriesForAllChains[0].data.sort((a, b) => new Date(a.x).getTime() - new Date(b.x).getTime());

      setAllChainsSerie(seriesForAllChains);
    }
  }, [allChainsData, filters.sourceChain, getDateList, showAllChains]);

  const setTimePeriod = (
    value: number,
    unit: "days" | "months" | "years",
    resetHours: boolean = true,
    btnSelected: string = "",
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
  const handleLast3MonthsBtn = () => setTimePeriod(3, "months", true, "3months");
  const handleLast6MonthsBtn = () => setTimePeriod(6, "months", true, "6months");
  const handleLastYearBtn = () => setTimePeriod(1, "years", true, "year");

  const handleDoneBtn = () => {
    if (!startDate || !endDate) return;

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

    setStartDate999(startDate);
    setEndDate999(endDate);

    setFilters(prevFilters => ({
      ...prevFilters,
      from: newFrom.toISOString(),
      to: newTo.toISOString(),
      timespan: timespan,
    }));

    setShowCalendar(false);
  };

  const handleOutsideClickDate = () => {
    setStartDate(new Date(filters.from));
    setEndDate(new Date(filters.to));
    setShowCalendar(false);

    const dateDifferenceInDays = calculateDateDifferenceInDays(
      new Date(filters.from),
      new Date(filters.to),
    );

    setLastBtnSelected(
      dateDifferenceInDays === 1
        ? "24h"
        : dateDifferenceInDays === 7
        ? "week"
        : dateDifferenceInDays > 28 && dateDifferenceInDays < 32
        ? "month"
        : dateDifferenceInDays > 90 && dateDifferenceInDays < 93
        ? "3months"
        : dateDifferenceInDays > 180 && dateDifferenceInDays < 185
        ? "6months"
        : dateDifferenceInDays > 360 && dateDifferenceInDays < 366
        ? "year"
        : "",
    );
  };

  useOutsideClick(dateContainerRef, handleOutsideClickDate);

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

  useEffect(() => {
    if (!data || !allChainsData) return;

    const dataByChain: { [key: string]: any[] } = {};
    const allDates: { [key: string]: boolean } = {};

    // Group by emitter_chain and extract all dates
    data.forEach(item => {
      // formatDate to add milliseconds and match dates when using .toISOString()
      const formatDate = item.from.slice(0, -1) + ".000Z";
      // const formatDate = new Date(item.from).toISOString();

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

    if (showAllChains) {
      setSeries([...allChainsSerie, ...newSeries]);
    } else {
      setSeries(newSeries);
    }
  }, [
    allChainsData,
    allChainsSerie,
    currentNetwork,
    data,
    filters.sourceChain,
    getDateList,
    showAllChains,
  ]);

  const [selectedTimeRange, setSelectedTimeRange] = useState(RANGE_LIST[0]);

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

  const [openFilters, setOpenFilters] = useState(false);

  const handleFiltersOpened = () => {
    setOpenFilters(prev => !prev);
  };

  return (
    <div className="chain-activity">
      {openFilters && (
        <div
          className="chain-activity-bg"
          onClick={() => {
            setOpenFilters(false);
          }}
        />
      )}

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
                className="cross-chain-filters-select"
                items={RANGE_LIST}
                name="timeRange"
                onValueChange={(value: any) => handleChainSelection(value)}
                type="searchable"
                value={selectedTimeRange}
              />
            </div>

            <div className="chain-activity-chart-top-section" ref={dateContainerRef}>
              <button
                className="chain-activity-chart-top-section-btn"
                onClick={() => setShowCalendar(true)}
              >
                <span>
                  {startDate999 &&
                    new Date(startDate999).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  -
                  {endDate999 &&
                    new Date(endDate999).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
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
                      setStartDate(start);
                      setEndDate(end);
                    }}
                    startDate={startDate}
                    endDate={endDate}
                    selectsRange
                    inline
                    maxDate={new Date()}
                    monthsShown={isDesktop ? 2 : 1}
                    showMonthDropdown
                  />

                  <div>
                    <button
                      className="done-btn"
                      onClick={handleDoneBtn}
                      disabled={!startDate || !endDate}
                    >
                      Apply
                    </button>

                    <button className="close-btn" onClick={() => setShowCalendar(false)}>
                      Close
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
                      className={`btn ${lastBtnSelected === "3months" ? "active" : ""}`}
                      onClick={handleLast3MonthsBtn}
                    >
                      Last 3 months
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
                  </div>
                </div>
              </div>
            </div>

            <div className="chain-activity-chart-top-legends">
              <div className="chain-activity-chart-top-legends-container">
                <span>Messages: </span>
                <p>2,435,958</p>
              </div>
            </div>
          </div>
        </div>
        {isLoading || isFetching || isLoading2 || isFetching2 ? (
          <Loader />
        ) : isError || isError2 ? (
          <ErrorPlaceholder errorType="chart" />
        ) : (
          <ReactApexChart
            series={series}
            type="area"
            height={400}
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
                  top: 50,
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
                axisTicks: { show: true },
                tickAmount: 13,
                labels: {
                  // datetimeUTC: isUTC00,
                  datetimeUTC: true,
                  offsetX: 0,
                  style: {
                    colors: "var(--color-gray-400)",
                    fontFamily: "IBM Plex Sans",
                    fontSize: "12px",
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
                      <p class="chain-activity-chart-tooltip-total-msg">TOTAL MESSAGES: ${totalMessages}</p>
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
                                          console.log(index > 1, index);
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
