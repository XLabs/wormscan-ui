import { CSSProperties, useEffect } from "react";
import {
  useTable,
  Column,
  useSortBy,
  TableState,
  UseTableOptions,
  UseSortByOptions,
} from "react-table";
import "./styles.scss";
import { ArrowUpIcon } from "src/icons/generic";

type Props<T extends object> = {
  className?: string;
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  hasSort?: boolean;
  isLoading?: boolean;
  numberOfColumns?: number;
  onRowClick?: (row: any) => void;
  sortBy?: { id: string; desc: boolean }[];
};

const Table = <T extends object>({
  className,
  columns,
  data,
  emptyMessage = "No items found.",
  hasSort = false,
  isLoading = false,
  numberOfColumns = 7,
  onRowClick,
  sortBy = [],
}: Props<T>) => {
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow, setSortBy } = useTable(
    {
      columns,
      data,
      initialState: { sortBy } as Partial<TableState<T>>,
      disableSortRemove: true,
    } as UseTableOptions<T> & UseSortByOptions<T>,
    useSortBy,
  );

  useEffect(() => {
    if (sortBy.length > 0) {
      setSortBy(sortBy);
    }
  }, [sortBy, setSortBy]);

  return (
    <>
      <table
        {...getTableProps()}
        className={`table ${hasSort ? "table-sort" : ""} ${
          onRowClick ? "table-clickable" : ""
        } ${className}`}
      >
        <thead className="table-head">
          {headerGroups.map((headerGroup, index) => (
            <tr key={index} {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column: any, index) => {
                const style: CSSProperties = column.style as CSSProperties;
                const sortIcon = hasSort && (
                  <span className="table-head-th-container-arrow">
                    {column.isSorted ? (
                      <ArrowUpIcon
                        style={{
                          rotate: column.isSortedDesc ? "180deg" : "0deg",
                        }}
                        width={24}
                      />
                    ) : (
                      ""
                    )}
                  </span>
                );

                return (
                  <th
                    key={index}
                    {...column.getHeaderProps(hasSort ? column.getSortByToggleProps() : {})}
                    style={{
                      ...style,
                      color: column.isSorted ? "var(--color-white)" : "var(--color-gray-400)",
                    }}
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
                  setTimeout(() => {
                    (row.original as any).justAppeared = false;
                  });
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
