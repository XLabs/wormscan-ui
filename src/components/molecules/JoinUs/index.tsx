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
          {t("home.join.initText")}
          <span> {t("home.join.endText")}</span>
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
    </section>
  );
};

export default JoinUs;
