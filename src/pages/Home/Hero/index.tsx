import { useTranslation } from "react-i18next";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import "./styles.scss";

const Hero = () => {
  const { t } = useTranslation();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("search");
  };

  return (
    <section className="home-hero">
      <div className="home-hero-text">{t("home.hero.text")}</div>

      <form onSubmit={e => handleSearch(e)}>
        <div className="home-hero-search">
          <div className="home-hero-search-input">
            <input
              type="text"
              placeholder={t("home.hero.placeholder")}
              aria-label={t("home.hero.search")}
            />
          </div>
          <button type="submit">
            <MagnifyingGlassIcon className="icon" />
          </button>
        </div>
      </form>
    </section>
  );
};

export { Hero };
