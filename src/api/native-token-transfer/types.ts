import { ChainId } from "@wormhole-foundation/sdk";

export type TBy = "notional" | "tx";

// Top Address
export type GetTopAddress = {
  symbol: string;
  by: TBy;
};

export type GetTopAddressItem = {
  fromAddress: string;
  value: string;
};

export type GetTopAddressResult = GetTopAddressItem[];

// Transfer By Time
export type GetTransferByTime = {
  symbol: string;
  from: string;
  to: string;
  timeSpan: string;
  by: TBy;
};

export type GetTransferByTimeItem = {
  time: string;
  symbol: string;
  value: string;
};

export type GetTransferByTimeResult = GetTransferByTimeItem[];

// Activity
export type GetActivity = {
  symbol: string;
  by: TBy;
};

export type GetActivityItem = {
  emitterChain: ChainId;
  destinationChain: ChainId;
  symbol: string;
  value: string;
};

export type GetActivityResult = GetActivityItem[];

// Summary
export type GetSummary = {
  symbol: string;
};

export type GetSummaryResult = {
  totalValueTokenTransferred: string;
  totalTokenTransferred: string;
  averageTransferSize: string;
  medianTransferSize: string;
  marketCap: string;
  circulatingSupply: string;
};

// Top Holder
export type GetTopHolder = {
  symbol: string;
};

export type GetTopHolderItem = {
  address: string;
  chain: ChainId;
  volume: string;
};

export type GetTopHolderResult = GetTopHolderItem[];
