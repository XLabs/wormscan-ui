import { chainToChainId } from "@wormhole-foundation/sdk";
import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { BlockchainIcon, Counter, Select, ToggleGroup } from "src/components/atoms";
import { Calendar } from "src/components/molecules";
import {
  BREAKPOINTS,
  GATEWAY_APP_ID,
  MAYAN_APP_ID,
  MAYAN_MCTP_APP_ID,
  MAYAN_SWIFT_APP_ID,
} from "src/consts";
import { getChainName } from "src/utils/wormhole";
import { useEnvironment } from "src/context/EnvironmentContext";
import { ChainFilterMainnet, ChainFilterTestnet, PROTOCOL_LIST } from "src/utils/filterUtils";
import { TSelectedPeriod } from "src/utils/chainActivityUtils";
import {
  useWindowSize,
  useNavigateCustom,
  useLockBodyScroll,
  useOutsideClick,
} from "src/utils/hooks";
import { CrossIcon, FilterListIcon } from "src/icons/generic";
import analytics from "src/analytics";
import { IParams } from "../..";
import "./styles.scss";

interface Props {
  params: IParams;
  setIsPaginationLoading: Dispatch<SetStateAction<boolean>>;
}

const filterKeys = ["appId", "exclusiveAppId", "sourceChain", "targetChain"] as const;
type TFilterKey = (typeof filterKeys)[number];

const parseParams = (params: string | null) => {
  if (!params) return [];
  return params.split(",").map(value => ({ value }));
};

const getParsedCheckedState = (params: IParams) => ({
  appId: parseParams(params.appId),
  exclusiveAppId: parseParams(params.exclusiveAppId),
  sourceChain: parseParams(params.sourceChain),
  targetChain: parseParams(params.targetChain),
});

