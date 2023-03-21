import { useTranslation } from "react-i18next";
import { SearchBar } from "src/components/molecules";
import "./styles.scss";

const Top = () => {
  const { t } = useTranslation();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("handleSearch");
  };

  return (
    <section className="txns-top">
      <h1 className="txns-top-title">{t("txns.top.title")}</h1>
      <SearchBar
        className="txns-top-search-bar"
        onSubmit={handleSearch}
        placeholder={t("txns.top.placeholder")}
        arialLabel={t("txns.top.search")}
      />
    </section>
  );
};

export { Top };
