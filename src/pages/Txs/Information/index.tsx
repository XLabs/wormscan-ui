import { Table } from "src/components/organisms";
import i18n from "src/i18n";
import { Column } from "react-table";
import { PAGE_SIZE, TransactionOutput } from "..";
import { Dispatch, SetStateAction } from "react";
import { Loader, Pagination } from "src/components/atoms";
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
    Header: "ORIGIN APP",
    accessor: "originApp",
  },
  {
    Header: "FROM",
    accessor: "from",
  },
  {
    Header: "TO",
    accessor: "to",
  },
  // {
  //   Header: "STATUS",
  //   accessor: "status",
  // },
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

  const onRowClick = (row: TransactionOutput) => {
    const { VAAId } = row || {};
    VAAId && navigate(`/tx/${VAAId}`);
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
        disableNextButton={parsedTxsData.length <= 0 || parsedTxsData.length < PAGE_SIZE}
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
                {i18n.t("common.transfers").toUpperCase()}
              </div>
              <div>
                <PaginationComponent className="txs-information-top-pagination" />
              </div>
            </div>
          </div>
          {isPaginationLoading ? (
            <Loader />
          ) : (
            <div className="table-container">
              <Table
                columns={columns}
                data={parsedTxsData}
                className="txs"
                emptyMessage="No txs found."
                onRowClick={onRowClick}
              />
            </div>
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
