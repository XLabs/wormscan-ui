import { Dispatch, SetStateAction } from "react";
import { useLocation } from "react-router-dom";
import { Column } from "react-table";
import { PAGE_SIZE, TransactionOutput } from "..";
import { Table } from "src/components/organisms";
import { Pagination, Switch } from "src/components/atoms";
import { useNavigateCustom } from "src/utils/hooks";
import Filters from "./Filters";
import "./styles.scss";

const getColumns = (condition: boolean): Column<TransactionOutput>[] => {
  const baseColumns: Column<TransactionOutput>[] = [
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

  if (condition) {
    baseColumns.splice(3, 0, {
      Header: "",
      accessor: "inOut",
    });
  }

  return baseColumns;
};

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
  const columns = getColumns(isTxsFiltered);
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
    <section className="txs-information">
      <div className="txs-information-top">
        <div className="txs-information-top-buttons">
          <div
            className="txs-information-top-buttons-live-mode"
            onClick={() => {
              setLiveMode(!liveMode);
            }}
          >
            <Switch label={`LIVE MODE ${liveMode ? "ON" : "OFF"}`} value={liveMode} />
          </div>

          {!isTxsFiltered && <Filters />}
        </div>

        <div>
          <PaginationComponent className="txs-information-top-pagination" />
        </div>
      </div>

      <div className="table-container">
        <Table
          className="txs"
          columns={columns}
          data={parsedTxsData}
          emptyMessage="No transactions found."
          isLoading={isPaginationLoading}
          numberOfColumns={isTxsFiltered ? 8 : 7}
          onRowClick={onRowClick}
        />
      </div>

      <div className="txs-pagination">
        <PaginationComponent />
      </div>
    </section>
  );
};

export { Information };
