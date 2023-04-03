import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ToggleGroup } from "src/components/atoms";
import { TransactionHistoryChart } from "src/components/molecules";
import { formatCurrency } from "src/utils/number";
import "./styles.scss";

const RANGE_LIST = [
  { label: "1D", value: "1D", ariaLabel: "One day" },
  { label: "1W", value: "1W", ariaLabel: "One week" },
  { label: "1M", value: "1M", ariaLabel: "One month" },
];

const Statistics = () => {
  const { t } = useTranslation();
  const [selectedRange, setSelectedRange] = useState(RANGE_LIST[0].value);

  return (
    <section className="home-statistics">
      <div className="home-statistics-history">
        <div className="home-statistics-history-options">
          <div className="home-statistics-title">Transaction History</div>
          <ToggleGroup
            value={selectedRange}
            onValueChange={setSelectedRange}
            items={RANGE_LIST}
            ariaLabel="Select range"
            separatedOptions
          />
        </div>

        <span className="home-statistics-history-date">Feb 28, 250.000 txns</span>

        <TransactionHistoryChart />
      </div>

      <div className="home-statistics-data">
        <div className="home-statistics-title">Wormhole stats</div>

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
