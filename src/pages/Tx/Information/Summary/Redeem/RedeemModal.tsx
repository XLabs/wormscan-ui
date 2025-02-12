import { ChainId, Network } from "@wormhole-foundation/sdk";
import { CopyToClipboard } from "src/components/molecules";
import { CopyIcon } from "src/icons/generic";
import { shortAddress } from "src/utils/crypto";
import { getExplorerLink } from "src/utils/wormhole";
import { BlockchainIcon } from "src/components/atoms";
import "./styles.scss";

type RedeemModalProps = {
  currentNetwork: Network;
  fromChain: ChainId;
  parsedDestinationAddress: string;
  parsedOriginAddress: string;
  toChain: ChainId;
  sourceTokenLink: string;
  sourceSymbol: string;
  amountSent: string;
};

const RedeemModal = ({
  currentNetwork,
  fromChain,
  parsedDestinationAddress,
  parsedOriginAddress,
  toChain,
  sourceTokenLink,
  sourceSymbol,
  amountSent,
}: RedeemModalProps) => {
  return (
    <div className="redeem-modal">
      <div className="redeem-modal-title">Source</div>
      <div className="redeem-modal-address">
        <BlockchainIcon chainId={fromChain} network={currentNetwork} />
        <a
          href={getExplorerLink({
            network: currentNetwork,
            chainId: fromChain,
            value: parsedOriginAddress,
            base: "address",
            isNativeAddress: true,
          })}
          target="_blank"
          rel="noopener noreferrer"
        >
          {shortAddress(parsedOriginAddress.toUpperCase())}
        </a>
        <CopyToClipboard toCopy={parsedOriginAddress}>
          <CopyIcon width={24} />
        </CopyToClipboard>

        <div className="redeem-modal-amount">
          <span>(</span>
          <span>{amountSent}</span>

          <a
            href={sourceTokenLink}
            target="_blank"
            rel="noopener noreferrer"
            style={{ marginLeft: 4 }}
          >
            {sourceSymbol}
          </a>

          <span>)</span>
        </div>
      </div>

      <div className="redeem-modal-title">Target</div>
      <div className="redeem-modal-address">
        <BlockchainIcon chainId={toChain} network={currentNetwork} />
        <a
          href={getExplorerLink({
            network: currentNetwork,
            chainId: toChain,
            value: parsedDestinationAddress,
            base: "address",
            isNativeAddress: true,
          })}
          target="_blank"
          rel="noopener noreferrer"
        >
          {shortAddress(parsedDestinationAddress.toLocaleUpperCase())}
        </a>
        <CopyToClipboard toCopy={parsedDestinationAddress}>
          <CopyIcon width={24} />
        </CopyToClipboard>
      </div>
    </div>
  );
};

export default RedeemModal;
