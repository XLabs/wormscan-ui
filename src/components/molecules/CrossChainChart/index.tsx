import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "react-query";
import { useEnvironment } from "src/context/EnvironmentContext";
import i18n from "src/i18n";
import { Fullscreenable, Loader, NavLink, Select, ToggleGroup } from "src/components/atoms";
import { ErrorPlaceholder } from "src/components/molecules";
import { getClient } from "src/api/Client";
import { CrossChainBy } from "src/api/guardian-network/types";
import { Chart } from "./Chart";
import { ChainId } from "@wormhole-foundation/sdk";
import { SwapSmallVerticalIcon, GlobeIcon, FullscreenIcon } from "src/icons/generic";
import { useWindowSize } from "src/utils/hooks";
import "./styles.scss";

interface ICsvRow {
  "Target Chain": number;
  "Target Percentage": number;
  "Target Volume": string;
  "Source Chain": number;
  "Source Percentage": number;
  "Source Volume": string;
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

const DOWNLOADABLE_LIST = [
  { label: "Download CSV", value: "csv" },
  { label: "Download PNG", value: "png" },
];

const TABLE_HEADERS = [
  "Source Chain",
  "Source Volume",
  "Source Percentage",
  "Target Chain",
  "Target Volume",
  "Target Percentage",
];

const CrossChainChart = ({ isHomePage = false }: { isHomePage?: boolean }) => {
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

  const { width } = useWindowSize();
  const isDesktop = width >= 1024;

  useEffect(() => {
    if (currentNetwork === "Mainnet") {
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

  const handleDownloadAs = (downloadAs: "csv" | "png") => {
    if (!data) return;

    const csvData: any = [];
    data.forEach(item => {
      item.destinations.sort((a, b) => b.percentage - a.percentage);
      item.destinations.forEach(dest => {
        csvData.push({
          "Source Chain": item.chain,
          "Source Volume": item.volume,
          "Source Percentage": item.percentage,
          "Target Chain": dest.chain,
          "Target Volume": dest.volume,
          "Target Percentage": dest.percentage,
        });
      });
    });

    csvData.sort((a: ICsvRow, b: ICsvRow) => b["Source Percentage"] - a["Source Percentage"]);

    if (downloadAs === "csv") {
      const rows = csvData.map(
        (row: ICsvRow) =>
          `${row["Source Chain"]},${row["Source Volume"]},${row["Source Percentage"]},${row["Target Chain"]},${row["Target Volume"]},${row["Target Percentage"]}`,
      );

      const csvContent = [TABLE_HEADERS.join(","), ...rows].join("\n");
      createDownloadLink(
        csvContent,
        "text/csv",
        `Cross-chain activity - ${selectedTimeRange.label}.csv`,
      );
    } else if (downloadAs === "png") {
      const rows = csvData.map((row: ICsvRow) => [
        row["Source Chain"],
        row["Source Volume"],
        row["Source Percentage"],
        row["Target Chain"],
        row["Target Volume"],
        row["Target Percentage"],
      ]);

      const tableData = [TABLE_HEADERS, ...rows];

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      const cellPadding = isDesktop ? 8 : 6;
      const cellHeight = isDesktop ? 32 : 20;
      const fontSize = isDesktop ? 16 : 12;
      const font = `${fontSize}px Roboto, sans-serif`;
      context.font = font;

      const columnWidths = TABLE_HEADERS.map((header, i) => {
        return (
          Math.max(
            context.measureText(header).width,
            ...rows.map((row: Array<string | number>) => context.measureText(`${row[i]}`).width),
          ) +
          cellPadding * 2
        );
      });

      const tableWidth = columnWidths.reduce((a, b) => a + b, 0);
      const tableHeight = tableData.length * cellHeight;

      canvas.width = tableWidth;
      canvas.height = tableHeight;

      context.fillStyle = "white";
      context.fillRect(0, 0, tableWidth, tableHeight);
      context.strokeStyle = "black";
      context.lineWidth = 1;
      context.font = font;

      tableData.forEach((row, rowIndex) => {
        row.forEach((cell: number | string, colIndex: number) => {
          const x = columnWidths.slice(0, colIndex).reduce((a, b) => a + b, 0);
          const y = rowIndex * cellHeight;

          context.strokeRect(x, y, columnWidths[colIndex], cellHeight);

          context.fillStyle = "black";
          context.fillText(`${cell}`, x + cellPadding, y + cellHeight / 2 + fontSize / 2 - 2);
        });
      });

      canvas.toBlob(blob => {
        try {
          createDownloadLink(
            blob,
            "image/png",
            `Cross-chain activity - ${selectedTimeRange.label}.png`,
          );
        } catch (error) {
          console.log("Error creating blob", error);
        }
      }, "image/png");
    }
  };

  const fullscreenBtnRef = useRef(null);

  return (
    <Fullscreenable className="cross-chain" buttonRef={fullscreenBtnRef}>
      <div className="cross-chain-top">
        <div className="cross-chain-top-title">
          <GlobeIcon width={24} />
          {t("home.crossChain.title")}
          <div className="cross-chain-top-fullscreen" ref={fullscreenBtnRef}>
            <FullscreenIcon width={20} />
          </div>
          {isHomePage && (
            <NavLink className="token-activity-title-link" to="/analytics/chains">
              View More
            </NavLink>
          )}
        </div>

        <Select
          ariaLabel="Select Download Format"
          className="cross-chain-top-download"
          items={DOWNLOADABLE_LIST}
          name="downloadAs"
          onValueChange={({ value }) => handleDownloadAs(value)}
          placeholder="Download"
          value={{ label: "Download", value: "" }}
        />
      </div>

      <div className="cross-chain-options">
        {currentNetwork === "Mainnet" ? (
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

            <Select
              ariaLabel="Select Download Format"
              className="cross-chain-filters-group-download"
              items={DOWNLOADABLE_LIST}
              name="downloadAs"
              onValueChange={({ value }) => handleDownloadAs(value)}
              placeholder="Download"
              value={{ label: "Download", value: "" }}
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
    </Fullscreenable>
  );
};

const createDownloadLink = (content: BlobPart, type: string, filename: string) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export default CrossChainChart;
