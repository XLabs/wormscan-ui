import { useTranslation } from "react-i18next";
import { CopyIcon } from "src/icons/generic";
import { useEnvironment } from "src/context/EnvironmentContext";
import { txType } from "src/consts";
import { Tag } from "src/components/atoms";
import { CopyToClipboard } from "src/components/molecules";
import { parseTx } from "src/utils/crypto";
import { getExplorerLink } from "src/utils/wormhole";
import { ChainId, chainToChainId } from "@wormhole-foundation/sdk";
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
      {(parseTxHash || gatewayInfo?.originTxHash) && (
        <div className="tx-top-txId">
          <div>Tx Hash:</div>
          <div className="tx-top-txId-container">
            {/* delete conditional when WORMCHAIN gets an explorer */}
            {(emitterChainId === chainToChainId("Wormchain") ||
              emitterChainId === chainToChainId("Sei")) &&
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
              <CopyIcon />
            </CopyToClipboard>
          </div>
        </div>
      )}

      {gatewayInfo?.originTxHash && (
        <div className="tx-top-txId">
          <div>Gateway Tx Hash:</div>
          <div className="tx-top-txId-container">
            <a
              href={getExplorerLink({
                network: currentNetwork,
                chainId: chainToChainId("Wormchain"),
                value: parseTxHashUpperCase.startsWith("0X")
                  ? parseTxHashUpperCase.substring(2)
                  : parseTxHashUpperCase,
                isNativeAddress: true,
              })}
              target="_blank"
              rel="noopener noreferrer"
            >
              {parseTxHashUpperCase}
            </a>
            <CopyToClipboard toCopy={parseTxHashUpperCase}>
              <CopyIcon />
            </CopyToClipboard>
          </div>
        </div>
      )}
    </section>
  );
};

export { Top };
