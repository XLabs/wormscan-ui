import { Table } from "src/components/organisms";
import { Column } from "react-table";
import { PAGE_SIZE, TransactionOutput } from "..";
import { Dispatch, SetStateAction } from "react";
import { Pagination, Switch } from "src/components/atoms";
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
  currentPage: number;
  isPaginationLoading: boolean;
  isTxsFiltered: boolean;
  liveMode: boolean;
  onChangePagination: (pageNumber: number) => void;
  parsedTxsData: TransactionOutput[] | undefined;
  setIsPaginationLoading: Dispatch<SetStateAction<boolean>>;
  setLiveMode: (b: boolean) => void;
}

const Information = ({
  currentPage = 1,
  isPaginationLoading,
  isTxsFiltered = false,
  liveMode,
  onChangePagination,
  parsedTxsData,
  setIsPaginationLoading,
  setLiveMode,
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
              <div
                className="txs-information-top-title"
                onClick={() => {
                  setLiveMode(!liveMode);
                }}
              >
                <Switch label={`LIVE MODE ${liveMode ? "ON" : "OFF"}`} value={liveMode} />
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
