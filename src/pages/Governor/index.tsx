import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "react-query";
import analytics from "src/analytics";
import { useEnvironment } from "src/context/EnvironmentContext";
import { BREAKPOINTS } from "src/consts";
import { BaseLayout } from "src/layouts/BaseLayout";
import {
  BlockchainIcon,
  GovernorHeader,
  NavLink,
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
  MinRemainingBar,
  RemainingTxLimitTooltip,
  SingleTxLimitTooltip,
} from "src/utils/governorUtils";
import { ChainId } from "@wormhole-foundation/sdk";
import { getClient } from "src/api/Client";
import { ClockIcon, CopyIcon, PieChartIcon, StaticsIncreaseIcon } from "src/icons/generic";
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
  const { environment } = useEnvironment();
  const currentNetwork = environment.network;
  const isMainnet = currentNetwork === "Mainnet";
  const { width } = useWindowSize();
  const isDesktop = width >= BREAKPOINTS.desktop;
  const navigate = useNavigateCustom();
  useLockBodyScroll({ isLocked: !isDesktop && openSortBy });

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

      data
        .filter((item: IDataDashboard) => item.notionalLimit > 0 && item.maxTransactionSize > 0)
        .map((item: IDataDashboard) => {
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
                }}
                value={showTransactions ? "txs" : "dashboard"}
              />
            </div>
          </div>

          <div className="governor-container-table">
            {showTransactions ? (
              isErrorDashboard || isErrorTransactions ? (
                <ErrorPlaceholder />
              ) : (
                <Table
                  trackTxsSortBy
                  className="governor-container-table-transactions"
                  columns={
                    isDesktop
                      ? columnsTransactions
                      : [
                          ...columnsTransactions,
                          {
                            Header: "View Details",
                            accessor: "viewDetails",
                          },
                        ]
                  }
                  data={dataTransactions}
                  emptyMessage="There are no transactions queued in the governors."
                  defaultSortBy={{ id: "releaseTime", desc: false }}
                  isLoading={isLoadingTransactions}
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
                defaultSortBy={{ id: "dailyLimit", desc: true }}
                isLoading={isLoadingDashboard}
                trackTxsSortBy={true}
              />
            )}
          </div>
        </div>
      </section>
    </BaseLayout>
  );
};

export default Governor;
