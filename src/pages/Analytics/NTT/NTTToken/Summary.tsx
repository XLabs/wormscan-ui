import { useQuery } from "react-query";
import FlipNumbers from "react-flip-numbers";
import { Chain, ChainId, chainToChainId, Network } from "@wormhole-foundation/sdk";
import { useEnvironment } from "src/context/EnvironmentContext";
import { WORMHOLE_PAGE_URL } from "src/consts";
import {
  ArrowUpRightIcon,
  DiscordIcon,
  GithubIcon,
  InfoCircleIcon,
  LinkIcon,
  TelegramIcon,
  TwitterIcon,
} from "src/icons/generic";
import { BlockchainIcon, Loader, Tooltip } from "src/components/atoms";
import { formatNumber } from "src/utils/number";
import { getExplorerLink } from "src/utils/wormhole";
import { getClient } from "src/api/Client";
import { GetSummaryResult } from "src/api/native-token-transfer/types";
import { Environment } from "src/utils/environment";

interface Props {
  isError: boolean;
  isLoading: boolean;
  summary: GetSummaryResult;
  coingecko_id: string;
}

// change the name that coingecko brings us to the one we use
const chainNameMap: Record<string, Chain> = {
  "arbitrum-one": "Arbitrum",
  "near-protocol": "Near",
  "optimistic-ethereum": "Optimism",
  "polygon-pos": "Polygon",
  "binance-smart-chain": "Bsc",
};

const chainNameMapUnsupported: Record<string, number> = {
  energi: 99949991,
  "hedera-hashgraph": 99949992,
  polkadot: 99949993,
  stellar: 99949994,
  tron: 99949995,
  zksync: 99949996,
};

const MAX_CONTRACTS = 3;

