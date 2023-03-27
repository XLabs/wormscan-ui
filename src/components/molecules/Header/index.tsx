import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import WormholeBrand from "../WormholeBrand";
import { HamburgerMenuIcon, Cross1Icon } from "@radix-ui/react-icons";
import "./styles.scss";
import { useState, useEffect } from "react";

const Header = () => {
  const { t } = useTranslation();
  const [expandItems, setExpandItems] = useState(false);

  useEffect(() => {
    if (expandItems) {
      document.body.style.overflow = "hidden";
      document.body.style.width = "calc(100% - 15px)";
    } else {
      document.body.style.overflow = "unset";
      document.body.style.width = "auto";
    }
  }, [expandItems]);

  const renderOptions = () => (
    <nav>
      <div className="header-navigation-item">
        <NavLink to="/">{t("home.header.about")}</NavLink>
      </div>

      <div className="header-navigation-item">
        <NavLink to="/txns">{t("home.header.txns")}</NavLink>
      </div>

      <div className="header-navigation-item">
        <NavLink to="/">{t("home.header.analytics")}</NavLink>
      </div>

      <div className="header-navigation-item">
        <NavLink to="/">{t("home.header.guardians")}</NavLink>
      </div>
    </nav>
  );

  return (
    <header className="header">
      <NavLink to="/">
        <WormholeBrand width={36.75} height={32.25} />
      </NavLink>

      <HamburgerMenuIcon
        onClick={() => setExpandItems(true)}
        className="header-open-mobile-menu-btn"
        width={20}
        height={20}
      />

      {/* DESKTOP OPTIONS */}
      <div className="header-navigation">
        {renderOptions()}

        <div className="header-actions">
          <button className="connect-button">{t("home.header.goBridge")}</button>
        </div>
      </div>

      {/* MOBILE HAMBURGUER MENU */}
      {expandItems && (
        <div className="header-navigation-mobile">
          <div className="header-navigation-mobile-top">
            <NavLink to="/">
              <WormholeBrand width={36.75} height={32.25} />
            </NavLink>
            <Cross1Icon
              onClick={() => setExpandItems(false)}
              className="header-navigation-mobile-btn"
              width={20}
              height={20}
            />
          </div>

          <div className="header-navigation-mobile-nav">
            {renderOptions()}

            <div className="header-navigation-item">
              <button className="go-bridge">{t("home.header.goBridge")}</button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
