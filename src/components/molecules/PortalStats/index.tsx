import { useQuery } from "react-query";
import { useTranslation } from "react-i18next";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import PortalStatsImage from "src/assets/portal-stats.svg";
import { useEnvironment } from "src/context/EnvironmentContext";
import { Loader, Tooltip } from "src/components/atoms";
import { ErrorPlaceholder, TransactionHistory } from "src/components/molecules";
import { formatNumber, numberToSuffix } from "src/utils/number";
import { getClient } from "src/api/Client";
import "./styles.scss";

const PortalStats = () => {
  const { t } = useTranslation();

  const {
    isLoading,
    isError,
    data: scoreData,
  } = useQuery("scoresResponse", () => getClient().guardianNetwork.getScores());

  const { total_volume, "24h_volume": volume24h } = scoreData || {};

  const { environment } = useEnvironment();

  return (
    <div className="portal-data">
      <div className="portal-title">
        {" "}
        <img src={PortalStatsImage} alt="portal logo" width="101" />
      </div>
      {isLoading ? (
        <Loader />
      ) : (
        <>
          {isError ? (
            <ErrorPlaceholder />
          ) : (
            <div className="portal-data-container">
              <div className="portal-data-container-item">
                <div className="portal-data-container-item-title">
                  {t("home.statistics.allVolume")}
                  <Tooltip
                    tooltip={
                      <div>All-time total volume transferred through the token bridge in USD.</div>
                    }
                    type="info"
                  >
                    <InfoCircledIcon height={18} width={18} />
                  </Tooltip>
                </div>
                <div className="portal-data-container-item-value">
                  {environment.network === "MAINNET" ? (
                    <>${total_volume ? formatNumber(Number(total_volume)) : "-"}</>
                  ) : (
                    "-"
                  )}
                </div>
              </div>

              <div className="portal-data-container-item">
                <div className="portal-data-container-item-title">
                  {t("home.statistics.messageVolume")}
                  <Tooltip
                    tooltip={
                      <div>
                        Volume transferred through the token bridge in the last 24 hours, in USD.
                      </div>
                    }
                    type="info"
                  >
                    <InfoCircledIcon height={18} width={18} />
                  </Tooltip>
                </div>
                <div className="portal-data-container-item-value">
                  {environment.network === "MAINNET" ? (
                    <>${volume24h ? formatNumber(Number(volume24h), 0) : "-"}</>
                  ) : (
                    "-"
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PortalStats;
