import { useTranslation } from "react-i18next";
import { useEnvironment } from "src/context/EnvironmentContext";
import { CopyIcon, SwapVerticalIcon } from "src/icons/generic";
import { CopyToClipboard } from "src/components/molecules";
import { Switch } from "src/components/atoms";
import { getExplorerLink } from "src/utils/wormhole";
import { ChainId } from "@wormhole-foundation/sdk";
import "./styles.scss";

interface Props {
  address: string;
  addressChainId: ChainId;
  liveMode: boolean;
  setLiveMode: (b: boolean) => void;
}

const Top = ({ address, addressChainId, liveMode, setLiveMode }: Props) => {
  const { environment } = useEnvironment();
  const currentNetwork = environment.network;

  const { t } = useTranslation();

  return (
    <section className="txs-top">
      <div className="txs-top-header">
        <h1 className="txs-top-header-title">
          <SwapVerticalIcon width={24} />
          {t("txs.top.title")}
        </h1>

        {!address && (
          <Switch
            label="LIVE MODE"
            showIndicator
            value={liveMode}
            setValue={() => setLiveMode(!liveMode)}
          />
        )}
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
              <CopyIcon width={24} />
            </CopyToClipboard>
          </div>
        </div>
      )}
    </section>
  );
};

export { Top };
