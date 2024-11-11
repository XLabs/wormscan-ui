import { Fragment, useEffect, useRef, useState } from "react";
import { useQuery } from "react-query";
import { ChainId } from "@wormhole-foundation/sdk";
import { BREAKPOINTS } from "src/consts";
import { useEnvironment } from "src/context/EnvironmentContext";
import {
  ActivityIcon,
  ChevronDownIcon,
  CrossIcon,
  FilterListIcon,
  FullscreenIcon,
} from "src/icons/generic";
import {
  BlockchainIcon,
  Counter,
  Fullscreenable,
  NavLink,
  Select,
  ToggleGroup,
} from "src/components/atoms";
import { ErrorPlaceholder } from "src/components/molecules";
import { useLockBodyScroll, useOutsideClick, useWindowSize } from "src/utils/hooks";
import { getTokenIcon } from "src/utils/token";
import { formatNumber } from "src/utils/number";
import { getISODateZeroed, oneDayAgoISOString, todayISOString } from "src/utils/date";
import { getChainName } from "src/utils/wormhole";
import { ChainFilterMainnet, ChainFilterTestnet } from "src/utils/filterUtils";
import { getClient } from "src/api/Client";
import { Chart } from "./Chart";
import analytics from "src/analytics";
import "./styles.scss";

const METRIC_CHART_LIST = [
  { label: "Volume", value: "volume", ariaLabel: "Volume" },
  { label: "Transfers", value: "transactions", ariaLabel: "Transfers" },
];

const SCALE_CHART_LIST = [
  { label: "Logarithmic", value: "logarithmic", ariaLabel: "Logarithmic" },
  { label: "Linear", value: "linear", ariaLabel: "Linear" },
];

const RANGE_LIST = [
  { label: "Last 24 hours", value: getISODateZeroed(1), timespan: "1h", shortLabel: "24H" },
  { label: "Last 7 days", value: getISODateZeroed(7), timespan: "1d", shortLabel: "7D" },
  { label: "Last 15 days", value: getISODateZeroed(15), timespan: "1d", shortLabel: "15D" },
  { label: "Last 30 days", value: getISODateZeroed(30), timespan: "1d", shortLabel: "30D" },
  // TODO: add when the endpoint supports it
  // { label: "Last 365 days", value: getISODateZeroed(365), timespan: "1mo", shortLabel: "365D" },
  // { label: "All Time", value: firstDataAvailableDate, timespan: "1mo", shortLabel: "All" },
];

