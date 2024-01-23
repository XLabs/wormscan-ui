import { CSSProperties } from "react";
import { useTable, Column } from "react-table";
import "./styles.scss";

type Props<T extends object> = {
  className?: string;
  columns?: Column<T>[];
  data?: T[];
  emptyMessage?: string;
  isLoading?: boolean;
  onRowClick?: (row: any) => void;
};

const Table = <T extends object>({
  className,
  columns,
  data,
  emptyMessage = "No items found.",
  isLoading,
  onRowClick,
}: Props<T>) => {
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({
    columns,
    data,
  });

  return (
    <>
      <table {...getTableProps()} className={`table ${className}`}>
        <thead className="table-head">
          {headerGroups.map((headerGroup, index) => (
            <tr key={index} {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column, index) => {
                const style: CSSProperties = (column as any).style;

                return (
                  <th key={index} {...column.getHeaderProps()} style={{ ...style }}>
                    {column.render("Header")}
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
                <td className="table-row-loading" colSpan={6}>
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
                return (
                  <tr
                    key={index}
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
