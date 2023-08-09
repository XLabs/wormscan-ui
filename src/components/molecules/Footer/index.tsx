import { useTranslation } from "react-i18next";
import { NavLink, Tag } from "src/components/atoms";
import {
  DISCORD_URL,
  TWITTER_URL,
  WORMHOLE_DOCS_URL,
  XLABS_CAREERS_URL,
  XLABS_URL,
} from "src/consts";
import DiscordIcon from "src/icons/DiscordIcon";
import TwitterIcon from "src/icons/TwitterIcon";
import WormholeBrand from "../WormholeBrand";
import { PinTopIcon } from "@radix-ui/react-icons";
import "./styles.scss";

const Footer = () => {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  const goTop = () => {
    window.scrollTo(0, 0);
  };

  return (
    <footer className="footer" data-testid="footer">
      <div className="footer-container">
        <div className="footer-top-button-container">
          <button type="button" className="footer-top-button" onClick={goTop}>
            <PinTopIcon /> Back to Top
          </button>
        </div>

        <div className="footer-brand">
          <NavLink to="/" data-testid="footer-logo-link">
            <WormholeBrand size="regular" />
          </NavLink>
        </div>

        <div className="footer-social">
          <div className="footer-social-container">
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
        </div>

        <div className="footer-links" data-testid="footer-nav">
          <div className="footer-links-item" data-link="home">
            <NavLink to="/">{t("home.footer.home")}</NavLink>
          </div>

          <div className="footer-links-item" data-link="txs">
            <NavLink to="/txs">{t("home.footer.txs")}</NavLink>
          </div>

          <div className="footer-links-item" data-link="contact">
            <div className="footer-links-item">
              <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer">
                {t("home.footer.contactUs")}
              </a>
            </div>
          </div>

          <div className="footer-links-item">
            <a href={XLABS_CAREERS_URL} target="_blank" rel="noopener noreferrer">
              {t("home.footer.careers")}
            </a>
            <Tag type="chip" size="small">
              {t("home.footer.hiring")}
            </Tag>
          </div>

          <div className="footer-links-item" data-link="api">
            <a href={WORMHOLE_DOCS_URL} target="_blank" rel="noopener noreferrer">
              {t("home.footer.apiDoc")}
            </a>
          </div>

          {/* ADD BUG BOUNTY LINK WHEN AVAILABLE */}
          {/* <div className="footer-links-item" data-link="bounty">
            <NavLink to="/">{t("home.footer.bugBounty")}</NavLink>
          </div> */}
        </div>

        <div className="footer-built">
          <a href={XLABS_URL} target="_blank" rel="noopener noreferrer">
            Built by xLabs
          </a>
        </div>

        <div className="footer-copy">
          <div className="footer-copy-brand">&copy; {year} Wormholescan</div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