const Filters = ({ params, setIsPaginationLoading }: Props) => {
  const navigate = useNavigateCustom();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const filterContainerRef = useRef<HTMLDivElement>(null);
  const showFiltersButtonRef = useRef<HTMLButtonElement>(null);

  const { width } = useWindowSize();
  const isDesktop = width >= BREAKPOINTS.desktop;

  const [startDate, setStartDate] = useState(params.from ? new Date(params.from) : null);
  const [endDate, setEndDate] = useState(params.to ? new Date(params.to) : null);
  const [startDateDisplayed, setStartDateDisplayed] = useState(
    params.from ? new Date(params.from) : null,
  );
  const [endDateDisplayed, setEndDateDisplayed] = useState(params.to ? new Date(params.to) : null);
  const lastBtnSelected: TSelectedPeriod = startDateDisplayed ? "custom" : "all";

  const [checkedState, setCheckedState] = useState(getParsedCheckedState(params));

  const totalFilterCounter =
    (params.appId ? 1 : 0) +
    (params.exclusiveAppId ? 1 : 0) +
    (params.sourceChain ? 1 : 0) +
    (params.targetChain ? 1 : 0);

  const disableApplyButton =
    checkedState.exclusiveAppId.map(item => item.value).join(",") === params.exclusiveAppId &&
    checkedState.appId.map(item => item.value).join(",") === params.appId &&
    checkedState.sourceChain.map(item => item.value).join(",") === params.sourceChain &&
    checkedState.targetChain.map(item => item.value).join(",") === params.targetChain;

  const { environment } = useEnvironment();
  const currentNetwork = environment.network;
  const orderedChains = currentNetwork === "Mainnet" ? ChainFilterMainnet : ChainFilterTestnet;

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
    searchableBy:
      chainId === chainToChainId("Wormchain") ? "Kujira, Evmos, Injective, Osmosis" : "",
  }));

  const ONLY_GATEWAY_CHAIN_LIST = [
    {
      icon: (
        <BlockchainIcon
          background="var(--color-white-10)"
          chainId={chainToChainId("Wormchain")}
          colorless
          lazy={false}
          network={currentNetwork}
          size={24}
        />
      ),
      label: getChainName({ network: currentNetwork, chainId: chainToChainId("Wormchain") }),
      value: String(chainToChainId("Wormchain")),
      searchableBy: "Kujira, Evmos, Injective, Osmosis",
    },
  ];

  const handleShowFilters = () => {
    setShowFilters(!showFilters);

    analytics.track("txsFilters", { network: environment.network });
  };

  const resetFilters = () => {
    filterKeys.forEach(key => searchParams.delete(key));
    setSearchParams(searchParams);
    setIsPaginationLoading(true);
    setShowFilters(false);
  };

  const applyFilters = useCallback(() => {
    const appendFilter = (key: TFilterKey, values: { value: string }[]) => {
      if (values.length > 0) {
        const joinedValues = values.map(item => item.value).join(",");
        searchParams.append(key, joinedValues);
      }
    };

    filterKeys.forEach(key => searchParams.delete(key));

    appendFilter("appId", checkedState.appId);
    appendFilter("exclusiveAppId", checkedState.exclusiveAppId);
    appendFilter("sourceChain", checkedState.sourceChain);
    appendFilter("targetChain", checkedState.targetChain);

    searchParams.delete("page");
    setSearchParams(searchParams);
    setIsPaginationLoading(true);
    setShowFilters(false);
  }, [checkedState, searchParams, setIsPaginationLoading, setSearchParams]);

  useLockBodyScroll({
    isLocked: !isDesktop && showFilters,
    scrollableClasses: ["select__option"],
  });

  const handleCloseFilters = () => {
    setCheckedState(getParsedCheckedState(params));
    setShowFilters(false);
  };

  useOutsideClick({
    ref: filterContainerRef,
    secondRef: showFiltersButtonRef,
    callback: handleCloseFilters,
  });

  useEffect(() => {
    setCheckedState(getParsedCheckedState(params));

    setStartDate(params.from ? new Date(params.from) : null);
    setEndDate(params.to ? new Date(params.to) : null);
    setStartDateDisplayed(params.from ? new Date(params.from) : null);
    setEndDateDisplayed(params.to ? new Date(params.to) : null);
  }, [params]);

  return (
    <div className="filters">
      {showFilters && !isDesktop && <div className="filters-bg" />}

      <div className="filters-top">
        <ToggleGroup
          ariaLabel="Select type"
          className="filters-top-toggle"
          items={[
            { label: "All", value: "0", ariaLabel: "All" },
            { label: "Transfers", value: "1,3", ariaLabel: "Transfers" },
            { label: "Attestation", value: "2", ariaLabel: "Attestation" },
          ]}
          onValueChange={value => {
            analytics.track("txsType", {
              network: environment.network,
              selected: value === "0" ? "All" : value.includes("1") ? "Transfers" : "Attestation",
            });

            if (value === "0") {
              searchParams.delete("payloadType");
            } else {
              searchParams.set("payloadType", value);
              searchParams.delete("page");
            }

            setIsPaginationLoading(true);
            setSearchParams(searchParams);
            navigate(`?${searchParams.toString()}`);
          }}
          value={params.payloadType || "0"}
        />

        <button
          className={`filters-top-btn ${showFilters ? "active" : ""}`}
          onClick={handleShowFilters}
          ref={showFiltersButtonRef}
        >
          <FilterListIcon width={24} />
          <span>Filters</span>
          {totalFilterCounter > 0 && <Counter>{totalFilterCounter}</Counter>}
        </button>

        <Calendar
          className="filters-container-calendar"
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          lastBtnSelected={lastBtnSelected}
          startDateDisplayed={startDateDisplayed}
          endDateDisplayed={endDateDisplayed}
          isDesktop={isDesktop}
          showDateRange
          showAgoButtons
          minDate={new Date(2022, 1, 1)}
          shouldUpdateURL
        />
      </div>

      {((isDesktop && showFilters) || !isDesktop) && (
        <div className={`filters-container ${showFilters ? "show" : ""}`} ref={filterContainerRef}>
          <h4 className="filters-container-title">Filters</h4>

          <button className="filters-container-close-btn" onClick={handleCloseFilters}>
            <CrossIcon width={24} />
          </button>

          <Select
            keepOpen={isDesktop}
            ariaLabel="Select Protocol"
            controlStyles={{ minWidth: 256 }}
            items={PROTOCOL_LIST}
            menuFixed={!isDesktop}
            menuListStyles={{ maxHeight: isDesktop ? 264 : 180 }}
            menuPortalStyles={{ zIndex: 100 }}
            name="protocol"
            onValueChange={(selectedItems: Array<{ icon?: any; value: string; label: string }>) => {
              let updatedSelectedItems = [...selectedItems];

              const mayanSelected = selectedItems.some(item => item.value === MAYAN_APP_ID);
              const mayanAlreadySelected = checkedState.appId.some(
                item => item.value === MAYAN_APP_ID,
              );

              if (mayanSelected && !mayanAlreadySelected) {
                updatedSelectedItems = [
                  ...updatedSelectedItems,
                  { label: "Mayan MCTP", value: MAYAN_MCTP_APP_ID },
                  { label: "Mayan Swift", value: MAYAN_SWIFT_APP_ID },
                ];
              }

              const uniqueValues = Array.from(
                new Map(updatedSelectedItems.map(item => [item.value, item])).values(),
              );

              setCheckedState(prevState => ({
                ...prevState,
                appId: uniqueValues,
              }));
            }}
            optionStyles={{ padding: 16 }}
            text={
              <div className="filters-container-select-text">
                Protocol
                {checkedState.appId.length > 0 && <Counter>{checkedState.appId.length}</Counter>}
              </div>
            }
            type="searchable"
            value={checkedState.appId}
          />

          <Select
            keepOpen={isDesktop}
            ariaLabel="Select Source Chain"
            items={CHAIN_LIST}
            menuFixed={!isDesktop}
            menuListStyles={{ maxHeight: isDesktop ? 264 : 180 }}
            menuPortalStyles={{ zIndex: 100 }}
            name="sourceChain"
            onValueChange={(value: any) => setCheckedState({ ...checkedState, sourceChain: value })}
            optionStyles={{ padding: 16 }}
            text={
              <div className="filters-container-select-text">
                Source chain
                {checkedState.sourceChain.length > 0 && (
                  <Counter>{checkedState.sourceChain.length}</Counter>
                )}
              </div>
            }
            type="searchable"
            value={checkedState.sourceChain}
          />

          <Select
            keepOpen={isDesktop}
            ariaLabel="Select Target Chain"
            items={
              checkedState.appId?.find(a => a.value === GATEWAY_APP_ID)
                ? ONLY_GATEWAY_CHAIN_LIST
                : CHAIN_LIST
            }
            menuFixed={!isDesktop}
            menuListStyles={{ maxHeight: isDesktop ? 264 : 180 }}
            menuPortalStyles={{ zIndex: 100 }}
            name="targetChain"
            onValueChange={(value: any) => setCheckedState({ ...checkedState, targetChain: value })}
            optionStyles={{ padding: 16 }}
            text={
              <div className="filters-container-select-text">
                Target chain
                {checkedState.targetChain.length > 0 && (
                  <Counter>{checkedState.targetChain.length}</Counter>
                )}
              </div>
            }
            type="searchable"
            value={checkedState.targetChain}
          />

          <button
            className="filters-container-apply-btn"
            disabled={disableApplyButton}
            onClick={applyFilters}
          >
            Apply Filters
          </button>

          <button
            className="filters-container-reset-btn"
            disabled={
              !params.appId && !params.exclusiveAppId && !params.sourceChain && !params.targetChain
            }
            onClick={resetFilters}
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default Filters;
