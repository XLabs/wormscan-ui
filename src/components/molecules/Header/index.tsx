import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { HamburgerMenuIcon, Cross1Icon } from "@radix-ui/react-icons";
import { Network } from "@certusone/wormhole-sdk";
import i18n from "src/i18n";
import { DISCORD_URL, PORTAL_BRIDGE_URL, WORMHOLE_DOCS_URL, XLABS_CAREERS_URL } from "src/consts";
import { useEnvironment } from "src/context/EnvironmentContext";
import { NavLink, Select, Tag } from "src/components/atoms";
import WormholeBrand from "../WormholeBrand";
import Search from "./Search";
import "./styles.scss";

type LinkProps = { onClickNavLink?: () => void };
type HeaderLinksProps = { onClickNavLink?: () => void; isMobile?: boolean };
type NavLinkItemProps = {
  to: string;
  label: string;
  onClick: () => void;
};
type ExternalLinkItemProps = {
  href: string;
  label: string;
  children?: React.ReactNode;
};

const LogoLink = ({ onClickNavLink }: LinkProps) => (
  <div className="header-logo-container">
    <NavLink to="/" data-testid="header-logo-link" onClick={onClickNavLink}>
      <WormholeBrand />
    </NavLink>
  </div>
);

const NavLinkItem = ({ to, label, onClick }: NavLinkItemProps) => (
  <div className="header-navigation-item">
    <NavLink to={to} onClick={onClick}>
      {i18n.t(label)}
    </NavLink>
  </div>
);

const ExternalLinkItem = ({ href, label, children }: ExternalLinkItemProps) => (
  <div className="header-navigation-item">
    <a href={href} target="_blank" rel="noopener noreferrer">
      {i18n.t(label)}
    </a>
    {children}
  </div>
);

const HeaderLinks = ({ onClickNavLink, isMobile }: HeaderLinksProps) => (
  <nav data-testid="header-nav">
    {isMobile && <NavLinkItem to="/" onClick={onClickNavLink} label="home.footer.home" />}
    <NavLinkItem to="/txs" onClick={onClickNavLink} label="home.header.txs" />
    {isMobile && (
      <>
        <ExternalLinkItem href={DISCORD_URL} label="home.footer.contactUs" />
        <div className="header-navigation-item">
          <ExternalLinkItem href={XLABS_CAREERS_URL} label="home.footer.careers">
            <Tag type="chip" size="small">
              {i18n.t("home.footer.hiring")}
            </Tag>
          </ExternalLinkItem>
        </div>
        <ExternalLinkItem href={WORMHOLE_DOCS_URL} label="home.footer.apiDoc" />
      </>
    )}
  </nav>
);

type NetworkSelectProps = { label: string; value: Network };

const NETWORK_LIST: NetworkSelectProps[] = [
  { label: "Mainnet", value: "MAINNET" },
  { label: "Testnet", value: "TESTNET" },
];

const Header = () => {
  const [expandMobileMenu, setExpandMobileMenu] = useState<boolean>(false);

  const { t } = useTranslation();
  const { environment, setEnvironment } = useEnvironment();
  const { pathname, search } = useLocation();
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
          value={NETWORK_LIST.find(a => a.value === currentNetwork)}
          onValueChange={(env: NetworkSelectProps) => onClickChangeNetwork(env.value)}
          items={NETWORK_LIST}
          ariaLabel={"Select Network"}
          className={`header-network-select ${isMainnet ? "" : "header-network-select--active"}`}
        />

        <div className="header-navigation">
          <HeaderLinks />
        </div>

        {isMainnet && (
          <div className="go-bridge-container">
            <a
              className="go-bridge"
              href={PORTAL_BRIDGE_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("home.header.goBridge")}
            </a>
          </div>
        )}

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
          <LogoLink onClickNavLink={hideMobileMenu} />
          <div className="header-navigation-mobile-container" onClick={hideMobileMenu}>
            <Cross1Icon className="header-navigation-mobile-btn" />
          </div>
        </div>

        <div className="header-navigation-mobile-nav">
          <HeaderLinks onClickNavLink={hideMobileMenu} isMobile={true} />

          <div className="header-navigation-item">
            {isMainnet && (
              <div className="go-bridge-container">
                <a
                  className="go-bridge"
                  href={PORTAL_BRIDGE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t("home.header.goBridge")}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      <label
        className={`header-menu-mobile-mask header-menu-mobile-mask--${
          expandMobileMenu ? "open" : "close"
        }`}
        onClick={hideMobileMenu}
      />
    </header>
  );
};

export default Header;
