import { useTranslation } from "react-i18next";
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
        <button className="home-join-button" data-testid="join-discord-button">
          <DiscordIcon /> {t("home.join.discord")}
        </button>
      </div>
    </section>
  );
};

export default JoinUs;
