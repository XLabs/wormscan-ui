import { useTranslation } from "react-i18next";
import { DISCORD_URL } from "src/consts";
import DiscordIcon from "src/icons/DiscordIcon";
import "./styles.scss";

const JoinUs = () => {
  const { t } = useTranslation();

  return (
    <section className="home-join">
      <div className="home-join-text-container">
        <div className="home-join-text">
          <p>{t("home.join.initText")}</p>
          <p>
            {t("home.join.secondText")}
            <span> {t("home.join.endText")}</span>
          </p>
        </div>
        <a
          aria-label="Discord link"
          className="home-join-button"
          data-testid="join-discord-button"
          href={DISCORD_URL}
          rel="noopener noreferrer"
          target="_blank"
        >
          <DiscordIcon /> {t("home.join.discord")}
        </a>
      </div>

      <div className="home-join-bg-white" />
      <div className="home-join-bg-secondary" />
    </section>
  );
};

export default JoinUs;
