import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "react-query";
import { useEnvironment } from "src/context/EnvironmentContext";
import i18n from "src/i18n";
import { Loader, Select, ToggleGroup } from "src/components/atoms";
import { ErrorPlaceholder } from "src/components/molecules";
import { getClient } from "src/api/Client";
import { CrossChainBy } from "src/api/guardian-network/types";
import { Chart } from "./Chart";
import { ChainId } from "src/api";
import { SwapSmallVerticalIcon, GlobeIcon, ChevronDownIcon } from "src/icons/generic";
import "./styles.scss";

interface ICsvRow {
  "Destination Chain": number;
  "Destination Percentage": number;
  "Destination Volume": string;
  "Main Chain": number;
  "Main Percentage": number;
  "Main Volume": string;
}

const MAINNET_TYPE_LIST = [
  { label: i18n.t("home.crossChain.volume"), value: "notional", ariaLabel: "Volume" },
  { label: i18n.t("home.crossChain.count"), value: "tx", ariaLabel: "Transactions" },
];

const TESTNET_TYPE_LIST = [
  { label: i18n.t("home.crossChain.count"), value: "tx", ariaLabel: "Transactions" },
];

const RANGE_LIST = [
  { label: "Last 7 days", value: "7d" },
  { label: "Last 30 days", value: "30d" },
  { label: "Last 90 days", value: "90d" },
  { label: "Last 365 days", value: "1y" },
  { label: "All Time", value: "all-time" },
];

const CrossChainChart = () => {
  const { environment } = useEnvironment();
  const currentNetwork = environment.network;
  const { t } = useTranslation();

  const [TYPE_LIST, setTypeList] = useState(MAINNET_TYPE_LIST);
  const [selectedType, setSelectedType] = useState<CrossChainBy>("notional");
  const [selectedTimeRange, setSelectedTimeRange] = useState(RANGE_LIST[0]);
  const [selectedDestination, setSelectedDestination] = useState<"sources" | "destinations">(
    "sources",
  );
  const isSources = selectedDestination === "sources";
  const prevChain = useRef<ChainId>(null);

  useEffect(() => {
    if (currentNetwork === "MAINNET") {
      setTypeList(MAINNET_TYPE_LIST);
    } else {
      setSelectedType("tx");
      setTypeList(TESTNET_TYPE_LIST);
    }
  }, [currentNetwork]);

  const { data, isError, isLoading, isFetching } = useQuery(
    ["getLastTxs", selectedType, selectedTimeRange.value],
    () =>
      getClient().guardianNetwork.getCrossChainActivity({
        by: selectedType,
        timeSpan: selectedTimeRange.value,
      }),
    { cacheTime: 0 },
  );

  const handleDownload = () => {
    const csvData: any = [];
    data.forEach(item => {
      item.destinations.sort((a, b) => b.percentage - a.percentage);
      item.destinations.forEach(dest => {
        csvData.push({
          "Main Chain": item.chain,
          "Main Volume": item.volume,
          "Main Percentage": item.percentage,
          "Destination Chain": dest.chain,
          "Destination Volume": dest.volume,
          "Destination Percentage": dest.percentage,
        });
      });
    });

    csvData.sort((a: ICsvRow, b: ICsvRow) => b["Main Percentage"] - a["Main Percentage"]);

    const headers = [
      "Main Chain",
      "Main Volume",
      "Main Percentage",
      "Destination Chain",
      "Destination Volume",
      "Destination Percentage",
    ];

    const rows = csvData.map(
      (row: ICsvRow) =>
        `${row["Main Chain"]},${row["Main Volume"]},${row["Main Percentage"]},${row["Destination Chain"]},${row["Destination Volume"]},${row["Destination Percentage"]}`,
    );

    const csvContent = [headers.join(","), ...rows].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Cross-chain activity.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="cross-chain" data-testid="cross-chain-card">
      <div className="cross-chain-top">
        <div className="cross-chain-top-title">
          <GlobeIcon width={24} />
          {t("home.crossChain.title")}
        </div>

        <button className="cross-chain-top-download" onClick={handleDownload}>
          {t("home.crossChain.download")}
          <ChevronDownIcon width={24} />
        </button>
      </div>

      <div className="cross-chain-options">
        {currentNetwork === "MAINNET" ? (
          <ToggleGroup
            ariaLabel="Select type"
            className="cross-chain-options-items"
            items={TYPE_LIST}
            onValueChange={value => setSelectedType(value)}
            value={selectedType}
          />
        ) : (
          <div className="cross-chain-options-txsText">Transactions</div>
        )}

        <div className="cross-chain-destination">
          <button
            aria-label="Select graphic type"
            className="cross-chain-destination-button"
            onClick={() => setSelectedDestination(isSources ? "destinations" : "sources")}
          >
            <SwapSmallVerticalIcon width={24} />

            {isSources ? "Source to Target" : "Target to Source"}
          </button>
        </div>

        <div className="cross-chain-filters">
          <div className="cross-chain-filters-group">
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

      <div className="cross-chain-relative">
        {isLoading || isFetching ? (
          <Loader />
        ) : (
          <>
            {isError ? (
              <ErrorPlaceholder errorType="sankey" />
            ) : (
              <Chart
                currentNetwork={currentNetwork}
                data={data}
                prevChain={prevChain}
                selectedDestination={selectedDestination}
                selectedType={selectedType}
                selectedTimeRange={selectedTimeRange.value}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CrossChainChart;
