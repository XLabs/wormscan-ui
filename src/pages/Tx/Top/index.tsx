import { CopyIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import Tag from "src/components/atoms/Tag";
import CopyToClipboard from "src/components/molecules/CopyToClipboard";
import { useWindowSize } from "src/utils/hooks/useWindowSize";
import { shortAddress } from "src/utils/string";
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
  const size = useWindowSize();
  const isTablet = size.width >= 768;

  return (
    <section className="tx-top">
      <div className="tx-top-header">
        <h1 className="tx-top-header-title">{t("tx.top.title")}</h1>
        {txType[payloadType] && <Tag className="blue">{txType[payloadType]}</Tag>}
      </div>
      <div className="tx-top-txId">
        HASH: {isTablet ? txHash : shortAddress(txHash)}
        <CopyToClipboard toCopy={txHash}>
          <CopyIcon />
        </CopyToClipboard>
      </div>
    </section>
  );
};

export { Top };
