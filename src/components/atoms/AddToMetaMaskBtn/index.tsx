import { useState } from "react";
import { ChainId, Network } from "@wormhole-foundation/sdk";
import { Tooltip } from "src/components/atoms";
import { shortAddress } from "src/utils/crypto";
import { TokenInfo, addToken } from "src/utils/metaMaskUtils";
import { CheckIcon, CopyIcon, MetaMaskIcon } from "src/icons/generic";
import "./styles.scss";

type Props = {
  className?: string;
  currentNetwork: Network;
  toChain: ChainId;
  tokenInfo: TokenInfo;
};

const AddToMetaMaskBtn = ({ className, currentNetwork, toChain, tokenInfo }: Props) => {
  const [showCheck, setShowCheck] = useState(false);

  if (!tokenInfo) return null;

  const copyAddress = async (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(tokenInfo.tokenAddress);
    setShowCheck(true);

    setTimeout(() => {
      setShowCheck(false);
    }, 1500);
  };

  return (
    <Tooltip
      tooltip={
        <div className="metamask-btn-tooltip">
          <span>You need to add it manually, the token doesn&apos;t have a symbol.</span>
          <span>Suggestion:</span>
          <span>
            Token contract address: <b>{shortAddress(tokenInfo.tokenAddress).toUpperCase()}</b>
            {showCheck ? (
              <div className="icon">
                <CheckIcon />
              </div>
            ) : (
              <div className="icon copy" onClick={copyAddress}>
                <CopyIcon />
              </div>
            )}
          </span>
          <span>
            Token symbol: <b>{tokenInfo.targetSymbol}</b>
          </span>
          <span>
            Decimal token: <b>{tokenInfo.tokenDecimals}</b>
          </span>
        </div>
      }
      maxWidth={false}
      enableTooltip={!tokenInfo.tokenSymbol}
      type="info"
    >
      <div className={`metamask-btn ${className}`}>
        <button
          disabled={!tokenInfo.tokenSymbol}
          onClick={async () => {
            try {
              await addToken({
                currentNetwork,
                toChain,
                tokenInfo,
              });
            } catch (error) {
              console.error("Failed to add token", error);
            }
          }}
        >
          <MetaMaskIcon />
          Add to MetaMask
        </button>
      </div>
    </Tooltip>
  );
};

export default AddToMetaMaskBtn;
