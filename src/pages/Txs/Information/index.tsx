import { Table, Tabs } from "src/components/organisms";
import i18n from "src/i18n";
import { Column } from "react-table";
import { useNavigate } from "react-router-dom";
import { TransactionOutput } from "..";
import Pagination from "src/components/atoms/Pagination";
import "./styles.scss";
import { Dispatch, SetStateAction } from "react";
import { Loader } from "src/components/atoms";

const TXS_TAB_HEADERS = [
  i18n.t("common.transfers").toUpperCase(),
  // i18n.t("common.messages").toUpperCase(),
];

const columns: Column<TransactionOutput>[] | any = [
  {
    Header: "TX HASH",
    accessor: "txHash",
  },
  {
    Header: "FROM",
    accessor: "from",
  },
  {
    Header: "TO",
    accessor: "to",
  },
  {
    Header: "STATUS",
    accessor: "status",
  },
  {
    Header: "AMOUNT",
    accessor: "amount",
    style: { textAlign: "right" },
  },
  {
    Header: "TIME",
    accessor: "time",
    style: { textAlign: "right" },
  },
];

interface Props {
  parsedTxsData: TransactionOutput[] | undefined;
  currentPage: number;
  onChangePagination: (pageNumber: number) => void;
  isPaginationLoading: boolean;
  setIsPaginationLoading: Dispatch<SetStateAction<boolean>>;
}

const Information = ({
  parsedTxsData,
  currentPage = 1,
  onChangePagination,
  isPaginationLoading,
  setIsPaginationLoading,
}: Props) => {
  const navigate = useNavigate();

  const onRowClick = (row: TransactionOutput) => {
    const { id: txHash } = row || {};
    txHash && navigate(`/tx/${txHash}`);
  };

  const goFirstPage = () => {
    setIsPaginationLoading(true);
    onChangePagination(1);
  };

  const goPrevPage = (currentPage: number) => {
    const prevPage = currentPage - 1 < 1 ? 1 : currentPage - 1;
    setIsPaginationLoading(true);
    onChangePagination(prevPage);
  };

  const goNextPage = (currentPage: number) => {
    const nextPage = currentPage + 1;
    setIsPaginationLoading(true);
    onChangePagination(nextPage);
  };

  return (
    <>
      <section className="txs-information">
        <Tabs
          headers={TXS_TAB_HEADERS}
          className="txs-information-tabs"
          contents={[
            <>
              {/* <div className="txs-information-table-results">(?) Results</div> */}
              {isPaginationLoading ? (
                <div className="txs-page-loader">
                  <Loader />
                </div>
              ) : (
                <Table
                  columns={columns}
                  data={parsedTxsData}
                  className="txs"
                  onRowClick={onRowClick}
                />
              )}

              <div className="txs-pagination">
                <Pagination
                  currentPage={currentPage}
                  goFirstPage={() => goFirstPage()}
                  goPrevPage={() => goPrevPage(currentPage)}
                  goNextPage={() => goNextPage(currentPage)}
                  // goLastPage={() => goLastPage()}
                  disabled={isPaginationLoading}
                />
              </div>
            </>,
          ]}
        />
      </section>
    </>
  );
};

export { Information };
