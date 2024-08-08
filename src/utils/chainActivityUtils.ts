import { IChainActivity } from "src/api/guardian-network/types";
import { calculateDateDifferenceInDays } from "./date";

export interface IDetails {
  emitter_chain: string;
  volume: number;
  count: number;
}

export interface IAccumulator {
  [key: string]: IChainActivityDetails;
}

export interface IChainActivityDetails extends IChainActivity {
  details: IDetails[];
}

export interface IChainList {
  disabled: boolean;
  icon: JSX.Element;
  label: string;
  showMinus: boolean;
  value: string;
}

export interface ICompleteData {
  [key: string]: {
    color: string;
    count: number;
    details: IDetails[];
    emitter_chain: string;
    volume: number;
    x: string;
    y: number;
  };
}

export type TSelectedPeriod = "24h" | "week" | "month" | "year" | "all" | "custom";

export const DAY_IN_MILLISECONDS = 86400000;
export const SHORT_TIMESPAN_LIMIT = 6;
export const MEDIUM_TIMESPAN_LIMIT = 365;

export const colors = [
  "#B57AFF",
  "#FF884D",
  "#7BFFB0",
  "#5F6FFF",
  "#FF5B79",
  "#5BB0FF",
  "#5535D7",
  "#F2FF5B",
  "#FFA3AE",
  "#11D400",
];

export const grayColors = [
  "#EEEEEE",
  "#E0E0E0",
  "#D3D3D3",
  "#C6C6C6",
  "#B9B9B9",
  "#ACACAC",
  "#9F9F9F",
  "#929292",
  "#858585",
  "#787878",
  "#444444",
];

export const formatXaxisLabels = (value: string, from: Date, to: Date): string => {
  const dateDifferenceInDays = calculateDateDifferenceInDays(from, to);
  let date = "";

  if (dateDifferenceInDays < SHORT_TIMESPAN_LIMIT) {
    date = new Date(value).toLocaleString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } else if (dateDifferenceInDays < MEDIUM_TIMESPAN_LIMIT) {
    date = new Date(value).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
    });
  } else {
    date = new Date(value).toLocaleString("en-GB", {
      month: "short",
      year: "2-digit",
    });
  }

  return date;
};
