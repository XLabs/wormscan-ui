import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { Network } from "@wormhole-foundation/sdk";
import { useEnvironment } from "src/context/EnvironmentContext";
import { NavLink, Select } from "src/components/atoms";
import { TermsOfUseBanner, WormholeScanBrand } from "src/components/molecules";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import Search from "./Search";
import {
  HomeIcon,
  SearchIcon,
  MenuIcon,
  SwapVerticalIcon,
  TriangleDownIcon,
  LayersIcon,
  GlobeIcon,
  Cube3DIcon,
  LinkIcon,
  Code2Icon,
  AnalyticsIcon,
} from "src/icons/generic";
import { useOutsideClick, useWindowSize } from "src/utils/hooks";
import { BREAKPOINTS, GITHUB_URL, WORMHOLE_DOCS_URL, WORMHOLESCAN_API_DOCS_URL } from "src/consts";
import "./styles.scss";
import { getTokenIcon } from "src/utils/token";

type NetworkSelectProps = { label: string; value: Network };

const NETWORK_LIST: NetworkSelectProps[] = [
  { label: "Mainnet", value: "Mainnet" },
  { label: "Testnet", value: "Testnet" },
];

const Header = ({
  secondaryHeader = false,
  showTopHeader = true,
}: {
  secondaryHeader?: boolean;
  showTopHeader?: boolean;
}) => {
  const [showDesktopFixedNav, setShowDesktopFixedNav] = useState(false);
  const [lastScrollTop, setLastScrollTop] = useState(0);
  const [showMobileNav, setShowMobileNav] = useState(true);
  const [showMobileAnalytics, setShowMobileAnalytics] = useState(false);
  const [showMobileOtherMenu, setShowMobileOtherMenu] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const headerRef = useRef(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mobileNavRef = useRef(null);
  const { width } = useWindowSize();
  const isDesktop = width >= BREAKPOINTS.desktop;
  const { environment, setEnvironment } = useEnvironment();
  const { pathname, search } = useLocation();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const tokenIcon = getTokenIcon("W");

  const currentNetwork = environment.network;

  useEffect(() => {
    if (isDesktop) {
      const currentHeaderRef = headerRef.current;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) {
            setShowDesktopFixedNav(true);
          } else {
            setShowDesktopFixedNav(false);
          }
        },
        {
          root: null,
          rootMargin: "0px",
          threshold: 0.1,
        },
      );

      if (currentHeaderRef) {
        observer.observe(currentHeaderRef);
      }

      return () => {
        if (currentHeaderRef) {
          observer.unobserve(currentHeaderRef);
        }
      };
    }
  }, [isDesktop]);

  useEffect(() => {
    if (!isDesktop) {
      const scrollThreshold = 20;

      const handleScroll = () => {
        const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (Math.abs(lastScrollTop - currentScrollTop) > scrollThreshold) {
          setShowMobileNav(lastScrollTop > currentScrollTop || currentScrollTop < scrollThreshold);
          setLastScrollTop(currentScrollTop <= 0 ? 0 : currentScrollTop);
        }
      };

      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, [lastScrollTop, isDesktop]);

  useEffect(() => {
    if (!showMobileNav) {
      setShowMobileAnalytics(false);
      setShowMobileOtherMenu(false);
    }
  }, [showMobileNav]);

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
  };

  const handleFocus = () => {
    setIsActive(true);
  };

  const handleBlur = () => {
    setIsActive(false);
  };

  const closeAllMobileMenus = () => {
    setShowMobileAnalytics(false);
    setShowMobileOtherMenu(false);
  };

  useOutsideClick({ ref: mobileNavRef, callback: closeAllMobileMenus });

  return (
    <header
      className={`header ${secondaryHeader ? "header-secondary" : ""}`}
      data-testid="header"
      ref={headerRef}
    >
      <div
        className={`header-banner ${!isDesktop && showMobileNav ? "show-mobile-nav" : ""} ${
          !isDesktop && showMobileNav && showMobileAnalytics ? "show-mobile-analytics" : ""
        } ${!isDesktop && showMobileNav && showMobileOtherMenu ? "show-mobile-other" : ""}`}
      >
        <TermsOfUseBanner />
      </div>

      {showTopHeader && (
        <div
          className={`header-container ${secondaryHeader ? "header-container-secondary" : ""} ${
            showDesktopFixedNav ? "header-container-fixed" : ""
          }`}
        >
          <div className="header-container-logo">
            <NavLink to="/" data-testid="header-logo-link">
              <WormholeScanBrand pos={showDesktopFixedNav ? "horizontal" : "vertical"} />
            </NavLink>
          </div>

          <Search ref={inputRef} onFocus={handleFocus} onBlur={handleBlur} />

          <nav className="header-container-links">
            <NavLink to="/" aria-label="Home">
              <HomeIcon />
            </NavLink>

            <NavLink to="/txs" aria-label={t("home.header.txs")}>
              {t("home.header.txs")}
            </NavLink>

            <NavLink to="/governor" aria-label="Governor">
              Governor
            </NavLink>

            <NavigationMenu.Root delayDuration={0}>
              <NavigationMenu.List className="dropdown-menu">
                <NavigationMenu.Item>
                  <NavigationMenu.Trigger
                    className={`dropdown-menu-trigger ${
                      pathname.includes("/analytics") ? "active" : ""
                    }`}
                  >
                    Analytics <TriangleDownIcon className="icon" />
                  </NavigationMenu.Trigger>

                  <NavigationMenu.Content className="dropdown-menu-content">
                    <NavLink to="/analytics/w" aria-label="analytics wormhole token">
                      <img
                        className="dropdown-menu-content-wIcon"
                        src={tokenIcon}
                        alt="W Token"
                        width="16"
                        height="16"
                      />{" "}
                      W Token
                    </NavLink>

                    <NavLink to="/analytics/tokens" aria-label="analytics tokens">
                      <LayersIcon /> Tokens
                    </NavLink>

                    <NavLink to="/analytics/chains" aria-label="analytics chains">
                      <GlobeIcon /> Chains
                    </NavLink>

                    <NavLink to="/analytics/protocols" aria-label="analytics protocols">
                      <Cube3DIcon /> Protocols
                    </NavLink>
                  </NavigationMenu.Content>
                </NavigationMenu.Item>
              </NavigationMenu.List>
            </NavigationMenu.Root>

            <NavigationMenu.Root delayDuration={0}>
              <NavigationMenu.List className="dropdown-menu">
                <NavigationMenu.Item>
                  <NavigationMenu.Trigger
                    className={`dropdown-menu-trigger ${
                      pathname.includes("/developers/vaa-parser") ? "active" : ""
                    }`}
                  >
                    Developers <TriangleDownIcon className="icon" />
                  </NavigationMenu.Trigger>

                  <NavigationMenu.Content className="dropdown-menu-content">
                    <NavLink to="/developers/vaa-parser" aria-label="VAA Parser">
                      <Code2Icon /> VAA Parser
                    </NavLink>

                    <NavLink to="/developers/submit" aria-label="Submit Your Protocol">
                      <Code2Icon /> Submit Your Protocol
                    </NavLink>

                    <NavLink to="/developers/api-doc" aria-label="API Doc">
                      <Code2Icon /> API Doc
                    </NavLink>

                    <a
                      href={WORMHOLE_DOCS_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Wormhole Doc"
                    >
                      <LinkIcon /> Wormhole Doc
                    </a>

                    <a
                      href={GITHUB_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Github"
                    >
                      <LinkIcon /> Github
                    </a>
                  </NavigationMenu.Content>
                </NavigationMenu.Item>
              </NavigationMenu.List>
            </NavigationMenu.Root>

            <Select
              ariaLabel="Select Network"
              className="header-select-network"
              items={NETWORK_LIST}
              name="networkSelect"
              onValueChange={(env: NetworkSelectProps) => onClickChangeNetwork(env.value)}
              type="secondary"
              menuPortalStyles={{ zIndex: 99 }}
              value={NETWORK_LIST.find(a => a.value === currentNetwork)}
            />
          </nav>
        </div>
      )}

      <div
        className={`header-container-mobile ${showMobileNav ? "" : "hidden"}`}
        ref={mobileNavRef}
      >
        <div className="header-container-mobile-items">
          <NavLink to="/" aria-label="Home">
            <HomeIcon />
            HOME
          </NavLink>

          <div
            className={`navlink ${isActive ? "active" : ""}`}
            onClick={() => inputRef.current.focus()}
          >
            <SearchIcon />
            SEARCH
          </div>

          <NavLink to="/txs" aria-label="Swap">
            <SwapVerticalIcon />
            TXS
          </NavLink>

          <div
            className={`navlink  ${showMobileAnalytics ? "active" : ""}`}
            onClick={() => {
              setShowMobileOtherMenu(false);
              setShowMobileAnalytics(!showMobileAnalytics);
            }}
          >
            <AnalyticsIcon />
            ANALYTICS
          </div>

          <div
            className={`navlink ${showMobileOtherMenu ? "active" : ""}`}
            onClick={() => {
              setShowMobileAnalytics(false);
              setShowMobileOtherMenu(!showMobileOtherMenu);
            }}
          >
            <MenuIcon />
            OTHER
          </div>
        </div>

        <div
          className={`header-container-mobile-menu ${
            showMobileNav && showMobileAnalytics ? "open" : ""
          }`}
        >
          <NavLink
            to="/analytics/w"
            aria-label="analytics wormhole token"
            onClick={closeAllMobileMenus}
          >
            <img
              className="header-container-mobile-menu-wIcon"
              src={tokenIcon}
              alt="W Token"
              width="16"
              height="16"
            />{" "}
            W Token
          </NavLink>

          <NavLink
            to="/analytics/tokens"
            aria-label="analytics tokens"
            onClick={closeAllMobileMenus}
          >
            <LayersIcon /> Tokens
          </NavLink>

          <NavLink
            to="/analytics/chains"
            aria-label="analytics chains"
            onClick={closeAllMobileMenus}
          >
            <GlobeIcon /> Chains
          </NavLink>

          <NavLink
            to="/analytics/protocols"
            aria-label="analytics protocols"
            onClick={closeAllMobileMenus}
          >
            <Cube3DIcon /> Protocols
          </NavLink>
        </div>

        <div
          className={`header-container-mobile-menu ${
            showMobileNav && showMobileOtherMenu ? "open" : ""
          }`}
        >
          <NavLink to="/governor" aria-label="Governor">
            Governor
          </NavLink>

          <div className="header-container-mobile-menu-dev-tools-title">Developers</div>

          <div className="header-container-mobile-menu-dev-tools">
            <NavLink
              to="/developers/vaa-parser"
              aria-label="VAA Parser"
              onClick={closeAllMobileMenus}
            >
              <Code2Icon /> VAA Parser
            </NavLink>

            <NavLink
              to="/developers/submit"
              aria-label="Submit Yout Protocol"
              onClick={closeAllMobileMenus}
            >
              <Code2Icon /> Submit Your Protocol
            </NavLink>

            <NavLink to="/developers/api-doc" aria-label="API Doc" onClick={closeAllMobileMenus}>
              <Code2Icon /> API Doc
            </NavLink>

            <a
              className="navlink"
              href={WORMHOLE_DOCS_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Wormhole Doc"
              onClick={closeAllMobileMenus}
            >
              <LinkIcon /> Wormhole Doc
            </a>

            <a
              className="navlink"
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Github"
              onClick={closeAllMobileMenus}
            >
              <LinkIcon /> Github
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
