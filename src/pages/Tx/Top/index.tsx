import { CopyIcon } from "@radix-ui/react-icons";
import { useTranslation } from "react-i18next";
import Tag from "src/components/atoms/Tag";
import CopyToClipboard from "src/components/molecules/CopyToClipboard";
import "./styles.scss";

interface Props {
  txHash: string;
  payloadType: number;
}

const txType: { [key: number]: string } = {
  1: "Transfer",
  2: "Attestation",
  3: "Transfer",
};
const Top = ({ txHash, payloadType }: Props) => {
  const { t } = useTranslation();

  return (
    <section className="tx-top">
      <div className="tx-top-header">
        <h1 className="tx-top-header-title">{t("tx.top.title")}</h1>
        {txType[payloadType] && <Tag className="blue">{txType[payloadType]}</Tag>}
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
