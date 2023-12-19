import { ChainId, PageRequest } from "src/api/model";

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
  tvl: string;
  total_volume: string;
  total_tx_count: string;
  "24h_volume": string;
  "24h_tx_count": string;
  "24h_messages": string;
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

export interface GetOperationsInput {
  txHash?: string;
  address?: string;
  vaaID?: string;
  pagination?: PageRequest;
}

export interface GetOperationsOutput {
  id: string;
  emitterChain: number;
  emitterAddress: {
    hex: string;
    native: string;
  };
  sequence: string;
  vaa: string;
  content: {
    payload: {
      amount: string;
      fee: string;
      fromAddress: string | null;
      parsedPayload: any;
      payload: string;
      payloadType: number;
      toAddress: string;
      toChain: number;
      tokenAddress: string;
      tokenChain: number;
    };
    standarizedProperties: {
      appIds: string[];
      fromChain: number;
      fromAddress: string;
      toChain: number;
      toAddress: string;
      tokenChain: number;
      tokenAddress: string;
      amount: string;
      feeAddress: string;
      feeChain: number;
      fee: string;
    };
  };
  sourceChain: {
    chainId: number;
    timestamp: Date | string;
    transaction: {
      txHash: string;
      secondTxHash?: string;
    };
    from: string;
    status: string;
    attribute?: {
      type: string;
      value?: {
        originAddress: string;
        originChainId: number;
        originTxHash: string;
      };
    };
  };
  targetChain: {
    chainId: number;
    timestamp: Date | string;
    transaction: {
      txHash: string;
    };
    status: string;
    from: string;
    to: string;
  };
  data: {
    symbol: string;
    tokenAmount: string;
    usdAmount: string;
  };
}
[];
