import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { CellProps, Column, Row } from "react-table";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import analytics from "src/analytics";
import { useEnvironment } from "src/context/EnvironmentContext";
import { MORE_INFO_GOVERNOR_URL } from "src/consts";
import { BaseLayout } from "src/layouts/BaseLayout";
import { BlockchainIcon, Tooltip } from "src/components/atoms";
import { Table } from "src/components/organisms";
import { getChainName } from "src/utils/wormhole";
import { formatNumber } from "src/utils/number";
import { useNavigateCustom } from "src/utils/hooks/useNavigateCustom";
import { getClient } from "src/api/Client";
import "./styles.scss";

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

interface IDataItem {
  chainId: number;
  maxTransactionSize: number;
  notionalLimit: number;
  availableNotional: number;
}

interface IRow {
  availableNotional?: number;
  chainId?: {
    id: number;
    name: string;
  };
  maxTransactionSize?: number;
  notionalLimit?: number;
}

const Governor = () => {
  useEffect(() => {
    analytics.page({ title: "GOVERNOR" });
  }, []);

  const [dashboardData, setDashboardData] = useState([]);
  const [showTransactions, setShowTransactions] = useState(false);
  const [isLoadingLimits, setIsLoadingLimits] = useState(true);
  const { environment } = useEnvironment();
  const currentNetwork = environment.network;
  const navigate = useNavigateCustom();

  const columnsDashboard: Column[] | any = [
    {
      Header: <>CHAIN</>,
      id: "chainId.name",
      accessor: "chainId.name",
      sortType: (rowA: Row<any>, rowB: Row<any>, columnId: "chainId.name") => {
        const a = rowA.values[columnId].toUpperCase();
        const b = rowB.values[columnId].toUpperCase();

        return a.localeCompare(b);
      },
      Cell: ({ row }: CellProps<any, any>) => {
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
        <>
          SINGLE TRANSACTION LIMIT
          <Tooltip
            className="governor-container-table-title-tooltip"
            tooltip={
              <div>
                Transactions exceeding this single-transaction threshold activate a 24-hour finality
                delay before being signed by Wormhole Guardians. These transactions are not included
                in the total value counted towards the 24-hour rolling period limit.
              </div>
            }
            type="info"
          >
            <InfoCircledIcon height={18} width={18} />
          </Tooltip>
        </>
      ),
      id: "maxTransactionSize",
      accessor: "maxTransactionSize",
      Cell: ({ value }: CellProps<any, any>) => (
        <div className="big-transaction">
          <p>{formatNumber(value, 0)} USD</p>
        </div>
      ),
    },
    {
      Header: (
        <>
          DAILY LIMIT
          <Tooltip
            className="governor-container-table-title-tooltip"
            tooltip={
              <div>
                Maximum total value of transactions that can be signed without delay in any 24-hour
                rolling period. If this limit is exceeded, additional transactions are delayed until
                earlier transactions age beyond this 24-hour window, thereby freeing up bandwidth to
                process the delayed transactions.
              </div>
            }
            type="info"
          >
            <InfoCircledIcon height={18} width={18} />
          </Tooltip>
        </>
      ),
      id: "notionalLimit",
      accessor: "notionalLimit",
      Cell: ({ value }: CellProps<any, any>) => (
        <div className="daily-limit">
          <p>{formatNumber(value, 0)} USD</p>
        </div>
      ),
    },
    {
      Header: (
        <>
          REMAINING TRANSACTION LIMIT
          <Tooltip
            className="governor-container-table-title-tooltip"
            tooltip={
              <div>
                This shows the remaining value of transaction volume that can be processed without
                delay today. Once this limit is reached, further transactions will be delayed until
                sufficient limit is available within the 24-hour rolling window.
              </div>
            }
            type="info"
          >
            <InfoCircledIcon height={18} width={18} />
          </Tooltip>
        </>
      ),
      id: "remainingTransactionLimit",
      accessor: (row: IRow) => {
        return (row.availableNotional / row.notionalLimit) * 100;
      },
      Cell: ({ value, row }: { value: number; row: Row<IRow> }) => {
        const formattedValue = parseFloat(formatNumber(value, 2));
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

      sortType: (a: Row<IRow>, b: Row<IRow>) => {
        return (
          (a.original.availableNotional / a.original.notionalLimit) * 100 -
          (b.original.availableNotional / b.original.notionalLimit) * 100
        );
      },
    },
  ];

  useEffect(() => {
    if (currentNetwork !== "MAINNET") {
      navigate("/");
    }
  }, [currentNetwork, navigate]);

  useQuery(["getLimit"], () => getClient().governor.getLimit(), {
    onSuccess: data => {
      const transformedData = data.map((item: IDataItem) => ({
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
          setting thresholds for transaction sizes and volume.{" "}
          <a
            className="governor-description-link"
            href={MORE_INFO_GOVERNOR_URL}
            target="_blank"
            rel="noreferrer"
          >
            Learn more
          </a>
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
                initialSortById="chainId.name"
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
