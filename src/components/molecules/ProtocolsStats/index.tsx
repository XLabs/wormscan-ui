import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { useEnvironment } from "src/context/EnvironmentContext";
import { ALLBRIDGE_URL, CCTP_URL, MAYAN_URL, NTT_URL, PORTAL_BRIDGE_URL } from "src/consts";
import { BlockchainIcon, Loader, ProtocolIcon, Tooltip } from "src/components/atoms";
import { ErrorPlaceholder } from "src/components/molecules";
import { formatNumber } from "src/utils/number";
import { getClient } from "src/api/Client";
import { ProtocolName, ProtocolsStatsOutput } from "src/api/guardian-network/types";
import { Cube3DIcon, LinkIcon } from "src/icons/generic";
import { chainToChainId } from "@wormhole-foundation/sdk";
import { getChainName } from "src/utils/wormhole";
import "./styles.scss";

const protocolNames: Record<ProtocolName, string> = {
  allbridge: "Allbridge",
  cctp: "CCTP",
  mayan: "Mayan",
  portal_token_bridge: "Portal",
  native_token_transfer: "NTT",
};

const protocolLinks: Record<ProtocolName, string> = {
  allbridge: ALLBRIDGE_URL,
  cctp: CCTP_URL,
  mayan: MAYAN_URL,
  portal_token_bridge: PORTAL_BRIDGE_URL,
  native_token_transfer: NTT_URL,
};

const chainsSupported = {
  allbridge: [
    chainToChainId("Arbitrum"),
    chainToChainId("Avalanche"),
    chainToChainId("Base"),
    chainToChainId("Bsc"),
    chainToChainId("Celo"),
    chainToChainId("Ethereum"),
    chainToChainId("Optimism"),
    chainToChainId("Polygon"),
    chainToChainId("Solana"),
    // chainToChainId("Stellar"),
    // chainToChainId("Tron"),
  ],
  cctp: [
    chainToChainId("Arbitrum"),
    chainToChainId("Avalanche"),
    chainToChainId("Base"),
    chainToChainId("Ethereum"),
    chainToChainId("Optimism"),
    chainToChainId("Polygon"),
    chainToChainId("Solana"),
  ],
  mayan: [
    chainToChainId("Arbitrum"),
    chainToChainId("Avalanche"),
    chainToChainId("Base"),
    chainToChainId("Bsc"),
    chainToChainId("Ethereum"),
    chainToChainId("Optimism"),
    chainToChainId("Polygon"),
    chainToChainId("Solana"),
  ],
  portal_token_bridge: [
    chainToChainId("Acala"),
    chainToChainId("Algorand"),
    chainToChainId("Aptos"),
    chainToChainId("Arbitrum"),
    chainToChainId("Aurora"),
    chainToChainId("Avalanche"),
    chainToChainId("Base"),
    chainToChainId("Bsc"),
    chainToChainId("Celo"),
    chainToChainId("Ethereum"),
    chainToChainId("Evmos"),
    chainToChainId("Fantom"),
    chainToChainId("Injective"),
    chainToChainId("Karura"),
    chainToChainId("Klaytn"),
    chainToChainId("Kujira"),
    chainToChainId("Moonbeam"),
    chainToChainId("Optimism"),
    chainToChainId("Osmosis"),
    chainToChainId("Polygon"),
    chainToChainId("Scroll"),
    chainToChainId("Sei"),
    chainToChainId("Solana"),
    chainToChainId("Sui"),
    chainToChainId("Terra"),
    chainToChainId("Terra2"),
    chainToChainId("Xpla"),
  ],
  native_token_transfer: [chainToChainId("Ethereum"), chainToChainId("Solana")],
};

