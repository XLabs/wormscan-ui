import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ChainId } from "src/api";
import { BlockchainIcon, Select, Tooltip } from "src/components/atoms";
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
} from "src/consts";
import { formatAppId } from "src/utils/crypto";
import { getChainName } from "src/utils/wormhole";
import { useEnvironment } from "src/context/EnvironmentContext";
import {
  useWindowSize,
  useNavigateCustom,
  useLockBodyScroll,
  useLocalStorage,
} from "src/utils/hooks";
import { CrossIcon, FilterListIcon } from "src/icons/generic";
import "./styles.scss";

interface ICheckedState {
  appId: Array<{ value: string }>;
  exclusiveAppId: Array<{ value: string }>;
  sourceChain: Array<{ value: string }>;
  targetChain: Array<{ value: string }>;
}
type TCheckedStateKey = keyof ICheckedState;

enum FilterKeys {
  AppId = "appId",
  ExclusiveAppId = "exclusiveAppId",
  SourceChain = "sourceChain",
  TargetChain = "targetChain",
}

const appIds = [
  CCTP_APP_ID,
  CONNECT_APP_ID,
  ETH_BRIDGE_APP_ID,
  USDT_TRANSFER_APP_ID, // disabled until it goes prod
  MAYAN_APP_ID,
  NTT_APP_ID,
  PORTAL_NFT_APP_ID,
  PORTAL_APP_ID,
  GR_APP_ID,
  TBTC_APP_ID,
  // UNKNOWN_APP_ID, // disabled until the backend is ready
  GATEWAY_APP_ID,
];

export const ChainFilterMainnet = [
  ChainId.Acala,
  ChainId.Algorand,
  ChainId.Aptos,
  ChainId.Arbitrum,
  ChainId.Aurora,
  ChainId.Avalanche,
  ChainId.Base,
  ChainId.Blast,
  ChainId.BSC,
  ChainId.Celo,
  ChainId.Ethereum,
  ChainId.Fantom,
  ChainId.Injective,
  ChainId.Karura,
  ChainId.Klaytn,
  ChainId.Mantle,
  ChainId.Moonbeam,
  ChainId.Near,
  ChainId.Neon,
  ChainId.Oasis,
  ChainId.Optimism,
  ChainId.Polygon,
  ChainId.Scroll,
  ChainId.Sei,
  ChainId.Solana,
  ChainId.Sui,
  ChainId.Terra,
  ChainId.Terra2,
  ChainId.Wormchain,
  ChainId.XLayer,
  ChainId.Xpla,
];

export const ChainFilterTestnet = [
  ChainId.Acala,
  ChainId.Celo,
  ChainId.Algorand,
  ChainId.PolygonSepolia,
  ChainId.Aptos,
  ChainId.Arbitrum,
  ChainId.ArbitrumSepolia,
  ChainId.Aurora,
  ChainId.Base,
  ChainId.BaseSepolia,
  ChainId.Blast,
  ChainId.BSC,
  ChainId.Fantom,
  ChainId.Avalanche,
  ChainId.Ethereum,
  ChainId.Holesky,
  ChainId.Injective,
  ChainId.Karura,
  ChainId.Klaytn,
  ChainId.Mantle,
  ChainId.Moonbeam,
  ChainId.Polygon,
  ChainId.Near,
  ChainId.Neon,
  ChainId.Oasis,
  ChainId.Optimism,
  ChainId.OptimismSepolia,
  ChainId.Scroll,
  ChainId.Sei,
  ChainId.Sepolia,
  ChainId.Solana,
  ChainId.Sui,
  ChainId.Terra,
  ChainId.Terra2,
  ChainId.Wormchain,
  ChainId.XLayer,
  ChainId.Xpla,
];

const parseParams = (params: string | null) => {
  if (!params) return [];
  return params.split(",").map(value => ({ value }));
};

const Filters = () => {
  const navigate = useNavigateCustom();
  const [showFilters, setShowFilters] = useLocalStorage<boolean>("showTxsFilters", false);

  const { width } = useWindowSize();
  const isDesktop = width >= BREAKPOINTS.desktop;

  const [searchParams, setSearchParams] = useSearchParams();
  const appIdParams = searchParams.get(FilterKeys.AppId) || "";
  const exclusiveAppIdParams = searchParams.get(FilterKeys.ExclusiveAppId) || "";
  const sourceChainParams = searchParams.get(FilterKeys.SourceChain) || "";
  const targetChainParams = searchParams.get(FilterKeys.TargetChain) || "";

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
  const orderedChains = currentNetwork === "MAINNET" ? ChainFilterMainnet : ChainFilterTestnet;

  const PROTOCOL_LIST: { label: string; value: string }[] = appIds.map(appId => ({
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
    setCheckedState({
      appId: [],
      exclusiveAppId: [],
      sourceChain: [],
      targetChain: [],
    });
    navigate("/txs?page=1");
    setShowFilters(false);
  };

  const applyFilters = () => {
    let url = "/txs?page=1";

    for (const key in checkedState) {
      const checkedStateKey = key as TCheckedStateKey;
      if (checkedState[checkedStateKey].length > 0) {
        const stateValue = checkedState[checkedStateKey];
        const values = stateValue.map(item => item.value).join(",");
        url += `&${key}=${values}`;
      }
    }

    navigate(url);
    !isDesktop && setShowFilters(false);
  };

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

  return (
    <div className="filters">
      {showFilters && !isDesktop && <div className="filters-bg" onClick={handleShowFilters} />}

      <div className="filters-top">
        <button className="filters-top-tab">All</button>

        <button
          className={`filters-top-btn ${showFilters ? "active" : ""}`}
          onClick={handleShowFilters}
        >
          <FilterListIcon width={24} />
          <span>Filters</span>
          {totalFilterCounter > 0 && <span className="counter">{totalFilterCounter}</span>}
        </button>
      </div>

      <div className={`filters-container ${showFilters ? "show" : ""}`}>
        <h4 className="filters-container-title">Filters</h4>

        <button className="filters-container-close-btn" onClick={() => setShowFilters(false)}>
          <CrossIcon width={24} />
        </button>

        <Select
          ariaLabel="Select Protocol"
          controlStyles={{ minWidth: 272 }}
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
              {checkedState.appId.length > 0 && (
                <span className="counter">{checkedState.appId.length}</span>
              )}
              Protocol
            </div>
          }
          type="searchable"
          value={checkedState.appId}
        />

        <Select
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
              {checkedState.sourceChain.length > 0 && (
                <span className="counter">{checkedState.sourceChain.length}</span>
              )}
              Source chain
            </div>
          }
          type="searchable"
          value={checkedState.sourceChain}
        />

        <Select
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
              {checkedState.targetChain.length > 0 && (
                <span className="counter">{checkedState.targetChain.length}</span>
              )}
              Target chain
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
    </div>
  );
};

export default Filters;
