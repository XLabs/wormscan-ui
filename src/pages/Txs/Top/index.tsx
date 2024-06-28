import { useTranslation } from "react-i18next";
import { CopyIcon } from "@radix-ui/react-icons";
import { useEnvironment } from "src/context/EnvironmentContext";
import { CopyToClipboard } from "src/components/molecules";
import { parseAddress } from "src/utils/crypto";
import { getExplorerLink } from "src/utils/wormhole";
import { ChainId } from "@wormhole-foundation/sdk";
import "./styles.scss";

interface Props {
  address: string;
  addressChainId: ChainId;
}

const Top = ({ address, addressChainId }: Props) => {
  const { environment } = useEnvironment();
  const currentNetwork = environment.network;

  const { t } = useTranslation();

  return (
    <section className="txs-top">
      <div className="txs-top-header">
        <h1 className="txs-top-header-title">{t("txs.top.title")}</h1>
      </div>
      {address && (
        <div className="txs-top-txId">
          <div>Address:</div>
          <div className="txs-top-txId-container">
            <a
              href={getExplorerLink({
                network: currentNetwork,
                chainId: addressChainId,
                value: address,
                isNativeAddress: true,
                base: "address",
              })}
              target="_blank"
              rel="noopener noreferrer"
            >
              {address}
            </a>

            <CopyToClipboard toCopy={address}>
              <CopyIcon height={20} width={20} />
            </CopyToClipboard>
          </div>
        </div>
      )}
    </section>
  );
};

export { Top };
