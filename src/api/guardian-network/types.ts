import { ChainId, PageRequest } from "src/api/model";

export type Observation = {
  hash: string;
  guardianAddr: string;
  signature: string;
} & Omit<VAADetail, "guardianSetIndex" | "vaa" | "timestamp">;

export type VAADetail = {
  sequence: number;
  id: string;
  version: number;
  emitterChain: ChainId;
  emitterAddr: string;
  emitterNativeAddr: string;
  guardianSetIndex: number;
  vaa: string;
  timestamp: Date;
  updatedAt: Date;
  indexedAt: Date;
  txHash: string;
  appId: string;
  payload: {
    amount: string;
    callerAppId: string;
    fee: string;
    fromAddress: string;
    parsedPayload: any;
    payload: string;
    payloadType: number;
    toAddress: string;
    toChain: number;
    tokenAddress: string;
    tokenChain: number;
  };
};

export type VAACount = {
  chainId: ChainId;
  count: number;
};

export type CrossChainBy = "tx" | "notional";

export type CrossChainActivityInput = {
  timeSpan: string;
  by: CrossChainBy;
};

export type CrossChainActivity = {
  chain: ChainId;
  percentage: number;
  volume: number;
  destinations: {
    chain: ChainId;
    percentage: number;
    volume: number;
  }[];
}[];

export type LastTxs = {
  time: string;
  count: number;
}[];

export type DateRange = "day" | "week" | "month" | "3-month";

export interface ScoresOutput {
  "24h_messages": string;
  "24h_tx_count": string;
  "24h_volume": string;
  total_messages: string;
  total_tx_count: string;
  total_volume: string;
  tvl: string;
}

export type ProtocolName = "cctp" | "allbridge" | "portal" | "mayan";

export interface ProtocolsStatsOutput {
  protocol: ProtocolName;
  total_value_locked?: number;
  total_value_secured?: number;
  total_value_transferred: number;
  total_messages: number;
  last_day_messages: number;
  last_day_diff_percentage: string;
}

export interface AssetsByVolumeInput {
  timeSpan?: "7d" | "15d" | "30d";
}

export interface AssetsByVolumeOutput {
  symbol: string;
  tokens: {
    emitter_chain: number;
    token_address: string;
    token_chain: number;
    txs: string;
    volume: string;
  }[];
  txs: string;
  volume: string;
}

export interface Tokens {
  chainImageSrc: string;
  chainName: string;
  emitter_chain: number;
  txs: number;
  txsFormatted: string;
  volume: number;
  volumeFormatted: string;
}

export interface AssetsByVolumeTransformed {
  symbol: string;
  tokens: Tokens[];
  txs: string;
  volume: string;
}

export interface ChainPairsByTransfersInput {
  timeSpan?: "7d" | "15d" | "30d";
}
export interface ChainPairsByTransfersOutput {
  emitterChain: number;
  destinationChain: number;
  numberOfTransfers: string;
}

export type GetVAAInput = (
  | {
      chainId?: number;
      emitter?: string;
      seq?: number;
    }
  | {
      chainId: number;
      emitter?: string;
      seq?: number;
    }
  | {
      chainId: number;
      emitter: string;
      seq?: number;
    }
  | {
      chainId: number;
      emitter: string;
      seq: number;
    }
) & {
  query?: {
    parsedPayload?: boolean;
  };
  pagination?: PageRequest;
};

export interface GetVAAByTxHashInput {
  query: {
    txHash: string;
    parsedPayload?: boolean;
  };
}

export interface GlobalTxInput {
  chainId: number;
  emitter: string;
  seq: number;
  query?: {
    parsedPayload?: boolean;
  };
}

export interface GlobalTxOutput {
  id: string;
  originTx: {
    attribute?: {
      type: string;
      from: string;
      status: string;
      txHash: string;
      value: {
        originAddress: string;
        originChainId: ChainId;
        originTxHash: string;
      };
    };
    chainId: number;
    txHash: string;
    timestamp: string;
    from: string;
    status: string;
  };
  destinationTx: {
    chainId: number;
    status: string;
    method: string;
    txHash: string;
    from: string;
    to: string;
    blockNumber: string;
    timestamp: string;
    updatedAt: string;
  };
}
