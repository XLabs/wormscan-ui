import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { TopAssetListItem, TopChainListItem } from "src/components/molecules";
import { TopList } from "src/components/organisms";
import client from "src/api/Client";
import "./styles.scss";
import { useQuery } from "react-query";
import { Loader } from "src/components/atoms";

const RANGE_LIST: { label: string; value: "7d" | "15d" | "30d" }[] = [
  { label: "7 days", value: "7d" },
  { label: "15 days", value: "15d" },
  { label: "30 days", value: "30d" },
];

const TopLists = () => {
  const { t } = useTranslation();
  const [selectedTopChainTimeRange, setSelectedTopChainTimeRange] = useState(RANGE_LIST[0]);
  const [selectedTopAssetTimeRange, setSelectedTopAssetTimeRange] = useState(RANGE_LIST[0]);

  const {
    isFetching: isFetchingTokens,
    isLoading: isLoadingTokens,
    error: errorTokens,
    data: dataTokens,
  } = useQuery(
    "womrholeMarketTokens",
    async () => {
      const response = await window.fetch(process.env.WORMHOLE_MARKET_TOKENS_URL);
      return await response.json();
    },
    {
      staleTime: Infinity,
      retry: false,
    },
  );

  const {
    isFetching: isFetchingChainPairs,
    error: errorChainPairs,
    data: dataChainPairs,
  } = useQuery(
    ["chainPairsByTransfers", selectedTopChainTimeRange.value],
    () =>
      client.guardianNetwork.getChainPairsByTransfers({
        timeSpan: selectedTopChainTimeRange.value,
      }),
    {
      refetchOnWindowFocus: false,
    },
  );

  const {
    isFetching: isFetchingAssets,
    error: errorAssets,
    data: dataAssets,
  } = useQuery(
    ["assetsByVolume", selectedTopAssetTimeRange.value],
    () => client.guardianNetwork.getAssetsByVolume({ timeSpan: selectedTopAssetTimeRange.value }),
    {
      refetchOnWindowFocus: false,
    },
  );

  return (
    <section className="home-top-lists">
      <TopList
        title={t("home.topLists.chains.title")}
        subtitle={t("home.topLists.chains.subtitle")}
        filterOptions={{
          name: "topChainTimeRange",
          items: RANGE_LIST,
          ariaLabel: "Select Time Range",
          className: "home-top-lists-select",
        }}
        value={selectedTopChainTimeRange}
        onValueChange={setSelectedTopChainTimeRange}
      >
        {isFetchingChainPairs ? (
          <>
            <div className="home-top-lists-loader">
              <Loader />
            </div>
          </>
        ) : (
          dataChainPairs?.length > 0 &&
          dataChainPairs.map(({ emitterChain, destinationChain, numberOfTransfers }) => {
            return (
              <TopChainListItem
                key={`${emitterChain}-${destinationChain}`}
                from_chain={emitterChain}
                to_chain={destinationChain}
                transactions={numberOfTransfers}
              />
            );
          })
        )}
      </TopList>

      <TopList
        title={t("home.topLists.assets.title")}
        subtitle={t("home.topLists.assets.subtitle")}
        filterOptions={{
          name: "topAssetTimeRange",
          items: RANGE_LIST,
          ariaLabel: "Select Time Range",
          className: "home-top-lists-select",
        }}
        value={selectedTopAssetTimeRange}
        onValueChange={setSelectedTopAssetTimeRange}
      >
        {isFetchingAssets ? (
          <>
            <div className="home-top-lists-loader">
              <Loader />
            </div>
          </>
        ) : (
          dataAssets?.length > 0 &&
          dataAssets.map(({ emitterChain, symbol, tokenChain, tokenAddress, volume }) => {
            let tokenLogoURL: string = "";

            if (dataTokens?.tokens) {
              // remove leading zeros from token address
              const tokenAddressParsed: string = "0x" + tokenAddress.replace(/^0+/, "");
              tokenLogoURL = dataTokens.tokens[tokenChain][tokenAddressParsed]?.logo;
            }

            return (
              <TopAssetListItem
                key={`${emitterChain}-${symbol}`}
                from_chain={emitterChain}
                token_logo={tokenLogoURL}
                symbol={symbol}
                volume={volume}
              />
            );
          })
        )}
      </TopList>
    </section>
  );
};

export { TopLists };
