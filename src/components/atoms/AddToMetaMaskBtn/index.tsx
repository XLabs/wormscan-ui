import { useState } from "react";
import { ChainId, Network } from "@certusone/wormhole-sdk";
import { CopyIcon, Cross1Icon, Cross2Icon } from "@radix-ui/react-icons";
import MetaMaskIcon from "src/icons/MetaMaskIcon";
import { Tooltip } from "src/components/atoms";
import { CopyToClipboard } from "src/components/molecules";
import { shortAddress } from "src/utils/crypto";
import { TokenInfo, addToken } from "src/utils/metaMaskUtils";
import "./styles.scss";

type Props = {
  className?: string;
  currentNetwork: Network;
  toChain: ChainId;
  tokenInfo: TokenInfo;
};

const AddToMetaMaskBtn = ({ className, currentNetwork, toChain, tokenInfo }: Props) => {
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  const openTooltip = () => {
    setIsTooltipOpen(true);
  };

  const closeTooltip = () => {
    setIsTooltipOpen(false);
  };

  return (
    <Tooltip
      tooltip={
        <div className="metamask-btn-tooltip">
          <div className="metamask-btn-tooltip-close" onClick={closeTooltip}>
            <Cross2Icon height={20} width={20} />
          </div>
          <span>You need to add it manually, the token doesn&apos;t have a symbol.</span>
          <span>Suggestion:</span>
          <span>
            <b>Token contract address:</b> {shortAddress(tokenInfo.tokenAddress).toUpperCase()}
            <CopyToClipboard toCopy={tokenInfo.tokenAddress}>
              <CopyIcon height={20} width={20} />
            </CopyToClipboard>
          </span>
          <span>
            <b>Token symbol:</b> {tokenInfo.targetSymbol}
          </span>
          <span>
            <b>Decimal token:</b> {tokenInfo.tokenDecimals}
          </span>
        </div>
      }
      controlled={true}
      maxWidth={false}
      open={!Boolean(tokenInfo.tokenSymbol) && isTooltipOpen}
      type="info"
    >
      <div className={`metamask-btn ${className}`} onMouseEnter={openTooltip}>
        <button
          disabled={!Boolean(tokenInfo.tokenSymbol)}
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
