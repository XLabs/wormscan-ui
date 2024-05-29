import { Fragment, useEffect, useState } from "react";
import { useQuery } from "react-query";
import { useTranslation } from "react-i18next";
import { useEnvironment } from "src/context/EnvironmentContext";
import { BREAKPOINTS } from "src/consts";
import { Loader, Select } from "src/components/atoms";
import { ErrorPlaceholder, TopAssetListItem, TopAssetsChart } from "src/components/molecules";
import { useWindowSize } from "src/utils/hooks/useWindowSize";
import { getChainIcon, getChainName } from "src/utils/wormhole";
import { formatNumber } from "src/utils/number";
import { ChainId } from "src/api";
import { getClient } from "src/api/Client";
import { AssetsByVolumeOutput, Tokens } from "src/api/guardian-network/types";
import analytics from "src/analytics";
import "./styles.scss";
import { LayersIcon } from "src/icons/generic";

const RANGE_LIST: { label: string; value: "7d" | "15d" | "30d" }[] = [
  { label: "Last 7 days", value: "7d" },
  { label: "Last 15 days", value: "15d" },
  { label: "Last 30 days", value: "30d" },
];

const HIDDEN_ROW = -1;

const TopAssets = () => {
  const [selectedTopAssetTimeRange, setSelectedTopAssetTimeRange] = useState(RANGE_LIST[0]);
  const [top7AssetsData, setTop7AssetsData] = useState([]);
  const [rowSelected, setRowSelected] = useState<number>(0);
  const { t } = useTranslation();
  const { width } = useWindowSize();
  const { environment } = useEnvironment();
  const currentNetwork = environment.network;

  const { isLoading, isFetching, isError, data } = useQuery(
    ["assetsByVolume", selectedTopAssetTimeRange.value],
    () =>
      getClient().guardianNetwork.getAssetsByVolume({ timeSpan: selectedTopAssetTimeRange.value }),
    {
      refetchOnWindowFocus: false,
    },
  );

  useEffect(() => {
    if (width >= BREAKPOINTS.desktop && rowSelected === HIDDEN_ROW) {
      setRowSelected(0);
    }
  }, [width, rowSelected]);

  useEffect(() => {
    const processApiAssetsData = async (data: AssetsByVolumeOutput[]) => {
      const dataAssetsTransformed = data.map(asset => {
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
            acronym: emitter_chain === ChainId.BSC,
            chainId: emitter_chain,
            network: currentNetwork,
          });
          groups[emitter_chain].chainImageSrc = getChainIcon({
            colorless: true,
            chainId: emitter_chain,
          });
        });

        const sortedTokens = Object.values(groups).sort((a, b) => b.volume - a.volume);

        return {
          ...asset,
          tokens: sortedTokens,
        };
      });

      setTop7AssetsData(dataAssetsTransformed);
    };

    if (data && data?.length > 0) {
      processApiAssetsData(data);
    }
  }, [currentNetwork, data]);

  return (
    <>
      <section>
        <div className="top-assets" data-testid="topAssetTimeRange">
          <div className="top-assets-header">
            <h3 className="top-assets-header-title">
              <LayersIcon width={24} />
              {t("home.topAssets.title")}
            </h3>

            <div className="top-assets-header-select-container">
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

          <div className="top-assets-body">
            {isLoading || isFetching ? (
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
                      <th>{t("home.topAssets.volume")}</th>
                      <th>{t("home.topAssets.txs")}</th>
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
                              rowSelected={rowSelected}
                              showThisGraph={() => {
                                analytics.track("topSevenAsset", {
                                  network: currentNetwork,
                                  selectedTimeRange: selectedTopAssetTimeRange.value,
                                  selected: symbol,
                                });

                                if (width < BREAKPOINTS.desktop && rowSelected === rowIndex) {
                                  return setRowSelected(HIDDEN_ROW);
                                }

                                return setRowSelected(rowIndex);
                              }}
                              symbol={symbol}
                              txs={txs}
                              volume={volume}
                            />
                            {width < BREAKPOINTS.desktop && rowSelected === rowIndex && (
                              <tr>
                                <td colSpan={5}>
                                  <TopAssetsChart
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

                {width >= BREAKPOINTS.desktop && (
                  <TopAssetsChart
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

export { TopAssets };
