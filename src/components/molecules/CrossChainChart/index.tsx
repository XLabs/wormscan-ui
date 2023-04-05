import { useState } from "react";
import client from "src/api/Client";
import { Chart } from "./Chart";
import { useQuery } from "react-query";
import { Loader, Select, ToggleGroup } from "src/components/atoms";
import i18n from "src/i18n";
import { useTranslation } from "react-i18next";
import "./styles.scss";

const TYPE_LIST = [
  { label: i18n.t("home.crossChain.chains"), value: "chains", ariaLabel: "Chains" },
  { label: i18n.t("home.crossChain.count"), value: "tx-count", ariaLabel: "Transaction Count" },
];

const APP_LIST = [
  { label: "All Apps", value: "all" },
  { label: "App #1", value: "app1" },
  { label: "App #2", value: "app2" },
  { label: "App #3", value: "app3" },
];

const RANGE_LIST = [
  { label: "All Time", value: "all" },
  { label: "Range #1", value: "range1" },
  { label: "Range #2", value: "range2" },
  { label: "Range #3", value: "range3" },
  { label: "Range #4", value: "range4" },
  { label: "Range #5", value: "range5" },
];

const CrossChainChart = () => {
  const { t } = useTranslation();
  const [selectedType, setSelectedType] = useState<string>(TYPE_LIST[0].value);
  const [selectedApp, setSelectedApp] = useState<string>(APP_LIST[0].value);
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>(RANGE_LIST[0].value);

  const { isLoading, error, data } = useQuery("crossChainResponse", () =>
    client.guardianNetwork.getCrossChainActivity(),
  );

  if (error) return null;
  return (
    <div className="cross-chain">
      <div className="cross-chain-title">{t("home.crossChain.title")}</div>

      <div className="cross-chain-options">
        <ToggleGroup
          value={selectedType}
          onValueChange={value => setSelectedType(value)}
          items={TYPE_LIST}
          ariaLabel="Select type"
          className="cross-chain-options-items"
        />

        <div className="cross-chain-filters">
          <div className="cross-chain-filters-group">
            <span className="cross-chain-filters-text">{t("home.crossChain.apps")}</span>
            <Select
              value={selectedApp}
              onValueChange={value => setSelectedApp(value)}
              items={APP_LIST}
              ariaLabel="Select App"
              className="cross-chain-filters-select"
            />
          </div>

          <div className="cross-chain-filters-group">
            <span className="cross-chain-filters-text">{t("home.crossChain.timeRange")}</span>
            <Select
              value={selectedTimeRange}
              onValueChange={value => setSelectedTimeRange(value)}
              items={RANGE_LIST}
              ariaLabel="Select Time Range"
              className="cross-chain-filters-select"
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="cross-chain-loader">
          <Loader />
        </div>
      ) : (
        <Chart data={data} />
      )}

      <div className="cross-chain-message">{t("home.crossChain.bottomMessage")}</div>
    </div>
  );
};

export default CrossChainChart;
