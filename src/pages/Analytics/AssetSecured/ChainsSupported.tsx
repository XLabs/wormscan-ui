import { Chain, ChainId, chainToChainId } from "@wormhole-foundation/sdk";
import { useEnvironment } from "src/context/EnvironmentContext";
import { getChainName, getExplorerLink } from "src/utils/wormhole";
import { BlockchainIcon, Tooltip } from "src/components/atoms";
import { GetSecuredTokensByWormholeOutput } from "src/api/guardian-network/types";
import { chainNameMap, chainNameMapUnsupported } from "../NTT/NTTToken/Summary";
import "./styles.scss";

export const ChainsSupported = ({ item }: { item: GetSecuredTokensByWormholeOutput }) => {
  const { environment } = useEnvironment();
  const currentNetwork = environment.network;

  return (
    <Tooltip
      type="info"
      maxWidth={false}
      tooltip={
        <div className="asset-secured-list-table-item-tooltip">
          {Object.entries(item.platforms).map(([chain, address], i) => {
            const chainCapitalized = (chain.charAt(0).toUpperCase() + chain.slice(1)) as Chain;
            const chainId = (chainToChainId(chainNameMap[chain] || chainCapitalized) ??
              chainNameMapUnsupported[chain]) as ChainId;

            return (
              <a
                href={getExplorerLink({
                  chainId: chainId,
                  network: currentNetwork,
                  value: address,
                  base: "token",
                })}
                className="asset-secured-list-table-item-tooltip-link"
                rel="noreferrer"
                target="_blank"
                key={chain}
                style={{
                  gridColumn: Object.entries(item.platforms).length === 1 ? "span 2" : "auto",
                }}
              >
                <BlockchainIcon
                  background="#1F1F1F"
                  chainId={chainId}
                  network={currentNetwork}
                  size={20}
                />

                <span className="asset-secured-list-table-item-tooltip-link-text">
                  {getChainName({
                    chainId: chainId,
                    network: currentNetwork,
                  })}
                </span>
              </a>
            );
          })}
        </div>
      }
    >
      <div className="asset-secured-list-table-item-chains">
        {Object.entries(item.platforms).map(([chain, address], i) => {
          const maxVisibleChains = 7;
          const maxChainsLimit = 8;

          if (i > maxVisibleChains) return null;

          const chainCapitalized = (chain.charAt(0).toUpperCase() + chain.slice(1)) as Chain;
          const chainId = (chainToChainId(chainNameMap[chain] || chainCapitalized) ??
            chainNameMapUnsupported[chain]) as ChainId;

          if (i === maxVisibleChains && Object.entries(item.platforms).length > maxChainsLimit) {
            return (
              <div key={chain} className="asset-secured-list-table-item-chains-more">
                {Object.entries(item.platforms).length - maxVisibleChains}
              </div>
            );
          }

          return (
            <BlockchainIcon
              background="#1F1F1F"
              chainId={chainId}
              className="asset-secured-list-table-item-chains-chain"
              colorless
              key={chain}
              network={currentNetwork}
              size={28}
            />
          );
        })}
      </div>
    </Tooltip>
  );
};
