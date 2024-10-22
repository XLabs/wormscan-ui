import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "react-query";
import analytics from "src/analytics";
import { useEnvironment } from "src/context/EnvironmentContext";
import { BREAKPOINTS, MORE_INFO_GOVERNOR_URL } from "src/consts";
import { BaseLayout } from "src/layouts/BaseLayout";
import {
  BlockchainIcon,
  GovernorHeader,
  NavLink,
  Select,
  ToggleGroup,
  Tooltip,
} from "src/components/atoms";
import { Table } from "src/components/organisms";
import { getChainName } from "src/utils/wormhole";
import { formatNumber } from "src/utils/number";
import { useNavigateCustom, useWindowSize, useLockBodyScroll } from "src/utils/hooks";
import { parseTx, shortAddress } from "src/utils/crypto";
import {
  columnsDashboard,
  columnsTransactions,
  DailyLimitTooltip,
  IDataDashboard,
  IDataTransaction,
  IRowDashboard,
  IRowTransaction,
  ISelectSortBy,
  ISelectSortLowHigh,
  MinRemainingBar,
  RemainingTxLimitTooltip,
  SingleTxLimitTooltip,
  SORT_DASHBOARD_BY_LIST,
  SORT_LOW_HIGH_LIST,
  SORT_TRANSACTIONS_BY_LIST,
} from "src/utils/governorUtils";
import { ChainId } from "@wormhole-foundation/sdk";
import { getClient } from "src/api/Client";
import {
  ClockIcon,
  CopyIcon,
  CrossIcon,
  FilterListIcon,
  LayersIcon,
  PieChartIcon,
  StaticsIncreaseIcon,
} from "src/icons/generic";
import { CopyToClipboard, ErrorPlaceholder } from "src/components/molecules";
import { ETH_LIMIT } from "../Txs";
import "./styles.scss";

