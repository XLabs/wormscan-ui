import { Column, Row } from "react-table";

export interface IRowToken {
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

const sortBySymbol = (rowA: Row<IRowToken>, rowB: Row<IRowToken>) => {
  const a = rowA.original.symbol.toUpperCase();
  const b = rowB.original.symbol.toUpperCase();
  return a.localeCompare(b);
};

const sortByNumber = (key: keyof IRowToken) => (rowA: Row<IRowToken>, rowB: Row<IRowToken>) => {
  return (rowA.original[key] as number) - (rowB.original[key] as number);
};

export const COLUMNS_NTT: Column<IRowToken>[] | any = [
  { Header: "Token", accessor: "token", sortType: sortBySymbol },
  {
    Header: "Fully Diluted Valuation",
    accessor: "fullyDilutedValuation",
    sortType: sortByNumber("fullyDilutedNumber"),
  },
  {
    Header: "Circulating Supply",
    accessor: "circulatingSupply",
    sortType: sortByNumber("circulatingSupplyNumber"),
  },
  { Header: "Total Value Transferred", accessor: "tvt", sortType: sortByNumber("tvtNumber") },
  { Header: "24h Volume", accessor: "volume", sortType: sortByNumber("volumeNumber") },
  { Header: "Price", accessor: "price", sortType: sortByNumber("priceNumber") },
];
