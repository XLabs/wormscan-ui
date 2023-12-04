import { Fragment, useEffect, useState } from "react";
import { useQuery } from "react-query";
import { useTranslation } from "react-i18next";
import { TokenIconKeys, Top7AssetsData } from "src/types";
import { BREAKPOINTS } from "src/consts";
import { Loader, Select } from "src/components/atoms";
import { TopAssetListItem, ErrorPlaceholder, TopAssetsChart } from "src/components/molecules";
import { useWindowSize } from "src/utils/hooks/useWindowSize";
import { getClient } from "src/api/Client";
import "./styles.scss";

const RANGE_LIST: { label: string; value: "7d" | "15d" | "30d" }[] = [
  { label: "Last 7 days", value: "7d" },
  { label: "Last 15 days", value: "15d" },
  { label: "Last 30 days", value: "30d" },
];

const TopAssets = () => {
  const { t } = useTranslation();
  const [selectedTopAssetTimeRange, setSelectedTopAssetTimeRange] = useState(RANGE_LIST[0]);
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
                          {
                            symbol,
                            volume,
                            txs,
                          }: { symbol: string; volume: string; txs: number | string },
                          itemIndex,
                        ) => (
                          <Fragment key={itemIndex}>
                            <TopAssetListItem
                              itemIndex={itemIndex}
                              rowSelected={rowSelected}
                              showThisGraph={() => {
                                if (rowSelected === itemIndex && width < BREAKPOINTS.desktop) {
                                  return setRowSelected(hiddenRow);
                                }

                                return setRowSelected(itemIndex);
                              }}
                              symbol={symbol as TokenIconKeys}
                              txs={txs}
                              volume={volume}
                            />
                            <TopAssetsChart
                              itemIndex={itemIndex}
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

const top7AssetsData = [
  {
    symbol: "USDC",
    volume: "308037973.82222277",
    txs: "9483711",
    tokenChain: 2,
    tokenAddress: "000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    tokens: [
      {
        emitterChainId: 2,
        tokenChainId: 2,
        tokenAddress: "000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        volume: "108037973.82222277",
        txs: 1000,
      },
      {
        emitterChainId: 21,
        tokenChainId: 8,
        tokenAddress: "000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        volume: "54270278.89339858",
        txs: 800,
      },
      {
        emitterChainId: 1,
        tokenChainId: 5,
        tokenAddress: "000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        volume: "45876561.84487975",
        txs: 700,
      },
      {
        emitterChainId: 3,
        tokenChainId: 8,
        tokenAddress: "000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        volume: "38567415.82960269",
        txs: 600,
      },
      {
        emitterChainId: 4,
        tokenChainId: 5,
        tokenAddress: "000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        volume: "34998792.42202905",
        txs: 500,
      },
      {
        emitterChainId: 3,
        tokenChainId: 8,
        tokenAddress: "000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        volume: "19893888.26079301",
        txs: 270,
      },
      {
        emitterChainId: 9,
        tokenChainId: 8,
        tokenAddress: "000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        volume: "14490508.32184930",
        txs: 100,
      },
    ],
  },
  {
    symbol: "BNB",
    volume: "121234177.12222277",
    txs: "41723",
    tokenChain: 2,
    tokenAddress: "418D75f65a02b3D53B2418FB8E1fe493759c7605",
    tokens: [
      {
        emitterChainId: 9,
        tokenChainId: 5,
        tokenAddress: "000000000000000000000000dac17f958d2ee523a2206206994597c13d831ec7",
        volume: "9.00",
        txs: 1000,
      },
      {
        emitterChainId: 4,
        tokenChainId: 8,
        tokenAddress: "000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        volume: "8.00",
        txs: 500,
      },
      {
        emitterChainId: 2,
        tokenChainId: 5,
        tokenAddress: "000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        volume: "7.00",
        txs: 400,
      },
      {
        emitterChainId: 17,
        tokenChainId: 8,
        tokenAddress: "000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        volume: "6.20",
        txs: 100,
      },
      {
        emitterChainId: 18,
        tokenChainId: 5,
        tokenAddress: "000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        volume: "5.00",
        txs: 5000,
      },
      {
        emitterChainId: 14,
        tokenChainId: 8,
        tokenAddress: "000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        volume: "4.00",
        txs: 2700,
      },
      {
        emitterChainId: 15,
        tokenChainId: 8,
        tokenAddress: "000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        volume: "1.00",
        txs: 300,
      },
    ],
  },
  {
    symbol: "USDT",
    volume: "121134123.20",
    txs: "1829612",
    tokenChain: 2,
    tokenAddress: "000000000000000000000000dac17f958d2ee523a2206206994597c13d831ec7",
    tokens: [
      {
        emitterChainId: 22,
        tokenChainId: 5,
        tokenAddress: "000000000000000000000000dac17f958d2ee523a2206206994597c13d831ec7",
        volume: "1000.00",
        txs: 1000,
      },
      {
        emitterChainId: 23,
        tokenChainId: 8,
        tokenAddress: "000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        volume: "500.00",
        txs: 500,
      },
      {
        emitterChainId: 12,
        tokenChainId: 5,
        tokenAddress: "000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        volume: "400.00",
        txs: 400,
      },
      {
        emitterChainId: 13,
        tokenChainId: 8,
        tokenAddress: "000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        volume: "100.20",
        txs: 100,
      },
      {
        emitterChainId: 12,
        tokenChainId: 5,
        tokenAddress: "000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        volume: "50.00",
        txs: 1,
      },
      {
        emitterChainId: 23,
        tokenChainId: 8,
        tokenAddress: "000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        volume: "44.00",
        txs: 270,
      },
      {
        emitterChainId: 26,
        tokenChainId: 8,
        tokenAddress: "000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        volume: "33.00",
        txs: 300,
      },
    ],
  },
  {
    symbol: "SOL",
    volume: "99123516.20",
    txs: "917681",
    tokenChain: 2,
    tokenAddress: "f8c3527cc04340b208c854e985240c02f7b7793f",
    tokens: [
      {
        emitterChainId: 2,
        tokenChainId: 5,
        tokenAddress: "000000000000000000000000dac17f958d2ee523a2206206994597c13d831ec7",
        volume: "99999.00",
        txs: 99999,
      },
      {
        emitterChainId: 13,
        tokenChainId: 8,
        tokenAddress: "000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        volume: "77777.00",
        txs: 77777,
      },
      {
        emitterChainId: 25,
        tokenChainId: 5,
        tokenAddress: "000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        volume: "66666.00",
        txs: 66666,
      },
      {
        emitterChainId: 24,
        tokenChainId: 8,
        tokenAddress: "000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        volume: "55555.20",
        txs: 55555,
      },
      {
        emitterChainId: 23,
        tokenChainId: 5,
        tokenAddress: "000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        volume: "12312.00",
        txs: 12312,
      },
      {
        emitterChainId: 22,
        tokenChainId: 8,
        tokenAddress: "000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        volume: "5342.00",
        txs: 521,
      },
      {
        emitterChainId: 19,
        tokenChainId: 8,
        tokenAddress: "000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        volume: "1235.00",
        txs: 12,
      },
    ],
  },
  {
    symbol: "WETH",
    volume: "91783165.20",
    txs: "786917",
    tokenChain: 2,
    tokenAddress: "000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    tokens: [
      {
        emitterChainId: 1,
        tokenChainId: 5,
        tokenAddress: "000000000000000000000000dac17f958d2ee523a2206206994597c13d831ec7",
        volume: "3333333.00",
        txs: 1000,
      },
      {
        emitterChainId: 1,
        tokenChainId: 8,
        tokenAddress: "000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        volume: "2222222.00",
        txs: 500,
      },
      {
        emitterChainId: 2,
        tokenChainId: 5,
        tokenAddress: "000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        volume: "1111111.00",
        txs: 400,
      },
      {
        emitterChainId: 3,
        tokenChainId: 8,
        tokenAddress: "000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        volume: "999999.20",
        txs: 100,
      },
      {
        emitterChainId: 4,
        tokenChainId: 5,
        tokenAddress: "000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        volume: "888888.00",
        txs: 5000,
      },
      {
        emitterChainId: 3,
        tokenChainId: 8,
        tokenAddress: "000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        volume: "777777.00",
        txs: 2700,
      },
      {
        emitterChainId: 22,
        tokenChainId: 8,
        tokenAddress: "000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        volume: "666666.00",
        txs: 300,
      },
    ],
  },
  {
    symbol: "TBTC",
    volume: "76345265.20",
    txs: "456172",
    tokenChain: 30,
    tokenAddress: "236aa50979D5f3De3Bd1Eeb40E81137F22ab794b",
    tokens: [
      {
        emitterChainId: 9,
        tokenChainId: 5,
        tokenAddress: "000000000000000000000000dac17f958d2ee523a2206206994597c13d831ec7",
        volume: "567467.00",
        txs: 1000,
      },
      {
        emitterChainId: 3,
        tokenChainId: 8,
        tokenAddress: "000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        volume: "524123.00",
        txs: 500,
      },
      {
        emitterChainId: 13,
        tokenChainId: 5,
        tokenAddress: "000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        volume: "456789.00",
        txs: 400,
      },
      {
        emitterChainId: 14,
        tokenChainId: 8,
        tokenAddress: "000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        volume: "345631.20",
        txs: 100,
      },
      {
        emitterChainId: 16,
        tokenChainId: 5,
        tokenAddress: "000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        volume: "312312.00",
        txs: 5000,
      },
      {
        emitterChainId: 27,
        tokenChainId: 8,
        tokenAddress: "000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        volume: "267845.00",
        txs: 2700,
      },
      {
        emitterChainId: 28,
        tokenChainId: 8,
        tokenAddress: "000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        volume: "12341.00",
        txs: 300,
      },
    ],
  },
  {
    symbol: "AVAX",
    volume: "15678367.20",
    txs: "265789",
    tokenChain: 7,
    tokenAddress: "32847e63E99D3a044908763056e25694490082F8",
    tokens: [
      {
        emitterChainId: 12,
        tokenChainId: 5,
        tokenAddress: "000000000000000000000000dac17f958d2ee523a2206206994597c13d831ec7",
        volume: "99946.00",
        txs: 1000,
      },
      {
        emitterChainId: 13,
        tokenChainId: 8,
        tokenAddress: "000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        volume: "88464.00",
        txs: 500,
      },
      {
        emitterChainId: 12,
        tokenChainId: 5,
        tokenAddress: "000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        volume: "75487.00",
        txs: 400,
      },
      {
        emitterChainId: 13,
        tokenChainId: 8,
        tokenAddress: "000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        volume: "53123.20",
        txs: 100,
      },
      {
        emitterChainId: 12,
        tokenChainId: 5,
        tokenAddress: "000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        volume: "32131.00",
        txs: 5000,
      },
      {
        emitterChainId: 22,
        tokenChainId: 8,
        tokenAddress: "000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        volume: "21412.00",
        txs: 2700,
      },
      {
        emitterChainId: 21,
        tokenChainId: 8,
        tokenAddress: "000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        volume: "1231.00",
        txs: 300,
      },
    ],
  },
] as Top7AssetsData;
