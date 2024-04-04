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

type Governance = {
  availableNotional: number;
  chainId: number;
  chainName?: string;
  maxTransactionSize: number;
  notionalLimit: number;
};

type GovernanceRow = {
  availableNotional: JSX.Element;
  chainId: JSX.Element;
  maxTransactionSize: JSX.Element;
  notionalLimit: JSX.Element;
};

const Governance = () => {
  const [settingsData, setSettingsData] = useState([]);
  const [showTransactions, setShowTransactions] = useState(false);
  const { environment } = useEnvironment();
  const currentNetwork = environment.network;

  const { isLoading: isLoadingLimits } = useQuery(
    ["getLimit"],
    () =>
      getClient()
        .governor.getLimit()
        .catch(() => null),
    {
      onSuccess: data => {
        const tempRows: GovernanceRow[] = [];

        data.forEach((item: Governance) => {
          item.chainName = getChainName({ chainId: item.chainId, network: currentNetwork });
        });

        data.sort((a: Governance, b: Governance) => a.chainName.localeCompare(b.chainName));

        data.length > 0
          ? data.map((item: Governance) => {
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
      },
    },
  );

  return (
    <BaseLayout>
      <section className="governance">
        <h1 className="governance-title">Governance</h1>

        <div className="governance-container">
          <div className="governance-container-top">
            <div className="governance-container-top-btns">
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
              className="governance-container-top-pagination"
              currentPage={1}
              goNextPage={() => {
                console.log("goNextPage");
              }}
              goPrevPage={() => {
                console.log("goPrevPage");
              }}
            /> */}
          </div>

          <div className="governance-container-table">
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

          <div className="governance-container-bottom">
            {/*  <Pagination
              className="governance-container-top-pagination"
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

export default Governance;
