import { useCallback, useEffect, useRef, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { useQuery } from "react-query";
import "react-datepicker/dist/react-datepicker.css";
import { useEnvironment } from "src/context/EnvironmentContext";
import {
  BlockchainIcon,
  Counter,
  Fullscreenable,
  Loader,
  Select,
  ToggleGroup,
} from "src/components/atoms";
import { ErrorPlaceholder, WormholeScanBrand } from "src/components/molecules";
import { changePathOpacity, formatterYAxis, updatePathStyles } from "src/utils/apexChartUtils";
import { getChainName } from "src/utils/wormhole";
import { ChainId, chainToChainId } from "@wormhole-foundation/sdk";
import { getClient } from "src/api/Client";
import { useWindowSize, useLockBodyScroll } from "src/utils/hooks";
import { formatNumber, numberToSuffix } from "src/utils/number";
import {
  ActivityIcon,
  AnalyticsIcon,
  CrossIcon,
  FilterListIcon,
  FullscreenIcon,
  GlobeIcon,
  LinearIcon,
  LogarithmicIcon,
} from "src/icons/generic";
import { IChainActivity, IChainActivityInput } from "src/api/guardian-network/types";
import { calculateDateDifferenceInDays, startOfDayUTC, startOfMonthUTC } from "src/utils/date";
import { ChainFilterMainnet, ChainFilterTestnet, PROTOCOL_LIST } from "src/utils/filterUtils";
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
import analytics from "src/analytics";

const TYPE_CHART_LIST = [
  { label: <ActivityIcon width={24} />, value: "area", ariaLabel: "Area" },
  { label: <AnalyticsIcon width={24} />, value: "bar", ariaLabel: "Bar" },
];

const SCALE_CHART_LIST = [
  { label: <LogarithmicIcon width={22} />, value: "logarithmic", ariaLabel: "Logarithmic" },
  { label: <LinearIcon width={22} />, value: "linear", ariaLabel: "Linear" },
];

const METRIC_CHART_LIST = [
  { label: "Volume", value: "volume", ariaLabel: "Volume" },
  { label: "Transfers", value: "transactions", ariaLabel: "Transfers" },
];

const ChainActivity = () => {
  const { width } = useWindowSize();
  const isTablet = width >= BREAKPOINTS.tablet;
  const isDesktop = width >= BREAKPOINTS.desktop;
  const isBigDesktop = width >= BREAKPOINTS.bigDesktop;

  const chartRef = useRef(null);
  const [chartSelected, setChartSelected] = useState<"area" | "bar">("area");
  const [scaleSelected, setScaleSelected] = useState<"linear" | "logarithmic">("logarithmic");
  const [metricSelected, setMetricSelected] = useState<"volume" | "transactions">("volume");

  const initialDataDate = new Date(new Date().setFullYear(new Date().getFullYear() - 1));

  const [startDate, setStartDate] = useState(initialDataDate);
  const [endDate, setEndDate] = useState(new Date());
  const [startDateDisplayed, setStartDateDisplayed] = useState(initialDataDate);
  const [endDateDisplayed, setEndDateDisplayed] = useState(new Date());

  const [showAllSourceChains, setShowAllSourceChains] = useState(true);
  const [showAllTargetChains, setShowAllTargetChains] = useState(true);
  const [allChainsSerie, setAllChainsSerie] = useState([]);
  const [series, setSeries] = useState([]);
  const [messagesNumber, setMessagesNumber] = useState(0);
  const [allMessagesNumber, setAllMessagesNumber] = useState(0);
  const [volumeNumber, setVolumeNumber] = useState(0);
  const [allVolumeNumber, setAllVolumeNumber] = useState(0);

  const [lastBtnSelected, setLastBtnSelected] = useState<TSelectedPeriod>("year");
  const [openFilters, setOpenFilters] = useState(false);

  useLockBodyScroll({
    isLocked: !isDesktop && openFilters,
    scrollableClasses: ["select__option", "show-date"],
  });

  const { environment } = useEnvironment();
  const currentNetwork = environment.network;
  const orderedChains = currentNetwork === "Mainnet" ? ChainFilterMainnet : ChainFilterTestnet;
  const ALL_SOURCE_CHAINS = {
    label: "All Chains",
    value: "All Chains",
    icon: <GlobeIcon width={24} style={{ color: "#fff" }} />,
    showMinus: !showAllSourceChains,
    disabled: false,
  };
  const ALL_TARGET_CHAINS = {
    label: "All Chains",
    value: "All Chains",
    icon: <GlobeIcon width={24} style={{ color: "#fff" }} />,
    showMinus: !showAllTargetChains,
    disabled: false,
  };

  const [sourceChainListSelected, setSourceChainListSelected] = useState([ALL_SOURCE_CHAINS]);
  const [targetChainListSelected, setTargetChainListSelected] = useState([ALL_TARGET_CHAINS]);

  const SOURCE_CHAIN_LIST = [
    ALL_SOURCE_CHAINS,
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
        sourceChainListSelected.length >= 10 &&
        !sourceChainListSelected.some(item => +item.value === chainId),
    })),
  ];
  const TARGET_CHAIN_LIST = [
    ALL_TARGET_CHAINS,
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
        targetChainListSelected.length >= 10 &&
        !targetChainListSelected.some(item => +item.value === chainId),
    })),
  ];

  const [filters, setFilters] = useState<IChainActivityInput>({
    from: startDate?.toISOString(),
    to: endDate?.toISOString(),
    timespan: "1mo",
    sourceChain: [],
    targetChain: [],
    appId: "",
  });

  const isUTC00 = new Date().getTimezoneOffset() === 0;
  const isUTCPositive = new Date().getTimezoneOffset() < 0;

  const tickAmount =
    allChainsSerie?.[0]?.data?.length > 0
      ? isBigDesktop
        ? Math.min(allChainsSerie[0].data.length, 18)
        : isTablet
        ? Math.min(allChainsSerie[0].data.length, 10)
        : 4
      : null;

  const lastTrackedObjectRef = useRef(null);

  const trackAnalytics = () => {
    const objectToSend = {
      network: currentNetwork,
      selectedType: metricSelected,
      selectedTimeRange: lastBtnSelected.toUpperCase(),
      chain:
        (filters.sourceChain?.length > 0
          ? filters.sourceChain
              .map(chain =>
                getChainName({
                  network: currentNetwork,
                  chainId: +chain as ChainId,
                }),
              )
              .join(", ")
          : "Unset") +
        (filters.targetChain?.length > 0
          ? " -> " +
            filters.targetChain
              .map(chain =>
                getChainName({
                  network: currentNetwork,
                  chainId: +chain as ChainId,
                }),
              )
              .join(", ")
          : ""),
    };

    // Check if the new objectToSend is different from the last tracked object
    if (JSON.stringify(objectToSend) !== JSON.stringify(lastTrackedObjectRef.current)) {
      analytics.track("chainActivity", objectToSend);
      lastTrackedObjectRef.current = objectToSend;
    }
  };

  const {
    data: dataAllChains,
    isError: isErrorAllChains,
    isFetching: isFetchingAllChains,
  } = useQuery(
    ["getChainActivity", filters.from, filters.to, filters.targetChain, filters.appId],
    () => {
      trackAnalytics();

      return getClient().guardianNetwork.getChainActivity({
        from: filters.from,
        to: filters.to,
        timespan: filters.timespan,
        sourceChain: [],
        targetChain: filters.targetChain,
        appId: filters.appId,
      });
    },
  );

  const { data, isError, isFetching } = useQuery(["getChainActivity", filters], () => {
    if (filters?.sourceChain?.length === 0) {
      return Promise.resolve([]);
    }

    trackAnalytics();

    return getClient().guardianNetwork.getChainActivity({
      from: filters.from,
      to: filters.to,
      timespan: filters.timespan,
      sourceChain: filters.sourceChain,
      targetChain: filters.targetChain,
      appId: filters.appId,
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

  const handleChainSelection = (value: IChainList[], type: "source" | "target") => {
    if (type === "source") {
      if (
        value.length === 0 &&
        sourceChainListSelected.length === 1 &&
        sourceChainListSelected[0].value === "All Chains"
      ) {
        return;
      }

      const lastChainSelected = value?.[value.length - 1]?.value;

      if (value.length === 0 || lastChainSelected === "All Chains") {
        value = [SOURCE_CHAIN_LIST[0]];
      } else {
        value = value.filter(item => item.value !== "All Chains");
      }

      setSourceChainListSelected(value);
      const chainsSelected = value.map((item: IChainList) => item.value);
      const chainsSelectedWithoutAll = chainsSelected.filter(
        (chain: string) => chain !== "All Chains",
      );
      const isAllChainsSelected = chainsSelected.includes("All Chains");

      if (isAllChainsSelected) {
        setShowAllSourceChains(true);
      } else {
        setShowAllSourceChains(false);
      }

      setFilters({
        ...filters,
        sourceChain: chainsSelectedWithoutAll,
      });
    } else if (type === "target") {
      if (
        value.length === 0 &&
        targetChainListSelected.length === 1 &&
        targetChainListSelected[0].value === "All Chains"
      ) {
        return;
      }

      const lastChainSelected = value?.[value.length - 1]?.value;

      if (value.length === 0 || lastChainSelected === "All Chains") {
        value = [TARGET_CHAIN_LIST[0]];
      } else {
        value = value.filter(item => item.value !== "All Chains");
      }

      setTargetChainListSelected(value);
      const chainsSelected = value.map((item: IChainList) => item.value);
      const chainsSelectedWithoutAll = chainsSelected.filter(
        (chain: string) => chain !== "All Chains",
      );
      const isAllChainsSelected = chainsSelected.includes("All Chains");

      if (isAllChainsSelected) {
        setShowAllTargetChains(true);
      } else {
        setShowAllTargetChains(false);
      }

      setFilters({
        ...filters,
        targetChain: chainsSelectedWithoutAll,
      });
    }
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
    setLastBtnSelected("year");
    setShowAllSourceChains(true);
    setShowAllTargetChains(true);
    setSourceChainListSelected([ALL_SOURCE_CHAINS]);
    setTargetChainListSelected([ALL_TARGET_CHAINS]);
    setFilters({
      from: initialDataDate?.toISOString(),
      to: new Date()?.toISOString(),
      timespan: "1mo",
      sourceChain: [],
      targetChain: [],
      appId: "",
    });
    setOpenFilters(false);
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
          acc[key].volume += curr.volume / 10 ** 8;
          acc[key].count += curr.count;

          const index =
            metricSelected === "transactions"
              ? acc[key].details.findIndex(detail => detail.count < curr.count)
              : acc[key].details.findIndex(detail => detail.volume < curr.volume / 10 ** 8);
          const detail = {
            emitter_chain: curr.emitter_chain,
            volume: curr.volume / 10 ** 8,
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

      const groupedByDate = groupDataByDate(dataAllChains);
      const totalVolumeAndCountPerDay = Object.values(groupedByDate);
      const seriesForAllChains = [
        {
          name: "All Chains",
          data: totalVolumeAndCountPerDay.map(item => ({
            x: item.from,
            y: metricSelected === "transactions" ? item.count : item.volume,
            volume: item.volume,
            count: item.count,
            emitter_chain: item.emitter_chain,
            details: item.details,
            color: "var(--color-lime)",
          })),
          color: "var(--color-lime)",
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
      const totalVolume = dataAllChains.reduce((acc, item) => acc + item.volume, 0);

      setAllMessagesNumber(totalMessages);
      setAllVolumeNumber(totalVolume / 10 ** 8);
      setAllChainsSerie(seriesForAllChains);
    }
  }, [dataAllChains, getDateList, metricSelected]);

  useEffect(() => {
    if (!data) return;

    const dataByChain: { [key: string]: any[] } = {};
    const allDates: { [key: string]: boolean } = {};
    const chainIndices: { [key: string]: number } = {};
    sourceChainListSelected.forEach((chain: IChainList, i: number) => {
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
        y: metricSelected === "transactions" ? item.count : item.volume / 10 ** 8,
        volume: item.volume / 10 ** 8,
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

    const sumOfVolume = data.reduce((acc, item) => acc + item.volume, 0);
    setVolumeNumber(sumOfVolume / 10 ** 8);

    if (showAllSourceChains) {
      setSeries([...allChainsSerie, ...newSeries]);
    } else {
      setSeries(newSeries);
    }
  }, [
    allChainsSerie,
    sourceChainListSelected,
    currentNetwork,
    data,
    filters.sourceChain,
    getDateList,
    metricSelected,
    showAllSourceChains,
  ]);

  const fullscreenBtnRef = useRef(null);

  return (
    <Fullscreenable className="chain-activity" buttonRef={fullscreenBtnRef}>
      {openFilters && <div className="chain-activity-bg" onClick={handleFiltersOpened} />}

      <h2 className="chain-activity-title">
        <AnalyticsIcon width={24} /> Chains Activity{" "}
        <div className="chain-activity-title-fullscreen" ref={fullscreenBtnRef}>
          <FullscreenIcon width={20} />
        </div>
      </h2>

      <div className="chain-activity-chart" ref={chartRef}>
        <div className="chain-activity-chart-top">
          <button
            className="chain-activity-chart-top-mobile-filters-btn"
            onClick={handleFiltersOpened}
          >
            <FilterListIcon width={24} />
            <span className="chain-activity-chart-top-mobile-filters-btn-txt">Filters</span>

            {filters.sourceChain.length > 0 &&
            filters.targetChain.length > 0 &&
            filters.appId !== "" ? (
              <Counter>3</Counter>
            ) : filters.sourceChain.length > 0 && filters.targetChain.length > 0 ? (
              <Counter>2</Counter>
            ) : filters.sourceChain.length > 0 ? (
              <Counter>1</Counter>
            ) : (
              ""
            )}
          </button>

          <div className={`chain-activity-chart-top-filters ${openFilters ? "open" : ""}`}>
            <div className="chain-activity-chart-top-filters-title">
              <p>Filters</p>
              <button onClick={handleFiltersOpened}>
                <CrossIcon width={24} />
              </button>
            </div>

            <Select
              ariaLabel="Select Chains"
              className="chain-activity-chart-top-filters-section"
              items={SOURCE_CHAIN_LIST}
              menuFixed={!isDesktop}
              menuListStyles={{ maxHeight: isDesktop ? 264 : 180 }}
              menuPortalStyles={{ zIndex: 100 }}
              name="sourceChain"
              onValueChange={(value: any) => handleChainSelection(value, "source")}
              text={
                <div className="chain-activity-chart-top-filters-section-text">
                  {filters.sourceChain.length > 0 && (
                    <Counter>{filters.sourceChain.length}</Counter>
                  )}
                  Source <span className="hidden-desktop-1180">chain</span>
                </div>
              }
              type="searchable"
              value={sourceChainListSelected}
            />

            <Select
              ariaLabel="Select Chains"
              className="chain-activity-chart-top-filters-section"
              items={TARGET_CHAIN_LIST}
              menuFixed={!isDesktop}
              menuListStyles={{ maxHeight: isDesktop ? 264 : 180 }}
              menuPortalStyles={{ zIndex: 100 }}
              name="targetChain"
              onValueChange={(value: any) => handleChainSelection(value, "target")}
              text={
                <div className="chain-activity-chart-top-filters-section-text">
                  {filters?.targetChain?.length > 0 && (
                    <Counter>{filters.targetChain.length}</Counter>
                  )}
                  Target <span className="hidden-desktop-1180">chain</span>
                </div>
              }
              type="searchable"
              value={targetChainListSelected}
            />

            {/*
              TODO: Implement this when the endpoint supports all protocols
            
            <Select
              ariaLabel="Select Protocol"
              className="chain-activity-chart-top-filters-section"
              controlStyles={{ minWidth: 256 }}
              isMulti={false}
              items={PROTOCOL_LIST}
              menuFixed={!isDesktop}
              menuListStyles={{ maxHeight: isDesktop ? 264 : 180 }}
              menuPortalStyles={{ zIndex: 100 }}
              name="protocol"
              onValueChange={(value: any) =>
                setFilters({
                  ...filters,
                  appId: value?.value === filters.appId ? "" : value.value,
                })
              }
              text={
                <div className="chain-activity-chart-top-filters-section-text">
                  {filters?.appId && <Counter>1</Counter>}
                  Protocol
                </div>
              }
              type="searchable"
              value={{
                label: filters.appId,
                value: filters.appId,
              }}
            /> */}

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

            <div className="chain-activity-chart-top-filters-buttons">
              <button className="apply-btn" onClick={applyFilters}>
                Apply Filters
              </button>

              <button className="reset-btn" onClick={resetFilters}>
                Reset Filters
              </button>
            </div>

            <ToggleGroup
              ariaLabel="Select type"
              className="chain-activity-chart-top-filters-toggle-metric"
              items={METRIC_CHART_LIST}
              onValueChange={value => setMetricSelected(value)}
              value={metricSelected}
            />

            <div
              className={`chain-activity-chart-top-filters-legends ${
                isFetching || isFetchingAllChains || isError || isErrorAllChains ? "hidden" : ""
              }`}
            >
              <div className="chain-activity-chart-top-filters-legends-container">
                <span>Source: </span>

                {metricSelected === "transactions" ? (
                  <div className="chain-activity-chart-top-filters-legends-container-total">
                    <span>
                      {lastBtnSelected === "24h"
                        ? "Daily"
                        : lastBtnSelected === "week"
                        ? "Weekly"
                        : lastBtnSelected === "month"
                        ? "Monthly"
                        : lastBtnSelected === "year"
                        ? "Yearly"
                        : lastBtnSelected === "custom"
                        ? ""
                        : "All Time"}{" "}
                      Total Transfers:{" "}
                    </span>
                    <p>
                      {showAllSourceChains
                        ? formatNumber(allMessagesNumber, 0)
                        : formatNumber(messagesNumber, 0)}
                    </p>
                  </div>
                ) : (
                  <div className="chain-activity-chart-top-filters-legends-container-total">
                    <span>
                      {lastBtnSelected === "24h"
                        ? "Daily"
                        : lastBtnSelected === "week"
                        ? "Weekly"
                        : lastBtnSelected === "month"
                        ? "Monthly"
                        : lastBtnSelected === "year"
                        ? "Yearly"
                        : lastBtnSelected === "custom"
                        ? ""
                        : "All Time"}{" "}
                      Total Volume:{" "}
                    </span>
                    <p>
                      $
                      {showAllSourceChains
                        ? formatNumber(allVolumeNumber, 0)
                        : formatNumber(volumeNumber, 0)}
                    </p>
                  </div>
                )}
              </div>

              <div className="chain-activity-chart-top-filters-legends-target">
                <span>Target: </span>
                <div className="chain-activity-chart-top-filters-legends-target-chains">
                  {filters?.targetChain?.length > 0
                    ? filters.targetChain.map(chain => {
                        return (
                          <div key={chain}>
                            {getChainName({
                              network: currentNetwork,
                              chainId: +chain as ChainId,
                            })}
                          </div>
                        );
                      })
                    : "All Chains"}
                </div>
              </div>
            </div>
          </div>

          <div className="chain-activity-chart-top-filters-design">
            <ToggleGroup
              ariaLabel="Select type"
              className="chain-activity-chart-top-filters-design-toggle-type"
              items={TYPE_CHART_LIST}
              onValueChange={value => setChartSelected(value)}
              value={chartSelected}
            />

            {chartSelected === "area" && (
              <ToggleGroup
                ariaLabel="Select scale"
                className="chain-activity-chart-scale"
                items={SCALE_CHART_LIST}
                onValueChange={value => setScaleSelected(value)}
                value={scaleSelected}
              />
            )}
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
                    top: isDesktop ? 96 : 0,
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
                  offsetY: 32,
                  offsetX: 40,
                  horizontalAlign: "left",
                  showForSingleSeries: true,
                  itemMargin: {
                    horizontal: 0,
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
                  logarithmic: scaleSelected === "logarithmic" && chartSelected === "area",
                  forceNiceScale: scaleSelected === "logarithmic" && chartSelected === "area",
                },
                tooltip: {
                  custom: ({ series, seriesIndex, dataPointIndex, w }) => {
                    const data = w.config.series[seriesIndex].data[dataPointIndex];

                    const allDataForDate = w.config.series
                      .map((serie: any) => serie.data[dataPointIndex])
                      .sort((a: any, b: any) => b.y - a.y);

                    const totalY = allChainsSerie[0].data[dataPointIndex]?.y || 0;

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
                          showAllSourceChains
                            ? "<div class='chain-activity-chart-tooltip-container-each-msg-icon' style='background-color: var(--color-lime)'></div>"
                            : ""
                        }
                    
                        ${
                          metricSelected === "transactions"
                            ? `Transfers Sum: <span>${formatNumber(totalY, 0)}</span>`
                            : `Volume Sum: <span>$${
                                isDesktop ? formatNumber(totalY, 0) : numberToSuffix(totalY)
                              }</span>`
                        }
                      </div>
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
                                          ${
                                            metricSelected === "transactions"
                                              ? formatNumber(item?.y)
                                              : `$${numberToSuffix(item?.volume)}`
                                          }
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
                                              ${
                                                metricSelected === "transactions"
                                                  ? formatNumber(
                                                      item?.details
                                                        .slice(i)
                                                        .reduce(
                                                          (acc: number, item: any) =>
                                                            acc + item?.count,
                                                          0,
                                                        ),
                                                    )
                                                  : `$${numberToSuffix(
                                                      item?.details
                                                        .slice(i)
                                                        .reduce(
                                                          (acc: number, item: any) =>
                                                            acc + item?.volume,
                                                          0,
                                                        ),
                                                    )}`
                                              }
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
                                        ${
                                          metricSelected === "transactions"
                                            ? formatNumber(detail.count)
                                            : `$${numberToSuffix(detail.volume)}`
                                        }
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
                },
              }}
            />
          </>
        )}
      </div>
    </Fullscreenable>
  );
};

export default ChainActivity;