const Governor = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showTransactions, setShowTransactionsState] = useState(
    searchParams.get("view") === "transactions",
  );

  useEffect(() => {
    analytics.page({ title: `GOVERNOR_${showTransactions ? "TRANSACTIONS" : "DASHBOARD"}` });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setShowTransactions = (show: boolean) => {
    analytics.page({ title: `GOVERNOR_${show ? "TRANSACTIONS" : "DASHBOARD"}` });
    setShowTransactionsState(show);
    setSearchParams(prev => {
      prev.set("view", show ? "transactions" : "dashboard");
      return prev;
    });
  };

  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
  const [isErrorDashboard, setIsErrorDashboard] = useState(false);
  const [isErrorTransactions, setIsErrorTransactions] = useState(false);
  const [dataDashboard, setDataDashboard] = useState([]);
  const [dataTransactions, setDataTransactions] = useState([]);
  const [openSortBy, setOpenSortBy] = useState(false);
  const [selectedSortBy, setSelectedSortBy] = useState(
    showTransactions ? SORT_TRANSACTIONS_BY_LIST[4] : SORT_DASHBOARD_BY_LIST[3],
  );
  const [selectedSortLowHigh, setSelectedSortLowHigh] = useState(
    showTransactions ? SORT_LOW_HIGH_LIST[0] : SORT_LOW_HIGH_LIST[0],
  );
  const [sortBy, setSortBy] = useState<{ id: string; desc: boolean }[]>([
    { id: selectedSortBy.value, desc: selectedSortLowHigh.value },
  ]);
  const { environment } = useEnvironment();
  const currentNetwork = environment.network;
  const isMainnet = currentNetwork === "Mainnet";
  const { width } = useWindowSize();
  const isDesktop = width >= BREAKPOINTS.desktop;
  const navigate = useNavigateCustom();
  useLockBodyScroll({ isLocked: !isDesktop && openSortBy });

  const handleSelectedSortBy = (value: ISelectSortBy) => {
    setSelectedSortBy(value);
    setSortBy([{ id: value.value, desc: selectedSortLowHigh.value }]);
  };

  const handleSelectedSortLowHigh = (value: ISelectSortLowHigh) => {
    setSelectedSortLowHigh(value);
    setSortBy([{ id: selectedSortBy.value, desc: value.value }]);
  };

  const onRowClick = (row: IRowTransaction) => {
    if (isDesktop) {
      const { parseTxHash } = row || {};
      parseTxHash && navigate(`/tx/${parseTxHash}`);
    }
  };

  useQuery(["getLimit"], () => getClient().governor.getLimit(), {
    onError: () => {
      setIsErrorDashboard(true);
      setIsLoadingDashboard(false);
    },
    onSuccess: (data: IDataDashboard[]) => {
      const tempRows: IRowDashboard[] = [];

      data.map((item: IDataDashboard) => {
        const { chainId, notionalLimit, maxTransactionSize, availableNotional } = item;
        const availablePercentage = (item.availableNotional / item.notionalLimit) * 100;
        const formattedValue = parseFloat(formatNumber(availablePercentage, 2));
        const chainName = getChainName({ chainId: item.chainId, network: currentNetwork });

        const row = {
          chainId,
          chainName,
          maxTransactionSize,
          notionalLimit,
          availableNotional,
          chain: (
            <div className="dashboard chain">
              <BlockchainIcon
                background="var(--color-black-25)"
                chainId={chainId}
                className="chain-icon"
                colorless={false}
                network={currentNetwork}
                size={24}
              />
              <p>{chainName}</p>
            </div>
          ),
          singleTransactionLimit: (
            <div className="dashboard big-transaction">
              <h4>
                single tx limit <SingleTxLimitTooltip />
              </h4>
              <p>{formatNumber(item.maxTransactionSize, 0)} USD</p>
            </div>
          ),
          dailyLimit: (
            <div className="dashboard daily-limit">
              <h4>
                daily limit <DailyLimitTooltip />
              </h4>
              <p>{formatNumber(item.notionalLimit, 0)} USD</p>
            </div>
          ),
          remainingTransactionLimit: (
            <div className="dashboard min-remaining">
              <div className="min-remaining-container">
                <Tooltip side="left" tooltip={<div>{formattedValue}%</div>}>
                  <div>
                    <MinRemainingBar
                      color={
                        100 - availablePercentage >= 80 ? "#FF884D" : "var(--color-success-100)"
                      }
                      percentage={availablePercentage}
                    />
                  </div>
                </Tooltip>
              </div>

              <h4>
                remaining tx limit <RemainingTxLimitTooltip />
              </h4>
              <p>{formatNumber(item.availableNotional, 0)} USD</p>
            </div>
          ),
        };

        tempRows.push(row);
      });

      setDataDashboard(tempRows);
      setIsLoadingDashboard(false);
    },
    enabled: isMainnet,
  });

  useQuery(["getEnqueuedTransactions"], () => getClient().governor.getEnqueuedTransactions(), {
    onError: () => {
      setIsErrorTransactions(true);
      setIsLoadingTransactions(false);
    },
    onSuccess: async (txs: IDataTransaction[]) => {
      const tempRows: IRowTransaction[] = [];

      await Promise.all(
        txs.map(async tx => {
          const { chainId, releaseTime, status, txHash, amount } = tx;
          if (status === "issued") return;

          const txInfo = await getClient().guardianNetwork.getOperations({
            txHash: tx.txHash,
          });

          const chainName = getChainName({ chainId, network: currentNetwork });

          const parseTxHash = parseTx({
            value: txHash,
            chainId: tx.chainId as ChainId,
          });

          const usdAmount = txInfo[0]?.data?.usdAmount || `${amount}`;

          const limitDataForChain = dataDashboard
            ? dataDashboard.find((d: IRowDashboard) => d?.chainId === chainId)
            : ETH_LIMIT;
          const transactionLimit = limitDataForChain?.maxTransactionSize;
          const isBigTransaction = transactionLimit <= Number(usdAmount);
          const formatedStatus = isBigTransaction ? "Big transaction" : "Daily limit exceeded";

          const releaseDate = new Date(releaseTime);
          const currentDate = new Date();
          const diffInMilliseconds = releaseDate.getTime() - currentDate.getTime();
          const diffInHours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));
          const diffInMinutes = Math.floor((diffInMilliseconds % (1000 * 60 * 60)) / (1000 * 60));
          const timeLeft = `${diffInHours <= 0 ? "" : `${diffInHours}h, `}${
            diffInMinutes <= 0 ? "" : `${diffInMinutes}m`
          } left`;

          const row = {
            chainName,
            parseTxHash,
            usdAmount,
            formatedStatus,
            releaseDate,
            chain: (
              <div className="txs chain">
                <BlockchainIcon
                  background="var(--color-black-25)"
                  chainId={chainId}
                  className="chain-icon"
                  colorless={false}
                  network={currentNetwork}
                  size={24}
                />
                <p>{chainName}</p>
              </div>
            ),
            txHash: (
              <div className="txs tx-hash">
                <h4>TX HASH</h4>
                <NavLink to={`/tx/${parseTxHash}`}>
                  {shortAddress(parseTxHash).toUpperCase()}
                </NavLink>
                <CopyToClipboard toCopy={parseTxHash}>
                  <CopyIcon width={24} />
                </CopyToClipboard>
              </div>
            ),
            amount: (
              <div className="txs amount">
                <h4>AMOUNT</h4>
                <p>{formatNumber(+usdAmount, 0)} USD</p>
              </div>
            ),
            status: (
              <div className="txs status">
                {isBigTransaction ? (
                  <>
                    <h4>STATUS</h4>
                    <StaticsIncreaseIcon
                      style={{ color: "var(--color-information-100)" }}
                      width={24}
                    />
                    <p>{formatedStatus}</p>
                  </>
                ) : (
                  <>
                    <h4>STATUS</h4>
                    <PieChartIcon style={{ color: "var(--color-alert-100)" }} width={24} />
                    <p>{formatedStatus}</p>
                  </>
                )}
              </div>
            ),
            releaseTime: (
              <div className="txs release-time">
                <p>{timeLeft}</p>
                <ClockIcon width={24} />
              </div>
            ),
            viewDetails: (
              <div className="txs view-details">
                <NavLink to={`/tx/${parseTxHash}`}>View details</NavLink>
              </div>
            ),
          };

          tempRows.push(row);
        }),
      );

      setDataTransactions(tempRows);
      setIsLoadingTransactions(false);
    },
    enabled: showTransactions && isLoadingTransactions && dataDashboard?.length > 0,
  });

  const handleReset = (showTxs: boolean) => {
    if (showTxs) {
      setSelectedSortBy(SORT_TRANSACTIONS_BY_LIST[4]);
      setSelectedSortLowHigh(SORT_LOW_HIGH_LIST[0]);
      setSortBy([{ id: SORT_TRANSACTIONS_BY_LIST[4].value, desc: false }]);
    } else {
      setSelectedSortBy(SORT_DASHBOARD_BY_LIST[3]);
      setSelectedSortLowHigh(SORT_LOW_HIGH_LIST[0]);
      setSortBy([{ id: SORT_DASHBOARD_BY_LIST[3].value, desc: false }]);
    }
    setOpenSortBy(false);
  };

  return (
    <BaseLayout>
      <section className="governor">
        <GovernorHeader />

        <div className="governor-container">
          <div className="governor-container-top">
            <div className="governor-container-top-btns">
              <ToggleGroup
                ariaLabel="Select type"
                items={[
                  { label: "Dashboard", value: "dashboard", ariaLabel: "Dashboard" },
                  {
                    label: "Queued Transactions",
                    value: "txs",
                    ariaLabel: "Queued Transactions",
                  },
                ]}
                onValueChange={value => {
                  setShowTransactions(value === "txs");
                  handleReset(value === "txs");
                }}
                value={showTransactions ? "txs" : "dashboard"}
              />

              <button
                className="sort-by-btn"
                aria-label="Sort by"
                onClick={() => setOpenSortBy(!openSortBy)}
              >
                <FilterListIcon width={24} />
              </button>
            </div>
          </div>

          <div className="governor-container-table">
            {showTransactions ? (
              isErrorDashboard || isErrorTransactions ? (
                <ErrorPlaceholder />
              ) : (
                <Table
                  className="governor-container-table-transactions"
                  columns={
                    isDesktop
                      ? columnsTransactions
                      : [
                          ...columnsTransactions,
                          {
                            Header: "VIEW DETAILS",
                            accessor: "viewDetails",
                          },
                        ]
                  }
                  data={dataTransactions}
                  emptyMessage="There are no transactions queued in the governors."
                  hasSort={true}
                  isLoading={isLoadingTransactions}
                  sortBy={sortBy}
                  onRowClick={onRowClick}
                />
              )
            ) : isErrorDashboard ? (
              <ErrorPlaceholder />
            ) : (
              <Table
                className={`governor-container-table-dashboard ${
                  isDesktop ? "" : "table-mobile-dashboard"
                }`}
                columns={columnsDashboard}
                data={dataDashboard}
                emptyMessage="There is no data to display."
                hasSort={true}
                isLoading={isLoadingDashboard}
                sortBy={sortBy}
              />
            )}
          </div>
        </div>

        <div
          className={`governor-mobile-filters ${
            openSortBy ? (showTransactions ? "open-txs" : "open-dashboard") : ""
          }`}
        >
          <div className="governor-mobile-filters-top">
            <h4>Sort by</h4>

            <button
              className="governor-mobile-filters-top-btn"
              onClick={() => setOpenSortBy(false)}
            >
              <CrossIcon width={24} />
            </button>
          </div>

          <Select
            ariaLabel="Select sort by"
            className="governor-mobile-filters-select"
            items={showTransactions ? SORT_TRANSACTIONS_BY_LIST : SORT_DASHBOARD_BY_LIST}
            menuFixed={true}
            menuPortalStyles={{ zIndex: 99 }}
            name="topAssetTimeRange"
            onValueChange={(value: ISelectSortBy) => handleSelectedSortBy(value)}
            optionStyles={{ padding: 16 }}
            value={selectedSortBy}
          />

          <Select
            ariaLabel="Select sort low to high"
            className="governor-mobile-filters-select"
            items={SORT_LOW_HIGH_LIST}
            menuFixed={true}
            menuPortalStyles={{ zIndex: 99 }}
            name="topAssetTimeRange"
            onValueChange={(value: ISelectSortLowHigh) => handleSelectedSortLowHigh(value)}
            optionStyles={{ padding: 16 }}
            value={selectedSortLowHigh}
          />

          <div className="governor-mobile-filters-btns">
            <button
              className="governor-mobile-filters-btns-apply"
              onClick={() => setOpenSortBy(false)}
            >
              Apply
            </button>

            <button
              className="governor-mobile-filters-btns-reset"
              onClick={() => handleReset(showTransactions)}
            >
              Reset
            </button>
          </div>
        </div>

        {openSortBy && (
          <div
            className="governor-mobile-filters-overlay"
            onClick={() => setOpenSortBy(false)}
          ></div>
        )}
      </section>
    </BaseLayout>
  );
};

export default Governor;
