import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { useTranslation } from "react-i18next";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import WormholeStatsImage from "src/assets/wormhole-stats.svg";
import { Loader, Tooltip } from "src/components/atoms";
import { ErrorPlaceholder } from "src/components/molecules";
import { formatNumber } from "src/utils/number";
import { getClient } from "src/api/Client";
import "./styles.scss";

const MESSAGE_COUNTS =
  "https://europe-west3-wormhole-message-db-mainnet.cloudfunctions.net/message-count-history";

const WormholeStats = () => {
  const [allMessages, setAllMessages] = useState(0);
  const [allMessagesError, setAllMessagesError] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    fetch(MESSAGE_COUNTS)
      .then(response => response.json())
      .then(data => {
        let sum = 0;
        for (const date in data.DailyTotals) {
          if (data.DailyTotals[date]["*"]) {
            sum += data.DailyTotals[date]["*"];
          }
          setAllMessages(sum);
        }
      })
      .catch(_err => {
        setAllMessagesError(true);
      });
  }, []);

  const {
    isLoading,
    isError,
    data: scoreData,
  } = useQuery("scoresResponse", () => getClient().guardianNetwork.getScores());

  const { "24h_messages": messages24h } = scoreData || {};

  return (
    <div className="wormhole-stats">
      <div className="wormhole-stats-title">
        <img src={WormholeStatsImage} alt="wormhole logo" width="132" />
      </div>
      {isLoading || !allMessages ? (
        <Loader />
      ) : (
        <>
          {isError || allMessagesError ? (
            <ErrorPlaceholder />
          ) : (
            <div className="wormhole-stats-container">
              <div className="wormhole-stats-container-item">
                <div className="wormhole-stats-container-item-title">
                  {t("home.statistics.allMessage")}
                  <Tooltip
                    tooltip={<div>Messages transferred in the past 24 hours.</div>}
                    type="info"
                  >
                    <InfoCircledIcon height={18} width={18} />
                  </Tooltip>
                </div>
                <div className="wormhole-stats-container-item-value">
                  {allMessages ? formatNumber(Number(allMessages), 0) : "-"}
                </div>
              </div>

              <div className="wormhole-stats-container-item">
                <div className="wormhole-stats-container-item-title">
                  {t("home.statistics.dayMessage")}
                  <Tooltip
                    tooltip={<div>Messages transferred in the past 24 hours.</div>}
                    type="info"
                  >
                    <InfoCircledIcon height={18} width={18} />
                  </Tooltip>
                </div>
                <div className="wormhole-stats-container-item-value">
                  {messages24h ? formatNumber(Number(messages24h), 0) : "-"}
                </div>
              </div>
            </div>
          )}
        </>
      )}
      <div className="w-132" />
    </div>
  );
};

export default WormholeStats;
