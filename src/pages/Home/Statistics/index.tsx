import { useTranslation } from "react-i18next";
import { formatCurrency } from "src/utils/number";
import "./styles.scss";

const Statistics = () => {
  const { t } = useTranslation();

  return (
    <section className="home-statistics">
      <div className="home-statistics-graph">Transaction history</div>

      <div className="home-statistics-data">
        <div className="home-statistics-data-title">Wormhole stats</div>

        <div className="home-statistics-data-container">
          <div className="home-statistics-data-container-item">
            <div className="home-statistics-data-container-item-title">
              {t("home.statistics.tvl")}
            </div>
            <div className="home-statistics-data-container-item-value">
              ${formatCurrency(19400321, 0)}
            </div>
          </div>

          <div className="home-statistics-data-container-item">
            <div className="home-statistics-data-container-item-title">
              {t("home.statistics.allVolume")}
            </div>
            <div className="home-statistics-data-container-item-value">
              ${formatCurrency(6400000, 0)}
            </div>
          </div>

          <div className="home-statistics-data-container-item">
            <div className="home-statistics-data-container-item-title">
              {t("home.statistics.allTxn")}
            </div>
            <div className="home-statistics-data-container-item-value">
              ${formatCurrency(19400321, 0)}
            </div>
          </div>

          <hr />

          <div className="home-statistics-data-container-item">
            <div className="home-statistics-data-container-item-title">
              {t("home.statistics.messageVolume")}
            </div>
            <div className="home-statistics-data-container-item-value">
              ${formatCurrency(1000234, 0)}
            </div>
          </div>

          <div className="home-statistics-data-container-item">
            <div className="home-statistics-data-container-item-title">
              {t("home.statistics.dayTxn")}
            </div>
            <div className="home-statistics-data-container-item-value">
              ${formatCurrency(6400000, 0)}
            </div>
          </div>

          <div className="home-statistics-data-container-item">
            <div className="home-statistics-data-container-item-title">
              {t("home.statistics.dayMessage")}
            </div>
            <div className="home-statistics-data-container-item-value">
              ${formatCurrency(50000, 0)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export { Statistics };