const TokenActivity = ({ isHomePage = false }: { isHomePage?: boolean }) => {
  const { environment } = useEnvironment();
  const currentNetwork = environment.network;
  const isMainnet = currentNetwork === "Mainnet";

  const filterContainerRef = useRef<HTMLDivElement>(null);
  const orderedChains = isMainnet ? ChainFilterMainnet : ChainFilterTestnet;

  const { width } = useWindowSize();
  const isDesktop = width >= BREAKPOINTS.desktop;

  const [selectedTopAssetTimeRange, setSelectedTopAssetTimeRange] = useState(RANGE_LIST[0]);

  const [scaleSelected, setScaleSelectedState] = useState<"linear" | "logarithmic">("linear");
  const setScaleSelected = (value: "linear" | "logarithmic", track: boolean) => {
    setScaleSelectedState(value);

    if (track) {
      analytics.track("scaleSelected", {
        selected: value,
        selectedType: "tokenActivity",
      });
    }
  };
  const [chartSelected, setChartSelected] = useState<"area" | "bar">("area");
  const [metricSelected, setMetricSelected] = useState<"volume" | "transactions">("volume");
  const [openFilters, setOpenFilters] = useState(false);
  const [rowSelected, setRowSelected] = useState<number>(0);

  const [filters, setFiltersState] = useState({
    from: getISODateZeroed(1),
    to: todayISOString,
    timespan: "1h",
    sourceChain: [],
    targetChain: [],
    symbol: { label: "USDC", value: "USDC" },
  });

  const setFilters = (newFilters: typeof filters, timeRange?: string) => {
    analytics.track("tokenActivity", {
      network: currentNetwork,
      selectedType: metricSelected,
      chain:
        (filters.sourceChain?.length > 0
          ? filters.sourceChain.map(chain => chain.label).join(", ")
          : "Unset") +
        (filters.targetChain?.length > 0
          ? " -> " + filters.targetChain.map(chain => chain.label).join(", ")
          : ""),
      symbol: newFilters?.symbol?.label,
      selectedTimeRange: timeRange ? timeRange : selectedTopAssetTimeRange?.label,
    });

    setFiltersState(newFilters);
  };

  const sourceChains = filters.sourceChain.map(({ value }) => Number(value) as ChainId);
  const targetChains = filters.targetChain.map(({ value }) => Number(value) as ChainId);

  const CHAIN_LIST: { label: string; value: string }[] = orderedChains.map(chainId => ({
    icon: (
      <BlockchainIcon
        background="var(--color-white-10)"
        chainId={chainId}
        colorless
        lazy={false}
        network={currentNetwork}
        size={24}
      />
    ),
    label: getChainName({ network: currentNetwork, chainId }),
    value: String(chainId),
  }));

  const {
    isLoading: isLoadingList,
    isError: isErrorList,
    data: dataList,
  } = useQuery(["tokensSymbolVolume", currentNetwork], async () => {
    const response = await getClient().guardianNetwork.getTokensSymbolVolume({
      limit: isMainnet ? 16 : 10,
    });

    const excludedSymbols = ["UST", "LUNA", "stETH", "XCN", "sAVAX", "FTX Token"];
    const filteredResponse = response.filter(token => !excludedSymbols.includes(token.symbol));

    if (filters.symbol.value !== filteredResponse[0].symbol) {
      setFilters({
        ...filters,
        symbol: { label: filteredResponse[0].symbol, value: filteredResponse[0].symbol },
      });
    }

    setRowSelected(0);
    return filteredResponse;
  });

  const {
    isLoading: isLoadingChart,
    isError: isErrorChart,
    data: dataChart,
  } = useQuery(
    [
      "tokensSymbolActivity",
      filters.from,
      filters.to,
      filters.symbol.value,
      filters.timespan,
      sourceChains,
      targetChains,
    ],
    () =>
      getClient().guardianNetwork.getTokensSymbolActivity({
        from: filters.from,
        to: todayISOString,
        symbol: filters.symbol.value,
        timespan: filters.timespan,
        sourceChain: sourceChains,
        targetChain: targetChains,
      }),
  );

  const applyFilters = () => {
    setOpenFilters(false);
  };

  const resetFilters = () => {
    setFilters({
      ...filters,
      sourceChain: [],
      targetChain: [],
    });
    setOpenFilters(false);
  };

  const handleRowSelected = (rowIndex: number) => {
    setFilters({
      ...filters,
      symbol: {
        label: dataList[rowIndex].symbol,
        value: dataList[rowIndex].symbol,
      },
    });
    setRowSelected(!isDesktop && rowIndex === rowSelected ? -1 : rowIndex);
  };

  useEffect(() => {
    if (!isMainnet) {
      setMetricSelected("transactions");
    }
  }, [isMainnet]);

  useOutsideClick({
    ref: filterContainerRef,
    callback: () => setOpenFilters(false),
  });

  useLockBodyScroll({
    isLocked: !isDesktop && openFilters,
    scrollableClasses: ["select__option"],
  });

  const fullscreenBtnRef = useRef(null);

  return (
    <Fullscreenable
      className="token-activity"
      buttonRef={fullscreenBtnRef}
      itemName="tokenActivity"
    >
      {openFilters && !isDesktop && <div className="token-activity-bg" />}

      <h3 className="token-activity-title">
        <ActivityIcon /> Cross-Chain Token Activity
        <div className="token-activity-title-fullscreen" ref={fullscreenBtnRef}>
          <FullscreenIcon width={20} />
        </div>
        {isHomePage && (
          <NavLink
            className="token-activity-title-link"
            to="/analytics/tokens"
            onClick={() => {
              analytics.track("viewMore", {
                network: currentNetwork,
                selected: "Token Activity",
              });
            }}
          >
            View More
          </NavLink>
        )}
      </h3>

      <div className="token-activity-container">
        <div className="token-activity-container-top">
          <div
            className={`token-activity-container-top-menu ${openFilters ? "open" : ""}`}
            ref={filterContainerRef}
          >
            <h4 className="token-activity-container-top-menu-title">Filters</h4>

            <button
              className="token-activity-container-top-menu-close-btn"
              onClick={() => setOpenFilters(false)}
            >
              <CrossIcon width={24} />
            </button>

            <Select
              ariaLabel="Select Source Chain"
              buttonStyles={{
                width: "100%",
                justifyContent: "space-between",
                height: isDesktop ? 36 : 48,
              }}
              items={CHAIN_LIST}
              menuPortalTarget={document.querySelector(".token-activity")}
              menuFixed={!isDesktop}
              menuListStyles={{ maxHeight: isDesktop ? 264 : 180 }}
              menuPortalStyles={{ zIndex: 100 }}
              name="topAssetTimeRange"
              onValueChange={value => setFilters({ ...filters, sourceChain: value })}
              optionStyles={{ padding: 16 }}
              text={
                <div className="token-activity-container-top-menu-select-text">
                  {filters.sourceChain.length > 0 && (
                    <Counter>{filters.sourceChain.length}</Counter>
                  )}
                  Source chain
                </div>
              }
              type="searchable"
              value={filters.sourceChain}
            />

            <Select
              ariaLabel="Select Target Chain"
              buttonStyles={{
                width: "100%",
                justifyContent: "space-between",
                height: isDesktop ? 36 : 48,
              }}
              items={CHAIN_LIST}
              menuFixed={!isDesktop}
              menuPortalTarget={document.querySelector(".token-activity")}
              menuListStyles={{ maxHeight: isDesktop ? 264 : 180 }}
              menuPortalStyles={{ zIndex: 100 }}
              name="topAssetTimeRange"
              onValueChange={value => setFilters({ ...filters, targetChain: value })}
              optionStyles={{ padding: 16 }}
              text={
                <div className="token-activity-container-top-menu-select-text">
                  {filters.targetChain.length > 0 && (
                    <Counter>{filters.targetChain.length}</Counter>
                  )}
                  Target chain
                </div>
              }
              type="searchable"
              value={filters.targetChain}
            />

            {!isDesktop && (
              <ToggleGroup
                ariaLabel="Select metric type (volume or transfers)"
                className="token-activity-container-top-toggle"
                items={isMainnet ? METRIC_CHART_LIST : [METRIC_CHART_LIST[1]]}
                onValueChange={value => {
                  if (value === "transactions") {
                    setScaleSelected("linear", false);
                  }
                  setMetricSelected(value);

                  analytics.track("metricSelected", {
                    network: currentNetwork,
                    selected: value,
                    selectedType: "tokenActivity",
                  });
                }}
                value={metricSelected}
              />
            )}

            {!isDesktop && chartSelected === "area" && metricSelected === "volume" && (
              <ToggleGroup
                ariaLabel="Select scale (linear or logarithmic)"
                className="token-activity-container-top-toggle"
                // className="token-activity-chart-top-scale"
                items={SCALE_CHART_LIST}
                onValueChange={value => setScaleSelected(value, true)}
                value={scaleSelected}
              />
            )}

            <div className="token-activity-container-top-menu-buttons">
              <button className="apply-btn" onClick={applyFilters}>
                Apply Filters
              </button>

              <button
                className="reset-btn"
                disabled={filters.sourceChain.length === 0 && filters.targetChain.length === 0}
                onClick={resetFilters}
              >
                Reset Filters
              </button>
            </div>
          </div>

          {isDesktop && (
            <ToggleGroup
              ariaLabel="Select metric type (volume or transfers)"
              className="token-activity-container-top-toggle"
              items={isMainnet ? METRIC_CHART_LIST : [METRIC_CHART_LIST[1]]}
              onValueChange={value => {
                if (value === "transactions") {
                  setScaleSelected("linear", false);
                }
                setMetricSelected(value);

                analytics.track("metricSelected", {
                  network: currentNetwork,
                  selected: value,
                  selectedType: "tokenActivity",
                });
              }}
              value={metricSelected}
            />
          )}

          <Select
            ariaLabel="Select Time Range"
            className="token-activity-container-top-select"
            items={RANGE_LIST}
            menuPortalTarget={document.querySelector(".token-activity")}
            name="topAssetTimeRange"
            onValueChange={value => {
              setSelectedTopAssetTimeRange(value);
              setFilters(
                {
                  ...filters,
                  from: value.value,
                  timespan: value.timespan,
                },
                value?.label,
              );
            }}
            value={selectedTopAssetTimeRange}
          />

          <button
            className="token-activity-container-top-filters-btn"
            onClick={() => setOpenFilters(true)}
          >
            <FilterListIcon />
            <span className="token-activity-container-top-filters-btn-txt">Filters</span>
            {(filters.sourceChain.length > 0 || filters.targetChain.length > 0) && (
              <Counter>
                {filters.sourceChain.length > 0 && filters.targetChain.length > 0 ? 2 : 1}
              </Counter>
            )}
          </button>
        </div>

        <div className="token-activity-container-content">
          <div className="token-activity-container-content-list">
            <div className="token-activity-container-content-list-title">
              Top 10 Transferred Tokens
              <span>(All Time)</span>
            </div>

            <div className="token-activity-container-content-list-header">
              <div>SYMBOL</div> <div>VOLUME</div>
            </div>

            {isErrorList ? (
              <ErrorPlaceholder />
            ) : isLoadingList ? (
              <div className="token-activity-container-content-list-loader">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div className="token-activity-container-content-list-loader-row" key={i} />
                ))}
              </div>
            ) : (
              dataList?.map((item, rowIndex) => (
                <Fragment key={rowIndex}>
                  <div
                    className={`token-activity-container-content-list-row row-${rowIndex} ${
                      rowIndex === rowSelected ? "open" : ""
                    }`}
                    onClick={() => handleRowSelected(rowIndex)}
                  >
                    <div className="token-activity-container-content-list-row-symbol">
                      <img
                        src={getTokenIcon(item.symbol)}
                        alt={`${item.symbol} icon`}
                        height="24"
                        width="24"
                        className="top-asset-list-row-item-to-icon"
                        loading="lazy"
                      />

                      <span>{item.symbol}</span>
                    </div>

                    <div className="token-activity-container-content-list-row-volume">
                      ${formatNumber(item.volume, 0)}
                      <ChevronDownIcon />
                    </div>
                  </div>

                  {width < BREAKPOINTS.desktop && rowSelected === rowIndex && (
                    <Chart
                      data={dataChart}
                      filters={filters}
                      isError={isErrorChart}
                      isLoading={isLoadingChart}
                      metricSelected={metricSelected}
                      rangeShortLabel={selectedTopAssetTimeRange.shortLabel}
                      rowSelected={rowSelected}
                      setScaleSelected={setScaleSelected}
                      scaleSelected={scaleSelected}
                      chartSelected={chartSelected}
                      setChartSelected={setChartSelected}
                    />
                  )}
                </Fragment>
              ))
            )}
          </div>

          {width >= BREAKPOINTS.desktop && (
            <Chart
              data={dataChart}
              filters={filters}
              isError={isErrorChart}
              isLoading={isLoadingChart}
              metricSelected={metricSelected}
              rangeShortLabel={selectedTopAssetTimeRange.shortLabel}
              rowSelected={rowSelected}
              setScaleSelected={setScaleSelected}
              scaleSelected={scaleSelected}
              setChartSelected={setChartSelected}
              chartSelected={chartSelected}
            />
          )}
        </div>
      </div>
    </Fullscreenable>
  );
};

export default TokenActivity;
