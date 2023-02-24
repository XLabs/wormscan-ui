import { useTranslation } from "react-i18next";
import "./styles.scss";

const Statistics = () => {
  const { t } = useTranslation();

  return (
    <section className="home-statistics">
      <div className="home-statistics-graph">Graph</div>
      <div className="home-statistics-data">
        <div className="home-statistics-data-row">
          <div className="home-statistics-data-row-item">
            <div className="home-statistics-data-row-item-title">
              {t("home.statistics.connectedChains")}
            </div>
            <div className="home-statistics-data-row-item-value">16</div>
          </div>
          <div className="home-statistics-data-row-item">
            <div className="home-statistics-data-row-item-title">
              {t("home.statistics.allVolume")}
            </div>
            <div className="home-statistics-data-row-item-value">$6,400,000</div>
          </div>
          <div className="home-statistics-data-row-item">
            <div className="home-statistics-data-row-item-title">{t("home.statistics.tvl")}</div>
            <div className="home-statistics-data-row-item-value">$19,400,321</div>
          </div>
        </div>
        <hr />
        <div className="home-statistics-data-row">
          <div className="home-statistics-data-row-item">
            <div className="home-statistics-data-row-item-title">
              {t("home.statistics.messageVolume")}
            </div>
            <div className="home-statistics-data-row-item-value">1,000,234</div>
          </div>
          <div className="home-statistics-data-row-item">
            <div className="home-statistics-data-row-item-title">
              {t("home.statistics.assetsTransfer")}
            </div>
            <div className="home-statistics-data-row-item-value">$6,400,000</div>
          </div>
          <div className="home-statistics-data-row-item">
            <div className="home-statistics-data-row-item-title">
              {t("home.statistics.validators")}
            </div>
            <div className="home-statistics-data-row-item-value">19</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export { Statistics };
