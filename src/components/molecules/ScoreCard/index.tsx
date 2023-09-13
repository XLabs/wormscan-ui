import { useQuery } from "react-query";
import { useTranslation } from "react-i18next";
import { Loader } from "src/components/atoms";
import { ErrorPlaceholder } from "src/components/molecules";
import { formatCurrency, formatNumber, numberToSuffix } from "src/utils/number";
import { getClient } from "src/api/Client";
import "./styles.scss";
import { useEnvironment } from "src/context/EnvironmentContext";

const ScoreCard = () => {
  const { t } = useTranslation();

  const {
    isLoading,
    isError,
    data: scoreData,
  } = useQuery("scoresResponse", () => getClient().guardianNetwork.getScores());

  const {
    tvl,
    total_volume,
    total_tx_count,
    "24h_volume": volume24h,
    "24h_tx_count": tx_count24h,
    "24h_messages": messages24h,
  } = scoreData || {};

  const { environment } = useEnvironment();

  return (
    <div className="home-statistics-data" data-testid="home-score-card">
      <div className="home-statistics-title">Wormhole stats</div>
      {isLoading ? (
        <Loader />
      ) : (
        <>
          {isError ? (
            <ErrorPlaceholder />
          ) : (
            <div className="home-statistics-data-container">
              <div className="home-statistics-data-container-item end">
                <div className="home-statistics-data-container-item-title">
                  {t("home.statistics.allTxn")}
                </div>
                <div className="home-statistics-data-container-item-value">
                  {total_tx_count ? numberToSuffix(Number(total_tx_count)) : "-"}
                </div>
              </div>

              <div className="home-statistics-data-container-item end">
                <div className="home-statistics-data-container-item-title">
                  {t("home.statistics.dayTxn")}
                </div>
                <div className="home-statistics-data-container-item-value">
                  {tx_count24h ? formatNumber(Number(tx_count24h), 0) : "-"}
                </div>
              </div>

              <div className="home-statistics-data-container-item end">
                <div className="home-statistics-data-container-item-title">
                  {t("home.statistics.dayMessage")}
                </div>
                <div className="home-statistics-data-container-item-value">
                  {messages24h ? formatNumber(Number(messages24h), 0) : "-"}
                </div>
              </div>

              <hr />

              <div className="home-statistics-data-container-item start">
                <div className="home-statistics-data-container-item-title">
                  {t("home.statistics.tvl")}
                </div>
                <div className="home-statistics-data-container-item-value">
                  {environment.network === "MAINNET" ? (
                    <>${tvl ? numberToSuffix(Number(tvl)) : "-"}</>
                  ) : (
                    "-"
                  )}
                </div>
              </div>

              <div className="home-statistics-data-container-item start">
                <div className="home-statistics-data-container-item-title">
                  {t("home.statistics.allVolume")}
                </div>
                <div className="home-statistics-data-container-item-value">
                  {environment.network === "MAINNET" ? (
                    <>${total_volume ? numberToSuffix(Number(total_volume)) : "-"}</>
                  ) : (
                    "-"
                  )}
                </div>
              </div>

              <div className="home-statistics-data-container-item start">
                <div className="home-statistics-data-container-item-title">
                  {t("home.statistics.messageVolume")}
                </div>
                <div className="home-statistics-data-container-item-value">
                  {environment.network === "MAINNET" ? (
                    <>${volume24h ? formatCurrency(Number(volume24h), 0) : "-"}</>
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

export default ScoreCard;
