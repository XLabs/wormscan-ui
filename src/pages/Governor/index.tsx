import { useEffect, useMemo, useState } from "react";
import { useQuery } from "react-query";
import { Column } from "react-table";
import { useEnvironment } from "src/context/EnvironmentContext";
import { BaseLayout } from "src/layouts/BaseLayout";
import { BlockchainIcon, Pagination, Tooltip } from "src/components/atoms";
import { Table } from "src/components/organisms";
import { getChainName } from "src/utils/wormhole";
import { formatNumber } from "src/utils/number";
import { useNavigateCustom } from "src/utils/hooks/useNavigateCustom";
import { getClient } from "src/api/Client";
import "./styles.scss";
import { InfoCircledIcon } from "@radix-ui/react-icons";

const columnsTransactions: Column[] | any = [
  {
    Header: "STATUS",
    accessor: "1",
  },
  {
    Header: "TX HASH",
    accessor: "2",
  },
  {
    Header: "AMOUNT",
    accessor: "3",
  },
  {
    Header: "RELEASE TIME",
    accessor: "4",
  },
];

type Governor = {
  availableNotional: number;
  chainId: number;
  chainName?: string;
  maxTransactionSize: number;
  notionalLimit: number;
};

type GovernorRow = {
  availableNotional: JSX.Element;
  chainId: JSX.Element;
  maxTransactionSize: JSX.Element;
  notionalLimit: JSX.Element;
};

