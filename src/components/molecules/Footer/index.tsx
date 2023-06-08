import { useTranslation } from "react-i18next";
import { NavLink } from "src/components/atoms";
import DiscordIcon from "src/icons/DiscordIcon";
import TwitterIcon from "src/icons/TwitterIcon";
import WormholeBrand from "../WormholeBrand";
import "./styles.scss";

const Footer = () => {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="footer" data-testid="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <NavLink to="/" data-testid="footer-logo-link">
            <WormholeBrand size="regular" />
          </NavLink>
        </div>

        <div className="footer-social">
          <div className="footer-social-text">{t("home.footer.joinUs")}:</div>
          <div className="footer-social-icons">
            <DiscordIcon />
            <TwitterIcon />
          </div>
        </div>

        <div className="footer-links" data-testid="footer-nav">
          <div className="footer-links-item">
            <NavLink to="/">{t("home.footer.home")}</NavLink>
          </div>

          <div className="footer-links-item">
            <NavLink to="/about">{t("home.footer.about")}</NavLink>
          </div>

          <div className="footer-links-item">
            <NavLink to="/txs">{t("home.footer.txs")}</NavLink>
          </div>
        </div>

        <div className="footer-copy">&copy;{year} Wormholescan | Wormhole Explorer</div>
      </div>
    </footer>
  );
};

export default Footer;
