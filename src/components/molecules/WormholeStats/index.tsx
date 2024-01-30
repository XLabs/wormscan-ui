import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import WormholeStatsImage from "src/assets/wormhole-stats.svg";
import { useEnvironment } from "src/context/EnvironmentContext";
import { Loader, Tooltip } from "src/components/atoms";
import { ErrorPlaceholder } from "src/components/molecules";
import { formatNumber } from "src/utils/number";
import "./styles.scss";

const MESSAGE_COUNTS_MAINNET =
  "https://europe-west3-wormhole-message-db-mainnet.cloudfunctions.net/message-count-history";

const MESSAGE_COUNTS_TESTNET =
  "https://europe-west3-wormhole-message-db-testnet.cloudfunctions.net/message-count-history";

type Props = {
  isError: boolean;
  isLoading: boolean;
  messages24h: string;
};

const WormholeStats = ({ isLoading, isError, messages24h }: Props) => {
  const [allMessages, setAllMessages] = useState(0);
  const [allMessagesError, setAllMessagesError] = useState(false);
  const { t } = useTranslation();
  const { environment } = useEnvironment();
  const isMainnet = environment.network === "MAINNET";

  // TODO: remove this once our api brings the info
  useEffect(() => {
    setAllMessages(0);
    fetch(isMainnet ? MESSAGE_COUNTS_MAINNET : MESSAGE_COUNTS_TESTNET)
      .then(response => response.json())
      .then(data => {
        let sum = 0;
        for (const date in data.DailyTotals) {
          if (data.DailyTotals[date]["*"]) {
            sum += data.DailyTotals[date]["*"];
          }
        }
        setAllMessages(sum);
      })
      .catch(_err => {
        setAllMessagesError(true);
      });
  }, [isMainnet]);

  return (
    <div className="wormhole-stats">
      <div className="wormhole-stats-title">
        <img src={WormholeStatsImage} alt="wormhole logo" width="132" />
      </div>
      {isLoading || !allMessages ? (
        <div className="wormhole-stats-loader">
          <Loader />
        </div>
      ) : (
        <>
          {isError || allMessagesError ? (
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
                        Total messages sent since the creation of the network. (Includes Pyth
                        messages)
                      </div>
                    }
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
                    tooltip={
                      <div>
                        Number of messages sent in the last 24 hours. (Includes Pyth messages)
                      </div>
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
            </div>
          )}
        </>
      )}
      <div className="w-132" />
    </div>
  );
};

export default WormholeStats;
