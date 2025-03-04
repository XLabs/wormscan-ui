import { useMemo } from "react";
import { Rectangle3DIcon2 } from "src/icons/generic";
import { BREAKPOINTS } from "src/consts";
import { Table } from "src/components/organisms";
import { useNavigateCustom, useWindowSize } from "src/utils/hooks";
import { COLUMNS_NTT, IRowTokenNTT } from "src/utils/tableUtils";

interface Props {
  data: IRowTokenNTT[];
  isLoading: boolean;
  isError: boolean;
}

export const TokensTradedList = ({ data, isLoading, isError }: Props) => {
  const { width } = useWindowSize();
  const isDesktop = width >= BREAKPOINTS.desktop;
  const navigate = useNavigateCustom();

  const columns = useMemo(() => {
    return isDesktop
      ? COLUMNS_NTT
      : [...COLUMNS_NTT, { Header: "View Details", accessor: "viewDetails" as keyof IRowTokenNTT }];
  }, [isDesktop]);

  return (
    <div className="ntt-page-tokens-list">
      <h3 className="ntt-page-tokens-list-title">
        <Rectangle3DIcon2 /> Tokens Transferred via NTT
      </h3>

      {isError ? (
        <div className="ntt-page-tokens-list-error">Failed to get tokens</div>
      ) : (
        <div className="ntt-page-tokens-list-table">
          <Table
            columns={columns}
            data={data?.length > 0 ? data : []}
            emptyMessage="There are no transactions."
            isLoading={isLoading}
            defaultSortBy={{
              id: "fullyDilutedValuation",
              desc: true,
            }}
            onRowClick={v => {
              if (isDesktop) {
                window.scrollTo(0, 0);
                return navigate(`/analytics/ntt/${v.coingecko_id}/${v.symbol}`);
              }
            }}
          />
        </div>
      )}
    </div>
  );
};
