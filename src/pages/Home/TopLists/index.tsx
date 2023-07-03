import { useState } from "react";
import { useTranslation } from "react-i18next";
import { TopAssetListItem, TopChainListItem, ErrorPlaceholder } from "src/components/molecules";
import { TopList } from "src/components/organisms";
import { getClient } from "src/api/Client";
import { useQuery } from "react-query";
import { Loader } from "src/components/atoms";
import { removeLeadingZeros } from "src/utils/string";
import { ChainId, isEVMChain } from "@certusone/wormhole-sdk";
import "./styles.scss";

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
    isError: isErrorTokens,
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
    isLoading: isLoadingChainPairs,
    isFetching: isFetchingChainPairs,
    isError: isErrorChainPairs,
    data: dataChainPairs,
  } = useQuery(
    ["chainPairsByTransfers", selectedTopChainTimeRange.value],
    () =>
      getClient().guardianNetwork.getChainPairsByTransfers({
        timeSpan: selectedTopChainTimeRange.value,
      }),
    {
      refetchOnWindowFocus: false,
    },
  );

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
        {isLoadingChainPairs || isFetchingChainPairs ? (
          <Loader />
        ) : (
          <>
            {isErrorChainPairs ? (
              <ErrorPlaceholder />
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
          </>
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
        {isLoadingAssets || isFetchingAssets ? (
          <Loader />
        ) : (
          <>
            {isErrorAssets ? (
              <ErrorPlaceholder />
            ) : (
              dataAssets?.length > 0 &&
              dataAssets.map(({ emitterChain, symbol, tokenChain, tokenAddress, volume }) => {
                let tokenLogoURL = "";

                if (dataTokens?.tokens) {
                  // remove leading zeros from token address
                  let tokenAddressParsed: string = removeLeadingZeros(tokenAddress);
                  tokenAddressParsed = isEVMChain(tokenChain as ChainId)
                    ? "0x" + tokenAddressParsed
                    : tokenAddressParsed;
                  tokenLogoURL = dataTokens?.tokens?.[tokenChain]?.[tokenAddressParsed]?.logo;
                }

                return (
                  <TopAssetListItem
                    key={`${emitterChain}-${tokenChain}-${symbol}`}
                    from_chain={emitterChain}
                    token_logo={tokenLogoURL}
                    symbol={symbol}
                    volume={volume}
                  />
                );
              })
            )}
          </>
        )}
      </TopList>
    </section>
  );
};

export { TopLists };
