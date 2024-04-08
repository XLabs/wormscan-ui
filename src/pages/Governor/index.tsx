import { useState } from "react";
import { useQuery } from "react-query";
import { Column } from "react-table";
import { useEnvironment } from "src/context/EnvironmentContext";
import { BaseLayout } from "src/layouts/BaseLayout";
import { BlockchainIcon, Pagination } from "src/components/atoms";
import { Table } from "src/components/organisms";
import { getChainName } from "src/utils/wormhole";
import { formatNumber } from "src/utils/number";
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

const columnsSettings: Column[] | any = [
  {
    Header: "CHAIN",
    accessor: "chainId",
  },
  {
    Header: "BIG TRANSACTION",
    accessor: "maxTransactionSize",
  },
  {
    Header: "DAILY LIMIT",
    accessor: "notionalLimit",
  },
  {
    Header: "DAILY LIMIT REMAINING",
    accessor: "availableNotional",
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
  const [settingsData, setSettingsData] = useState([]);
  const [showTransactions, setShowTransactions] = useState(false);
  const [isLoadingLimits, setIsLoadingLimits] = useState(true);
  const { environment } = useEnvironment();
  const currentNetwork = environment.network;

  useQuery(["getLimit"], () => getClient().governor.getLimit(), {
    onSuccess: data => {
      const tempRows: GovernorRow[] = [];

      data.forEach((item: Governor) => {
        item.chainName = getChainName({ chainId: item.chainId, network: currentNetwork });
      });

      data.sort((a: Governor, b: Governor) => a.chainName.localeCompare(b.chainName));

      data.length > 0
        ? data.map((item: Governor) => {
            const row = {
              chainId: (
                <div className="chain">
                  <BlockchainIcon
                    background="var(--color-black-25)"
                    chainId={item.chainId}
                    className="chain-icon"
                    colorless={false}
                    network={currentNetwork}
                    size={24}
                  />

                  <p>{item.chainName}</p>
                </div>
              ),
              maxTransactionSize: (
                <div className="big-transaction">
                  <p>{formatNumber(item.maxTransactionSize, 0)} USD</p>
                </div>
              ),
              notionalLimit: (
                <div className="daily-limit">
                  <p>{formatNumber(item.notionalLimit, 0)} USD</p>
                </div>
              ),
              availableNotional: (
                <div className="min-remaining">
                  <p>{formatNumber(item.availableNotional, 0)} USD</p>
                </div>
              ),
            };

            tempRows.push(row);
          })
        : [];

      setSettingsData(tempRows);
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
                aria-label="Settings"
                onClick={() => {
                  setShowTransactions(false);
                }}
              >
                SETTINGS
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
                columns={columnsSettings}
                data={isLoadingLimits ? [] : settingsData}
                emptyMessage="No limits found."
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
