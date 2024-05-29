import { useTranslation } from "react-i18next";
import { ArrowUpIcon, PinTopIcon } from "@radix-ui/react-icons";
import { NavLink, Tag } from "src/components/atoms";
import { WormholeBrand } from "src/components/molecules";
import {
  DISCORD_URL,
  GITHUB_URL,
  PROVIDE_FEEDBACK_URL,
  TWITTER_URL,
  WORMHOLE_BLOG,
  XLABS_ABOUT_US_URL,
  XLABS_CAREERS_URL,
  XLABS_OUR_WORK_URL,
  XLABS_URL,
} from "src/consts";
import DiscordIcon from "src/icons/DiscordIcon";
import TwitterIcon from "src/icons/TwitterIcon";
import XlabsIcon from "src/icons/XlabsIcon";
import { ChatIcon } from "src/icons/generic";
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
          <ChatIcon width={25.75} />

          <h4 className="footer-container-discord-text">
            Want to become part of the community? Join us.
          </h4>

          <div className="footer-container-discord-links">
            <a
              className="footer-container-discord-links-ds-btn"
              href={DISCORD_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Discord link"
            >
              <DiscordIcon width={19} />
              Join Discord
            </a>

            <a
              className="footer-container-discord-links-x-btn"
              href={TWITTER_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter link"
            >
              <TwitterIcon width={17} />
              <p>Join Twitter</p>
            </a>
          </div>
        </div>
      </div>

      <div className="footer-container">
        <NavLink className="footer-container-logo" to="/" data-testid="footer-logo-link">
          <WormholeBrand />
        </NavLink>

        <div className="footer-container-links">
          <div className="footer-container-links-container">
            <p className="footer-container-links-container-title">{t("home.footer.community")}</p>
            <a
              href={DISCORD_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Discord link"
            >
              Discord
            </a>

            <a
              href={TWITTER_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter link"
            >
              X (Twitter)
            </a>

            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" aria-label="GitHub link">
              GitHub
            </a>

            <a
              href={WORMHOLE_BLOG}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Wormhole blog link"
            >
              Blog
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

            <div>
              <a
                href={XLABS_CAREERS_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Careers link"
              >
                {t("home.footer.careers")}
              </a>
              <Tag type="chip" size="small">
                {t("home.footer.hiring")}
              </Tag>
            </div>

            <a
              href={XLABS_OUR_WORK_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Our Work link"
            >
              {t("home.footer.ourWork")}
            </a>

            <a
              href={PROVIDE_FEEDBACK_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Provide Feedback"
            >
              {t("home.footer.provideFeedback")}
            </a>
            <NavLink to="/terms-of-use">{t("home.footer.termsOfUse")}</NavLink>
          </div>
        </div>

        <button className="footer-container-button" type="button" onClick={goTop}>
          {t("home.footer.backToTop")} <ArrowUpIcon height={20} width={20} />
        </button>
      </div>

      <div className="footer-container">
        <div className="footer-container-build">
          <p className="footer-container-build-text">{t("home.footer.builtBy")}</p>

          <a href={XLABS_URL} target="_blank" rel="noopener noreferrer" aria-label="xLabs link">
            <XlabsIcon width={24} />
          </a>
        </div>

        <p className="footer-container-copy">
          &copy; {year} Wormholescan v{packageJson.version}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
