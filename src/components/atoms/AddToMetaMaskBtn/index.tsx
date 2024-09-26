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
  targetTokenInfo: TokenInfo;
};

const AddToMetaMaskBtn = ({ className, currentNetwork, toChain, targetTokenInfo }: Props) => {
  const [showCheck, setShowCheck] = useState(false);

  if (!targetTokenInfo) return null;

  const copyAddress = async (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(targetTokenInfo.tokenAddress);
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
            Token contract address:{" "}
            <b>{shortAddress(targetTokenInfo.tokenAddress).toUpperCase()}</b>
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
            Token symbol: <b>{targetTokenInfo.tokenSymbol}</b>
          </span>
          <span>
            Decimal token: <b>{targetTokenInfo.tokenDecimals}</b>
          </span>
        </div>
      }
      maxWidth={false}
      enableTooltip={!targetTokenInfo.tokenSymbol}
      type="info"
    >
      <div className={`metamask-btn ${className}`}>
        <button
          disabled={!targetTokenInfo.tokenSymbol}
          onClick={async () => {
            try {
              await addToken({
                currentNetwork,
                toChain,
                tokenInfo: targetTokenInfo,
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
