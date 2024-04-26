import { CheckIcon, Cross1Icon } from "@radix-ui/react-icons";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ChainId } from "src/api";
import { BlockchainIcon, Tooltip } from "src/components/atoms";
import {
  CCTP_APP_ID,
  // CCTP_MANUAL_APP_ID_STRING, we are putting them from the front in the tx detail
  CONNECT_APP_ID,
  ETH_BRIDGE_APP_ID,
  MAYAN_APP_ID,
  NTT_APP_ID,
  PORTAL_APP_ID,
  GR_APP_ID,
  // UNKNOWN_APP_ID, disabled until the backend is ready
  GATEWAY_APP_ID,
} from "src/consts";
import { formatAppId } from "src/utils/crypto";
import { getChainName } from "src/utils/wormhole";
import { useEnvironment } from "src/context/EnvironmentContext";
import { useNavigateCustom } from "src/utils/hooks/useNavigateCustom";
import { useWindowSize } from "src/utils/hooks/useWindowSize";
import FiltersIcon from "src/icons/filtersIcon.svg";
import "./styles.scss";

interface ICheckedState {
  appId: string | null;
  exclusiveAppId: string | null;
  sourceChain: ChainId | null;
  targetChain: ChainId | null;
}
type TCheckedStateKey = keyof ICheckedState;

interface IShowMore {
  appId: boolean;
  sourceChain: boolean;
  targetChain: boolean;
}
type TShowMoreKey = keyof IShowMore;

const APP_ID_STRING = "appId";
const EXCLUSIVE_APP_ID_STRING = "exclusiveAppId";
const SOURCE_CHAIN_STRING = "sourceChain";
const TARGET_CHAIN_STRING = "targetChain";

const appIds = [
  CCTP_APP_ID,
  CONNECT_APP_ID,
  ETH_BRIDGE_APP_ID,
  MAYAN_APP_ID,
  NTT_APP_ID,
  PORTAL_APP_ID,
  GR_APP_ID,
  // UNKNOWN_APP_ID, disabled until the backend is ready
  GATEWAY_APP_ID,
];

const ChainFilterMainnet = [
  ChainId.Acala,
  ChainId.Algorand,
  ChainId.Arbitrum,
  ChainId.Aurora,
  ChainId.Avalanche,
  ChainId.Base,
  // ChainId.Blast, TODO: add when exists a Blast transaction
  ChainId.BSC,
  ChainId.Celo,
  ChainId.Ethereum,
  ChainId.Fantom,
  ChainId.Injective,
  ChainId.Karura,
  ChainId.Klaytn,
  // ChainId.Mantle, TODO: add when exists a Mantle transaction
  ChainId.Moonbeam,
  ChainId.Near,
  ChainId.Neon,
  ChainId.Oasis,
  ChainId.Optimism,
  ChainId.Polygon,
  // ChainId.Scroll, TODO: add when exists a Scroll transaction
  ChainId.Sei,
  ChainId.Solana,
  ChainId.Sui,
  ChainId.Terra,
  ChainId.Terra2,
  ChainId.Wormchain,
  ChainId.Xpla,
];

const ChainFilterTestnet = [
  ChainId.Acala,
  ChainId.Celo,
  ChainId.Algorand,
  // ChainId.PolygonSepolia, TODO: add when exists a Amoy transaction
  ChainId.Aptos,
  ChainId.Arbitrum,
  ChainId.ArbitrumSepolia,
  ChainId.Aurora,
  ChainId.Base,
  ChainId.BaseSepolia,
  // ChainId.Blast, TODO: add when exists a Blast transaction
  ChainId.BSC,
  ChainId.Fantom,
  ChainId.Avalanche,
  ChainId.Ethereum,
  ChainId.Holesky,
  ChainId.Injective,
  ChainId.Karura,
  ChainId.Klaytn,
  // ChainId.Mantle, TODO: add when exists a Mantle transaction
  ChainId.Moonbeam,
  ChainId.Polygon,
  ChainId.Near,
  ChainId.Neon,
  ChainId.Oasis,
  ChainId.Optimism,
  ChainId.OptimismSepolia,
  // ChainId.Scroll, TODO: add when exists a Scroll transaction
  ChainId.Sei,
  ChainId.Sepolia,
  ChainId.Solana,
  ChainId.Sui,
  ChainId.Terra,
  ChainId.Terra2,
  ChainId.Wormchain,
  ChainId.Xpla,
];

