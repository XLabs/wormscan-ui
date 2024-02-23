import { Table } from "src/components/organisms";
import i18n from "src/i18n";
import { Column } from "react-table";
import { PAGE_SIZE, TransactionOutput } from "..";
import { Dispatch, SetStateAction } from "react";
import { Pagination } from "src/components/atoms";
import { useNavigateCustom } from "src/utils/hooks/useNavigateCustom";
import { useLocation } from "react-router-dom";
import "./styles.scss";

const columns: Column<TransactionOutput>[] | any = [
  {
    Header: "STATUS",
    accessor: "status",
  },
  {
    Header: "SOURCE TX HASH",
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
    Header: "PROTOCOL",
    accessor: "originApp",
  },
  {
    Header: "TYPE",
    accessor: "amount",
  },
  {
    Header: "TIME",
    accessor: "time",
  },
];

interface Props {
  parsedTxsData: TransactionOutput[] | undefined;
  currentPage: number;
  onChangePagination: (pageNumber: number) => void;
  isPaginationLoading: boolean;
  setIsPaginationLoading: Dispatch<SetStateAction<boolean>>;
  isTxsFiltered: boolean;
}

const Information = ({
  parsedTxsData,
  currentPage = 1,
  onChangePagination,
  isPaginationLoading,
  setIsPaginationLoading,
  isTxsFiltered = false,
}: Props) => {
  const navigate = useNavigateCustom();
  const location = useLocation();
  const currentUrlPage = +new URLSearchParams(location.search).get("page") || 1;

  const onRowClick = (row: TransactionOutput) => {
    const { txHashId } = row || {};
    txHashId && navigate(`/tx/${txHashId}`);
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

  const goPage = (currentPage: number) => {
    if (currentPage === currentUrlPage) return;
    setIsPaginationLoading(true);
    onChangePagination(currentPage);
  };

  const PaginationComponent = ({ className }: { className?: string }) => {
    return (
      <Pagination
        currentPage={currentPage}
        goFirstPage={() => goFirstPage()}
        goPrevPage={() => goPrevPage(currentPage)}
        goNextPage={() => goNextPage(currentPage)}
        // goLastPage={() => goLastPage()}
        goPage={isTxsFiltered ? null : goPage}
        disabled={isPaginationLoading}
        disableNextButton={parsedTxsData?.length <= 0 || parsedTxsData?.length < PAGE_SIZE}
        className={className}
      />
    );
  };

  return (
    <>
      <section className="txs-information">
        <>
          <div>
            <div className="txs-information-top">
              <div className="txs-information-top-title">
                {/* {i18n.t("common.transfers").toUpperCase()} */}
              </div>
              <div>
                <PaginationComponent className="txs-information-top-pagination" />
              </div>
            </div>
          </div>

          <div className="table-container">
            <Table
              className="txs"
              columns={columns}
              data={parsedTxsData}
              emptyMessage="No txs found."
              isLoading={isPaginationLoading}
              onRowClick={onRowClick}
            />
          </div>

          <div className="txs-pagination">
            <PaginationComponent />
          </div>
        </>
      </section>
    </>
  );
};

export { Information };
