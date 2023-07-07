import { useTranslation } from "react-i18next";
import { NavLink } from "src/components/atoms";
import { DISCORD_URL, TWITTER_URL, XLABS_URL } from "src/consts";
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

        <div className="footer-links" data-testid="footer-nav">
          <div className="footer-links-item">
            <NavLink to="/">{t("home.footer.home")}</NavLink>
          </div>

          <div className="footer-links-item">
            <NavLink to="/txs">{t("home.footer.txs")}</NavLink>
          </div>
        </div>

        <div className="footer-copy">
          <div className="footer-copy-brand">&copy;{year} Wormholescan</div>
          <div className="footer-copy-project">Wormhole Explorer</div>
          <div className="footer-copy-powered">
            <a href={XLABS_URL} target="_blank" rel="noopener noreferrer">
              Powered by xlabs.xyz
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
