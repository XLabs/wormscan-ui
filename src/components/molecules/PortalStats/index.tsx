import { useTranslation } from "react-i18next";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import PortalStatsImage from "src/assets/portal-stats.svg";
import { useEnvironment } from "src/context/EnvironmentContext";
import { Loader, Tooltip } from "src/components/atoms";
import { ErrorPlaceholder } from "src/components/molecules";
import { formatNumber } from "src/utils/number";
import "./styles.scss";

type Props = {
  isError: boolean;
  isLoading: boolean;
  total_volume: string;
  volume24h: string;
};

const PortalStats = ({ isLoading, isError, total_volume, volume24h }: Props) => {
  const { t } = useTranslation();
  const { environment } = useEnvironment();

  return (
    <div className="portal-data">
      <div className="portal-title">
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
