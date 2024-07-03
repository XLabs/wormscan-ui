import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { TriangleDownIcon } from "@radix-ui/react-icons";
import { Network } from "@wormhole-foundation/sdk";
import { TWITTER_URL, DISCORD_URL, WORMHOLE_DOCS_URL, XLABS_CAREERS_URL } from "src/consts";
import { useEnvironment } from "src/context/EnvironmentContext";
import { NavLink, Select, Tag } from "src/components/atoms";
import { WormholeScanBrand } from "src/components/molecules";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import Search from "./Search";
import { AnalyticsIcon, HomeIcon, SearchIcon, MenuIcon, SwapVerticalIcon } from "src/icons/generic";
import { useWindowSize } from "src/utils/hooks";
import "./styles.scss";

type NetworkSelectProps = { label: string; value: Network };

const NETWORK_LIST: NetworkSelectProps[] = [
  { label: "Mainnet", value: "Mainnet" },
  { label: "Testnet", value: "Testnet" },
];

const Header = () => {
  const [showDesktopFixedNav, setShowDesktopFixedNav] = useState(false);
  const [lastScrollTop, setLastScrollTop] = useState(0);
  const [showMobileNav, setShowMobileNav] = useState(true);
  const [showMobileOtherMenu, setShowMobileOtherMenu] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const headerRef = useRef(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { width } = useWindowSize();
  const isDesktop = width >= 1024;
  const { environment, setEnvironment } = useEnvironment();
  const { pathname, search } = useLocation();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const currentNetwork = environment.network;
  const isMainnet = currentNetwork === "Mainnet";

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
      const handleScroll = () => {
        const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
        setShowMobileNav(lastScrollTop > currentScrollTop || currentScrollTop < 50);
        setLastScrollTop(currentScrollTop <= 0 ? 0 : currentScrollTop);
      };

      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, [lastScrollTop, isDesktop]);

  useEffect(() => {
    if (!showMobileNav) {
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

  return (
    <header className="header" data-testid="header" ref={headerRef}>
      <div className={`header-container ${showDesktopFixedNav ? "header-container-fixed" : ""}`}>
        <div className="header-container-logo">
          <NavLink to="/" data-testid="header-logo-link">
            <WormholeScanBrand pos={showDesktopFixedNav ? "horizontal" : "vertical"} />
          </NavLink>
        </div>

        <Search ref={inputRef} onFocus={handleFocus} onBlur={handleBlur} />

        <nav className="header-container-links">
          <NavLink to="/" aria-label="Home">
            <HomeIcon width={24} />
          </NavLink>

          <NavLink to="/txs" aria-label={t("home.header.txs")}>
            {t("home.header.txs")}
          </NavLink>

          {isMainnet && (
            <NavLink to="/governor" aria-label="Governor">
              Governor
            </NavLink>
          )}

          <NavigationMenu.Root delayDuration={0}>
            <NavigationMenu.List className="dropdown-menu">
              <NavigationMenu.Item>
                <NavigationMenu.Trigger className="dropdown-menu-trigger">
                  Dev Tools <TriangleDownIcon className="icon" height={16} width={16} />
                </NavigationMenu.Trigger>

                <NavigationMenu.Content className="dropdown-menu-content">
                  <NavLink to="/vaa-parser" aria-label="VAA Parser">
                    VAA Parser
                  </NavLink>

                  <a
                    href="https://docs.wormholescan.io/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="API Docs"
                  >
                    API Docs
                  </a>

                  <a
                    href="https://docs.wormhole.com/wormhole"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Wormhole Docs"
                  >
                    Wormhole Docs
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

      <div className={`header-container-mobile ${showMobileNav ? "" : "hidden"}`}>
        <NavLink to="/" aria-label="Home">
          <HomeIcon width={24} />
          HOME
        </NavLink>

        <div
          className={`navlink ${isActive ? "active" : ""}`}
          onClick={() => inputRef.current.focus()}
        >
          <SearchIcon width={24} />
          SEARCH
        </div>

        <NavLink to="/txs" aria-label="Swap">
          <SwapVerticalIcon width={24} />
          TXS
        </NavLink>

        <NavLink to="/analytics" aria-label="Analytics">
          <AnalyticsIcon width={24} />
          STATS
        </NavLink>

        <div
          className={`navlink ${showMobileOtherMenu ? "active" : ""}`}
          onClick={() => setShowMobileOtherMenu(!showMobileOtherMenu)}
        >
          <MenuIcon width={24} />
          OTHER
        </div>
      </div>

      <div
        className={`header-container-mobile-other-menu ${
          showMobileNav && showMobileOtherMenu ? "open" : ""
        }`}
      >
        {isMainnet && (
          <NavLink to="/governor" aria-label="Governor">
            Governor
          </NavLink>
        )}

        <div className="header-container-mobile-other-menu-dev-tools-title">Dev tools</div>

        <div className="header-container-mobile-other-menu-dev-tools">
          <NavLink to="/vaa-parser" aria-label="VAA Parser">
            VAA Parser
          </NavLink>

          <a
            href="https://docs.wormholescan.io/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="API Docs"
          >
            API docs
          </a>

          <a
            href="https://docs.wormhole.com/wormhole"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Wormhole Docs"
          >
            Wormhole docs
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
