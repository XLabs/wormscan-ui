import { useTranslation } from "react-i18next";
import { NavLink } from "src/components/atoms";
import { WormholeScanBrand } from "src/components/molecules";
import {
  DISCORD_URL,
  GITHUB_URL,
  PROVIDE_FEEDBACK_URL,
  TWITTER_URL,
  WORMHOLE_BLOG,
  WORMHOLE_DOCS_URL,
  WORMHOLESCAN_API_DOCS_URL,
  XLABS_ABOUT_US_URL,
  XLABS_CAREERS_URL,
  XLABS_OUR_WORK_URL,
  XLABS_URL,
} from "src/consts";
import XlabsIcon from "src/icons/XlabsIcon";
import { ArrowUpIcon, ChatIcon, DiscordIcon, TwitterIcon } from "src/icons/generic";
import packageJson from "../../../../package.json";
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
        <div className="footer-container-discord">
          <ChatIcon width={24} />

          <h4 className="footer-container-discord-text">
            Want to join the Wormhole community? Join us!
          </h4>

          <div className="footer-container-discord-links">
            <a
              className="footer-container-discord-links-ds-btn"
              href={DISCORD_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Discord link"
            >
              <DiscordIcon />
              Join Discord
            </a>

            <a
              className="footer-container-discord-links-x-btn desktop"
              href={TWITTER_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter link"
            >
              <TwitterIcon />
              <p>Join X</p>
            </a>
          </div>
        </div>
      </div>

      <div className="footer-container">
        <NavLink className="footer-container-logo" to="/" data-testid="footer-logo-link">
          <WormholeScanBrand pos="vertical" />
        </NavLink>

        <div className="footer-container-links">
          <div className="footer-container-links-container">
            <p className="footer-container-links-container-title">{t("home.footer.community")}</p>

            <a
              href={PROVIDE_FEEDBACK_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Provide Feedback"
            >
              {t("home.footer.provideFeedback")}
            </a>

            <a
              href={DISCORD_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Discord link"
            >
              Discord
            </a>

            <a
              href={WORMHOLE_BLOG}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Wormhole blog link"
            >
              Blog
            </a>

            <a
              href={TWITTER_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter link"
            >
              X
            </a>
          </div>

          <div className="footer-container-links-container">
            <p className="footer-container-links-container-title">{t("home.footer.company")}</p>

            <a
              href={XLABS_ABOUT_US_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="About Us link"
            >
              {t("home.footer.aboutUs")}
            </a>

            <a
              href={XLABS_OUR_WORK_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Our Work link"
            >
              {t("home.footer.ourWork")}
            </a>

            <a
              href={XLABS_CAREERS_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Careers link"
            >
              {t("home.footer.careers")}
            </a>
          </div>

          <div className="footer-container-links-container">
            <p className="footer-container-links-container-title">{t("home.footer.developers")}</p>

            <NavLink to="/vaa-parser" aria-label="VAA Parser">
              VAA Parser
            </NavLink>

            <a
              href={WORMHOLESCAN_API_DOCS_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="API Doc"
            >
              API Doc
            </a>

            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" aria-label="GitHub link">
              GitHub
            </a>

            <a
              href={WORMHOLE_DOCS_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Wormhole Doc"
            >
              Wormhole Doc
            </a>
          </div>
        </div>

        <button className="footer-container-button" type="button" onClick={goTop}>
          {t("home.footer.backToTop")} <ArrowUpIcon width={24} />
        </button>
      </div>

      <div className="footer-container">
        <p className="footer-container-copy">
          <span>&copy;</span>
          <span className="footer-container-copy-text">
            {year} Wormholescan v{packageJson.version}
          </span>
          <NavLink to="/terms-of-use">{t("home.footer.termsOfUse")}</NavLink>
        </p>

        <div className="footer-container-build">
          <p className="footer-container-build-text">{t("home.footer.builtBy")}</p>

          <a href={XLABS_URL} target="_blank" rel="noopener noreferrer" aria-label="xLabs link">
            <XlabsIcon width={24} />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
