import { useQuery } from "react-query";
import FlipNumbers from "react-flip-numbers";
import { ChainId, chainToChainId, Network } from "@wormhole-foundation/sdk";
import { useEnvironment } from "src/context/EnvironmentContext";
import { WORMHOLE_PAGE_URL } from "src/consts";
import {
  ArrowUpRightIcon,
  DiscordIcon,
  GithubIcon,
  LinkIcon,
  TelegramIcon,
  TwitterIcon,
} from "src/icons/generic";
import { BlockchainIcon } from "src/components/atoms";
import { formatNumber } from "src/utils/number";
import { getTokenIcon } from "src/utils/token";
import { getExplorerLink } from "src/utils/wormhole";
import { getGeckoTokenInfo } from "src/utils/cryptoToolkit";

export const Summary = () => {
  const tokenIcon = getTokenIcon("W");
  const { environment } = useEnvironment();
  const currentNetwork = environment.network;
  const isMainnet = currentNetwork === "Mainnet";

  const {
    data: wTokenPrice,
    isError: isErrorWTokenPrice,
    isFetching: isFetchingWTokenPrice,
  } = useQuery(
    ["getWTokenInfo"],
    async () => {
      const data = await getGeckoTokenInfo(
        "85VBFQZC9TZkfaptBWjvUw7YbZjy52A6mjtPGjstQAmQ",
        chainToChainId("Solana"),
      );
      if (!data || !data.attributes?.price_usd) throw new Error("No data");
      return data.attributes.price_usd;
    },
    {
      enabled: isMainnet,
      refetchInterval: 10000,
    },
  );

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
                <ChainItem
                  chainId={chainToChainId("Optimism")}
                  network={environment.network}
                  value="0xb0ffa8000886e57f86dd5264b9582b2ad87b2b91"
                />
              </div>
            </div>

            <div className="summary-top-content-container-item">
              <div className="summary-top-content-container-item-up">Price</div>
              <div className="summary-top-content-container-item-down price">
                <div className="price-value">
                  {isFetchingWTokenPrice && !isErrorWTokenPrice && !wTokenPrice && "..."}

                  {isErrorWTokenPrice && "N/A"}

                  {wTokenPrice && (
                    <FlipNumbers
                      height={15}
                      width={11}
                      color="white"
                      background="var(--color-gray-900)"
                      play
                      perspective={100}
                      numbers={`$${formatNumber(+wTokenPrice, 4)}`}
                      numberStyle={{
                        fontFamily: "Roboto",
                        fontSize: "14px",
                        fontWeight: 400,
                        letterSpacing: "0.02em",
                        lineHeight: "20px",
                      }}
                      nonNumberStyle={{
                        fontFamily: "Roboto",
                        fontSize: "14px",
                        fontWeight: 400,
                        letterSpacing: "0.02em",
                        lineHeight: "20px",
                      }}
                    />
                  )}
                </div>
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
                <a href="https://x.com/wormhole" rel="noreferrer" target="_blank">
                  <TwitterIcon />
                </a>
                <a href="https://t.me/wormholecrypto" rel="noreferrer" target="_blank">
                  <TelegramIcon />
                </a>
                <a
                  href="https://discord.com/invite/wormholecrypto"
                  rel="noreferrer"
                  target="_blank"
                >
                  <DiscordIcon />
                </a>
                <a href="https://github.com/wormhole-foundation" rel="noreferrer" target="_blank">
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
      rel="noreferrer"
      target="_blank"
    >
      <BlockchainIcon chainId={chainId} network={network} />
      <ArrowUpRightIcon />
    </a>
  );
};
