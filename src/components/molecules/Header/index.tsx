import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import WormholeBrand from "../WormholeBrand";
import "./styles.scss";

const Header = () => {
  const { t } = useTranslation();

  return (
    <header className="header">
      <WormholeBrand width={36.75} height={32.25} />

      <div className="header-navigation">
        <nav>
          <div className="header-navigation-item">
            <NavLink to="/">{t("home.header.about")}</NavLink>
          </div>

          <div className="header-navigation-item">
            <NavLink to="/">{t("home.header.txns")}</NavLink>
          </div>

          <div className="header-navigation-item">
            <NavLink to="/">{t("home.header.analytics")}</NavLink>
          </div>

          <div className="header-navigation-item">
            <NavLink to="/">{t("home.header.guardians")}</NavLink>
          </div>
        </nav>

        <div className="header-actions">
          <button className="connect-button">{t("home.header.goBridge")}</button>
        </div>
      </div>
    </header>
  );
};

export default Header;
