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
  { label: "Last 7 days", value: "7" },
  { label: "Last 30 days", value: "30" },
  { label: "Last 90 days", value: "90" },
  { label: "Last 365 days", value: "365" },
];

const CrossChainChart = () => {
  const { t } = useTranslation();
  const [selectedType, setSelectedType] = useState(TYPE_LIST[0].value);
  const [selectedApp, setSelectedApp] = useState(APP_LIST[0]);
  const [selectedTimeRange, setSelectedTimeRange] = useState(RANGE_LIST[0]);

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
              name="app"
              value={selectedApp}
              onValueChange={(value: any) => setSelectedApp(value)}
              items={APP_LIST}
              ariaLabel="Select App"
              className="cross-chain-filters-select"
              placeholder="Search app"
              isSearchable
              noOptionsMessage="App not found"
            />
          </div>

          <div className="cross-chain-filters-group">
            <span className="cross-chain-filters-text">{t("home.crossChain.timeRange")}</span>
            <Select
              name="timeRange"
              value={selectedTimeRange}
              onValueChange={(value: any) => setSelectedTimeRange(value)}
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
