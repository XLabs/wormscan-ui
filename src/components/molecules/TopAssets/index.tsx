import { Fragment, useEffect, useMemo, useState } from "react";
import { useQuery } from "react-query";
import { useTranslation } from "react-i18next";
import { useEnvironment } from "src/context/EnvironmentContext";
import { BREAKPOINTS } from "src/consts";
import { Loader, Select, ToggleGroup } from "src/components/atoms";
import { ErrorPlaceholder, TopAssetListItem, TopAssetsChart } from "src/components/molecules";
import { useWindowSize } from "src/utils/hooks";
import { getChainIcon, getChainName } from "src/utils/wormhole";
import { formatNumber } from "src/utils/number";
import { ChainId, chainToChainId } from "@wormhole-foundation/sdk";
import { getClient } from "src/api/Client";
import { Tokens } from "src/api/guardian-network/types";
import analytics from "src/analytics";
import { LayersIcon } from "src/icons/generic";
import "./styles.scss";

const METRIC_CHART_LIST = [
  { label: "Volume", value: "volume", ariaLabel: "Volume" },
  { label: "Transfers", value: "transfers", ariaLabel: "Transfers" },
];

const RANGE_LIST: { label: string; value: "7d" | "15d" | "30d" }[] = [
  { label: "Last 7 days", value: "7d" },
  { label: "Last 15 days", value: "15d" },
  { label: "Last 30 days", value: "30d" },
];

const HIDDEN_ROW = "";