const Governor = () => {
  const [dashboardData, setDashboardData] = useState([]);
  const [showTransactions, setShowTransactions] = useState(false);
  const [isLoadingLimits, setIsLoadingLimits] = useState(true);
  const { environment } = useEnvironment();
  const currentNetwork = environment.network;
  const navigate = useNavigateCustom();

  const columnsDashboard = useMemo(
    () => [
      {
        Header: <div className="title">CHAIN</div>,
        id: "chainId.name",
        accessor: "chainId.name",
        sortType: "basic",
        Cell: ({ row }) => {
          const { id, name } = row.original.chainId;
          return (
            <div className="chain">
              <BlockchainIcon
                background="var(--color-black-25)"
                chainId={id}
                className="chain-icon"
                colorless={false}
                network={currentNetwork}
                size={24}
              />

              <p>{name}</p>
            </div>
          );
        },
      },
      {
        Header: (
          <div className="title">
            SINGLE TRANSACTION LIMIT
            <Tooltip
              tooltip={
                <div>
                  Transactions exceeding this single-transaction threshold activate a 24-hour
                  finality delay before being signed by Wormhole Guardians. These transactions are
                  not included in the total value counted towards the 24-hour rolling period limit.
                </div>
              }
              type="info"
            >
              <InfoCircledIcon height={18} width={18} />
            </Tooltip>
          </div>
        ),
        id: "maxTransactionSize",
        accessor: "maxTransactionSize",
        Cell: ({ value }) => (
          <div className="big-transaction">
            <p>{formatNumber(value, 0)} USD</p>
          </div>
        ),
      },
      {
        Header: (
          <div className="title">
            DAILY LIMIT
            <Tooltip
              tooltip={
                <div>
                  Maximum total value of transactions that can be signed without delay in any
                  24-hour rolling period. If this limit is exceeded, additional transactions are
                  delayed until earlier transactions age beyond this 24-hour window, thereby freeing
                  up bandwidth to process the delayed transactions.
                </div>
              }
              type="info"
            >
              <InfoCircledIcon height={18} width={18} />
            </Tooltip>
          </div>
        ),
        id: "notionalLimit",
        accessor: "notionalLimit",
        Cell: ({ value }) => (
          <div className="daily-limit">
            <p>{formatNumber(value, 0)} USD</p>
          </div>
        ),
      },
      {
        Header: (
          <div className="title">
            REMAINING TRANSACTION LIMIT
            <Tooltip
              tooltip={
                <div>
                  This shows the remaining value of transaction volume that can be processed without
                  delay today. Once this limit is reached, further transactions will be delayed
                  until sufficient limit is available within the 24-hour rolling window.
                </div>
              }
              type="info"
            >
              <InfoCircledIcon height={18} width={18} />
            </Tooltip>
          </div>
        ),
        id: "remainingTransactionLimit",
        accessor: row => {
          return (row.availableNotional / row.notionalLimit) * 100;
        },
        Cell: ({ value, row }) => {
          // Destructuring directly in the parameter list
          console.log(row.original); // This should now log the full original row data
          const formattedValue = formatNumber(value, 2); // `value` is now directly available
          return (
            <div className="min-remaining">
              <p>{formatNumber(row.original.availableNotional, 0)} USD</p>

              <Tooltip side="left" tooltip={<div>{formattedValue}%</div>}>
                <div className="min-remaining-bar">
                  <div
                    className="min-remaining-bar-fill"
                    style={{
                      backgroundColor: 100 - value >= 80 ? "#7a211b" : "#335d35",
                    }}
                  >
                    <div
                      className="min-remaining-bar-fill-used"
                      style={{
                        backgroundColor: 100 - value >= 80 ? "#f44336" : "#66bb6a",
                        width: `${100 - value}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </Tooltip>
            </div>
          );
        },

        sortType: (a, b) => {
          return (
            (a.original.availableNotional / a.original.notionalLimit) * 100 -
            (b.original.availableNotional / b.original.notionalLimit) * 100
          );
        },
      },
    ],
    [currentNetwork],
  );

  useEffect(() => {
    if (currentNetwork !== "MAINNET") {
      navigate("/");
    }
  }, [currentNetwork, navigate]);

  useQuery("getLimit", () => getClient().governor.getLimit(), {
    onSuccess: data => {
      const transformedData = data.map(item => ({
        chainId: {
          id: item.chainId,
          name: getChainName({ chainId: item.chainId, network: currentNetwork }),
        },
        maxTransactionSize: item.maxTransactionSize,
        notionalLimit: item.notionalLimit,
        availableNotional: item.availableNotional,
      }));

      setDashboardData(transformedData);
      setIsLoadingLimits(false);
    },
    onError: () => {
      setIsLoadingLimits(false);
    },
  });

  return (
    <BaseLayout>
      <section className="governor">
        <h1 className="governor-title">Governor</h1>
        <p className="governor-description">
          The Wormhole Governor is an added security measure that enhances stability and safety by
          setting thresholds for transaction sizes and volume.[ Learn
          more](https://github.com/wormhole-foundation/wormhole/blob/main/whitepapers/0007_governor.md)
        </p>

        <div className="governor-container">
          <div className="governor-container-top">
            <div className="governor-container-top-btns">
              {/* <button
                className={showTransactions ? "active" : ""}
                aria-label="Transactions"
                onClick={() => {
                  setShowTransactions(true);
                }}
              >
                TRANSACTIONS
              </button> */}

              <button
                className={!showTransactions ? "active" : ""}
                aria-label="Dashboard"
                onClick={() => {
                  setShowTransactions(false);
                }}
              >
                DASHBOARD
              </button>
            </div>

            {/* <Pagination
              className="governor-container-top-pagination"
              currentPage={1}
              goNextPage={() => {
                console.log("goNextPage");
              }}
              goPrevPage={() => {
                console.log("goPrevPage");
              }}
            /> */}
          </div>

          <div className="governor-container-table">
            {showTransactions ? (
              <Table
                columns={columnsTransactions}
                data={[]}
                emptyMessage="There are no transactions in governors."
                isLoading={isLoadingLimits}
              />
            ) : (
              <Table
                columns={columnsDashboard}
                data={isLoadingLimits ? [] : dashboardData}
                emptyMessage="No limits found."
                hasSort={true}
                isLoading={isLoadingLimits}
              />
            )}
          </div>

          <div className="governor-container-bottom">
            {/*  <Pagination
              className="governor-container-top-pagination"
              currentPage={1}
              goNextPage={() => {
                console.log("goNextPage");
              }}
              goPrevPage={() => {
                console.log("goPrevPage");
              }}
            /> */}
          </div>
        </div>
      </section>
    </BaseLayout>
  );
};

export default Governor;
