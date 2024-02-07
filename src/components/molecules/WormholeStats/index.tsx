import { useTranslation } from "react-i18next";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import WormholeStatsImage from "src/assets/wormhole-stats.svg";
import { Loader, Tooltip } from "src/components/atoms";
import { ErrorPlaceholder } from "src/components/molecules";
import { formatNumber } from "src/utils/number";
import "./styles.scss";

type Props = {
  isError: boolean;
  isLoading: boolean;
  messages24h: string;
  total_messages: string;
};

const WormholeStats = ({ isLoading, isError, messages24h, total_messages }: Props) => {
  const { t } = useTranslation();

  return (
    <div className="wormhole-stats">
      <div className="wormhole-stats-title">
        <img src={WormholeStatsImage} alt="wormhole logo" width="132" />
      </div>
      {isLoading ? (
        <div className="wormhole-stats-loader">
          <Loader />
        </div>
      ) : (
        <>
          {isError ? (
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
                  {total_messages ? formatNumber(Number(total_messages), 0) : "-"}
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
