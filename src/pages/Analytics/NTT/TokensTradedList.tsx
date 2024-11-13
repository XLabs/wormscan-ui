import { useState, useMemo } from "react";
import { CrossIcon, FilterListIcon, Rectangle3DIcon2 } from "src/icons/generic";
import { BREAKPOINTS } from "src/consts";
import { Select } from "src/components/atoms";
import { Table } from "src/components/organisms";
import { useLockBodyScroll, useNavigateCustom, useWindowSize } from "src/utils/hooks";
import {
  COLUMNS_NTT,
  initialSortStateNtt,
  IRowToken,
  SORT_LOW_HIGH_LIST_NTT,
  SORT_TRANSFERS_NTT,
} from "src/utils/nttUtils";

interface Props {
  data: IRowToken[];
  isLoading: boolean;
  isError: boolean;
}

export const TokensTradedList = ({ data, isLoading, isError }: Props) => {
  const { width } = useWindowSize();
  const [sortState, setSortState] = useState(initialSortStateNtt);
  const isDesktop = width >= BREAKPOINTS.desktop;
  const [openSortBy, setOpenSortBy] = useState(false);
  const navigate = useNavigateCustom();
  useLockBodyScroll({ isLocked: !isDesktop && openSortBy });

  const columns = useMemo(() => {
    return isDesktop
      ? COLUMNS_NTT
      : [...COLUMNS_NTT, { Header: "VIEW DETAILS", accessor: "viewDetails" as keyof IRowToken }];
  }, [isDesktop]);

  const handleSelectedSortBy = (value: { label: string; value: string }) => {
    setSortState(prevState => ({
      ...prevState,
      selectedSortBy: value,
      sortBy: [{ id: value.value, desc: prevState.selectedSortLowHigh.value }],
    }));
  };

  const handleSelectedSortLowHigh = (value: { label: string; value: boolean }) => {
    setSortState(prevState => ({
      ...prevState,
      selectedSortLowHigh: value,
      sortBy: [{ id: prevState.selectedSortBy.value, desc: value.value }],
    }));
  };

  const handleReset = () => {
    setSortState(initialSortStateNtt);
    setOpenSortBy(false);
  };

  return (
    <div className="ntt-page-tokens-list">
      <h3 className="ntt-page-tokens-list-title">
        <Rectangle3DIcon2 /> Tokens Transferred via NTT
        <button
          className="sort-by-btn"
          aria-label="Sort by"
          aria-expanded={openSortBy}
          onClick={() => setOpenSortBy(!openSortBy)}
        >
          <FilterListIcon width={24} />
        </button>
      </h3>

      {isError ? (
        <div className="ntt-page-tokens-list-error">Failed to get tokens</div>
      ) : (
        <div className="ntt-page-tokens-list-table">
          <Table
            columns={columns}
            data={data}
            emptyMessage="There are no transactions."
            hasSort={true}
            isLoading={isLoading}
            sortBy={sortState.sortBy}
            onRowClick={v => {
              window.scrollTo(0, 0);

              if (isDesktop) {
                return navigate(`/analytics/ntt/${v.coingecko_id}/${v.symbol}`);
              }
            }}
          />
        </div>
      )}

      <div className={`ntt-page-tokens-list-mobile-filters ${openSortBy ? "open" : ""}`}>
        <div className="ntt-page-tokens-list-mobile-filters-top">
          <h4>Sort by</h4>
          <button
            className="ntt-page-tokens-list-mobile-filters-top-btn"
            onClick={() => setOpenSortBy(false)}
          >
            <CrossIcon width={24} />
          </button>
        </div>

        <Select
          ariaLabel="Select sort by"
          className="ntt-page-tokens-list-mobile-filters-select"
          items={SORT_TRANSFERS_NTT}
          menuFixed
          menuListStyles={{ maxHeight: "unset" }}
          name="topAssetTimeRange"
          onValueChange={handleSelectedSortBy}
          optionStyles={{ padding: 16 }}
          value={sortState.selectedSortBy}
        />

        <Select
          ariaLabel="Select sort low to high"
          className="ntt-page-tokens-list-mobile-filters-select"
          items={SORT_LOW_HIGH_LIST_NTT}
          menuFixed
          name="topAssetTimeRange"
          onValueChange={handleSelectedSortLowHigh}
          optionStyles={{ padding: 16 }}
          value={sortState.selectedSortLowHigh}
        />

        <div className="ntt-page-tokens-list-mobile-filters-btns">
          <button
            className="ntt-page-tokens-list-mobile-filters-btns-apply"
            onClick={() => setOpenSortBy(false)}
          >
            Apply
          </button>

          <button
            className="ntt-page-tokens-list-mobile-filters-btns-reset"
            disabled={
              sortState.selectedSortBy.value === initialSortStateNtt.selectedSortBy.value &&
              sortState.selectedSortLowHigh.value === initialSortStateNtt.selectedSortLowHigh.value
            }
            onClick={handleReset}
          >
            Reset
          </button>
        </div>
      </div>
      {openSortBy && (
        <div
          className="ntt-page-tokens-list-mobile-filters-overlay"
          onClick={() => setOpenSortBy(false)}
        ></div>
      )}
    </div>
  );
};
