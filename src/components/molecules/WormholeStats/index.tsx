import { useTranslation } from "react-i18next";
import { useQuery } from "react-query";
import WormholeStatsImage from "src/assets/wormhole-stats.svg";
import { useEnvironment } from "src/context/EnvironmentContext";
import { ExternalLinkIcon, InfoCircledIcon } from "@radix-ui/react-icons";
import { WORMHOLE_PAGE_URL } from "src/consts";
import { Loader, Tooltip } from "src/components/atoms";
import { ErrorPlaceholder } from "src/components/molecules";
import { formatNumber } from "src/utils/number";
import { getClient } from "src/api/Client";
import "./styles.scss";

const WormholeStats = () => {
  const { t } = useTranslation();
  const { environment } = useEnvironment();
  const isMainnet = environment.network === "MAINNET";

  const {
    isLoading,
    isError,
    data: scoreData,
  } = useQuery("scoresResponse", () => getClient().guardianNetwork.getScores());

  const {
    "24h_messages": messages24h,
    "24h_volume": volume24h,
    total_messages,
    total_volume,
  } = scoreData || {};

  return (
    <div className={`wormhole-stats ${isMainnet ? "" : "wormhole-stats-testnet"}`}>
      <a
        className="wormhole-stats-title"
        href={WORMHOLE_PAGE_URL}
        target="_blank"
        rel="noopener noreferrer"
      >
        <img src={WormholeStatsImage} alt="wormhole logo" width="132" />
        <ExternalLinkIcon height={15} width={15} />
      </a>

      {isLoading ? (
        <div className="wormhole-stats-loader">
          <Loader />
        </div>
      ) : isError ? (
        <div className="wormhole-stats-error">
          <ErrorPlaceholder />
        </div>
      ) : (
        <div className="wormhole-stats-container">
          <div className="wormhole-stats-container-item">
            <div className="wormhole-stats-container-item-title">
              {t("home.statistics.allMessage")}
              <Tooltip
                tooltip={
                  <div>
                    Total messages sent since the creation of the network. (Includes Pyth messages)
                  </div>
                }
                type="info"
              >
                <InfoCircledIcon height={18} width={18} />
              </Tooltip>
            </div>
            <div className="wormhole-stats-container-item-value">
              {total_messages ? formatNumber(Number(total_messages), 0) : "-"}
            </div>
          </div>

          <div className="wormhole-stats-container-item">
            <div className="wormhole-stats-container-item-title">
              {t("home.statistics.dayMessage")}
              <Tooltip
                tooltip={
                  <div>Number of messages sent in the last 24 hours. (Includes Pyth messages)</div>
                }
                type="info"
              >
                <InfoCircledIcon height={18} width={18} />
              </Tooltip>
            </div>
            <div className="wormhole-stats-container-item-value">
              {messages24h ? formatNumber(Number(messages24h), 0) : "-"}
            </div>
          </div>

          <div className="wormhole-stats-container-item">
            <div className="wormhole-stats-container-item-title">
              {t("home.statistics.allVolume")}
              <Tooltip
                tooltip={
                  <div>This metric calculates the all-time total USD value of VAA transfers.</div>
                }
                type="info"
              >
                <InfoCircledIcon height={18} width={18} />
              </Tooltip>
            </div>
            <div className="wormhole-stats-container-item-value">
              {isMainnet ? <>${total_volume ? formatNumber(Number(total_volume)) : "-"}</> : "-"}
            </div>
          </div>

          <div className="wormhole-stats-container-item">
            <div className="wormhole-stats-container-item-title">
              {t("home.statistics.messageVolume")}
              <Tooltip
                tooltip={<div>This metric calculates the last 24h USD value of VAA transfers.</div>}
                type="info"
              >
                <InfoCircledIcon height={18} width={18} />
              </Tooltip>
            </div>
            <div className="wormhole-stats-container-item-value">
              {isMainnet ? <>${volume24h ? formatNumber(Number(volume24h), 0) : "-"}</> : "-"}
            </div>
          </div>
        </div>
      )}

      <div className="w-187" />
    </div>
  );
};

export default WormholeStats;
