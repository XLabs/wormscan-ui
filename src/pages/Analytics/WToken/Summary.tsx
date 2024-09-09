import { GetSummaryResult } from "src/api/native-token-transfer/types";
import { BlockchainIcon } from "src/components/atoms";
import { WORMHOLE_PAGE_URL } from "src/consts";
import { useEnvironment } from "src/context/EnvironmentContext";
import {
  ArrowUpRightIcon,
  DiscordIcon,
  GithubIcon,
  LinkIcon,
  TelegramIcon,
  TwitterIcon,
} from "src/icons/generic";
import { formatNumber } from "src/utils/number";
import { getTokenIcon } from "src/utils/token";
import { ChainId, chainToChainId, Network } from "@wormhole-foundation/sdk";
import { getExplorerLink } from "src/utils/wormhole";

type SummaryProps = {
  wTokenPrice: string;
  isErrorWTokenPrice: boolean;
  isFetchingWTokenPrice: boolean;
};

export const Summary = ({
  wTokenPrice,
  isErrorWTokenPrice,
  isFetchingWTokenPrice,
}: SummaryProps) => {
  const tokenIcon = getTokenIcon("W");
  const { environment } = useEnvironment();

  return (
    <div className="summary">
      <div className="summary-top">
        <div className="summary-top-img">
          <img src={tokenIcon} alt="W Token Icon" height="60" width="60" loading="lazy" />
        </div>

        <div className="summary-top-content">
          <h1 className="summary-top-content-title">
            <div className="summary-top-content-title-mobileImg">
              <img src={tokenIcon} alt="W Token Icon" height="30" width="30" loading="lazy" />
            </div>
            <div>Wormhole Token</div>
          </h1>
          <div className="summary-top-content-container">
            <div className="summary-top-content-container-item">
              <div className="summary-top-content-container-item-up">Contracts</div>
              <div className="summary-top-content-container-item-chain">
                <ChainItem
                  chainId={chainToChainId("Solana")}
                  network={environment.network}
                  value="85VBFQZC9TZkfaptBWjvUw7YbZjy52A6mjtPGjstQAmQ"
                />
                <ChainItem
                  chainId={chainToChainId("Ethereum")}
                  network={environment.network}
                  value="0xb0ffa8000886e57f86dd5264b9582b2ad87b2b91"
                />
                <ChainItem
                  chainId={chainToChainId("Base")}
                  network={environment.network}
                  value="0xb0ffa8000886e57f86dd5264b9582b2ad87b2b91"
                />
                <ChainItem
                  chainId={chainToChainId("Arbitrum")}
                  network={environment.network}
                  value="0xb0ffa8000886e57f86dd5264b9582b2ad87b2b91"
                />
              </div>
            </div>

            <div className="summary-top-content-container-item">
              <div className="summary-top-content-container-item-up">Price</div>
              <div className="summary-top-content-container-item-down">
                {isFetchingWTokenPrice || isErrorWTokenPrice
                  ? "..."
                  : `$${formatNumber(+wTokenPrice, 3)}`}
              </div>
            </div>

            <div className="summary-top-content-container-item">
              <div className="summary-top-content-container-item-up">Website</div>
              <div className="summary-top-content-container-item-down">
                <a className="link" href={WORMHOLE_PAGE_URL} rel="noreferrer" target="_blank">
                  <span>https://wormhole.com</span>
                  <LinkIcon width={24} />
                </a>
              </div>
            </div>

            <div className="summary-top-content-container-item">
              <div className="summary-top-content-container-item-up">Community</div>
              <div className="summary-top-content-container-item-down community">
                <a href="https://x.com/wormhole">
                  <TwitterIcon />
                </a>
                <a href="https://t.me/wormholecrypto">
                  <TelegramIcon />
                </a>
                <a href="https://discord.com/invite/wormholecrypto">
                  <DiscordIcon />
                </a>
                <a href="https://github.com/wormhole-foundation">
                  <GithubIcon />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ChainItem = ({
  chainId,
  network,
  value,
}: {
  chainId: ChainId;
  network: Network;
  value: string;
}) => {
  return (
    <a
      href={getExplorerLink({ chainId, network, value, base: "token" })}
      className="summary-top-content-container-item-chain-contract"
    >
      <BlockchainIcon chainId={chainId} network={network} />
      <ArrowUpRightIcon />
    </a>
  );
};
