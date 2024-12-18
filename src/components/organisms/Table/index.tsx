import { CSSProperties, useEffect } from "react";
import {
  useTable,
  Column,
  useSortBy,
  TableState,
  UseTableOptions,
  UseSortByOptions,
  TableInstance,
} from "react-table";
import { SortByIcon } from "src/icons/generic";
import "./styles.scss";
import analytics from "src/analytics";
import { useEnvironment } from "src/context/EnvironmentContext";

type Props<T extends object> = {
  className?: string;
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string | JSX.Element;
  hasSort?: boolean;
  isLoading?: boolean;
  numberOfColumns?: number;
  numberOfRows?: number;
  onRowClick?: (row: any) => void;
  sortBy?: { id: string; desc: boolean }[];
  trackTxsSortBy?: boolean;
};

type ExtendedTableInstance<T extends object> = TableInstance<T> & {
  setSortBy?: (updater: any) => void;
};

const Table = <T extends object>({
  className,
  columns,
  data,
  emptyMessage = "No items found.",
  hasSort = false,
  isLoading = false,
  numberOfColumns = 7,
  numberOfRows = 50,
  onRowClick,
  sortBy = [],
  trackTxsSortBy = false,
}: Props<T>) => {
  const { environment } = useEnvironment();

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    setSortBy,
  }: ExtendedTableInstance<T> = useTable(
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
  }, [sortBy, setSortBy, environment.network]);

  return (
    <>
      <table
        {...getTableProps()}
        className={`table ${hasSort ? "table-sortable" : ""} ${
          onRowClick ? "table-clickable" : ""
        } ${className}`}
      >
        <thead className="table-head">
          {headerGroups.map((headerGroup, index) => (
            <tr
              key={index}
              {...headerGroup.getHeaderGroupProps()}
              onClick={() => {
                if (trackTxsSortBy) {
                  setTimeout(() => {
                    const sortedColumn = headerGroup.headers.find((header: any) => header.isSorted);

                    analytics.track("txsSortBy", {
                      network: environment.network,
                      selected: sortedColumn?.id,
                      // @ts-expect-error Property 'isSortedDesc' exists at runtime but TypeScript doesn't know about it
                      selectedType: sortedColumn?.isSortedDesc ? "desc" : "asc",
                    });
                  }, 0);
                }
              }}
            >
              {headerGroup.headers.map((column: any, index) => {
                const style: CSSProperties = column.style as CSSProperties;
                const sortIcon = hasSort && (
                  <span className="table-head-th-container-arrow">
                    <SortByIcon
                      sortBy={column.isSorted ? (column.isSortedDesc ? "DSC" : "ASC") : null}
                    />
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
                      {column.render("Header")}
                      {sortIcon}
                    </div>
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        {isLoading ? (
          <tbody>
            {[...Array(numberOfRows)].map((_, index) => (
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
