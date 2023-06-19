import { useEffect, useState } from "react";
import client from "src/api/Client";
import { Chart } from "./Chart";
import { useMutation } from "react-query";
import { Loader, Select, ToggleGroup } from "src/components/atoms";
import i18n from "src/i18n";
import { useTranslation } from "react-i18next";
import { daysAgoDate } from "src/utils/date";
import { CrossChainBy } from "@xlabs-libs/wormscan-sdk";
import "./styles.scss";

const TYPE_LIST = [
  { label: i18n.t("home.crossChain.volume"), value: "notional", ariaLabel: "Volume" },
  { label: i18n.t("home.crossChain.count"), value: "tx", ariaLabel: "Transactions" },
];

const RANGE_LIST = [
  { label: "Last 7 days", value: "7" },
  { label: "Last 30 days", value: "30" },
  { label: "Last 90 days", value: "90" },
  { label: "Last 365 days", value: "365" },
  { label: "All Time", value: "all" },
];

const CrossChainChart = () => {
  const { t } = useTranslation();

  const [selectedType, setSelectedType] = useState<CrossChainBy>("notional");
  const [selectedTimeRange, setSelectedTimeRange] = useState(RANGE_LIST[0]);

  const { isLoading, error, data, mutate } = useMutation(
    "crossChainResponse",
    () =>
      client.guardianNetwork.getCrossChainActivity({
        by: selectedType,
        startTime: daysAgoDate(selectedTimeRange.value === "all" ? 1750 : +selectedTimeRange.value),
      }),
    { retry: 2 },
  );
  useEffect(mutate, [selectedTimeRange, selectedType, mutate]);

  if (error || (data && data.length === 0)) return null;
  return (
    <div className="cross-chain" data-testid="cross-chain-card">
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

      {isLoading || !data ? (
        <div className="cross-chain-loader">
          <Loader />
        </div>
      ) : (
        <Chart data={data} selectedType={selectedType} />
      )}

      <div className="cross-chain-message">
        <div>{t("home.crossChain.portalActivity")}</div>
        <div>{t("home.crossChain.bottomMessage")}</div>
      </div>
    </div>
  );
};

export default CrossChainChart;
