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
    <section className="txs-top">
      <h1 className="txs-top-title">{t("txs.top.title")}</h1>
      <SearchBar
        className="txs-top-search-bar"
        onSubmit={handleSearch}
        placeholder={t("txs.top.placeholder")}
        arialLabel={t("txs.top.search")}
      />
    </section>
  );
};

export { Top };
