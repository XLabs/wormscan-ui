import { Fragment, useRef, useState } from "react";
import { useQuery } from "react-query";
import { ChainId } from "@wormhole-foundation/sdk";
import { BREAKPOINTS } from "src/consts";
import { useEnvironment } from "src/context/EnvironmentContext";
import { ActivityIcon, ChevronDownIcon, CrossIcon, FilterListIcon } from "src/icons/generic";
import { BlockchainIcon, Counter, Loader, Select, ToggleGroup } from "src/components/atoms";
import { ErrorPlaceholder } from "src/components/molecules";
import { useLockBodyScroll, useOutsideClick, useWindowSize } from "src/utils/hooks";
import { getTokenIcon } from "src/utils/token";
import { formatNumber } from "src/utils/number";
import { getISODateZeroed, oneDayAgoISOString, todayISOString } from "src/utils/date";
import { getChainName } from "src/utils/wormhole";
import { ChainFilterMainnet, ChainFilterTestnet } from "src/utils/filterUtils";
import { getClient } from "src/api/Client";
import TokenActivityChart from "./TokenActivityChart";
import "./styles.scss";

const METRIC_CHART_LIST = [
  { label: "Volume", value: "volume", ariaLabel: "Volume" },
  { label: "Transactions", value: "transactions", ariaLabel: "Transactions" },
];

const RANGE_LIST = [
  { label: "Last 24 hours", value: getISODateZeroed(1), timespan: "1h" },
  { label: "Last 7 days", value: getISODateZeroed(7), timespan: "1d" },
  { label: "Last 15 days", value: getISODateZeroed(15), timespan: "1d" },
  { label: "Last 30 days", value: getISODateZeroed(30), timespan: "1d" },
  // { label: "Last 365 days", value: getISODateZeroed(365), timespan: "1mo" },
  // { label: "All Time", value: firstDataAvailableDate, timespan: "1mo" },
];

const TokenActivity = () => {
  const { environment } = useEnvironment();
  const currentNetwork = environment.network;

  const filterContainerRef = useRef<HTMLDivElement>(null);
  const orderedChains = currentNetwork === "Mainnet" ? ChainFilterMainnet : ChainFilterTestnet;

  const { width } = useWindowSize();
  const isTablet = width >= BREAKPOINTS.tablet;
  const isDesktop = width >= BREAKPOINTS.desktop;
  const isBigDesktop = width >= BREAKPOINTS.bigDesktop;

  const [selectedTopAssetTimeRange, setSelectedTopAssetTimeRange] = useState(RANGE_LIST[0]);
  const [metricSelected, setMetricSelected] = useState<"volume" | "transactions">("volume");
  const [openFilters, setOpenFilters] = useState(false);
  const [rowSelected, setRowSelected] = useState<number>(0);

  const [filters, setFilters] = useState({
    from: getISODateZeroed(1),
    to: todayISOString,
    timespan: "1h",
    sourceChain: [],
    targetChain: [],
    symbol: { label: "USDC", value: "USDC" },
  });

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
      limit: currentNetwork === "Mainnet" ? 16 : 10,
    });

    const excludedSymbols = ["UST", "LUNA", "stETH", "XCN", "sAVAX", "FTX Token"];
    const filteredResponse = response.filter(token => !excludedSymbols.includes(token.symbol));

    if (filters.symbol.value !== filteredResponse[0].symbol) {
      setFilters({
        ...filters,
        symbol: { label: filteredResponse[0].symbol, value: filteredResponse[0].symbol },
      });
    }

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

  const handleFiltersOpened = () => {
    setOpenFilters(prev => !prev);
  };

  const applyFilters = () => {
    setOpenFilters(false);
  };

  const resetFilters = () => {
    setFilters({
      from: oneDayAgoISOString,
      to: todayISOString,
      timespan: "1h",
      sourceChain: [],
      targetChain: [],
      symbol: { label: dataList[0].symbol, value: dataList[0].symbol },
    });
    setRowSelected(0);
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
    setRowSelected(rowIndex === rowSelected ? -1 : rowIndex);
  };

  useOutsideClick({
    ref: filterContainerRef,
    callback: () => setOpenFilters(false),
  });

  useLockBodyScroll({
    isLocked: !isDesktop && openFilters,
    scrollableClasses: [
      "select__option",
      "select-custom-option",
      "select-custom-option-container",
      "blockchain-icon",
      "custom-checkbox",
    ],
  });

  return (
    <div className="token-activity">
      {openFilters && !isDesktop && <div className="token-activity-bg" />}

      <h3 className="token-activity-title">
        <ActivityIcon /> Cross-chain Token Activity
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

            <div className="token-activity-container-top-menu-buttons">
              <button className="apply-btn" onClick={applyFilters}>
                Apply Filters
              </button>

              <button className="reset-btn" onClick={resetFilters}>
                Reset Filters
              </button>
            </div>
          </div>

          <ToggleGroup
            ariaLabel="Select metric type (volume or transactions)"
            className="token-activity-container-top-toggle"
            items={METRIC_CHART_LIST}
            onValueChange={value => setMetricSelected(value)}
            value={metricSelected}
          />

          <Select
            ariaLabel="Select Time Range"
            className="token-activity-container-top-select"
            items={RANGE_LIST}
            name="topAssetTimeRange"
            onValueChange={value => {
              setFilters({
                ...filters,
                from: value.value,
                timespan: value.timespan,
              });
              setSelectedTopAssetTimeRange(value);
            }}
            value={selectedTopAssetTimeRange}
          />

          <button
            className="token-activity-container-top-filters-btn"
            onClick={handleFiltersOpened}
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
              <Loader />
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
                    <TokenActivityChart
                      data={dataChart}
                      isError={isErrorChart}
                      isLoading={isLoadingChart}
                      metricSelected={metricSelected}
                      rowSelected={rowSelected}
                      filters={filters}
                    />
                  )}
                </Fragment>
              ))
            )}
          </div>

          {width >= BREAKPOINTS.desktop && (
            <TokenActivityChart
              data={dataChart}
              isError={isErrorChart}
              isLoading={isLoadingChart}
              metricSelected={metricSelected}
              rowSelected={rowSelected}
              filters={filters}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TokenActivity;
