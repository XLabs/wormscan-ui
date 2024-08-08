import { Dispatch, SetStateAction } from "react";
import { useLocation } from "react-router-dom";
import { Column } from "react-table";
import { PAGE_SIZE, TransactionOutput } from "..";
import { Table } from "src/components/organisms";
import { Pagination } from "src/components/atoms";
import { useNavigateCustom, useWindowSize } from "src/utils/hooks";
import Filters from "./Filters";
import { BREAKPOINTS } from "src/consts";
import "./styles.scss";

interface Props {
  currentPage: number;
  isPaginationLoading: boolean;
  isTxsFiltered: boolean;
  onChangePagination: (pageNumber: number) => void;
  parsedTxsData: TransactionOutput[] | undefined;
  payloadTypeParams: string;
  setIsPaginationLoading: Dispatch<SetStateAction<boolean>>;
}

const Information = ({
  currentPage = 1,
  isPaginationLoading,
  isTxsFiltered = false,
  onChangePagination,
  parsedTxsData,
  payloadTypeParams,
  setIsPaginationLoading,
}: Props) => {
  const navigate = useNavigateCustom();
  const location = useLocation();
  const currentUrlPage = +new URLSearchParams(location.search).get("page") || 1;
  const { width } = useWindowSize();
  const isDesktop = width >= BREAKPOINTS.desktop;

  //att status txhash sourcechain token name token address time
  //trans status txhash from to protocol time

  const columns: Column[] | any = [
    {
      Header: "STATUS",
      accessor: "status",
    },
    {
      Header: "SOURCE TX HASH",
      accessor: "txHash",
    },
    !payloadTypeParams && {
      Header: "TYPE",
      accessor: "type",
    },
    {
      Header: payloadTypeParams === "2" ? "SOURCE CHAIN" : "CHAINS",
      accessor: "chains",
    },
    payloadTypeParams === "2" && {
      Header: "TOKEN NAME",
      accessor: "tokenName",
    },
    payloadTypeParams === "2" && {
      Header: "TOKEN ADDRESS",
      accessor: "tokenAddress",
    },
    {
      Header: "PROTOCOL",
      accessor: "protocol",
    },
    {
      Header: "TIME",
      accessor: "time",
    },
  ].filter(Boolean);

  const onRowClick = (row: TransactionOutput) => {
    if (isDesktop) {
      const { txHashId } = row || {};
      txHashId && navigate(`/tx/${txHashId}`);
    }
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
        {!isTxsFiltered && <Filters />}

        <div className="txs-pagination">
          <PaginationComponent />
        </div>
      </div>

      <div className="table-container">
        <Table
          className="txs"
          columns={
            isDesktop
              ? columns
              : [
                  ...columns,
                  {
                    Header: "VIEW DETAILS",
                    accessor: "viewDetails",
                  },
                ]
          }
          data={parsedTxsData}
          emptyMessage="No transactions found."
          isLoading={isPaginationLoading}
          numberOfColumns={8}
          onRowClick={onRowClick}
        />
      </div>

      <div className="txs-pagination txs-pagination-bottom">
        <PaginationComponent />
      </div>
    </section>
  );
};

export { Information };
