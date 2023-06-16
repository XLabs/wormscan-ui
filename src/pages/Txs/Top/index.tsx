import { CopyIcon } from "@radix-ui/react-icons";
import { ChainId } from "@xlabs-libs/wormscan-sdk";
import { useTranslation } from "react-i18next";
import CopyToClipboard from "src/components/molecules/CopyToClipboard";
import { parseAddress } from "src/utils/crypto";
import { getExplorerLink } from "src/utils/wormhole";
import "./styles.scss";

interface Props {
  address: string;
  addressChainId: ChainId;
}

const Top = ({ address, addressChainId }: Props) => {
  const { t } = useTranslation();
  const parsedAddress = parseAddress({
    value: address,
    chainId: addressChainId,
  });

  return (
    <section className="txs-top">
      <div className="txs-top-header">
        <h1 className="txs-top-header-title">{t("txs.top.title")}</h1>
      </div>
      {address && (
        <div className="txs-top-txId">
          <div>Address:</div>
          <div className="tx-top-txId-container">
            <a
              href={getExplorerLink({
                chainId: addressChainId,
                value: parsedAddress,
                isNativeAddress: true,
                base: "address",
              })}
              target="_blank"
              rel="noreferrer"
            >
              {parsedAddress}
            </a>

            <CopyToClipboard toCopy={parsedAddress}>
              <CopyIcon />
            </CopyToClipboard>
          </div>
        </div>
      )}
    </section>
  );
};

export { Top };
