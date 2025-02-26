import { useCallback, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "react-query";
import analytics from "src/analytics";
import { getClient } from "src/api/Client";
import { BaseLayout } from "src/layouts/BaseLayout";
import { useEnvironment } from "src/context/EnvironmentContext";
import { NTT_APP_ID, NTT_URL } from "src/consts";
import { Pagination, ProtocolIcon } from "src/components/atoms";
import { Table } from "src/components/organisms";
import { COLUMNS_ASSET_SECURED } from "src/utils/tableUtils";
import { formatNumber } from "src/utils/number";
import { Rectangle3DIcon2 } from "src/icons/generic";
import { ChainsSupported } from "./ChainsSupported";
import "./styles.scss";

const AssetSecured = () => {
  useEffect(() => {
    analytics.page({ title: "ANALYTICS-ASSETS-SECURED-BY-WORMHOLE" });
  }, []);

  const { environment } = useEnvironment();
  const isMainnet = environment.network === "Mainnet";

  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;
  const sortByParam = searchParams.get("sortBy") || "tvt";
  const orderParam = searchParams.get("order") || "desc";

  const setCurrentPage = useCallback(
    (pageNumber: number) => {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("page", String(pageNumber));
      setSearchParams(newParams);
    },
    [searchParams, setSearchParams],
  );

  const { data, isFetching, isError } = useQuery(
    ["assetsSecuredByWormhole", isMainnet],
    async () => {
      const dataTokensList = await getClient().guardianNetwork.getSecuredTokensByWormhole();

      return dataTokensList.map(item => ({
        tokenString: item.symbol.trim(),
        typeString: item.type,
        fullyDilutedNumber: +item.fully_diluted_valuation || 0,
        fdvTvlNumber: +item.total_value_locked || +item.fully_diluted_valuation || 0,
        tvtNumber: +item.total_value_transferred || 0,
        chainsSupportedNumber: Object.entries(item.platforms).length,
        token: (
          <div className="asset-secured-list-table-item token">
            <h4>TOKEN</h4>
            <img
              src={`https://coin-images.coingecko.com/coins/images/35087/small/womrhole_logo_full_color_rgb_2000px_72ppi_fb766ac85a.png`}
              alt={`${item.symbol} icon`}
              height="24"
              width="24"
              className="top-asset-list-row-item-to-icon"
              loading="lazy"
            />
            {item.symbol}
          </div>
        ),
        type: (
          <div className="asset-secured-list-table-item">
            <h4>TYPE</h4>
            {item.type}
          </div>
        ),
        fdvTvl: (
          <div className="asset-secured-list-table-item">
            <h4>
              {item.type === "PORTAL_TOKEN_BRIDGE"
                ? "TOTAL VALUE LOCKED"
                : "FULLY DILUTED VALUATION"}
            </h4>
            {formatNumber(+item.total_value_locked || +item.fully_diluted_valuation, 0)}
          </div>
        ),
        tvt: (
          <div className="asset-secured-list-table-item">
            <h4>TOTAL VALUE TRANSFERRED</h4>${formatNumber(+item.total_value_transferred, 0)}
          </div>
        ),
        chainsSupported: (
          <div className="asset-secured-list-table-item">
            <h4>CHAINS</h4>
            <ChainsSupported item={item} />
          </div>
        ),
      }));
    },
    {
      enabled: isMainnet,
    },
  );

  const totalItems = useMemo(() => data?.length || 0, [data]);
  const totalPages = Math.ceil(totalItems / 20);

  const PaginationComponent = () => (
    <Pagination
      className="asset-secured-pagination"
      currentPage={currentPage}
      goFirstPage={() => setCurrentPage(1)}
      goLastPage={() => setCurrentPage(totalPages)}
      goPrevPage={() => setCurrentPage(Math.max(1, currentPage - 1))}
      goNextPage={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
      goPage={setCurrentPage}
      disableNextButton={currentPage >= totalPages}
      totalPages={totalPages}
    />
  );

  return (
    <BaseLayout>
      <div className="asset-secured">
        <h1 className="asset-secured-title">
          <ProtocolIcon protocol={NTT_APP_ID} width={24} /> Assets Secured By Wormhole
        </h1>

        <p className="asset-secured-description">
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Asperiores iste ducimus dicta
          doloribus laudantium blanditiis numquam, temporibus ut deserunt. Expedita vel quae
          accusamus vero quos saepe ab, porro veritatis!.{" "}
          <a
            className="governor-header-description-link"
            href={NTT_URL}
            target="_blank"
            rel="noreferrer"
          >
            Learn more
          </a>
        </p>

        <div className="asset-secured-list">
          <div className="asset-secured-list-header">
            <h3 className="asset-secured-list-header-title">
              <Rectangle3DIcon2 /> Assets
            </h3>

            <PaginationComponent />
          </div>

          {isError ? (
            <div className="asset-secured-list-error">Failed to get tokens</div>
          ) : (
            <div className="asset-secured-list-table">
              <Table
                columns={COLUMNS_ASSET_SECURED}
                data={data?.length > 0 ? data : []}
                numberOfRows={20}
                emptyMessage="There are no transactions."
                isLoading={isFetching}
                defaultSortBy={{ id: "tvt", desc: true }}
                urlSortBy={{ id: sortByParam, desc: orderParam === "desc" }}
                startIndex={(currentPage - 1) * 20}
                endIndex={currentPage * 20}
                urlSorting
              />
            </div>
          )}

          <div className="asset-secured-list-bottom">
            <PaginationComponent />
          </div>
        </div>
      </div>
    </BaseLayout>
  );
};

export default AssetSecured;
