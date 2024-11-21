import { useQuery } from "react-query";
import {
  ALL_BRIDGE_APP_ID,
  BREAKPOINTS,
  C3_APP_ID,
  CCTP_APP_ID,
  CONNECT_APP_ID,
  ETH_BRIDGE_APP_ID,
  FAST_TRANSFERS_APP_ID,
  GATEWAY_APP_ID,
  GR_APP_ID,
  LIQUIDITY_LAYER_APP_ID,
  MAYAN_APP_ID,
  NTT_APP_ID,
  OMNISWAP_APP_ID,
  PORTAL_APP_ID,
  SWAP_LAYER_APP_ID,
  TBTC_APP_ID,
  UNKNOWN_APP_ID,
  USDT_TRANSFER_APP_ID,
} from "src/consts";
import { useEnvironment } from "src/context/EnvironmentContext";
import { Cube3DIcon, InfoCircleIcon, LinkIcon } from "src/icons/generic";
import { BlockchainIcon, Loader, NavLink, ProtocolIcon, Tooltip } from "src/components/atoms";
import { ErrorPlaceholder } from "src/components/molecules";
import { chainsSupportedByProtocol, protocolLinksByProtocol } from "src/utils/filterUtils";
import { useNavigateCustom, useWindowSize } from "src/utils/hooks";
import { getChainName } from "src/utils/wormhole";
import { formatNumber } from "src/utils/number";
import { formatAppId } from "src/utils/crypto";
import { getClient } from "src/api/Client";
import "./styles.scss";
import analytics from "src/analytics";

// TODO: remove when /protocols/stats returns the correct app_id
const protocolMapping: Record<string, string> = {
  allbridge: ALL_BRIDGE_APP_ID,
  c3: C3_APP_ID,
  cctp: CCTP_APP_ID,
  connect: CONNECT_APP_ID,
  eth_bridge: ETH_BRIDGE_APP_ID,
  fast_transfers: FAST_TRANSFERS_APP_ID,
  liquidity_layer: LIQUIDITY_LAYER_APP_ID,
  mayan: MAYAN_APP_ID,
  native_token_transfer: NTT_APP_ID,
  omniswap: OMNISWAP_APP_ID,
  portal_token_bridge: PORTAL_APP_ID,
  standard_relayer: GR_APP_ID,
  swap_layer: SWAP_LAYER_APP_ID,
  tbtc: TBTC_APP_ID,
  usdt_transfer: USDT_TRANSFER_APP_ID,
  wormchain_gateway_transfer: GATEWAY_APP_ID,
};

