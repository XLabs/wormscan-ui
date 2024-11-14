import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "react-query";
import analytics from "src/analytics";
import { getClient } from "src/api/Client";
import { BaseLayout } from "src/layouts/BaseLayout";
import { useEnvironment } from "src/context/EnvironmentContext";
import { NTT_APP_ID, NTT_URL } from "src/consts";
import { NavLink, ProtocolIcon } from "src/components/atoms";
import { formatNumber } from "src/utils/number";
import { Stats } from "./Stats";
import { TokensTradedList } from "./TokensTradedList";
import "./styles.scss";

const NTT = () => {
  useEffect(() => {
    analytics.page({ title: `ANALYTICS-NTT` });
  }, []);

  const { environment } = useEnvironment();
  const currentNetwork = environment.network;
  const isMainnet = currentNetwork === "Mainnet";
  const { symbol, coingecko_id } = useParams();

  const {
    data: dataStats,
    isLoading: isLoadingStats,
    isError: isErrorStats,
  } = useQuery(["stats", isMainnet], () =>
    getClient()
      .guardianNetwork.getProtocolsStats()
      .then(stats => {
        const statsFiltered = stats.filter(
          item => item.protocol === "native_token_transfer" || item.protocol === NTT_APP_ID,
        );

        return statsFiltered[0];
      }),
  );

  const [tokensList, setTokensList] = useState([]);
  const { isFetching: isFetchingTokensList, isError: isErrorTokensList } = useQuery(
    ["tokenList", isMainnet],
    async () => {
      const dataTokensList = await getClient().nttApi.getNttTokenList();
      return dataTokensList;
    },
    {
      onSuccess: dataTokensList => {
        if (dataTokensList?.length > 0) {
          const transformedData = dataTokensList
            .filter(item => {
              return (
                item.circulating_supply !== "0" &&
                item.market_cap !== "0" &&
                item.coingecko_id !== "usd-coin"
              );
            })
            .map(item => ({
              coingecko_id: item.coingecko_id,
              symbol: item.symbol,
              priceNumber: +item.price,
              priceVariationNumber: +item.price_change_percentage_24h,
              circulatingSupplyNumber: +item.circulating_supply,
              marketCapNumber: +item.market_cap,
              volumeNumber: +item.volume_24h,
              token: (
                <div className="ntt-page-tokens-list-table-item token">
                  <img
                    src={item?.image?.small}
                    alt={`${item.symbol} icon`}
                    height="24"
                    width="24"
                    className="top-asset-list-row-item-to-icon"
                    loading="lazy"
                  />
                  {item.symbol}
                </div>
              ),
              price: (
                <div className="ntt-page-tokens-list-table-item">
                  ${formatNumber(+(+item.price).toFixed(4))}
                </div>
              ),
              priceVariation: (
                <div className="ntt-page-tokens-list-table-item">
                  <h4>24H PRICE VARIATION%</h4>
                  <div
                    className={`price-variation ${
                      item.price_change_percentage_24h
                        ? +item.price_change_percentage_24h > 0
                          ? "positive"
                          : "negative"
                        : ""
                    }`}
                  >
                    {+item.price_change_percentage_24h > 0 && "+"}
                    {(+item.price_change_percentage_24h).toFixed(4)}
                  </div>
                </div>
              ),
              circulatingSupply: (
                <div className="ntt-page-tokens-list-table-item">
                  <h4>CIRCULATING SUPPLY</h4>${formatNumber(+item.circulating_supply, 0)}
                </div>
              ),
              marketCap: (
                <div className="ntt-page-tokens-list-table-item">
                  <h4>MARKET CAP</h4>${formatNumber(+item.market_cap, 0)}
                </div>
              ),
              volume: (
                <div className="ntt-page-tokens-list-table-item volume">
                  <h4>24H VOLUME</h4>${formatNumber(+item.volume_24h, 0)}
                </div>
              ),
              viewDetails: (
                <div className="ntt-page-tokens-list-table-item view-details">
                  <NavLink to={`/analytics/ntt/${item.coingecko_id}/${item.symbol}`}>
                    View details
                  </NavLink>
                </div>
              ),
            }));
          setTokensList(transformedData);
        }
      },
      enabled: !coingecko_id && !symbol,
    },
  );

  return (
    <BaseLayout>
      <div className="ntt-page">
        <h1 className="ntt-page-title">
          <ProtocolIcon protocol={NTT_APP_ID} width={24} /> NTT
        </h1>
        <p className="ntt-page-description">
          Native Token Transfers (NTT) is an open framework that enables the seamless creation and
          transfer of multichain tokens, while maintaining ownership and contract upgradability
          across blockchains.{" "}
          <a
            className="governor-header-description-link"
            href={NTT_URL}
            target="_blank"
            rel="noreferrer"
          >
            Learn more
          </a>
        </p>

        <Stats data={dataStats} isLoading={isLoadingStats} isError={isErrorStats} />

        <TokensTradedList
          data={tokensList}
          isLoading={isFetchingTokensList}
          isError={isErrorTokensList}
        />
      </div>
    </BaseLayout>
  );
};

export default NTT;
