import { CSSProperties, Fragment, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  useTable,
  Column,
  useSortBy,
  TableState,
  UseTableOptions,
  UseSortByOptions,
  TableInstance,
} from "react-table";
import { CrossIcon, FilterListIcon, SortByIcon } from "src/icons/generic";
import analytics from "src/analytics";
import { useEnvironment } from "src/context/EnvironmentContext";
import { Select } from "src/components/atoms";
import { useLockBodyScroll, useWindowSize } from "src/utils/hooks";
import { BREAKPOINTS } from "src/consts";
import "./styles.scss";

type Props<T extends object> = {
  className?: string;
  columns: Column<T>[];
  data: T[];
  defaultSortBy?: { id: string; desc: boolean };
  emptyMessage?: string | JSX.Element;
  isLoading?: boolean;
  numberOfColumns?: number;
  numberOfRows?: number;
  onRowClick?: (row: any) => void;
  trackTxsSortBy?: boolean;
  startIndex?: number;
  endIndex?: number;
  urlSorting?: boolean;
  urlSortBy?: { id: string; desc: boolean };
};

type ExtendedTableInstance<T extends object> = TableInstance<T> & {
  setSortBy?: (updater: any) => void;
};

const Table = <T extends object>({
  className,
  columns,
  data,
  defaultSortBy,
  emptyMessage = "No items found.",
  isLoading = false,
  numberOfColumns = 7,
  numberOfRows = 50,
  onRowClick,
  trackTxsSortBy = false,
  startIndex,
  endIndex,
  urlSorting = false,
  urlSortBy,
}: Props<T>) => {
  const { environment } = useEnvironment();
  const [openSortBy, setOpenSortBy] = useState(false);
  const [currentSortBy, setCurrentSortBy] = useState(urlSortBy || defaultSortBy);
  const { width } = useWindowSize();
  const isDesktop = width >= BREAKPOINTS.desktop;
  const [searchParams, setSearchParams] = useSearchParams();

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
      initialState: { sortBy: defaultSortBy ? [urlSortBy || defaultSortBy] : [] } as Partial<
        TableState<T>
      >,
      disableSortRemove: true,
    } as UseTableOptions<T> & UseSortByOptions<T>,
    useSortBy,
  );

  const updateURL = useCallback(
    (sortBy: string, desc: boolean) => {
      setSearchParams(prevParams => {
        const newParams = new URLSearchParams(prevParams);
        newParams.set("sortBy", sortBy);
        newParams.set("order", desc ? "desc" : "asc");
        if (newParams.has("page")) {
          newParams.set("page", "1");
        }
        return newParams;
      });

      setSortBy([{ id: sortBy, desc }]);
    },
    [setSearchParams, setSortBy],
  );

  useEffect(() => {
    const sortedColumn = headerGroups.flatMap(group =>
      // @ts-expect-error Property 'isSorted' exists at runtime but TypeScript doesn't know about it
      group.headers.filter(col => col.isSorted),
    )[0];

    if (sortedColumn) {
      setCurrentSortBy({
        id: sortedColumn.id,
        // @ts-expect-error Property 'isSortedDesc' exists at runtime but TypeScript doesn't know about it
        desc: sortedColumn.isSortedDesc || false,
      });
    }
  }, [headerGroups]);

  const handleReset = () => {
    if (urlSorting) {
      setSearchParams(prevParams => {
        const newParams = new URLSearchParams(prevParams);
        newParams.delete("sortBy");
        newParams.delete("order");
        newParams.set("page", "1");
        return newParams;
      });
    }

    setSortBy([defaultSortBy]);
    setCurrentSortBy(defaultSortBy);

    setOpenSortBy(false);
  };

  useLockBodyScroll({ isLocked: !isDesktop && openSortBy });

  const visibleRows =
    startIndex !== undefined || endIndex !== undefined
      ? rows.slice(startIndex ?? 0, endIndex ?? rows.length)
      : rows;

  return (
    <>
      {defaultSortBy && (
        <>
          <div
            className={`table-mobile-filters-overlay ${openSortBy ? "open" : ""}`}
            onClick={() => setOpenSortBy(false)}
          />

          <button
            aria-expanded={openSortBy}
            aria-label="Sort by"
            className="table-sort-by-btn"
            onClick={() => setOpenSortBy(!openSortBy)}
          >
            <FilterListIcon width={24} />
          </button>

          <div className={`table-mobile-filters ${openSortBy ? "open" : ""}`}>
            <div className="table-mobile-filters-top">
              <h4>Sort by</h4>
              <button
                className="table-mobile-filters-top-btn"
                onClick={() => setOpenSortBy(false)}
                aria-label="Close sort options"
              >
                <CrossIcon width={24} />
              </button>
            </div>

            {headerGroups.map((headerGroup, index) => {
              return (
                <Fragment key={index}>
                  <Select
                    ariaLabel="Sort column"
                    className="table-mobile-filters-select"
                    items={headerGroup.headers
                      .filter(
                        (column: any) => column.render("Header").toString() !== "View Details",
                      )
                      .map((column: any) => ({
                        value: column.id,
                        label: column.render("Header").toString(),
                      }))}
                    menuFixed
                    menuListStyles={{ maxHeight: "unset" }}
                    name="Sort column"
                    onValueChange={selected => {
                      const selectedColumn = headerGroup.headers.find(
                        (col: any) => col.id === selected.value,
                      );

                      if (selectedColumn) {
                        setCurrentSortBy(prev => ({
                          id: selected.value,
                          desc: prev.desc,
                        }));
                        // @ts-expect-error Property 'toggleSortBy' exists at runtime but TypeScript doesn't know about it
                        selectedColumn.toggleSortBy(currentSortBy.desc);
                        urlSorting && updateURL(selected.value, currentSortBy.desc);
                      }
                    }}
                    optionStyles={{ padding: 16 }}
                    value={{
                      value: currentSortBy.id,
                      label:
                        headerGroup.headers
                          .find((column: any) => column.id === currentSortBy.id)
                          ?.render("Header") || "Sort",
                    }}
                  />

                  <Select
                    ariaLabel="Sort order"
                    className="table-mobile-filters-select"
                    items={[
                      { value: false, label: "Low to High" },
                      { value: true, label: "High to Low" },
                    ]}
                    menuFixed
                    menuListStyles={{ maxHeight: "unset" }}
                    name="Sort order"
                    onValueChange={selected => {
                      setCurrentSortBy(prev => ({ ...prev, desc: selected.value }));

                      const column = headerGroup.headers.find(
                        (col: any) => col.id === currentSortBy.id,
                      );
                      if (column) {
                        // @ts-expect-error Property 'toggleSortBy' exists at runtime but TypeScript doesn't know about it
                        column.toggleSortBy(selected.value);
                        urlSorting && updateURL(currentSortBy.id, selected.value);
                      }
                    }}
                    optionStyles={{ padding: 16 }}
                    value={{
                      value: currentSortBy.desc,
                      label: currentSortBy.desc ? "High to Low" : "Low to High",
                    }}
                  />
                </Fragment>
              );
            })}

            <div className="table-mobile-filters-btns">
              <button
                className="table-mobile-filters-btns-apply"
                onClick={() => setOpenSortBy(false)}
              >
                Apply
              </button>
              <button className="table-mobile-filters-btns-reset" onClick={handleReset}>
                Reset
              </button>
            </div>
          </div>
        </>
      )}

      <table
        {...getTableProps()}
        className={`table ${defaultSortBy ? "table-sortable" : ""} ${
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

                if (urlSorting) {
                  setTimeout(() => {
                    const sortedColumn = headerGroup.headers.find((header: any) => header.isSorted);
                    // @ts-expect-error Property 'isSortedDesc' exists at runtime but TypeScript doesn't know about it
                    updateURL(sortedColumn.id, sortedColumn.isSortedDesc);
                  }, 0);
                }
              }}
            >
              {headerGroup.headers.map((column: any, index) => {
                const style: CSSProperties = column.style as CSSProperties;
                const sortIcon = defaultSortBy && (
                  <span className="table-head-th-container-arrow">
                    <SortByIcon
                      sortBy={column.isSorted ? (column.isSortedDesc ? "DSC" : "ASC") : null}
                    />
                  </span>
                );

                return (
                  <th
                    key={index}
                    {...column.getHeaderProps(
                      defaultSortBy
                        ? {
                            ...column.getSortByToggleProps(),
                            onClick: (e: any) => {
                              e.preventDefault();
                              column.toggleSortBy(column.isSorted ? !column.isSortedDesc : true);
                            },
                          }
                        : {},
                    )}
                    style={{
                      ...style,
                      color: column.isSorted ? "var(--color-white)" : "var(--color-gray-400)",
                    }}
                  >
                    <div className="table-head-th-container">
                      {column.render("Header")} {column?.Tooltip && column.Tooltip}
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
              {visibleRows.map((row, index) => {
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
