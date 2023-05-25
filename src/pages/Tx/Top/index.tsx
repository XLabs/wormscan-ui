import { CopyIcon } from "@radix-ui/react-icons";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import Tag from "src/components/atoms/Tag";
import CopyToClipboard from "src/components/molecules/CopyToClipboard";
import "./styles.scss";

const Top = () => {
  const { txHash } = useParams();
  const { t } = useTranslation();

  return (
    <section className="tx-top">
      <div className="tx-top-header">
        <h1 className="tx-top-header-title">{t("tx.top.title")}</h1>
        <Tag className="blue">Transfer</Tag>
      </div>
      <div className="tx-top-txId">
        HASH: {txHash}
        <CopyToClipboard toCopy={txHash}>
          <CopyIcon />
        </CopyToClipboard>
      </div>
    </section>
  );
};

export { Top };
