import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { NavLink } from "src/components/atoms";
import WormholeBrand from "../WormholeBrand";
import { HamburgerMenuIcon, Cross1Icon } from "@radix-ui/react-icons";
import i18n from "src/i18n";
import Search from "./Search";
import "./styles.scss";
import { PORTAL_BRIDGE_URL } from "src/consts";

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

const Header = () => {
  const { t } = useTranslation();

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

  return (
    <header className="header" data-testid="header">
      <LogoLink />
      <Search />

      {/* DESKTOP OPTIONS */}
      <div className="header-navigation">
        <HeaderLinks />

        <div className="header-actions">
          <a href={PORTAL_BRIDGE_URL} target="_blank" rel="noreferrer">
            <button className="connect-button">{t("home.header.goBridge")}</button>
          </a>
        </div>
      </div>

      {/* MOBILE HAMBURGER MENU */}
      <div className="header-hamburger">
        <div className="header-hamburger-container" onClick={handleSetExpand}>
          <HamburgerMenuIcon className="header-open-mobile-menu-btn" />
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
            <a href={PORTAL_BRIDGE_URL} target="_blank" rel="noreferrer">
              <button className="go-bridge" data-testid="go-bridge-button">
                {t("home.header.goBridge")}
              </button>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