export const Summary = ({ isError, isLoading, summary, coingecko_id }: Props) => {
  const { environment } = useEnvironment();
  const currentNetwork = environment.network;
  const isMainnet = currentNetwork === "Mainnet";
  const tokenIcon = summary?.image?.large;
  const isUSDCe = coingecko_id === "wormhole-bridged-usdc-fantom";

  const {
    data: dataTokenSummary,
    isFetching: isFetchingTokenPrice,
    isError: isErrorTokenSummary,
  } = useQuery(["tokenList", isMainnet], () => getClient().nttApi.getNttSummary({ coingecko_id }), {
    enabled: isMainnet,
    refetchInterval: 40000,
  });

  const renderPrice = () => {
    if (isFetchingTokenPrice && !isErrorTokenSummary && !dataTokenSummary?.price) {
      return "...";
    }
    if (isErrorTokenSummary || isError) {
      return "N/A";
    }
    return dataTokenSummary?.price ? (
      <FlipNumbers
        height={15}
        width={11}
        color="white"
        background="var(--color-gray-900)"
        play
        perspective={100}
        numbers={`$${formatNumber(+dataTokenSummary.price, 4)}`}
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
    ) : (
      "N/A"
    );
  };

  return (
    <div className="summary">
      <div className="summary-top">
        {isLoading ? (
          <Loader />
        ) : (
          <>
            <div className="summary-top-img">
              {tokenIcon && (
                <img
                  alt={`${summary?.symbol} Token Icon`}
                  height="60"
                  loading="lazy"
                  src={tokenIcon}
                  width="60"
                />
              )}
            </div>

            <div className="summary-top-content">
              <h1 className="summary-top-content-title">
                <div className="summary-top-content-title-mobileImg">
                  {tokenIcon && (
                    <img
                      alt={`${summary?.symbol} Token Icon`}
                      height="30"
                      loading="lazy"
                      src={tokenIcon}
                      width="30"
                    />
                  )}
                </div>
                <div>{isUSDCe ? "USDC.e" : summary?.symbol || "N/A"} Token</div>
              </h1>
              <div className="summary-top-content-container">
                <div className="summary-top-content-container-item">
                  <div className="summary-top-content-container-item-up">Contracts</div>
                  <ContractsList summary={summary} environment={environment} />
                </div>

                <div className="summary-top-content-container-item">
                  <div className="summary-top-content-container-item-up">Price</div>
                  <div className="summary-top-content-container-item-down price">
                    <div className="price-value">{renderPrice()}</div>
                  </div>
                </div>

                {coingecko_id === "wormhole" && (
                  <>
                    <div className="summary-top-content-container-item">
                      <div className="summary-top-content-container-item-up">Website</div>
                      <div className="summary-top-content-container-item-down">
                        <a
                          className="link"
                          href={WORMHOLE_PAGE_URL}
                          rel="noreferrer"
                          target="_blank"
                        >
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
                        <a
                          href="https://github.com/wormhole-foundation"
                          rel="noreferrer"
                          target="_blank"
                        >
                          <GithubIcon />
                        </a>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const ContractsList = ({
  summary,
  environment,
}: {
  summary: GetSummaryResult;
  environment: Environment;
}) => (
  <div className="summary-top-content-container-item-chain">
    {summary?.platforms ? (
      <div className="summary-top-content-container-item-chain">
        {Object.entries(summary.platforms).map(([chain, contract], index) => {
          // show MAX_CONTRACTS contracts
          if (index < MAX_CONTRACTS) {
            const chainCapitalized = (chain.charAt(0).toUpperCase() + chain.slice(1)) as Chain;
            const chainId = chainToChainId(chainNameMap[chain] || chainCapitalized);
            const chainIdUnsupported = chainNameMapUnsupported[chain];

            return (
              <ChainItem
                key={index}
                chainId={(chainIdUnsupported || chainId) as ChainId}
                network={environment.network}
                value={contract}
              />
            );
          }
          // show the fourth contract directly if there are only 4 contracts in total without a tooltip
          if (
            index === MAX_CONTRACTS &&
            Object.keys(summary.platforms).length === MAX_CONTRACTS + 1
          ) {
            const chainCapitalized = (chain.charAt(0).toUpperCase() + chain.slice(1)) as Chain;
            const chainId = chainToChainId(chainNameMap[chain] || chainCapitalized);
            const chainIdUnsupported = chainNameMapUnsupported[chain];

            return (
              <ChainItem
                key={index}
                chainId={(chainIdUnsupported || chainId) as ChainId}
                network={environment.network}
                value={contract}
              />
            );
          }
          return null;
        })}
        {Object.keys(summary.platforms).length > MAX_CONTRACTS + 1 && (
          <Tooltip
            type="info"
            className="summary-top-content-container-item-chain-tooltip"
            side="bottom"
            tooltip={
              <div className="summary-top-content-container-item-chain-tooltip-container">
                {Object.entries(summary.platforms)
                  .slice(MAX_CONTRACTS)
                  .map(([chain, contract], i) => {
                    const chainCapitalized = (chain.charAt(0).toUpperCase() +
                      chain.slice(1)) as Chain;
                    const chainId = chainToChainId(chainNameMap[chain] || chainCapitalized);
                    const chainIdUnsupported = chainNameMapUnsupported[chain];

                    return (
                      <ChainItem
                        key={i}
                        chainId={(chainIdUnsupported || chainId) as ChainId}
                        network={environment.network}
                        value={contract}
                      />
                    );
                  })}
              </div>
            }
          >
            <div className="summary-top-content-container-item-chain-contract">
              <div className="summary-top-content-container-item-chain-contract-more">
                +{Object.keys(summary.platforms).length - MAX_CONTRACTS}
                <InfoCircleIcon
                  className="summary-top-content-container-item-chain-contract-arrow"
                  width={20}
                />
              </div>
            </div>
          </Tooltip>
        )}
      </div>
    ) : (
      "N/A"
    )}
  </div>
);

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
      <ArrowUpRightIcon
        className="summary-top-content-container-item-chain-contract-arrow"
        width={20}
      />
    </a>
  );
};
