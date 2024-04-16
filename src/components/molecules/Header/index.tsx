import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { HamburgerMenuIcon, Cross1Icon, TriangleDownIcon } from "@radix-ui/react-icons";
import { Network } from "@certusone/wormhole-sdk";
import DiscordIcon from "src/icons/DiscordIcon";
import TwitterIcon from "src/icons/TwitterIcon";
import { TWITTER_URL, DISCORD_URL, WORMHOLE_DOCS_URL, XLABS_CAREERS_URL } from "src/consts";
import { useEnvironment } from "src/context/EnvironmentContext";
import { NavLink, Select, Tag } from "src/components/atoms";
import { WormholeBrand } from "src/components/molecules";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import Search from "./Search";
import "./styles.scss";

type NavLinkItemProps = {
  to: string;
  label: string;
};
type ExternalLinkItemProps = {
  href: string;
  label: string;
  children?: React.ReactNode;
};

type NetworkSelectProps = { label: string; value: Network };

const NETWORK_LIST: NetworkSelectProps[] = [
  { label: "Mainnet", value: "MAINNET" },
  { label: "Testnet", value: "TESTNET" },
];

const Header = () => {
  const [expandMobileMenu, setExpandMobileMenu] = useState<boolean>(false);
  const { environment, setEnvironment } = useEnvironment();
  const { pathname, search } = useLocation();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const currentNetwork = environment.network;
  const isMainnet = currentNetwork === "MAINNET";

  const showMobileMenu = () => {
    setExpandMobileMenu(true);
    document.body.style.overflow = "hidden";
  };

  const hideMobileMenu = () => {
    setExpandMobileMenu(false);
    document.body.style.overflow = "unset";
  };

  const onClickChangeNetwork = (network: Network) => {
    if (network === currentNetwork) return;
    setEnvironment(network);
    hideMobileMenu();

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

  const LogoLink = () => (
    <div className="header-logo-container">
      <NavLink to="/" data-testid="header-logo-link" onClick={hideMobileMenu}>
        <WormholeBrand />
      </NavLink>
    </div>
  );

  const NavLinkItem = ({ to, label }: NavLinkItemProps) => (
    <div className="header-navigation-item">
      <NavLink to={to} onClick={hideMobileMenu}>
        {label}
      </NavLink>
    </div>
  );

  const ExternalLinkItem = ({ href, label, children }: ExternalLinkItemProps) => (
    <div className="header-navigation-item">
      <a href={href} target="_blank" rel="noopener noreferrer">
        {label}
      </a>
      {children}
    </div>
  );

  const HeaderLinks = ({ isMobile = false }: { isMobile?: boolean }) => (
    <nav data-testid="header-nav">
      {isMobile && <NavLinkItem to="/" label={t("home.footer.home")} />}
      <NavLinkItem to="/txs" label={t("home.header.txs")} />
      {isMainnet && <NavLinkItem to="/governor" label="Governor" />}

      <NavigationMenu.Root delayDuration={0}>
        <NavigationMenu.List className="dropdown-menu">
          <NavigationMenu.Item>
            <NavigationMenu.Trigger className="dropdown-menu-trigger">
              Dev Tools <TriangleDownIcon className="icon" />
            </NavigationMenu.Trigger>

            <NavigationMenu.Content className="dropdown-menu-content">
              <NavLinkItem to="/vaa-parser" label="VAA Parser" />
              <ExternalLinkItem href="https://docs.wormholescan.io/" label="API Docs" />
              <ExternalLinkItem href="https://docs.wormhole.com/wormhole" label="Wormhole Docs" />
            </NavigationMenu.Content>
          </NavigationMenu.Item>
        </NavigationMenu.List>
      </NavigationMenu.Root>

      {isMobile && <NavLinkItem to="/terms-of-use" label={t("home.footer.termsOfUse")} />}

      <Select
        name={"networkSelect"}
        value={NETWORK_LIST.find(a => a.value === currentNetwork)}
        onValueChange={(env: NetworkSelectProps) => onClickChangeNetwork(env.value)}
        items={NETWORK_LIST}
        ariaLabel={"Select Network"}
        className="header-network-select"
      />

      {isMobile && (
        <div className="header-navigation-item-social">
          <div className="header-navigation-item-social-text">{t("home.footer.joinUs")}</div>
          <div className="header-navigation-item-social-icons">
            <a
              href={DISCORD_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Discord link"
            >
              <DiscordIcon />
            </a>
            <a
              href={TWITTER_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter link"
            >
              <TwitterIcon />
            </a>
          </div>
        </div>
      )}
    </nav>
  );

  return (
    <header className="header" data-testid="header">
      <LogoLink />
      <div className="header-mobile-line" />
      <Search />
      <div className="header-actions">
        <div className="header-navigation">
          <HeaderLinks />
        </div>

        {/* MOBILE HAMBURGER MENU */}
        <div className="header-hamburger">
          <div className="header-hamburger-container" onClick={showMobileMenu}>
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
          <div className="header-navigation-mobile-container" onClick={hideMobileMenu}>
            <Cross1Icon className="header-navigation-mobile-btn" />
          </div>
        </div>

        <div className="header-navigation-mobile-nav">
          <HeaderLinks isMobile={true} />
        </div>
      </div>

      <div
        className={`header-menu-mobile-mask header-menu-mobile-mask--${
          expandMobileMenu ? "open" : "close"
        }`}
        onClick={hideMobileMenu}
      />
    </header>
  );
};

export default Header;
