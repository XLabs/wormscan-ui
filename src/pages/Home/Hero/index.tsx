import { useTranslation } from "react-i18next";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import "./styles.scss";

const Hero = () => {
  const { t } = useTranslation();

  return (
    <section className="home-hero">
      <div className="home-hero-text">
        {t("home.hero.initText")}
        <span> {t("home.hero.endText")}</span>
      </div>

      <div className="home-hero-search">
        <div className="home-hero-search-input">
          <input
            type="text"
            placeholder={t("home.hero.placeholder")}
            aria-label={t("home.hero.search")}
          />
          <MagnifyingGlassIcon className="icon" />
        </div>
      </div>
    </section>
  );
};

export { Hero };
