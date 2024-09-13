import { chain, chainToChainId } from "@wormhole-foundation/sdk";
import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { BlockchainIcon, Counter, Select, ToggleGroup } from "src/components/atoms";
import { BREAKPOINTS, GATEWAY_APP_ID } from "src/consts";
import { getChainName } from "src/utils/wormhole";
import { useEnvironment } from "src/context/EnvironmentContext";
import { ChainFilterMainnet, ChainFilterTestnet, PROTOCOL_LIST } from "src/utils/filterUtils";
import {
  useWindowSize,
  useNavigateCustom,
  useLockBodyScroll,
  useOutsideClick,
} from "src/utils/hooks";
import { CrossIcon, FilterListIcon } from "src/icons/generic";
import "./styles.scss";

interface Props {
  setIsPaginationLoading: Dispatch<SetStateAction<boolean>>;
}

interface ICheckedState {
  appId: Array<{ value: string }>;
  exclusiveAppId: Array<{ value: string }>;
  sourceChain: Array<{ value: string }>;
  targetChain: Array<{ value: string }>;
}

enum FilterKeys {
  AppId = "appId",
  ExclusiveAppId = "exclusiveAppId",
  SourceChain = "sourceChain",
  TargetChain = "targetChain",
}

const PAYLOAD_TYPE = "payloadType";

const parseParams = (params: string | null) => {
  if (!params) return [];
  return params.split(",").map(value => ({ value }));
};

const Filters = ({ setIsPaginationLoading }: Props) => {
  const navigate = useNavigateCustom();
  const [showFilters, setShowFilters] = useState(false);
  const filterContainerRef = useRef<HTMLDivElement>(null);
  const showFiltersButtonRef = useRef<HTMLButtonElement>(null);

  const { width } = useWindowSize();
  const isDesktop = width >= BREAKPOINTS.desktop;

  const [searchParams, setSearchParams] = useSearchParams();
  const appIdParams = searchParams.get(FilterKeys.AppId) || "";
  const exclusiveAppIdParams = searchParams.get(FilterKeys.ExclusiveAppId) || "";
  const sourceChainParams = searchParams.get(FilterKeys.SourceChain) || "";
  const targetChainParams = searchParams.get(FilterKeys.TargetChain) || "";
  const payloadTypeParams = searchParams.get(PAYLOAD_TYPE) || "";

  const [checkedState, setCheckedState] = useState<ICheckedState>({
    appId: parseParams(appIdParams),
    exclusiveAppId: parseParams(exclusiveAppIdParams),
    sourceChain: parseParams(sourceChainParams),
    targetChain: parseParams(targetChainParams),
  });

  const totalFilterCounter =
    (appIdParams ? 1 : 0) +
    (exclusiveAppIdParams ? 1 : 0) +
    (sourceChainParams ? 1 : 0) +
    (targetChainParams ? 1 : 0);

  const disableApplyButton =
    checkedState.exclusiveAppId.map(item => item.value).join(",") === exclusiveAppIdParams &&
    checkedState.appId.map(item => item.value).join(",") === appIdParams &&
    checkedState.sourceChain.map(item => item.value).join(",") === sourceChainParams &&
    checkedState.targetChain.map(item => item.value).join(",") === targetChainParams;

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
  };

  const resetFilters = () => {
    Object.values(FilterKeys).forEach(key => searchParams.delete(key));
    setSearchParams(searchParams);
    setIsPaginationLoading(true);
    setShowFilters(false);
  };

  const applyFilters = useCallback(() => {
    const appendFilter = (key: string, values: { value: string }[]) => {
      if (values.length > 0) {
        const joinedValues = values.map(item => item.value).join(",");
        searchParams.append(key, joinedValues);
      }
    };

    Object.values(FilterKeys).forEach(key => searchParams.delete(key));

    appendFilter(FilterKeys.AppId, checkedState.appId);
    appendFilter(FilterKeys.ExclusiveAppId, checkedState.exclusiveAppId);
    appendFilter(FilterKeys.SourceChain, checkedState.sourceChain);
    appendFilter(FilterKeys.TargetChain, checkedState.targetChain);

    searchParams.set("page", "1");
    setSearchParams(searchParams);
    setIsPaginationLoading(true);
    setShowFilters(false);
  }, [checkedState, searchParams, setSearchParams, setShowFilters, setIsPaginationLoading]);

  useEffect(() => {
    setCheckedState({
      appId: parseParams(appIdParams),
      exclusiveAppId: parseParams(exclusiveAppIdParams),
      sourceChain: parseParams(sourceChainParams),
      targetChain: parseParams(targetChainParams),
    });
  }, [appIdParams, exclusiveAppIdParams, sourceChainParams, targetChainParams]);

  useLockBodyScroll({
    isLocked: !isDesktop && showFilters,
    scrollableClasses: [
      "blockchain-icon",
      "custom-checkbox",
      "select__option",
      "select-custom-option-container",
      "select-custom-option",
    ],
  });

  const handleCloseFilters = () => {
    setCheckedState({
      appId: parseParams(appIdParams),
      exclusiveAppId: parseParams(exclusiveAppIdParams),
      sourceChain: parseParams(sourceChainParams),
      targetChain: parseParams(targetChainParams),
    });

    setShowFilters(false);
  };

  useOutsideClick({
    ref: filterContainerRef,
    secondRef: showFiltersButtonRef,
    callback: handleCloseFilters,
  });

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
            if (value === "0") {
              searchParams.delete(PAYLOAD_TYPE);
            } else {
              searchParams.set(PAYLOAD_TYPE, value);
              searchParams.set("page", "1");
            }

            setIsPaginationLoading(true);
            setSearchParams(searchParams);
            navigate(`?${searchParams.toString()}`);
          }}
          value={payloadTypeParams || "0"}
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
            isMulti={false}
            items={PROTOCOL_LIST}
            menuFixed={!isDesktop}
            menuListStyles={{ maxHeight: isDesktop ? 264 : 180 }}
            menuPortalStyles={{ zIndex: 100 }}
            name="protocol"
            onValueChange={(value: any) =>
              setCheckedState({
                ...checkedState,
                appId: value?.value === checkedState.appId?.[0]?.value ? [] : [value],
              })
            }
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
            className={`filters-container-reset-btn ${
              checkedState.exclusiveAppId.length === 0 &&
              checkedState.appId.length === 0 &&
              checkedState.sourceChain.length === 0 &&
              checkedState.targetChain.length === 0
                ? "hidden"
                : ""
            }`}
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
