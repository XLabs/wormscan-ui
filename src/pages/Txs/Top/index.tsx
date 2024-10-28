import { useTranslation } from "react-i18next";
import { ChainId } from "@wormhole-foundation/sdk";
import { useEnvironment } from "src/context/EnvironmentContext";
import { CopyIcon, SwapVerticalIcon, WalletIcon } from "src/icons/generic";
import { CopyToClipboard } from "src/components/molecules";
import { Switch } from "src/components/atoms";
import { getExplorerLink } from "src/utils/wormhole";
import { TruncateText } from "src/utils/string";
import { useWindowSize } from "src/utils/hooks";
import "./styles.scss";

interface Props {
  address: string;
  addressChainId: ChainId;
  liveMode: boolean;
  setLiveMode: (b: boolean) => void;
  showLiveMode: boolean;
}

const Top = ({ address, addressChainId, liveMode, setLiveMode, showLiveMode }: Props) => {
  const { environment } = useEnvironment();
  const currentNetwork = environment.network;
  const { width } = useWindowSize();
  const { t } = useTranslation();

  return (
    <section className="txs-top">
      {address && (
        <div className="txs-top-txId">
          <WalletIcon width={40} />
          <div className="txs-top-txId-text">Address:</div>
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
              <TruncateText containerWidth={width - 32} text={address} />
            </a>

            <CopyToClipboard toCopy={address}>
              <CopyIcon width={24} />
            </CopyToClipboard>
          </div>
        </div>
      )}

      <div className="txs-top-header">
        <h1 className="txs-top-header-title">
          <SwapVerticalIcon />
          {t("txs.top.title")}
        </h1>

        {showLiveMode && (
          <Switch
            label="LIVE MODE"
            showIndicator
            value={liveMode}
            setValue={() => setLiveMode(!liveMode)}
          />
        )}
      </div>
    </section>
  );
};

export { Top };
