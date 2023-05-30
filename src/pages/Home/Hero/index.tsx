import { useTranslation } from "react-i18next";

import "./styles.scss";

const Hero = () => {
  const { t } = useTranslation();

  return (
    <section className="home-hero">
      <div className="home-hero-text">{t("home.hero.text")}</div>
    </section>
  );
};

export { Hero };
