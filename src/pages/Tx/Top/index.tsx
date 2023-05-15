import { CopyIcon } from "@radix-ui/react-icons";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { SearchBar } from "src/components/molecules";
import "./styles.scss";

const Top = () => {
  const { txHash } = useParams();
  const { t } = useTranslation();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("handleSearch");
  };

  return (
    <section className="tx-top">
      <div className="tx-top-header">
        <h1 className="tx-top-header-title">{t("tx.top.title")}</h1>
        <SearchBar
          className="tx-top-header-search-bar"
          onSubmit={handleSearch}
          placeholder={t("tx.top.placeholder")}
          arialLabel={t("tx.top.search")}
        />
      </div>
      <div className="tx-top-txId">
        ID: {txHash} <CopyIcon />
      </div>
    </section>
  );
};

export { Top };
