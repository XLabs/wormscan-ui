import { CSSProperties } from "react";
import {
  useTable,
  Column,
  useSortBy,
  TableState,
  UseTableOptions,
  UseSortByOptions,
} from "react-table";
import { ArrowDownIcon, ArrowUpIcon } from "@radix-ui/react-icons";
import "./styles.scss";

type Props<T extends object> = {
  className?: string;
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  hasSort?: boolean;
  initialSortById?: string;
  isLoading?: boolean;
  numberOfColumns?: number;
  onRowClick?: (row: any) => void;
};

const Table = <T extends object>({
  className,
  columns,
  data,
  emptyMessage = "No items found.",
  hasSort = false,
  initialSortById,
  isLoading = false,
  numberOfColumns = 7,
  onRowClick,
}: Props<T>) => {
  const tableHooks = hasSort ? [useSortBy] : [];
  const initialState = initialSortById ? { sortBy: [{ id: initialSortById, desc: true }] } : {};
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
    {
      columns,
      data,
      initialState: initialState as Partial<TableState<T>>,
      disableSortRemove: true,
    } as UseTableOptions<T> & UseSortByOptions<T>,
    ...tableHooks,
  );

  return (
    <>
      <table {...getTableProps()} className={`table ${className}`}>
        <thead className="table-head">
          {headerGroups.map((headerGroup, index) => (
            <tr key={index} {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column: any, index) => {
                const style: CSSProperties = column.style as CSSProperties;
                const sortIcon = hasSort && (
                  <span className="table-head-th-container-arrow">
                    {column.isSorted ? (
                      column.isSortedDesc ? (
                        <ArrowDownIcon height={18} width={18} />
                      ) : (
                        <ArrowUpIcon height={18} width={18} />
                      )
                    ) : (
                      ""
                    )}
                  </span>
                );

                return (
                  <th
                    key={index}
                    {...column.getHeaderProps(hasSort ? column.getSortByToggleProps() : {})}
                    style={style}
                  >
                    <div className="table-head-th-container">
                      {index !== 0 && sortIcon}
                      {column.render("Header")}
                      {index === 0 && sortIcon}
                    </div>
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        {isLoading ? (
          <tbody>
            {[...Array(50)].map((_, index) => (
              <tr key={index}>
                <td className="table-row-loading" colSpan={numberOfColumns}>
                  <span className="loading-animation"></span>
                </td>
              </tr>
            ))}
          </tbody>
        ) : (
          rows?.length > 0 && (
            <tbody {...getTableBodyProps()}>
              {rows.map((row, index) => {
                prepareRow(row);
                const justAppeared = (row?.original as any)?.justAppeared;
                const txHash = (row?.original as any)?.txHashId;

                if (justAppeared) {
                  (row.original as any).justAppeared = false;
                }

                return (
                  <tr
                    key={index + txHash}
                    className={justAppeared ? "appear" : ""}
                    {...row.getRowProps()}
                    onClick={() => onRowClick && onRowClick(row.original)}
                  >
                    {row.cells.map((cell, index) => {
                      const style: CSSProperties = (cell.column as any).style;
                      return (
                        <td key={index} {...cell.getCellProps()} style={{ ...style }}>
                          {cell.render("Cell")}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          )
        )}
      </table>
      {!isLoading && rows?.length <= 0 && <div className="table-body-empty">{emptyMessage}</div>}
    </>
  );
};

export default Table;
