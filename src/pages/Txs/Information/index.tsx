import { Table } from "src/components/organisms";
import i18n from "src/i18n";
import { Column } from "react-table";
import { PAGE_SIZE, TransactionOutput } from "..";
import Pagination from "src/components/atoms/Pagination";
import { Dispatch, SetStateAction } from "react";
import { Loader } from "src/components/atoms";
import { useNavigateCustom } from "src/utils/hooks/useNavigateCustom";
import "./styles.scss";

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
  const navigate = useNavigateCustom();

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

  const PaginationComponent = ({ className }: { className?: string }) => {
    return (
      <Pagination
        currentPage={currentPage}
        goFirstPage={() => goFirstPage()}
        goPrevPage={() => goPrevPage(currentPage)}
        goNextPage={() => goNextPage(currentPage)}
        // goLastPage={() => goLastPage()}
        disabled={isPaginationLoading}
        disableNextButton={parsedTxsData.length <= 0 || parsedTxsData.length < PAGE_SIZE}
        className={className}
      />
    );
  };

  return (
    <>
      <section className="txs-information">
        <>
          {/* <div className="txs-information-table-results">(?) Results</div> */}
          <div>
            <div className="txs-information-top">
              <div className="txs-information-top-title">
                {i18n.t("common.transfers").toUpperCase()}
              </div>
              <div>
                <PaginationComponent className="txs-information-top-pagination" />
              </div>
            </div>
          </div>
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
              emptyMessage="No txs found."
            />
          )}

          <div className="txs-pagination">
            <PaginationComponent />
          </div>
        </>
      </section>
    </>
  );
};

export { Information };
