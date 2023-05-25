import { useTranslation } from "react-i18next";
import "./styles.scss";

const Top = () => {
  const { t } = useTranslation();

  return (
    <section className="txs-top">
      <h1 className="txs-top-title">{t("txs.top.title")}</h1>
    </section>
  );
};

export { Top };