const Filters = () => {
  const navigate = useNavigateCustom();
  const filtersBtnRef = useRef<HTMLButtonElement>(null);
  const filtersContainerRef = useRef<HTMLDivElement>(null);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [showMore, setShowMore] = useState<IShowMore>({
    appId: false,
    sourceChain: false,
    targetChain: false,
  });

  const { width } = useWindowSize();
  const isMobile = width < 1024;

  const [searchParams, setSearchParams] = useSearchParams();
  const appIdParams = searchParams.get(APP_ID_STRING) || null;
  const exclusiveAppIdParams = searchParams.get(EXCLUSIVE_APP_ID_STRING) || null;
  const sourceChainParams = +searchParams.get(SOURCE_CHAIN_STRING) || null;
  const targetChainParams = +searchParams.get(TARGET_CHAIN_STRING) || null;

  const [checkedState, setCheckedState] = useState<ICheckedState>({
    appId: appIdParams,
    exclusiveAppId: exclusiveAppIdParams,
    sourceChain: sourceChainParams,
    targetChain: targetChainParams,
  });
  const totalFilterCounter = Object.values(checkedState).filter(Boolean).length;
  const disableApplyButton =
    checkedState.appId === appIdParams &&
    checkedState.exclusiveAppId === exclusiveAppIdParams &&
    checkedState.sourceChain === sourceChainParams &&
    checkedState.targetChain === targetChainParams;

  const { environment } = useEnvironment();
  const currentNetwork = environment.network;
  const orderedChains = currentNetwork === "MAINNET" ? ChainFilterMainnet : ChainFilterTestnet;

  useEffect(() => {
    if (isMobile) {
      if (showFilters) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "unset";
      }
    } else {
      document.body.style.overflow = "unset";
    }

    setCheckedState({
      appId: appIdParams,
      exclusiveAppId: exclusiveAppIdParams,
      sourceChain: sourceChainParams,
      targetChain: targetChainParams,
    });

    const handleClickOutside = (e: any) => {
      if (
        filtersContainerRef.current &&
        !filtersContainerRef.current.contains(e.target) &&
        filtersBtnRef.current &&
        !filtersBtnRef.current.contains(e.target)
      ) {
        setShowFilters(false);
      }
    };

    document.addEventListener("mouseup", handleClickOutside);
    return () => {
      document.removeEventListener("mouseup", handleClickOutside);
    };
  }, [
    appIdParams,
    exclusiveAppIdParams,
    isMobile,
    showFilters,
    sourceChainParams,
    targetChainParams,
  ]);

  const handleShowFilters = () => {
    setShowFilters(!showFilters);
  };

  const handleShowMore = (key: TShowMoreKey) => {
    setShowMore(prevState => ({
      ...prevState,
      [key]: !prevState[key],
    }));
  };

  const handleFilters = (key: TCheckedStateKey, value: string | ChainId) => {
    setCheckedState(prevState => {
      const newState: any = { ...prevState };

      if (key === APP_ID_STRING && newState.exclusiveAppId) {
        newState.exclusiveAppId = null;
      }

      newState[key] = newState[key] === value ? null : value;

      return newState;
    });
  };

  const clearFilters = () => {
    setCheckedState({
      appId: null,
      exclusiveAppId: null,
      sourceChain: null,
      targetChain: null,
    });
  };

  const applyFilters = () => {
    const url = Object.keys(checkedState).reduce((acc, key: string) => {
      const checkedStateKey = key as TCheckedStateKey;
      if (checkedState[checkedStateKey]) {
        return `${acc}&${key}=${checkedState[checkedStateKey]}`;
      }
      return acc;
    }, "/txs?page=1");

    navigate(url);
    setShowFilters(false);
  };

  return (
    <div className="filters">
      <button
        className={`filters-btn ${showFilters ? "active" : ""}`}
        ref={filtersBtnRef}
        onClick={handleShowFilters}
      >
        <span>Filters</span>
        {totalFilterCounter > 0 && <span className="counter">{totalFilterCounter}</span>}
        <img src={FiltersIcon} alt="filters icon" height={12} loading="lazy" />
      </button>

      {showFilters && <div className="filters-bg" />}

      <div className={`filters-container ${showFilters ? "show" : ""}`} ref={filtersContainerRef}>
        <header>
          <div className="filters-container-box">
            <button className="filters-container-box-btn" onClick={() => setShowFilters(false)}>
              <Cross1Icon height={24} width={24} />
            </button>
          </div>
        </header>

        <main>
          <div className="filters-container-box">
            <div className="filters-container-box-top">
              <p className="filters-container-box-top-title">
                Protocol
                {(checkedState.appId || checkedState.exclusiveAppId) && (
                  <span className="counter">
                    {checkedState.appId && checkedState.exclusiveAppId ? "2" : "1"}
                  </span>
                )}
              </p>
            </div>

            <div
              className="filters-container-box-content"
              style={{ height: isMobile ? (showMore.appId ? appIds.length * 32 : 160) : 190 }}
            >
              {appIds.map(appId => (
                <div
                  className="filters-container-box-content-item"
                  key={appId}
                  onClick={() => handleFilters(APP_ID_STRING, appId)}
                >
                  <p>
                    <span>{formatAppId(appId)}</span>
                  </p>

                  {appId === checkedState.appId &&
                    (appId === MAYAN_APP_ID ||
                      appId === PORTAL_APP_ID ||
                      appId === NTT_APP_ID ||
                      appId === GR_APP_ID) && (
                      <Tooltip
                        className="filters-container-box-top-tooltip"
                        tooltip={
                          <div>
                            Show only {formatAppId(appId)}, without any additional protocols.
                          </div>
                        }
                        type="info"
                      >
                        <div
                          className="filters-container-box-content-item-exclusive"
                          onClick={e => {
                            e.stopPropagation();
                            return handleFilters(EXCLUSIVE_APP_ID_STRING, "true");
                          }}
                        >
                          <div
                            className={`custom-input ${
                              checkedState.exclusiveAppId ? "checked" : ""
                            }`}
                          >
                            {checkedState.exclusiveAppId && <CheckIcon height={14} width={14} />}
                          </div>
                        </div>
                      </Tooltip>
                    )}

                  <div className={`custom-input ${checkedState.appId === appId ? "checked" : ""}`}>
                    {checkedState.appId === appId && <CheckIcon height={14} width={14} />}
                  </div>
                </div>
              ))}
            </div>

            <button
              className="filters-container-box-show-more-btn"
              onClick={() => handleShowMore(APP_ID_STRING)}
            >
              {showMore.appId ? "Show Less" : "Show More"}
            </button>
          </div>

          <div className="filters-container-box">
            <div className="filters-container-box-top">
              <p className="filters-container-box-top-title">
                Source Chain
                {checkedState.sourceChain && <span className="counter">1</span>}
              </p>
            </div>

            <div
              className="filters-container-box-content"
              style={{
                height: isMobile ? (showMore.sourceChain ? orderedChains.length * 32 : 160) : 190,
              }}
            >
              {orderedChains.map(value => (
                <Tooltip
                  key={value}
                  enableTooltip={value === ChainId.Wormchain}
                  tooltip={<div>This chain includes Injective, Osmosis, Kujira, and Evmos.</div>}
                  type="info"
                >
                  <div
                    key={value}
                    className="filters-container-box-content-item"
                    onClick={() => handleFilters(SOURCE_CHAIN_STRING, value)}
                  >
                    <p>
                      <BlockchainIcon
                        background="var(--color-white-10)"
                        chainId={value}
                        className="chain-icon"
                        colorless={true}
                        network={currentNetwork}
                        size={24}
                      />
                      <span>
                        {getChainName({
                          network: currentNetwork,
                          chainId: value,
                        })}
                      </span>
                    </p>
                    <div
                      className={`custom-input ${
                        checkedState.sourceChain === value ? "checked" : ""
                      }`}
                    >
                      {checkedState.sourceChain === value && <CheckIcon height={14} width={14} />}
                    </div>
                  </div>
                </Tooltip>
              ))}
            </div>

            <button
              className="filters-container-box-show-more-btn"
              onClick={() => handleShowMore(SOURCE_CHAIN_STRING)}
            >
              {showMore.sourceChain ? "Show Less" : "Show More"}
            </button>
          </div>

          <div className="filters-container-box">
            <div className="filters-container-box-top">
              <p className="filters-container-box-top-title">
                Target Chain {checkedState.targetChain && <span className="counter">1</span>}
              </p>
            </div>

            <div
              className="filters-container-box-content"
              style={{
                height: isMobile ? (showMore.targetChain ? orderedChains.length * 32 : 160) : 190,
              }}
            >
              {orderedChains.map(value => (
                <Tooltip
                  key={value}
                  enableTooltip={value === ChainId.Wormchain}
                  tooltip={<div>This chain includes Injective, Osmosis, Kujira, and Evmos.</div>}
                  type="info"
                >
                  <div
                    key={value}
                    className="filters-container-box-content-item"
                    onClick={() => handleFilters(TARGET_CHAIN_STRING, value)}
                  >
                    <p>
                      <BlockchainIcon
                        background="var(--color-white-10)"
                        chainId={value}
                        className="chain-icon"
                        colorless={true}
                        network={currentNetwork}
                        size={24}
                      />
                      <span>
                        {getChainName({
                          network: currentNetwork,
                          chainId: value,
                        })}
                      </span>
                    </p>
                    <div
                      className={`custom-input ${
                        checkedState.targetChain === value ? "checked" : ""
                      }`}
                    >
                      {checkedState.targetChain === value && <CheckIcon height={14} width={14} />}
                    </div>
                  </div>
                </Tooltip>
              ))}
            </div>

            <button
              className="filters-container-box-show-more-btn"
              onClick={() => handleShowMore(TARGET_CHAIN_STRING)}
            >
              {showMore.targetChain ? "Show Less" : "Show More"}
            </button>
          </div>
        </main>

        <div className="filters-container-bottom">
          <button
            className="filters-container-bottom-apply-btn"
            disabled={disableApplyButton}
            onClick={applyFilters}
          >
            Apply
            {totalFilterCounter > 0 && (
              <span className="counter inverted mobile">{totalFilterCounter}</span>
            )}
          </button>

          <button className="filters-container-bottom-close-btn" onClick={clearFilters}>
            Clear
          </button>

          <button
            className="filters-container-bottom-close-btn"
            onClick={() => setShowFilters(false)}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Filters;
