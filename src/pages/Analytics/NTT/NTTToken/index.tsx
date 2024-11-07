import { useState, useMemo, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "react-query";
import { getClient } from "src/api/Client";
import { useEnvironment } from "src/context/EnvironmentContext";
import { BaseLayout } from "src/layouts/BaseLayout";
import { ToggleGroup } from "src/components/atoms";
import { GetOperationsOutput } from "src/api/guardian-network/types";
import {
  canWeGetDestinationTx,
  CCTP_APP_ID,
  CCTP_MANUAL_APP_ID,
  CONNECT_APP_ID,
  IStatus,
  NTT_APP_ID,
  PORTAL_APP_ID,
  UNKNOWN_APP_ID,
} from "src/consts";
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
import { CommunityBanner } from "./CommunityBanner";
import "./styles.scss";

export type TimeRange = { label: string; value: string };
export type ByType = "notional" | "tx";

export const TOKEN_ADDRESS_WORMHOLE_BRIDGED_USDC_FANTOM =
  "0X2F733095B80A04B38B0D10CC884524A3D09B836A";

const NTTToken = () => {
  const { environment } = useEnvironment();
  const currentNetwork = environment.network;
  const isMainnet = currentNetwork === "Mainnet";

  const { symbol, coingecko_id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeView, setActiveView] = useState(searchParams.get("view") || "general-info");

  const [timeRange, setTimeRange] = useState<TimeRange>({ label: "Last 24 hours", value: "1d" });
  const [by, setBy] = useState<ByType>("tx");

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
    () => {
      return getClient()
        .governor.getLimit()
        .catch(() => null);
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
    "getRecentTransactions",
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

        const filteredTransactions = isUSDCe
          ? data.filter(
              tx =>
                tx.content?.standarizedProperties?.tokenAddress.toUpperCase() ===
                TOKEN_ADDRESS_WORMHOLE_BRIDGED_USDC_FANTOM,
            )
          : data.filter(tx => tx.data?.symbol.toUpperCase() === symbol.toUpperCase());

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
          const isCCTP = appIds?.includes(CCTP_APP_ID);
          const isConnect = appIds?.includes(CONNECT_APP_ID);
          const isPortal = appIds?.includes(PORTAL_APP_ID);
          const isTBTC = !!appIds?.find(appId => appId.toLowerCase().includes("tbtc"));
          const isTransferWithPayload = false;
          const hasAnotherApp = !!(
            appIds &&
            appIds.filter(
              appId =>
                appId !== CONNECT_APP_ID &&
                appId !== PORTAL_APP_ID &&
                appId !== UNKNOWN_APP_ID &&
                !appId.toLowerCase().includes("tbtc"),
            )?.length
          );

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
            ? isConnect || isPortal || isCCTP
              ? (canWeGetDestinationTx(toChain) &&
                  !hasAnotherApp &&
                  (!isTransferWithPayload ||
                    (isTransferWithPayload && isConnect) ||
                    (isTransferWithPayload && isTBTC))) ||
                isCCTP
                ? "pending_redeem"
                : "vaa_emitted"
              : "vaa_emitted"
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
    () => {
      return getClient().nttApi.getNttSummary({
        coingecko_id,
      });
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
      activity.sort((a, b) => (+a.value < +b.value ? 1 : -1));

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
      activity.sort((a, b) => (+a.value < +b.value ? 1 : -1));

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
      data.sort((a, b) => (+a.value < +b.value ? 1 : -1));
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
      data.sort((a, b) => (+a.value < +b.value ? 1 : -1));
      return data;
    },
    {
      enabled: isMainnet,
    },
  );

  useEffect(() => {
    analytics.page({ title: `ANALYTICS-NTTTOKEN-${activeView}` });
  }, [activeView]);

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
              ...(!isUSDCe ? [{ label: "Transfers Over Time", value: "transfers-over-time" }] : []),
              { label: "Top Transfers", value: "top-transfers" },
              { label: "Top Holders", value: "top-holders" },
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

        {symbol === "W" && <CommunityBanner />}
      </div>
    </BaseLayout>
  );
};

export default NTTToken;