const ProtocolsStats = () => {
  const [sortedData, setSortedData] = useState<ProtocolsStatsOutput[]>([]);
  const { environment } = useEnvironment();
  const currentNetwork = environment.network;

  const { isLoading, isError, data } = useQuery("protocolsStats", () =>
    getClient().guardianNetwork.getProtocolsStats(),
  );

  useEffect(() => {
    if (data && data.length > 0) {
      const orderedData = [...data].sort((a: ProtocolsStatsOutput, b: ProtocolsStatsOutput) => {
        const aValue = a.total_value_transferred || 0;
        const bValue = b.total_value_transferred || 0;
        return bValue - aValue;
      });

      setSortedData(orderedData);
    }
  }, [data]);

  return (
    <div className={`protocols-stats ${currentNetwork}`}>
      <h3 className="protocols-stats-title">
        <Cube3DIcon width={24} />
        Featured Protocols
      </h3>
      {isLoading ? (
        <div className="protocols-stats-loader">
          <Loader />
        </div>
      ) : isError ? (
        <div className="protocols-stats-error">
          <ErrorPlaceholder />
        </div>
      ) : (
        <div className="protocols-stats-container">
          <div className="protocols-stats-container-header">
            <h4 className="protocols-stats-container-header-title">PROTOCOL</h4>
            <h4 className="protocols-stats-container-header-title">
              Total <span>value </span>
              transferred
            </h4>
            <h4 className="protocols-stats-container-header-title">Total messages</h4>
            <h4 className="protocols-stats-container-header-title">24h messages</h4>
            <h4 className="protocols-stats-container-header-title">Chains</h4>
          </div>

          {sortedData?.map((item: ProtocolsStatsOutput) => {
            if (!chainsSupported[item.protocol]) return null;

            return (
              <div className="protocols-stats-container-element" key={item.protocol}>
                <a
                  className="protocols-stats-container-element-item"
                  href={protocolLinks[item.protocol]}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ProtocolIcon protocol={item.protocol.toUpperCase()} />

                  <p className="protocols-stats-container-element-item-protocol">
                    {protocolNames[item.protocol]}
                  </p>

                  <LinkIcon width={24} />
                </a>

                <div className="protocols-stats-container-element-item">
                  <h4 className="protocols-stats-container-element-item-title">
                    TOTAL VALUE TRANSFERRED
                  </h4>
                  <p className="protocols-stats-container-element-item-value">
                    $
                    {item?.total_value_transferred
                      ? formatNumber(item?.total_value_transferred, 0)
                      : " -"}
                  </p>
                </div>

                <div className="protocols-stats-container-element-item">
                  <h4 className="protocols-stats-container-element-item-title">TOTAL MESSAGES</h4>
                  <p className="protocols-stats-container-element-item-value">
                    {item?.total_messages ? formatNumber(item?.total_messages, 0) : "-"}
                  </p>
                </div>

                <div className="protocols-stats-container-element-item">
                  <h4 className="protocols-stats-container-element-item-title">24H MESSAGES</h4>
                  <p className="protocols-stats-container-element-item-value">
                    {item?.last_day_messages && item?.last_day_diff_percentage ? (
                      <>
                        {formatNumber(item?.last_day_messages, 0)}
                        <span
                          className={`protocols-stats-container-element-item-value-diff ${
                            item?.last_day_diff_percentage === "0.00%"
                              ? ""
                              : item?.last_day_diff_percentage.startsWith("-")
                              ? "negative"
                              : "positive"
                          }`}
                        >
                          {!item?.last_day_diff_percentage.startsWith("-") && "+"}
                          {item?.last_day_diff_percentage}
                        </span>
                      </>
                    ) : (
                      "-"
                    )}
                  </p>
                </div>

                <div className="protocols-stats-container-element-item">
                  <h4 className="protocols-stats-container-element-item-title">CHAINS</h4>
                  <div className="protocols-stats-container-element-item-value">
                    <Tooltip
                      type="info"
                      maxWidth={false}
                      tooltip={
                        <div className="protocols-stats-container-element-item-value-tooltip">
                          {chainsSupported?.[item.protocol]?.map(chainId => {
                            return (
                              <div
                                className="protocols-stats-container-element-item-value-tooltip-content"
                                key={chainId}
                              >
                                <BlockchainIcon
                                  background="#1F1F1F"
                                  chainId={chainId}
                                  network={currentNetwork}
                                  size={20}
                                />

                                {getChainName({ chainId, network: currentNetwork })}
                              </div>
                            );
                          })}
                        </div>
                      }
                    >
                      <div className="protocols-stats-container-element-item-value-chains">
                        {chainsSupported?.[item.protocol]?.map((chainId, i) => {
                          if (i > 7) return null;

                          if (i === 7 && chainsSupported[item.protocol].length > 8) {
                            return (
                              <div
                                key={chainId}
                                className="protocols-stats-container-element-item-value-chains-chain protocols-stats-container-element-item-value-chains-chain-more"
                              >
                                {chainsSupported[item.protocol].length - 7}
                              </div>
                            );
                          }

                          return (
                            <BlockchainIcon
                              background="#1F1F1F"
                              chainId={chainId}
                              className="protocols-stats-container-element-item-value-chains-chain"
                              colorless={true}
                              key={chainId}
                              network={currentNetwork}
                              size={28}
                            />
                          );
                        })}
                      </div>
                    </Tooltip>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProtocolsStats;
