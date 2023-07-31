import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { NavLink, Select } from "src/components/atoms";
import WormholeBrand from "../WormholeBrand";
import { HamburgerMenuIcon, Cross1Icon } from "@radix-ui/react-icons";
import i18n from "src/i18n";
import Search from "./Search";
import { PORTAL_BRIDGE_URL } from "src/consts";
import { useLocation, useNavigate } from "react-router-dom";
import "./styles.scss";
import { useEnvironment } from "src/context/EnvironmentContext";
import { Network } from "@certusone/wormhole-sdk";

const setOverflowHidden = (hidden: boolean) => {
  if (hidden) {
    document.body.style.overflow = "hidden";
    document.body.style.width = "calc(100% - 15px)";
  } else {
    document.body.style.overflow = "unset";
    document.body.style.width = "auto";
  }
};

const LogoLink = () => (
  <NavLink to="/" data-testid="header-logo-link">
    <WormholeBrand />
  </NavLink>
);

const HeaderLinks = () => (
  <nav data-testid="header-nav">
    <div className="header-navigation-item">
      <NavLink to="/txs">{i18n.t("home.header.txs")}</NavLink>
    </div>
  </nav>
);

type NetworkSelectProps = { label: string; value: Network };

const NETWORK_LIST: NetworkSelectProps[] = [
  { label: "Mainnet", value: "MAINNET" },
  { label: "Testnet", value: "TESTNET" },
];

const Header = () => {
  const { t } = useTranslation();
  const { pathname, search } = useLocation();
  const navigate = useNavigate();

  const { environment, setEnvironment } = useEnvironment();
  const currentNetwork = environment.network;

  const isMainnet = currentNetwork === "MAINNET";

  const [expandMobileMenu, setExpandMobileMenu] = useState<boolean>(false);
  const handleSetExpand = () => {
    setExpandMobileMenu(state => {
      setOverflowHidden(!state);
      return !state;
    });
  };

  useEffect(() => {
    return () => setOverflowHidden(false);
  }, []);

  const onClickChangeNetwork = (network: Network) => {
    if (network === currentNetwork) return;
    setEnvironment(network);

    // if watching a transaction, go to transactions list
    if (pathname.includes("/tx/")) {
      navigate(`/txs?network=${network}`);
      return;
    }

    // if watching txs list on a specific page, go to page 1.
    if (pathname.includes("/txs") && search.includes("page=")) {
      navigate(`/txs?network=${network}`);
      return;
    }

    // if on search not found, go to home
    if (pathname.includes("/search-not-found")) {
      navigate(`/?network=${network}`);
      return;
    }
  };

  return (
    <header className="header" data-testid="header">
      <LogoLink />
      <Search />
      <div className="header-actions">
        <Select
          name={"networkSelect"}
          value={NETWORK_LIST.find(a => a.value === environment.network)}
          onValueChange={(env: NetworkSelectProps) => onClickChangeNetwork(env.value)}
          items={NETWORK_LIST}
          ariaLabel={"Select Network"}
          className={`header-network-select ${!isMainnet && "header-network-select--active"}`}
        />

        <div className="header-navigation">
          <HeaderLinks />
        </div>

        {isMainnet && (
          <div className="go-bridge-container">
            <a href={PORTAL_BRIDGE_URL} target="_blank" rel="noopener noreferrer">
              <button className="go-bridge">{t("home.header.goBridge")}</button>
            </a>
          </div>
        )}

        {/* MOBILE HAMBURGER MENU */}
        <div className="header-hamburger">
          <div className="header-hamburger-container" onClick={handleSetExpand}>
            <HamburgerMenuIcon className="header-open-mobile-menu-btn" />
          </div>
        </div>
      </div>

      <div
        className={`header-navigation-mobile header-navigation-mobile--${
          expandMobileMenu ? "open" : "close"
        }`}
      >
        <div className="header-navigation-mobile-top">
          <LogoLink />
          <div className="header-navigation-mobile-container" onClick={handleSetExpand}>
            <Cross1Icon className="header-navigation-mobile-btn" />
          </div>
        </div>

        <div className="header-navigation-mobile-nav">
          <HeaderLinks />

          <div className="header-navigation-item">
            {isMainnet && (
              <div className="go-bridge-container">
                <a href={PORTAL_BRIDGE_URL} target="_blank" rel="noopener noreferrer">
                  <button className="go-bridge" data-testid="go-bridge-button">
                    {t("home.header.goBridge")}
                  </button>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
