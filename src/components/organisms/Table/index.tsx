import { CSSProperties } from "react";
import { useTable, Column } from "react-table";
import "./styles.scss";

type Props<T extends object> = {
  columns: Column<T>[];
  data: T[];
  className?: string;
  onRowClick?: (row: any) => void;
};

const Table = <T extends object>({ columns, data, className, onRowClick }: Props<T>) => {
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({
    columns,
    data,
  });

  return (
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
      <tbody {...getTableBodyProps()} className="table-body">
        {rows.map((row, index) => {
          prepareRow(row);
          return (
            /* tslint:disable-next-line */
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
    </table>
  );
};

export default Table;