const TopAssets = () => {
  const [metricSelected, setMetricSelected] = useState<"volume" | "transfers">("volume");
  const [selectedTopAssetTimeRange, setSelectedTopAssetTimeRange] = useState(RANGE_LIST[0]);
  const [rowSelected, setRowSelected] = useState<string>(HIDDEN_ROW);
  const { t } = useTranslation();
  const { width } = useWindowSize();
  const { environment } = useEnvironment();
  const currentNetwork = environment.network;
  const isMainnet = currentNetwork === "Mainnet";

  const { isLoading, isError, data } = useQuery(
    ["assetsByVolume", selectedTopAssetTimeRange.value],
    () => {
      setRowSelected(HIDDEN_ROW);
      return getClient().guardianNetwork.getAssetsByVolume({
        timeSpan: selectedTopAssetTimeRange.value,
      });
    },
    { refetchOnWindowFocus: false },
  );

  const top7AssetsData = useMemo(() => {
    if (!data) return [];

    return data
      .map(asset => {
        const groups: Record<number, Tokens> = {};

        asset.tokens.forEach(({ emitter_chain, volume, txs }) => {
          const volumeNumber = Number(volume);
          const txsNumber = Number(txs);

          if (!groups[emitter_chain]) {
            groups[emitter_chain] = {
              chainImageSrc: "",
              chainName: "",
              emitter_chain,
              txs: 0,
              txsFormatted: "",
              volume: 0,
              volumeFormatted: "",
            };
          }

          groups[emitter_chain].volume += volumeNumber;
          groups[emitter_chain].txs += txsNumber;
          groups[emitter_chain].volumeFormatted = formatNumber(
            groups[emitter_chain].volume,
            groups[emitter_chain].volume < 10 ? undefined : 0,
          );
          groups[emitter_chain].txsFormatted = formatNumber(groups[emitter_chain].txs, 0);
          groups[emitter_chain].chainName = getChainName({
            acronym: emitter_chain === chainToChainId("Bsc"),
            chainId: emitter_chain as ChainId,
            network: currentNetwork,
          });
          groups[emitter_chain].chainImageSrc = getChainIcon({
            colorless: true,
            chainId: emitter_chain as ChainId,
          });
        });

        const sortedTokens = Object.values(groups).sort((a, b) => {
          return metricSelected === "volume" ? b.volume - a.volume : b.txs - a.txs;
        });

        return { ...asset, tokens: sortedTokens };
      })
      .sort((a, b) => {
        return metricSelected === "volume"
          ? b.tokens.reduce((sum, token) => sum + token.volume, 0) -
              a.tokens.reduce((sum, token) => sum + token.volume, 0)
          : b.tokens.reduce((sum, token) => sum + token.txs, 0) -
              a.tokens.reduce((sum, token) => sum + token.txs, 0);
      });
  }, [data, metricSelected, currentNetwork]);

  useEffect(() => {
    if (!isMainnet) setMetricSelected("transfers");
  }, [isMainnet]);

  useEffect(() => {
    if (top7AssetsData[0]?.symbol && !rowSelected && width >= BREAKPOINTS.desktop) {
      setRowSelected(top7AssetsData[0].symbol);
    }
  }, [rowSelected, top7AssetsData, width]);

  return (
    <>
      <section>
        <div className="top-assets" data-testid="topAssetTimeRange">
          <div className="top-assets-header">
            <h3 className="top-assets-header-title">
              <LayersIcon width={24} />
              {t("home.topAssets.title")}{" "}
              {metricSelected.charAt(0).toUpperCase() + metricSelected.slice(1)}
            </h3>

            <div className="top-assets-header-select-container">
              <ToggleGroup
                ariaLabel="Select metric type (volume or transfers)"
                className="token-activity-container-top-toggle"
                items={isMainnet ? METRIC_CHART_LIST : [METRIC_CHART_LIST[1]]}
                onValueChange={value => setMetricSelected(value)}
                value={metricSelected}
              />

              <Select
                ariaLabel="Select Time Range"
                className="top-assets-header-select"
                items={RANGE_LIST}
                name="topAssetTimeRange"
                onValueChange={(value: any) => setSelectedTopAssetTimeRange(value)}
                value={selectedTopAssetTimeRange}
              />
            </div>
          </div>

          <div className="top-assets-subtitle">Tap an asset and analyze the breakdown.</div>

          <div className="top-assets-body">
            {isLoading ? (
              <Loader />
            ) : isError ? (
              <ErrorPlaceholder />
            ) : (
              <>
                <table className="top-assets-body-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>{t("home.topAssets.token")}</th>
                      {isMainnet && <th>{t("home.topAssets.volume")}</th>}
                      <th>{t("home.topAssets.txs")}</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {top7AssetsData?.length > 0 &&
                      top7AssetsData.map(
                        (
                          { symbol, volume, txs }: { symbol: string; volume: string; txs: string },
                          rowIndex,
                        ) => (
                          <Fragment key={symbol}>
                            <TopAssetListItem
                              itemIndex={rowIndex}
                              onClick={() => {
                                analytics.track("topSevenAsset", {
                                  network: currentNetwork,
                                  selectedTimeRange: selectedTopAssetTimeRange.value,
                                  selected: symbol,
                                });

                                if (width < BREAKPOINTS.desktop && rowSelected === symbol) {
                                  return setRowSelected(HIDDEN_ROW);
                                }

                                return setRowSelected(symbol);
                              }}
                              rowSelected={rowSelected}
                              symbol={symbol}
                              txs={txs}
                              volume={volume}
                            />
                            {width < BREAKPOINTS.desktop && rowSelected === symbol && (
                              <tr>
                                <td colSpan={5}>
                                  <TopAssetsChart
                                    metricSelected={metricSelected}
                                    rowSelected={rowSelected}
                                    top7AssetsData={top7AssetsData}
                                    width={width}
                                  />
                                </td>
                              </tr>
                            )}
                          </Fragment>
                        ),
                      )}
                  </tbody>
                </table>

                {width >= BREAKPOINTS.desktop && rowSelected && (
                  <TopAssetsChart
                    metricSelected={metricSelected}
                    rowSelected={rowSelected}
                    top7AssetsData={top7AssetsData}
                    width={width}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default TopAssets;
