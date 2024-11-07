import { Column, Row } from "react-table";

export interface IRowToken {
  coingecko_id: string;
  symbol: string;
  priceNumber: number;
  priceVariationNumber: number;
  circulatingSupplyNumber: number;
  marketCapNumber: number;
  volumeNumber: number;
  token: React.ReactNode;
  price: React.ReactNode;
  priceVariation: React.ReactNode;
  circulatingSupply: React.ReactNode;
  marketCap: React.ReactNode;
  volume: React.ReactNode;
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

export const COLUMNS_NTT: Column<IRowToken>[] = [
  { Header: "TOKEN", accessor: "token", sortType: sortBySymbol },
  { Header: "PRICE", accessor: "price", sortType: sortByNumber("priceNumber") },
  {
    Header: "24H PRICE VARIATION%",
    accessor: "priceVariation",
    sortType: sortByNumber("priceVariationNumber"),
  },
  {
    Header: "CIRCULATING SUPPLY",
    accessor: "circulatingSupply",
    sortType: sortByNumber("circulatingSupplyNumber"),
  },
  { Header: "MARKET CAP", accessor: "marketCap", sortType: sortByNumber("marketCapNumber") },
  { Header: "24H VOLUME", accessor: "volume", sortType: sortByNumber("volumeNumber") },
];

export const SORT_TRANSFERS_NTT = [
  { label: "Token", value: "token" },
  { label: "Price", value: "price" },
  { label: "24H Price Variation", value: "priceVariation" },
  { label: "Circulating Supply", value: "circulatingSupply" },
  { label: "Market Cap", value: "marketCap" },
  { label: "24H Volume", value: "volume" },
];

export const SORT_LOW_HIGH_LIST_NTT = [
  { label: "Low to High", value: false },
  { label: "High to Low", value: true },
];

export const initialSortStateNtt = {
  selectedSortBy: SORT_TRANSFERS_NTT[4],
  selectedSortLowHigh: SORT_LOW_HIGH_LIST_NTT[1],
  sortBy: [{ id: SORT_TRANSFERS_NTT[4].value, desc: SORT_LOW_HIGH_LIST_NTT[1].value }],
};
