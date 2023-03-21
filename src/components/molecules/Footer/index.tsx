import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import DiscordIcon from "src/icons/DiscordIcon";
import TwitterIcon from "src/icons/TwitterIcon";
import WormholeBrand from "../WormholeBrand";

import "./styles.scss";

const Footer = () => {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-copy">
        <NavLink to="/">
          <WormholeBrand width={36.75} height={32.25} />
        </NavLink>
        <div className="footer-copy-text">&copy; {year} Wormscan.</div>
      </div>

      <div className="footer-links">
        <div className="footer-links-item">
          <NavLink to="/">{t("home.footer.faq")}</NavLink>
        </div>

        <div className="footer-links-item">
          <NavLink to="/txns">{t("home.footer.txns")}</NavLink>
        </div>

        <div className="footer-links-item">
          <NavLink to="/">{t("home.footer.contact")}</NavLink>
        </div>

        <div className="footer-links-item">
          <NavLink to="/">{t("home.footer.about")}</NavLink>
        </div>

        <div className="footer-links-item">
          <NavLink to="/">{t("home.footer.analytics")}</NavLink>
        </div>

        <div className="footer-links-item">
          <NavLink to="/">{t("home.footer.network")}</NavLink>
        </div>
      </div>

      <div className="footer-social">
        <DiscordIcon />
        <TwitterIcon />
      </div>
    </footer>
  );
};

export default Footer;
