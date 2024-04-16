import { CSSProperties } from "react";
import { useTable, Column, useSortBy } from "react-table";
import { ArrowDownIcon, ArrowUpIcon } from "@radix-ui/react-icons";
import "./styles.scss";

type Props<T extends object> = {
  className?: string;
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  hasSort?: boolean;
  isLoading?: boolean;
  onRowClick?: (row: any) => void;
};

const Table = <T extends object>({
  className,
  columns,
  data,
  emptyMessage = "No items found.",
  hasSort = false,
  isLoading = false,
  onRowClick,
}: Props<T>) => {
  const tableHooks = [useSortBy];
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
    {
      columns,
      data,
      initialState: { sortBy: [{ id: "chainId.name", desc: false }] } as any,
    },
    ...(hasSort ? tableHooks : []),
  );

  return (
    <>
      <table {...getTableProps()} className={`table ${className}`}>
        <thead className="table-head">
          {headerGroups.map((headerGroup, index) => (
            <tr key={index} {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column, index) => {
                const style: CSSProperties = (column as any).style;
                return (
                  <th
                    key={index}
                    {...column.getHeaderProps(hasSort ? column.getSortByToggleProps() : {})}
                    style={{ ...style }}
                  >
                    {hasSort && index !== 0 && column.isSorted && (
                      <span className="table-head-arrow">
                        {column.isSortedDesc ? (
                          <ArrowDownIcon height={16} width={16} />
                        ) : (
                          <ArrowUpIcon height={16} width={16} />
                        )}
                      </span>
                    )}

                    {column.render("Header")}

                    {hasSort && index === 0 && column.isSorted && (
                      <span className="table-head-arrow">
                        {column.isSortedDesc ? (
                          <ArrowDownIcon height={16} width={16} />
                        ) : (
                          <ArrowUpIcon height={16} width={16} />
                        )}
                      </span>
                    )}
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
                <td className="table-row-loading" colSpan={7}>
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
