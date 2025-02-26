import { Row, Column } from "react-table";
import { Tooltip } from "src/components/atoms";
import { InfoCircleIcon } from "src/icons/generic";

export const sortTableByString =
  <T extends object>(key: keyof T) =>
  (rowA: Row<T>, rowB: Row<T>) => {
    const a = String(rowA.original[key] || "").toUpperCase();
    const b = String(rowB.original[key] || "").toUpperCase();
    return a.localeCompare(b);
  };

export const sortTableByNumber =
  <T extends object>(key: keyof T) =>
  (rowA: Row<T>, rowB: Row<T>) => {
    return (rowA.original[key] as number) - (rowB.original[key] as number);
  };

// NTT
export interface IRowTokenNTT {
  symbol: string;
  coingecko_id: string;
  tvtNumber: number;
  volumeNumber: number;
  circulatingSupplyNumber: number;
  fullyDilutedNumber: number;
  priceNumber: number;
  token: React.ReactNode;
  tvt: React.ReactNode;
  volume: React.ReactNode;
  circulatingSupply: React.ReactNode;
  fullyDilutedValuation: React.ReactNode;
  price: React.ReactNode;
  viewDetails: React.ReactNode;
}

export const COLUMNS_NTT: Column<IRowTokenNTT>[] | any = [
  { Header: "Token", accessor: "token", sortType: sortTableByString<IRowTokenNTT>("symbol") },
  {
    Header: "Fully Diluted Valuation",
    accessor: "fullyDilutedValuation",
    sortType: sortTableByNumber<IRowTokenNTT>("fullyDilutedNumber"),
  },
  {
    Header: "Circulating Supply",
    accessor: "circulatingSupply",
    sortType: sortTableByNumber<IRowTokenNTT>("circulatingSupplyNumber"),
  },
  {
    Header: "Total Value Transferred",
    accessor: "tvt",
    sortType: sortTableByNumber<IRowTokenNTT>("tvtNumber"),
  },
  // { Header: "24h Volume", accessor: "volume", sortType: sortTableByNumber("volumeNumber") },
  { Header: "Price", accessor: "price", sortType: sortTableByNumber<IRowTokenNTT>("priceNumber") },
];

// Asset Secured
export interface IRowAssetSecured {
  tokenString: string;
  typeString: string;
  fdvTvlNumber: number;
  tvtNumber: number;
  chainsSupportedNumber: number;
  token: React.ReactNode;
  type: React.ReactNode;
  fdvTvl: React.ReactNode;
  tvt: React.ReactNode;
  chainsSupported: React.ReactNode;
}

export const COLUMNS_ASSET_SECURED: Column<any>[] | any = [
  {
    Header: "Token",
    accessor: "token",
    sortType: sortTableByString<IRowAssetSecured>("tokenString"),
  },
  { Header: "Type", accessor: "type", sortType: sortTableByString<IRowAssetSecured>("typeString") },
  {
    Header: "FDV/TVL",
    accessor: "fdvTvl",
    Tooltip: (
      <Tooltip
        className="governor-container-table-title-tooltip"
        maxWidth={false}
        tooltip={
          <div>
            FDV (Fully diluted valuation) is shown for NATIVE_TOKEN_TRANSFER
            <br />
            TVL (Total value locked) is shown for PORTAL_TOKEN_BRIDGE
          </div>
        }
        type="info"
      >
        <div>
          <InfoCircleIcon />
        </div>
      </Tooltip>
    ),
    sortType: sortTableByNumber<IRowAssetSecured>("fdvTvlNumber"),
  },
  {
    Header: "Total Value Transferred",
    accessor: "tvt",
    sortType: sortTableByNumber<IRowAssetSecured>("tvtNumber"),
  },
  {
    Header: "Chains Supported",
    accessor: "chainsSupported",
    sortType: sortTableByNumber<IRowAssetSecured>("chainsSupportedNumber"),
  },
];
