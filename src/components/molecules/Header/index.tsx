import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import WormholeBrand from "../WormholeBrand";
import "./styles.scss";

const Header = () => {
  const { t } = useTranslation();

  return (
    <header className="header">
      <WormholeBrand width={49} height={43} />

      <div className="header-navigation">
        <nav>
          <div className="header-navigation-item">
            <NavLink to="/">{t("home.header.status")}</NavLink>
          </div>

          <div className="header-navigation-item">
            <NavLink to="/">{t("home.header.bridge")}</NavLink>
          </div>

          <div className="header-navigation-item">
            <NavLink to="/">{t("home.header.stats")}</NavLink>
          </div>

          <div className="header-navigation-item">
            <NavLink to="/">{t("home.header.history")}</NavLink>
          </div>
        </nav>

        <div className="header-actions">
          <button className="connect-button">{t("home.header.connect")}</button>
        </div>
      </div>
    </header>
  );
};

export default Header;
