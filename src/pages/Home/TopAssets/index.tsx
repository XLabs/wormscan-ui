import { Fragment, useCallback, useEffect, useState } from "react";
import { useQuery } from "react-query";
import { useTranslation } from "react-i18next";
import { BREAKPOINTS } from "src/consts";
import { Loader, Select } from "src/components/atoms";
import { TopAssetListItem, ErrorPlaceholder, TopAssetsChart } from "src/components/molecules";
import { useWindowSize } from "src/utils/hooks/useWindowSize";
import { getClient } from "src/api/Client";
import { AssetsByVolumeOutput, TokenIconKeys } from "src/api/guardian-network/types";
import "./styles.scss";

const RANGE_LIST: { label: string; value: "7d" | "15d" | "30d" }[] = [
  { label: "Last 7 days", value: "7d" },
  { label: "Last 15 days", value: "15d" },
  { label: "Last 30 days", value: "30d" },
];

const TopAssets = () => {
  const { t } = useTranslation();
  const [selectedTopAssetTimeRange, setSelectedTopAssetTimeRange] = useState(RANGE_LIST[0]);
  const [top7AssetsData, setTop7AssetsData] = useState([]);
  const [rowSelected, setRowSelected] = useState<number>(0);
  const { width } = useWindowSize();
  const hiddenRow = -1;

  useEffect(() => {
    if (width >= BREAKPOINTS.desktop && rowSelected === hiddenRow) {
      setRowSelected(0);
    }
  }, [width, rowSelected, hiddenRow]);

  const {
    isLoading: isLoadingAssets,
    isFetching: isFetchingAssets,
    isError: isErrorAssets,
    data: dataAssets,
  } = useQuery(
    ["assetsByVolume", selectedTopAssetTimeRange.value],
    () =>
      getClient().guardianNetwork.getAssetsByVolume({ timeSpan: selectedTopAssetTimeRange.value }),
    {
      refetchOnWindowFocus: false,
    },
  );

  const processApiAssetsData = useCallback(async (dataAssets: AssetsByVolumeOutput[]) => {
    const AssetsDataUnificado = dataAssets.map(asset => {
      const groups: { [key: number]: { emitter_chain: number; volume: string; txs: string } } = {};

      asset.tokens.forEach(token => {
        if (groups[token.emitter_chain]) {
          groups[token.emitter_chain].volume = (
            parseFloat(groups[token.emitter_chain].volume) + parseFloat(token.volume)
          ).toString();
          groups[token.emitter_chain].txs = (
            parseInt(groups[token.emitter_chain].txs) + parseInt(token.txs)
          ).toString();
        } else {
          groups[token.emitter_chain] = {
            emitter_chain: token.emitter_chain,
            volume: token.volume,
            txs: token.txs,
          };
        }
      });

      const sortedTokens = Object.values(groups).sort(
        (a, b) => parseFloat(b.volume) - parseFloat(a.volume),
      );

      return {
        ...asset,
        tokens: sortedTokens,
      };
    });

    setTop7AssetsData(AssetsDataUnificado);
  }, []);

  useEffect(() => {
    if (dataAssets && dataAssets.length > 0) {
      processApiAssetsData(dataAssets);
    }
  }, [dataAssets, processApiAssetsData]);

  return (
    <section>
      <div className="top-assets" data-testid="topAssetTimeRange">
        <div className="top-assets-header">
          <h3 className="top-assets-header-title">{t("home.topAssets.title")}</h3>

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

          <h4 className="top-assets-header-subtitle">{t("home.topAssets.subtitle")}</h4>
        </div>

        <div className="top-assets-body-container">
          <div className="top-assets-body">
            {isLoadingAssets || isFetchingAssets ? (
              <Loader />
            ) : (
              <>
                <table className="top-assets-body-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>TOKEN</th>
                      <th>VOLUME USD</th>
                      <th>TXS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isErrorAssets ? (
                      <ErrorPlaceholder />
                    ) : (
                      top7AssetsData?.length > 0 &&
                      top7AssetsData.map(
                        (
                          { symbol, volume, txs }: { symbol: string; volume: string; txs: string },
                          rowIndex,
                        ) => (
                          <Fragment key={rowIndex}>
                            <TopAssetListItem
                              itemIndex={rowIndex}
                              rowSelected={rowSelected}
                              showThisGraph={() => {
                                if (rowSelected === rowIndex && width < BREAKPOINTS.desktop) {
                                  return setRowSelected(hiddenRow);
                                }

                                return setRowSelected(rowIndex);
                              }}
                              symbol={symbol as TokenIconKeys}
                              txs={txs}
                              volume={volume}
                            />
                            <TopAssetsChart
                              rowIndex={rowIndex}
                              rowSelected={rowSelected}
                              top7AssetsData={top7AssetsData}
                            />
                          </Fragment>
                        ),
                      )
                    )}
                  </tbody>
                </table>
              </>
            )}
          </div>
        </div>

        <p className="top-assets-bottom-text">Chart shows top 7 chains</p>
      </div>
    </section>
  );
};

export { TopAssets };
