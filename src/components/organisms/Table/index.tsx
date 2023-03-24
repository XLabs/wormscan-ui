import { CSSProperties } from "react";
import { useTable, Column } from "react-table";
import "./styles.scss";

type Props<T extends object> = {
  columns: Column<T>[];
  data: T[];
  className?: string;
};

const Table = <T extends object>({ columns, data, className }: Props<T>) => {
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({
    columns,
    data,
  });

  return (
    <table {...getTableProps()} className={`table ${className}`}>
      <thead className="table-head">
        {headerGroups.map(headerGroup => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map(column => {
              const style: CSSProperties = (column as any).style;

              return (
                <th {...column.getHeaderProps()} style={{ ...style }}>
                  {column.render("Header")}
                </th>
              );
            })}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()} className="table-body">
        {rows.map(row => {
          prepareRow(row);
          return (
            <tr {...row.getRowProps()}>
              {row.cells.map(cell => {
                const style: CSSProperties = (cell.column as any).style;
                return (
                  <td {...cell.getCellProps()} style={{ ...style }}>
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
