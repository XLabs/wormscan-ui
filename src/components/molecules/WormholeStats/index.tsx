import { useTranslation } from "react-i18next";
import { useQuery } from "react-query";
import { useEnvironment } from "src/context/EnvironmentContext";
import { WORMHOLE_PAGE_URL } from "src/consts";
import { Loader, Tooltip } from "src/components/atoms";
import { ErrorPlaceholder } from "src/components/molecules";
import { formatNumber } from "src/utils/number";
import { getClient } from "src/api/Client";
import { InfoCircleIcon, LinkIcon } from "src/icons/generic";
import WormholeLogo from "src/assets/wormhole-stats.svg";
import "./styles.scss";

const WormholeStats = () => {
  const { t } = useTranslation();
  const { environment } = useEnvironment();
  const isMainnet = environment.network === "Mainnet";

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
    <div className="wormhole-stats">
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
                tooltip={<div>Total messages sent since the creation of the network.</div>}
                type="info"
              >
                <div className="wormhole-stats-container-item-title-icon">
                  <InfoCircleIcon />
                </div>
              </Tooltip>
            </div>
            <div className="wormhole-stats-container-item-value">
              {total_messages ? formatNumber(Number(total_messages), 0) : "-"}
            </div>
          </div>

          <div className="wormhole-stats-container-item">
            <div className="wormhole-stats-container-item-title">
              {t("home.statistics.dayMessage")}{" "}
              <span className="wormhole-stats-container-item-title-time">
                {t("home.statistics.dayMessageTime")}
              </span>
              <Tooltip
                tooltip={<div>Number of messages sent in the last 24 hours.</div>}
                type="info"
              >
                <div className="wormhole-stats-container-item-title-icon">
                  <InfoCircleIcon />
                </div>
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
                <div className="wormhole-stats-container-item-title-icon">
                  <InfoCircleIcon />
                </div>
              </Tooltip>
            </div>
            <div className="wormhole-stats-container-item-value">
              {isMainnet ? <>${total_volume ? formatNumber(Number(total_volume)) : "-"}</> : "-"}
            </div>
          </div>

          <div className="wormhole-stats-container-item">
            <div className="wormhole-stats-container-item-title">
              {t("home.statistics.dayVolume")}{" "}
              <span className="wormhole-stats-container-item-title-time">
                {t("home.statistics.dayVolumeTime")}
              </span>
              <Tooltip
                tooltip={<div>This metric calculates the last 24h USD value of VAA transfers.</div>}
                type="info"
              >
                <div className="wormhole-stats-container-item-title-icon">
                  <InfoCircleIcon />
                </div>
              </Tooltip>
            </div>
            <div className="wormhole-stats-container-item-value">
              {isMainnet ? <>${volume24h ? formatNumber(Number(volume24h), 0) : "-"}</> : "-"}
            </div>
          </div>

          <div className="wormhole-stats-container-item">
            <div className="wormhole-stats-container-item-title"></div>
            <div className="wormhole-stats-container-item-value">
              <a
                className="wormhole-stats-container-item-value-link"
                href={WORMHOLE_PAGE_URL}
                rel="noreferrer"
                target="_blank"
              >
                <img src={WormholeLogo} alt="wormhole" />
                <LinkIcon width={24} />
              </a>
            </div>
          </div>

          <div className="wormhole-stats-container-line" />
        </div>
      )}
    </div>
  );
};

export default WormholeStats;
