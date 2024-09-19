import { useState, useMemo, useEffect } from "react";
import { useQuery } from "react-query";
import { getClient } from "src/api/Client";
import { getGeckoTokenInfo } from "src/utils/cryptoToolkit";
import { chainToChainId } from "@wormhole-foundation/sdk";
import { useEnvironment } from "src/context/EnvironmentContext";
import { Summary } from "./Summary";
import { Metrics } from "./Metrics";
import { TransfersOverTime } from "./TransfersOverTime";
import { RecentTransactions } from "./RecentTransactions";
import { ByChain } from "./ByChain";
import { TopHolders } from "./TopHolders";
import { TopAddresses } from "./TopAddresses";
import { ToggleGroup } from "src/components/atoms";
import { GetOperationsOutput } from "src/api/guardian-network/types";
import { useWindowSize } from "src/utils/hooks";
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
import "./styles.scss";
import { useSearchParams } from "react-router-dom";
import analytics from "src/analytics";

export type TimeRange = { label: string; value: string };
export type ByType = "notional" | "tx";

const WToken = () => {
  const { environment } = useEnvironment();
  const currentNetwork = environment.network;
  const isMainnet = currentNetwork === "Mainnet";

  const [timeRange, setTimeRange] = useState<TimeRange>({ label: "Last 24 hours", value: "1d" });
  const [by, setBy] = useState<ByType>("tx");

  const { width } = useWindowSize();
  const isSmallMobile = width && width < 550;

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

        const filteredTransactions = data.filter(tx => tx.data?.symbol === "W");

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

          const STATUS: IStatus = tx?.targetChain?.transaction?.txHash
            ? "COMPLETED"
            : appIds && appIds.includes(CCTP_MANUAL_APP_ID)
            ? "EXTERNAL_TX"
            : tx.vaa?.raw
            ? isConnect || isPortal || isCCTP
              ? (canWeGetDestinationTx(toChain) &&
                  !hasAnotherApp &&
                  (!isTransferWithPayload ||
                    (isTransferWithPayload && isConnect) ||
                    (isTransferWithPayload && isTBTC))) ||
                isCCTP
                ? "PENDING_REDEEM"
                : "VAA_EMITTED"
              : "VAA_EMITTED"
            : isBigTransaction || isDailyLimitExceeded
            ? "IN_GOVERNORS"
            : "IN_PROGRESS";

          return {
            ...tx,
            STATUS,
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
    data: wTokenPrice,
    isError: isErrorWTokenPrice,
    isFetching: isFetchingWTokenPrice,
  } = useQuery(
    ["getWTokenInfo"],
    async () => {
      const data = await getGeckoTokenInfo(
        "85VBFQZC9TZkfaptBWjvUw7YbZjy52A6mjtPGjstQAmQ",
        chainToChainId("Solana"),
      );
      if (!data || !data.attributes?.price_usd) throw new Error("No data");
      return data.attributes.price_usd;
    },
    {
      enabled: isMainnet,
      refetchInterval: 10000,
    },
  );

  const {
    data: transfersByTime,
    isError: isErrorTransfersByTime,
    isFetching: isFetchingTransfersByTime,
  } = useQuery(
    ["getTransferByTimeTx", startDate, endDate, by],
    async () => {
      const timeSpan = timeRange.value === "1d" ? "1h" : timeRange.value === "1y" ? "1mo" : "1d";
      return {
        data: await getClient().nttApi.getNttTransferByTime({
          by,
          symbol: "W",
          from: startDate.toISOString(),
          timeSpan,
          to: endDate.toISOString(),
        }),
        timeSpan,
      };
    },
    { enabled: isMainnet, refetchOnWindowFocus: false },
  );

  const { data: summary } = useQuery(
    ["getSummary"],
    () => {
      return getClient().nttApi.getNttSummary({
        symbol: "W",
      });
    },
    {
      enabled: isMainnet,
    },
  );

  const { data: activityTx } = useQuery(
    "getActivityTx",
    async () => {
      const activity = await getClient().nttApi.getNttActivity({
        by: "tx",
        symbol: "W",
      });
      activity.sort((a, b) => (+a.value < +b.value ? 1 : -1));

      return activity;
    },
    {
      enabled: isMainnet,
    },
  );

  const { data: activityNotional } = useQuery(
    "getActivityNotional",
    async () => {
      const activity = await getClient().nttApi.getNttActivity({
        by: "notional",
        symbol: "W",
      });
      activity.sort((a, b) => (+a.value < +b.value ? 1 : -1));

      return activity;
    },
    {
      enabled: isMainnet,
    },
  );

  const { data: topHolders } = useQuery(
    "getTopHolders",
    async () => {
      const data = await getClient().nttApi.getNttTopHolder({
        symbol: "W",
      });
      return data;
    },
    {
      enabled: isMainnet,
    },
  );

  const { data: topAddressesNotional } = useQuery(
    ["getNttTopAddressNotional"],
    async () => {
      const data = await getClient().nttApi.getNttTopAddress({
        by: "notional",
        symbol: "W",
      });
      data.sort((a, b) => (+a.value < +b.value ? 1 : -1));
      return data;
    },
    {
      enabled: isMainnet,
    },
  );

  const { data: topAddressesTx } = useQuery(
    ["getNttTopAddressTx"],
    async () => {
      const data = await getClient().nttApi.getNttTopAddress({
        by: "tx",
        symbol: "W",
      });
      data.sort((a, b) => (+a.value < +b.value ? 1 : -1));
      return data;
    },
    {
      enabled: isMainnet,
    },
  );

  const [searchParams, setSearchParams] = useSearchParams();
  const [activeView, setActiveView] = useState(searchParams.get("view") || "general-info");

  useEffect(() => {
    analytics.page({ title: `ANALYTICS-WTOKEN-${activeView}` });
  }, [activeView]);

  return (
    <div>
      <Summary
        wTokenPrice={wTokenPrice}
        isErrorWTokenPrice={isErrorWTokenPrice}
        isFetchingWTokenPrice={isFetchingWTokenPrice}
      />

      <div className="tabs">
        <ToggleGroup
          ariaLabel="Select W Token data view"
          className="tabs-toggle-group"
          items={[
            { label: isSmallMobile ? "Info" : "General Information", value: "general-info" },
            { label: isSmallMobile ? "Transfers" : "Top Transfers", value: "top-transfers" },
            { label: isSmallMobile ? "Holders" : "Top Holders", value: "top-holders" },
            { label: isSmallMobile ? "Addresses" : "Top Addresses", value: "top-addresses" },
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
          <Metrics summary={summary} />
          <TransfersOverTime
            transfers={transfersByTime?.data}
            isLoading={isFetchingTransfersByTime}
            isError={isErrorTransfersByTime}
            timeSpan={transfersByTime?.timeSpan || "1d"}
            setTimeRange={value => setTimeRange(value)}
            timeRange={timeRange}
            by={by}
            setBy={setBy}
          />
          <RecentTransactions
            isError={isErrorRecentTransactions}
            isLoading={isLoadingLimits || isFetchingRecentTransactions}
            recentTransactions={recentTransactions}
          />
        </>
      )}

      {activeView === "top-transfers" && (
        <ByChain activityNotional={activityNotional} activityTx={activityTx} />
      )}
      {activeView === "top-holders" && <TopHolders topHolders={topHolders} />}
      {activeView === "top-addresses" && (
        <TopAddresses topAddressesNotional={topAddressesNotional} topAddressesTx={topAddressesTx} />
      )}
    </div>
  );
};

export default WToken;
