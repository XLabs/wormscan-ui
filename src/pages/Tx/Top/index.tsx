import { CopyIcon } from "@radix-ui/react-icons";
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
        ID: 7754EFD799B47044A907EE98F235C1A95051316AFBC6944AF4DD54292C641169 <CopyIcon />
      </div>
    </section>
  );
};

export { Top };
