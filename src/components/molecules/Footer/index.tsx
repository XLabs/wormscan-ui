import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import DiscordIcon from "src/icons/DiscordIcon";
import TwitterIcon from "src/icons/TwitterIcon";
import WormholeBrand from "../WormholeBrand";

import "./styles.scss";

const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="footer">
      <WormholeBrand width={49} height={43} />

      <div className="footer-links">
        <div className="footer-links-item">
          <NavLink to="/">{t("home.footer.faq")}</NavLink>
        </div>

        <div className="footer-links-item">
          <NavLink to="/">{t("home.footer.status")}</NavLink>
        </div>

        <div className="footer-links-item">
          <NavLink to="/">{t("home.footer.bridge")}</NavLink>
        </div>

        <div className="footer-links-item">
          <NavLink to="/">{t("home.footer.stats")}</NavLink>
        </div>

        <div className="footer-links-item">
          <NavLink to="/">{t("home.footer.contact")}</NavLink>
        </div>
      </div>

      <div className="footer-social">
        {t("home.footer.join")}
        <DiscordIcon />
        <TwitterIcon />
      </div>
    </footer>
  );
};

export default Footer;
