import { useState, useMemo, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "react-query";
import { chainToChainId } from "@wormhole-foundation/sdk";
import { getClient } from "src/api/Client";
import { useEnvironment } from "src/context/EnvironmentContext";
import { BaseLayout } from "src/layouts/BaseLayout";
import { ToggleGroup } from "src/components/atoms";
import { GetOperationsOutput } from "src/api/guardian-network/types";
import { canWeGetDestinationTx, CCTP_MANUAL_APP_ID, IStatus, NTT_APP_ID } from "src/consts";
import { ChainLimit, Order } from "src/api";
import { ETH_LIMIT } from "src/pages/Txs";
import analytics from "src/analytics";
import { Summary } from "./Summary";
import { ByChain } from "./ByChain";
import { TopHolders } from "./TopHolders";
import { TopAddresses } from "./TopAddresses";
import { Metrics } from "./Metrics";
import { TransfersOverTime } from "./TransfersOverTime";
import { RecentTransactions } from "./RecentTransactions";
// import { CommunityBanner } from "./CommunityBanner";
import "./styles.scss";

export type TimeRange = {
  label: "Last 24 hours" | "Last week" | "Last month" | "Last year";
  value: "1d" | "1w" | "1m" | "1y";
};
export type ByType = "notional" | "tx";

const NTTToken = () => {
  const { environment } = useEnvironment();
  const currentNetwork = environment.network;
  const isMainnet = currentNetwork === "Mainnet";

  const { symbol, coingecko_id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeView, setActiveView] = useState(searchParams.get("view") || "general-info");

  const [timeRange, setTimeRange] = useState<TimeRange>({ label: "Last week", value: "1w" });
  const [by, setBy] = useState<ByType>("notional");

  const isUSDCe = coingecko_id === "wormhole-bridged-usdc-fantom";

  const { startDate, endDate } = useMemo(() => {
    const end = new Date();
    const start = new Date(end);
    switch (timeRange.value) {
      case "1d":
        start.setDate(end.getDate() - 1);
        break;
      case "1w":
        start.setDate(end.getDate() - 7);
        break;
      case "1m":
        start.setMonth(end.getMonth() - 1);
        break;
      case "1y":
        start.setFullYear(end.getFullYear() - 1);
        break;
    }
    return { startDate: start, endDate: end };
  }, [timeRange]);

  const { data: chainLimitsData, isLoading: isLoadingLimits } = useQuery(
    ["getLimit"],
    async () => {
      try {
        return await getClient().governor.getLimit();
      } catch {
        return null;
      }
    },
    {
      enabled: isMainnet,
    },
  );

  const {
    data: recentTransactions,
    isError: isErrorRecentTransactions,
    isFetching: isFetchingRecentTransactions,
  } = useQuery(
    ["getRecentTransactions", symbol],
    async () => {
      let page = 0;
      let transactions: GetOperationsOutput[] = [];

      while (transactions.length < 7) {
        const data = await getClient().guardianNetwork.getOperations({
          appId: NTT_APP_ID,
          pagination: {
            pageSize: 50,
            sortOrder: Order.DESC,
            page,
          },
        });

        const filteredTransactions = data.filter(
          tx =>
            tx.data?.symbol.toUpperCase() === symbol.toUpperCase() ||
            (isUSDCe &&
              tx.content?.standarizedProperties?.fromChain === chainToChainId("Ethereum") &&
              tx.content?.standarizedProperties?.toChain === chainToChainId("Fantom") &&
              tx.data?.symbol.toUpperCase() === "USDC"),
        );

        const transactionsWithStatus = filteredTransactions.map(tx => {
          const { emitterChain } = tx;
          const payload = tx?.content?.payload;
          const standarizedProperties = tx?.content?.standarizedProperties;

          const {
            appIds,
            fromChain: stdFromChain,
            toChain: stdToChain,
          } = standarizedProperties || {};

          const globalToChainId = tx.targetChain?.chainId;

          const parsedPayload = payload?.parsedPayload;
          const fromChainOrig = emitterChain || stdFromChain;

          const attributeType = tx.sourceChain?.attribute?.type;
          const attributeValue = tx.sourceChain?.attribute?.value;

          // --- Gateway Transfers
          const fromChain =
            attributeType === "wormchain-gateway" ? attributeValue?.originChainId : fromChainOrig;
          const toChain = parsedPayload?.["gateway_transfer"]?.chain
            ? parsedPayload?.["gateway_transfer"].chain
            : stdToChain || globalToChainId;
          // -----

          // --- Status Logic

          const limitDataForChain = chainLimitsData
            ? chainLimitsData.find((data: ChainLimit) => data.chainId === fromChain)
            : ETH_LIMIT;
          const transactionLimit = limitDataForChain?.maxTransactionSize;
          const isBigTransaction = transactionLimit <= Number(tx?.data?.usdAmount);
          const isDailyLimitExceeded =
            limitDataForChain?.availableNotional < Number(tx?.data?.usdAmount);

          const status: IStatus = tx?.targetChain?.transaction?.txHash
            ? "completed"
            : appIds && appIds.includes(CCTP_MANUAL_APP_ID)
            ? "external_tx"
            : tx.vaa?.raw
            ? canWeGetDestinationTx({
                appIds,
                network: currentNetwork,
                targetChain: toChain,
              })
              ? "pending_redeem"
              : "completed"
            : isBigTransaction || isDailyLimitExceeded
            ? "in_governors"
            : "in_progress";

          return {
            ...tx,
            status,
          };
        });

        transactions = [...transactions, ...transactionsWithStatus];
        if (page > 10) break;
        page++;
      }

      return transactions.slice(0, 7);
    },
    {
      enabled: !isLoadingLimits && isMainnet,
    },
  );

  const {
    data: transfersByTime,
    isError: isErrorTransfersByTime,
    isFetching: isFetchingTransfersByTime,
  } = useQuery(
    ["getTransferByTimeTx", startDate, endDate, by],
    async () => {
      const timeSpan: "1h" | "1d" | "1mo" =
        timeRange.value === "1d" ? "1h" : timeRange.value === "1y" ? "1mo" : "1d";
      return {
        data: await getClient().nttApi.getNttTransferByTime({
          by,
          symbol,
          from: startDate.toISOString(),
          timeSpan,
          to: endDate.toISOString(),
        }),
        timeSpan,
      };
    },
    { enabled: isMainnet, refetchOnWindowFocus: false },
  );

  const {
    data: summary,
    isError: isErrorSummary,
    isFetching: isFetchingSummary,
  } = useQuery(
    ["getSummary"],
    async () => {
      const data = await getClient().nttApi.getNttSummary({
        coingecko_id,
      });

      // TODO: when coingecko returns optimism, remove this
      if (data.symbol === "W") {
        if (!data.platforms["optimistic-ethereum"]) {
          data.platforms["optimistic-ethereum"] = "0xb0ffa8000886e57f86dd5264b9582b2ad87b2b91";
        }
      }

      return data;
    },
    {
      enabled: isMainnet,
    },
  );

  const {
    data: activityTx,
    isError: isErrorActivityTx,
    isFetching: isFetchingActivityTx,
  } = useQuery(
    "getActivityTx",
    async () => {
      const activity = await getClient().nttApi.getNttActivity({
        by: "tx",
        symbol,
      });
      activity?.sort((a, b) => (+a.value < +b.value ? 1 : -1));
      return activity;
    },
    {
      enabled: isMainnet,
    },
  );

  const {
    data: activityNotional,
    isError: isErrorActivityNotional,
    isFetching: isFetchingActivityNotional,
  } = useQuery(
    "getActivityNotional",
    async () => {
      const activity = await getClient().nttApi.getNttActivity({
        by: "notional",
        symbol,
      });
      activity?.sort((a, b) => (+a.value < +b.value ? 1 : -1));
      return activity;
    },
    {
      enabled: isMainnet,
    },
  );

  const {
    data: topHolders,
    isError: isErrorTopHolders,
    isFetching: isFetchingTopHolders,
  } = useQuery(
    "getTopHolders",
    async () => {
      const data = await getClient().nttApi.getNttTopHolder({
        coingecko_id,
      });
      return data;
    },
    {
      enabled: isMainnet,
    },
  );

  const {
    data: topAddressesNotional,
    isError: isErrorTopAddressesNotional,
    isFetching: isFetchingTopAddressesNotional,
  } = useQuery(
    ["getNttTopAddressNotional"],
    async () => {
      const data = await getClient().nttApi.getNttTopAddress({
        by: "notional",
        symbol,
      });
      data?.sort((a, b) => (+a.value < +b.value ? 1 : -1));
      return data;
    },
    {
      enabled: isMainnet,
    },
  );

  const {
    data: topAddressesTx,
    isError: isErrorTopAddressesTx,
    isFetching: isFetchingTopAddressesTx,
  } = useQuery(
    ["getNttTopAddressTx"],
    async () => {
      const data = await getClient().nttApi.getNttTopAddress({
        by: "tx",
        symbol,
      });
      data?.sort((a, b) => (+a.value < +b.value ? 1 : -1));
      return data;
    },
    {
      enabled: isMainnet,
    },
  );

  useEffect(() => {
    analytics.page({ title: `ANALYTICS-${symbol.toUpperCase()}-TOKEN-${activeView}` });
  }, [activeView, symbol]);

  useEffect(() => {
    setActiveView(searchParams.get("view") || "general-info");
  }, [searchParams]);

  return (
    <BaseLayout>
      <div className="ntt-token-page">
        <Summary
          summary={summary}
          isLoading={isFetchingSummary}
          isError={isErrorSummary}
          coingecko_id={coingecko_id}
        />

        <div className="tabs">
          <ToggleGroup
            ariaLabel="Select Token data view"
            className="tabs-toggle-group"
            items={[
              { label: "General Information", value: "general-info" },
              { label: "Transfers Over Time", value: "transfers-over-time" },
              { label: "Top Transfers", value: "top-transfers" },
              ...(!isUSDCe ? [{ label: "Top Holders", value: "top-holders" }] : []),
              { label: "Top Addresses", value: "top-addresses" },
            ]}
            onValueChange={value => {
              setActiveView(value);
              setSearchParams(prev => {
                prev.set("view", value);
                return prev;
              });
            }}
            value={activeView}
          />
        </div>

        {activeView === "general-info" && (
          <>
            <Metrics summary={summary} isLoading={isFetchingSummary} isError={isErrorSummary} />
            <RecentTransactions
              isError={isErrorRecentTransactions}
              isLoading={isLoadingLimits || isFetchingRecentTransactions}
              recentTransactions={recentTransactions}
              tokenIcon={summary?.image?.small}
            />
          </>
        )}

        {activeView === "transfers-over-time" && (
          <TransfersOverTime
            by={by}
            isError={isErrorTransfersByTime}
            isLoading={isFetchingTransfersByTime}
            setBy={setBy}
            setTimeRange={value => setTimeRange(value)}
            timeRange={timeRange}
            timeSpan={transfersByTime?.timeSpan || "1d"}
            transfers={transfersByTime?.data}
            currentNetwork={currentNetwork}
          />
        )}

        {activeView === "top-transfers" && (
          <ByChain
            activityNotional={activityNotional}
            activityTx={activityTx}
            isErrorActivityNotional={isErrorActivityNotional}
            isErrorActivityTx={isErrorActivityTx}
            isLoadingActivityNotional={isFetchingActivityNotional}
            isLoadingActivityTx={isFetchingActivityTx}
          />
        )}

        {activeView === "top-holders" && (
          <TopHolders
            isError={isErrorTopHolders}
            isLoading={isFetchingTopHolders}
            topHolders={topHolders}
          />
        )}

        {activeView === "top-addresses" && (
          <TopAddresses
            isErrorTopAddressesNotional={isErrorTopAddressesNotional}
            isErrorTopAddressesTx={isErrorTopAddressesTx}
            isLoadingTopAddressesNotional={isFetchingTopAddressesNotional}
            isLoadingTopAddressesTx={isFetchingTopAddressesTx}
            topAddressesNotional={topAddressesNotional}
            topAddressesTx={topAddressesTx}
          />
        )}

        {/* TODO: show when Multigov is available {symbol === "W" && <CommunityBanner />} */}
      </div>
    </BaseLayout>
  );
};

export default NTTToken;
