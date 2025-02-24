import { ChainId, chainIdToChain, Network } from "@wormhole-foundation/sdk";
import { WalletIcon } from "src/icons/generic";
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
      <div className="redeem-modal-icon">
        <WalletIcon width={80} circleColor="transparent" />
      </div>

      <div className="redeem-modal-content">
        <div className="redeem-modal-content-title">You are about to redeem</div>

        <div className="redeem-modal-content-info">
          {amountSent}
          <a href={sourceTokenLink} target="_blank" rel="noopener noreferrer">
            {sourceSymbol}
          </a>
          from <BlockchainIcon chainId={fromChain} network={currentNetwork} />{" "}
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
            {chainIdToChain(fromChain)}
          </a>
        </div>

        <div className="redeem-modal-content-info">
          to <BlockchainIcon chainId={toChain} network={currentNetwork} />
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
            {chainIdToChain(toChain)}
          </a>
        </div>
      </div>
    </div>
  );
};

export default RedeemModal;
