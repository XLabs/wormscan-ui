import { useTranslation } from "react-i18next";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import "./styles.scss";

const Hero = () => {
  const { t } = useTranslation("translation", {});

  return (
    <section className="hero">
      <div className="hero-text">
        {t("home.hero.initText")}
        <span> {t("home.hero.endText")}</span>
      </div>

      <div className="hero-search">
        <div className="hero-search-input">
          <input type="text" placeholder={t("home.search.placeholder")} aria-label="Search" />
          <MagnifyingGlassIcon className="icon" />
        </div>
      </div>
    </section>
  );
};

export { Hero };
