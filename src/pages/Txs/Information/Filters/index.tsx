import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { chainToChainId } from "@wormhole-foundation/sdk";
import { BlockchainIcon, ProtocolIcon, Select, ToggleGroup } from "src/components/atoms";
import {
  CCTP_APP_ID,
  // CCTP_MANUAL_APP_ID_STRING, we are putting them from the front in the tx detail
  CONNECT_APP_ID,
  ETH_BRIDGE_APP_ID,
  MAYAN_APP_ID,
  NTT_APP_ID,
  PORTAL_NFT_APP_ID,
  PORTAL_APP_ID,
  GR_APP_ID,
  // UNKNOWN_APP_ID, disabled until the backend is ready
  GATEWAY_APP_ID,
  USDT_TRANSFER_APP_ID,
  TBTC_APP_ID,
  BREAKPOINTS,
  C3_APP_ID,
} from "src/consts";
import { formatAppId } from "src/utils/crypto";
import { getChainName } from "src/utils/wormhole";
import { useEnvironment } from "src/context/EnvironmentContext";
import {
  useWindowSize,
  useNavigateCustom,
  useLockBodyScroll,
  useOutsideClick,
} from "src/utils/hooks";
import { CrossIcon, FilterListIcon } from "src/icons/generic";
import "./styles.scss";

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

const appIds = [
  C3_APP_ID,
  CCTP_APP_ID,
  CONNECT_APP_ID,
  ETH_BRIDGE_APP_ID,
  MAYAN_APP_ID,
  NTT_APP_ID,
  PORTAL_NFT_APP_ID,
  PORTAL_APP_ID,
  GR_APP_ID,
  TBTC_APP_ID,
  // UNKNOWN_APP_ID, // disabled until the backend is ready
  USDT_TRANSFER_APP_ID,
  GATEWAY_APP_ID,
];

export const ChainFilterMainnet = [
  chainToChainId("Acala"),
  chainToChainId("Algorand"),
  chainToChainId("Aptos"),
  chainToChainId("Arbitrum"),
  chainToChainId("Aurora"),
  chainToChainId("Avalanche"),
  chainToChainId("Base"),
  chainToChainId("Blast"),
  chainToChainId("Bsc"),
  chainToChainId("Celo"),
  chainToChainId("Ethereum"),
  chainToChainId("Fantom"),
  chainToChainId("Injective"),
  chainToChainId("Karura"),
  chainToChainId("Klaytn"),
  chainToChainId("Mantle"),
  chainToChainId("Moonbeam"),
  chainToChainId("Near"),
  chainToChainId("Neon"),
  chainToChainId("Oasis"),
  chainToChainId("Optimism"),
  chainToChainId("Polygon"),
  chainToChainId("Scroll"),
  chainToChainId("Sei"),
  chainToChainId("Solana"),
  chainToChainId("Sui"),
  chainToChainId("Terra"),
  chainToChainId("Terra2"),
  chainToChainId("Wormchain"),
  chainToChainId("Xlayer"),
  chainToChainId("Xpla"),
];

export const ChainFilterTestnet = [
  chainToChainId("Acala"),
  chainToChainId("Celo"),
  chainToChainId("Algorand"),
  chainToChainId("PolygonSepolia"),
  chainToChainId("Aptos"),
  // chainToChainId("Arbitrum"),
  chainToChainId("ArbitrumSepolia"),
  chainToChainId("Aurora"),
  // chainToChainId("Base"),
  chainToChainId("BaseSepolia"),
  chainToChainId("Blast"),
  chainToChainId("Bsc"),
  chainToChainId("Fantom"),
  chainToChainId("Avalanche"),
  chainToChainId("Ethereum"),
  chainToChainId("Holesky"),
  chainToChainId("Injective"),
  chainToChainId("Karura"),
  chainToChainId("Klaytn"),
  chainToChainId("Mantle"),
  chainToChainId("Moonbeam"),
  // chainToChainId("Polygon"),
  chainToChainId("Near"),
  chainToChainId("Neon"),
  chainToChainId("Oasis"),
  // chainToChainId("Optimism"),
  chainToChainId("OptimismSepolia"),
  chainToChainId("Scroll"),
  chainToChainId("Sei"),
  chainToChainId("Sepolia"),
  chainToChainId("Solana"),
  chainToChainId("Sui"),
  chainToChainId("Terra"),
  chainToChainId("Terra2"),
  chainToChainId("Wormchain"),
  chainToChainId("Xlayer"),
  chainToChainId("Xpla"),
];

const parseParams = (params: string | null) => {
  if (!params) return [];
  return params.split(",").map(value => ({ value }));
};

const Filters = () => {
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

  const PROTOCOL_LIST: { label: string; value: string }[] = appIds.map(appId => ({
    icon: <ProtocolIcon protocol={appId} />,
    label: formatAppId(appId),
    value: String(appId),
  }));

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

  const handleShowFilters = () => {
    setShowFilters(!showFilters);
  };

  const resetFilters = () => {
    Object.values(FilterKeys).forEach(key => searchParams.delete(key));
    setSearchParams(searchParams);
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
    setShowFilters(false);
  }, [checkedState, searchParams, setSearchParams, setShowFilters]);

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
          {totalFilterCounter > 0 && <span className="counter">{totalFilterCounter}</span>}
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
            name="topAssetTimeRange"
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
                {checkedState.appId.length > 0 && (
                  <span className="counter">{checkedState.appId.length}</span>
                )}
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
            name="topAssetTimeRange"
            onValueChange={(value: any) => setCheckedState({ ...checkedState, sourceChain: value })}
            optionStyles={{ padding: 16 }}
            text={
              <div className="filters-container-select-text">
                Source chain
                {checkedState.sourceChain.length > 0 && (
                  <span className="counter">{checkedState.sourceChain.length}</span>
                )}
              </div>
            }
            type="searchable"
            value={checkedState.sourceChain}
          />

          <Select
            keepOpen={isDesktop}
            ariaLabel="Select Target Chain"
            items={CHAIN_LIST}
            menuFixed={!isDesktop}
            menuListStyles={{ maxHeight: isDesktop ? 264 : 180 }}
            menuPortalStyles={{ zIndex: 100 }}
            name="topAssetTimeRange"
            onValueChange={(value: any) => setCheckedState({ ...checkedState, targetChain: value })}
            optionStyles={{ padding: 16 }}
            text={
              <div className="filters-container-select-text">
                Target chain
                {checkedState.targetChain.length > 0 && (
                  <span className="counter">{checkedState.targetChain.length}</span>
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
