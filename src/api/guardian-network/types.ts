import { ChainId, PageRequest } from "src/api/model";
import { IStatus } from "src/consts";

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

export type ProtocolName = "cctp" | "allbridge" | "portal_token_bridge" | "mayan";

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

export interface GetParsedVaaOutput {
  appIds?: string[];
  parsedPayload?: any;
  standardizedProperties?: any;
  vaa?: any;
}

export interface GetOperationsInput {
  address?: string;
  appId?: string;
  exclusiveAppId?: string;
  pagination?: PageRequest;
  sourceChain?: ChainId;
  targetChain?: ChainId;
  txHash?: string;
  vaaID?: string;
}

export interface GetOperationsOutput {
  id: string;
  emitterChain: number;
  emitterAddress: {
    hex: string;
    native: string;
  };
  sequence: string;
  vaa: {
    guardianSetIndex: number;
    raw: string;
  };
  content: {
    payload: {
      amount?: string;
      fee?: string;
      fromAddress?: string | null;
      parsedPayload?: any;
      payload?: string;
      payloadType?: number;
      toAddress?: string;
      toChain?: number;
      tokenAddress?: string;
      tokenChain?: number;

      // --- NTT ---
      nttManagerMessage?: {
        id: string;
        sender: string;
      };
      nttMessage?: {
        prefix: string;
        sourceToken: string;
        to: string;
        toChain: number;
        trimmedAmount: {
          amount: string;
          decimals: number;
        };
      };
      transceiverMessage?: any;
      // ---     ---

      // --- Attestation ---
      symbol?: string;
      name?: string;
      decimals?: number;
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

      wrappedTokenAddress?: string;
      wrappedTokenSymbol?: string;
      overwriteFee?: string;
      overwriteRedeemAmount?: string;
      overwriteSourceSymbol?: string;
      overwriteSourceTokenAddress?: string;
      overwriteSourceTokenChain?: number;
      overwriteTargetSymbol?: string;
      overwriteTargetTokenAddress?: string;
      overwriteTargetTokenChain?: number;
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
  decodedVaa?: any;
  STATUS?: IStatus;
  isBigTransaction?: boolean;
  isDailyLimitExceeded?: boolean;
  transactionLimit?: number;
}
[];
