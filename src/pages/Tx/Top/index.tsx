import { useTranslation } from "react-i18next";
import { CopyIcon } from "@radix-ui/react-icons";
import { CHAIN_ID_WORMCHAIN } from "@certusone/wormhole-sdk";
import { useEnvironment } from "src/context/EnvironmentContext";
import { txType } from "src/consts";
import { Tag } from "src/components/atoms";
import { CopyToClipboard } from "src/components/molecules";
import { parseTx } from "src/utils/crypto";
import { getExplorerLink } from "src/utils/wormhole";
import { ChainId } from "src/api";
import "./styles.scss";

interface Props {
  txHash: string;
  gatewayInfo?: {
    originAddress: string;
    originChainId: ChainId;
    originTxHash: string;
  };
  emitterChainId: ChainId;
  payloadType: number;
}

const BIGDIPPER_TRANSACTIONS = "https://bigdipper.live/wormhole/transactions";

const Top = ({ txHash, gatewayInfo, emitterChainId, payloadType }: Props) => {
  const { environment } = useEnvironment();
  const currentNetwork = environment.network;

  const { t } = useTranslation();
  const parseTxHash = parseTx({
    value: txHash,
    chainId: emitterChainId,
  });
  const parseTxHashUpperCase = parseTxHash.toUpperCase();

  return (
    <section className="tx-top">
      <div className="tx-top-header">
        <h1 className="tx-top-header-title">{t("tx.top.title")}</h1>
        {txType[payloadType] && <Tag>{txType[payloadType]}</Tag>}
      </div>
      <div className="tx-top-txId">
        <div>Tx Hash:</div>
        <div className="tx-top-txId-container">
          {/* delete conditional when WORMCHAIN gets an explorer */}
          {(emitterChainId === CHAIN_ID_WORMCHAIN || emitterChainId === ChainId.Sei) &&
          !gatewayInfo?.originTxHash ? (
            <div>
              <span>{parseTxHash}</span>
            </div>
          ) : (
            <a
              href={getExplorerLink({
                network: currentNetwork,
                chainId: gatewayInfo?.originChainId || emitterChainId,
                value: gatewayInfo?.originTxHash || parseTxHash,
                isNativeAddress: true,
              })}
              target="_blank"
              rel="noopener noreferrer"
            >
              {gatewayInfo?.originTxHash || parseTxHash}
            </a>
          )}
          <CopyToClipboard toCopy={gatewayInfo?.originTxHash || parseTxHash}>
            <CopyIcon height={20} width={20} />
          </CopyToClipboard>
        </div>
      </div>

      {gatewayInfo?.originTxHash && (
        <div className="tx-top-txId">
          <div>Gateway Tx Hash:</div>
          <div className="tx-top-txId-container">
            <a
              href={`${BIGDIPPER_TRANSACTIONS}/${
                parseTxHashUpperCase.startsWith("0X")
                  ? parseTxHashUpperCase.substring(2)
                  : parseTxHashUpperCase
              }`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {parseTxHashUpperCase}
            </a>
            <CopyToClipboard toCopy={parseTxHashUpperCase}>
              <CopyIcon height={20} width={20} />
            </CopyToClipboard>
          </div>
        </div>
      )}
    </section>
  );
};

export { Top };