const ProtocolsStats = ({ numberOfProtocols }: { numberOfProtocols?: number }) => {
  const navigate = useNavigateCustom();
  const { environment } = useEnvironment();
  const currentNetwork = environment.network;
  const isMainnet = currentNetwork === "Mainnet";

  const { width } = useWindowSize();
  const isDesktop = width >= BREAKPOINTS.desktop;

  const { data, isLoading, isError } = useQuery(["stats", isMainnet], () =>
    getClient()
      .guardianNetwork.getProtocolsStats()
      .then(stats => {
        const updatedStats = stats.map(item => ({
          ...item,
          protocol: protocolMapping[item.protocol] || item.protocol.toUpperCase(),
        }));

        return updatedStats
          .filter(
            item =>
              item.protocol !== C3_APP_ID &&
              item.protocol !== CONNECT_APP_ID &&
              item.protocol !== "STABLE" &&
              item.protocol !== "WORMHOLE_GATEWAY_TRANSFER",
          )
          .sort((a, b) => {
            return isMainnet
              ? b.total_value_transferred - a.total_value_transferred
              : b.total_messages - a.total_messages;
          });
      }),
  );

  return (
    <div className={`protocols-stats ${currentNetwork}`}>
      <h3 className="protocols-stats-title">
        <Cube3DIcon width={24} />
        {numberOfProtocols
          ? `Top ${numberOfProtocols} Protocols by ${isMainnet ? "Volume" : "Transfers"}`
          : "Protocols Stats"}

        {numberOfProtocols && (
          <NavLink
            className="protocols-stats-title-link"
            to="/analytics/protocols"
            onClick={() => {
              analytics.track("viewMore", {
                network: currentNetwork,
                selected: "Protocols Stats",
              });
            }}
          >
            View More
          </NavLink>
        )}
      </h3>

      {isError ? (
        <div className="protocols-stats-error">
          <ErrorPlaceholder />
        </div>
      ) : (
        <div className="protocols-stats-container">
          <div className="protocols-stats-container-header">
            <h4 className="protocols-stats-container-header-title">PROTOCOL</h4>
            {isMainnet && (
              <>
                <h4 className="protocols-stats-container-header-title">TOTAL VOLUME</h4>
                <h4 className="protocols-stats-container-header-title">
                  24H VOLUME <InfoTooltip24H />
                </h4>
              </>
            )}
            <h4 className="protocols-stats-container-header-title">TOTAL TRANSFERS</h4>
            <h4 className="protocols-stats-container-header-title">
              24H TRANSFERS <InfoTooltip24H />
            </h4>
            <h4 className="protocols-stats-container-header-title">CHAINS</h4>
          </div>

          {isLoading ? (
            isDesktop ? (
              Array.from({ length: numberOfProtocols || (isMainnet ? 12 : 8) }).map((_, i) => (
                <div className="protocols-stats-container-element-loader" key={i} />
              ))
            ) : (
              <Loader />
            )
          ) : (
            data?.length > 0 &&
            data?.map((item, i) => {
              if (i >= numberOfProtocols) return null;

              return (
                <div
                  className={`protocols-stats-container-element ${
                    isDesktop && item.protocol === NTT_APP_ID ? "ntt" : ""
                  }`}
                  onClick={
                    isDesktop && item.protocol === NTT_APP_ID
                      ? () => {
                          window.scrollTo(0, 0);
                          navigate("/analytics/ntt");
                        }
                      : undefined
                  }
                  key={item.protocol}
                >
                  <div className="protocols-stats-container-element-item">
                    <a
                      className="protocols-stats-container-element-item-link"
                      href={protocolLinksByProtocol[item.protocol.toUpperCase()]}
                      onClick={e => e.stopPropagation()}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <ProtocolIcon protocol={item.protocol} />

                      <p className="protocols-stats-container-element-item-link-protocol">
                        {formatAppId(item.protocol)}
                      </p>

                      <LinkIcon width={24} />
                    </a>

                    {isDesktop && item.protocol === PORTAL_APP_ID && item.total_value_locked && (
                      <Tooltip
                        maxWidth={false}
                        tooltip={
                          <div className="protocols-stats-container-element-item-tooltip-text">
                            <span>TOTAL VALUE LOCKED: </span>$
                            {formatNumber(item.total_value_locked, 0)}
                          </div>
                        }
                        type="info"
                      >
                        <div className="protocols-stats-container-element-item-tooltip">
                          <InfoCircleIcon />
                        </div>
                      </Tooltip>
                    )}
                  </div>

                  {isMainnet && (
                    <>
                      <div className="protocols-stats-container-element-item">
                        <h4 className="protocols-stats-container-element-item-title">
                          TOTAL VOLUME
                        </h4>
                        <p className="protocols-stats-container-element-item-value">
                          $
                          {item.total_value_transferred
                            ? formatNumber(item.total_value_transferred, 0)
                            : " -"}
                        </p>
                      </div>

                      <div className="protocols-stats-container-element-item">
                        <h4 className="protocols-stats-container-element-item-title">
                          24H VOLUME <InfoTooltip24H />
                        </h4>
                        <p className="protocols-stats-container-element-item-value">
                          ${formatNumber(item.last_24_hour_volume, 0)}
                          <span
                            className={`protocols-stats-container-element-item-value-diff ${
                              item.last_day_diff_volume_percentage === "0.00%" ? "" : "positive"
                            }`}
                          >
                            {item.last_day_diff_volume_percentage === "0.00%" ? "" : "+"}
                            {item.last_day_diff_volume_percentage}
                          </span>
                        </p>
                      </div>
                    </>
                  )}

                  <div className="protocols-stats-container-element-item">
                    <h4 className="protocols-stats-container-element-item-title">
                      TOTAL TRANSFERS
                    </h4>
                    <p className="protocols-stats-container-element-item-value">
                      {item.total_messages ? formatNumber(item.total_messages, 0) : "-"}
                    </p>
                  </div>

                  <div className="protocols-stats-container-element-item">
                    <h4 className="protocols-stats-container-element-item-title">
                      24H TRANSFERS <InfoTooltip24H />
                    </h4>
                    <p className="protocols-stats-container-element-item-value">
                      {formatNumber(item.last_day_messages, 0)}

                      <span
                        className={`protocols-stats-container-element-item-value-diff ${
                          item.last_day_diff_percentage === "0.00%" ? "" : "positive"
                        }`}
                      >
                        {item.last_day_diff_percentage === "0.00%" ? "" : "+"}
                        {item.last_day_diff_percentage}
                      </span>
                    </p>
                  </div>

                  {item?.total_value_locked && (
                    <div className="protocols-stats-container-element-item mobile">
                      <h4 className="protocols-stats-container-element-item-title">
                        TOTAL VALUE LOCKED
                      </h4>
                      <p className="protocols-stats-container-element-item-value">
                        ${formatNumber(item.total_value_locked, 0)}
                      </p>
                    </div>
                  )}

                  <div className="protocols-stats-container-element-item">
                    <h4 className="protocols-stats-container-element-item-title">CHAINS</h4>
                    <div className="protocols-stats-container-element-item-value">
                      <Tooltip
                        type="info"
                        maxWidth={false}
                        tooltip={
                          <div className="protocols-stats-container-element-item-value-tooltip">
                            {chainsSupportedByProtocol[item.protocol].map(chainId => {
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
                          {chainsSupportedByProtocol[item.protocol].map((chainId, i) => {
                            const maxVisibleChains = isDesktop ? 7 : 4;
                            const maxChainsLimit = isDesktop ? 8 : 5;

                            if (i > maxVisibleChains) return null;

                            if (
                              i === maxVisibleChains &&
                              chainsSupportedByProtocol[item.protocol].length > maxChainsLimit
                            ) {
                              return (
                                <div
                                  key={chainId}
                                  className="protocols-stats-container-element-item-value-chains-chain protocols-stats-container-element-item-value-chains-chain-more"
                                >
                                  {chainsSupportedByProtocol[item.protocol].length -
                                    maxVisibleChains}
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

                  {!isDesktop && item.protocol === NTT_APP_ID && (
                    <div className="protocols-stats-container-element-item">
                      <p className="protocols-stats-container-element-item-value">
                        <NavLink
                          className="protocols-stats-container-element-item-value-link"
                          to="/analytics/ntt"
                          onClick={() => {
                            analytics.track("viewMore", {
                              network: currentNetwork,
                              selected: "Protocols Stats - NTT Details",
                            });
                          }}
                        >
                          NTT Details
                        </NavLink>
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

const InfoTooltip24H = () => (
  <Tooltip
    tooltip={
      <div>
        The percentage represents the increase over the last 24 hours relative to the total.
      </div>
    }
    type="info"
  >
    <div className="protocols-stats-container-header-title-tooltip">
      <InfoCircleIcon />
    </div>
  </Tooltip>
);

export default ProtocolsStats;
