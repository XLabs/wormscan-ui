import { PageRequest } from "src/api/model";
import { ChainId } from "@wormhole-foundation/sdk";
import { IStatus } from "src/consts";
import { DeliveryLifecycleRecord } from "src/utils/genericRelayerVaaUtils";

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
    toChain: ChainId;
    tokenAddress: string;
    tokenChain: ChainId;
  };
};

export type VAACount = {
  chainId: ChainId;
  count: number;
};

export interface TokensSymbolVolumeInput {
  limit: number;
}

export interface TokensSymbolVolumeOutput {
  symbol: string;
  volume: number;
}

export interface TokensSymbolActivityInput {
  from: string;
  to: string;
  symbol: string;
  timespan: string;
  sourceChain: ChainId[];
  targetChain: ChainId[];
}

export interface TokensSymbolActivityOutput {
  tokens: {
    token_symbol: string;
    total_messages: number;
    total_value_transferred: number;
    time_range_data: {
      from: string;
      to: string;
      total_messages: number;
      total_value_transferred: number;
      aggregations?: {
        total_messages: number;
        total_value_transferred: number;
        source_chain: ChainId;
        target_chain: ChainId;
      }[];
    }[];
  }[];
}

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

export interface IChainActivityInput {
  from: string;
  to: string;
  timespan: "1h" | "1d" | "1mo";
  sourceChain: Array<number | string>;
  targetChain?: Array<number | string>;
  appId?: string;
}

export interface IChainActivity {
  count: number;
  emitter_chain: string;
  from: string;
  to: string;
  volume: number;
}

export interface IMayanActivityInput {
  from: string;
  to: string;
}

export interface IMayanActivity {
  activity: {
    destination_chain_id: string;
    emitter_chain_id: string;
    total_usd: number;
    txs: number;
  }[];
  total_messages: number;
  total_value_secure: number;
  total_value_transferred: number;
  volume: number;
}

export interface IMayanStats {
  last24h: {
    volume: number;
    toSolCount: number;
    fromSolCount: number;
    swaps: number;
    activeTraders: number;
  };
  allTime: {
    volume: number;
    toSolCount: number;
    fromSolCount: number;
    swaps: number;
    activeTraders: number;
  };
}

export interface IAllbridgeActivityInput {
  from: string;
  to: string;
}

export interface IAllbridgeActivity {
  activity: {
    destination_chain_id: number;
    emitter_chain_id: number;
    total_usd: string;
    txs: string;
  }[];
  total_value_secure: string;
  total_value_transferred: string;
}

export interface IProtocolActivityInput {
  from: string;
  to: string;
  timespan: "1h" | "1d" | "1mo";
  appId?: string;
}

export interface IProtocolActivity {
  app_id: string;
  time_range_data: {
    from: string;
    to: string;
    total_messages: number;
    total_value_transferred: number;
    aggregations?: {
      app_id: string;
      total_messages: number;
      total_value_transferred: number;
    }[];
  }[];
}

export type DateRange = "day" | "week" | "month" | "3-month";

export interface ScoresOutput {
  "24h_messages": string;
  "24h_tx_count": string;
  "24h_volume": string;
  "7d_volume": string;
  "30d_volume": string;
  total_messages: string;
  total_tx_count: string;
  total_volume: string;
  tvl: string;
}

export interface ProtocolsStatsOutput {
  last_24_hour_volume: number;
  last_day_diff_percentage: string;
  last_day_diff_volume_percentage: string;
  last_day_messages: number;
  protocol: string;
  total_messages: number;
  total_value_locked?: number;
  total_value_secured?: number;
  total_value_transferred: number;
}

export interface AssetsByVolumeInput {
  timeSpan?: "7d" | "15d" | "30d";
}

export interface AssetsByVolumeOutput {
  symbol: string;
  tokens: {
    emitter_chain: ChainId;
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
  emitter_chain: ChainId;
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
  emitterChain: ChainId;
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
  payloadType?: string;
  sourceChain?: string;
  targetChain?: string;
  txHash?: string;
  vaaID?: string;
  from?: string;
  to?: string;
}

export interface INFTInfo {
  description?: string;
  external_url?: string;
  image?: string;
  name?: string;
  uri?: string;
  tokenId?: number;
  attributes?: Array<{ trait_type: string; value: string }>;
}

export interface GetOperationsOutput {
  id: string;
  emitterChain: ChainId;
  emitterAddress: {
    hex: string;
    native: string;
  };
  sequence: string;
  vaa: {
    guardianSetIndex: number;
    isDuplicated: boolean;
    raw: string;
  };
  content: {
    payload: {
      action?: number;
      amount?: string;
      fee?: string;
      fromAddress?: string | null;
      parsedPayload?: any;
      payload?: string;
      payloadId?: number;
      payloadType?: number;
      toAddress?: string;
      toChain?: ChainId;
      tokenAddress?: string;
      tokenChain?: ChainId;

      // --- NTT ---
      nttManagerMessage?: {
        id: string;
        sender: string;
      };
      nttMessage?: {
        prefix: string;
        sourceToken: string;
        to: string;
        toChain: ChainId;
        trimmedAmount: {
          amount: string;
          decimals: number;
        };
      };
      transceiverMessage?: any;

      // Standard Relayers
      encodedExecutionInfo?: {
        gasLimit?: string;
        targetChainRefundPerGasUnused?: string;
      };
      targetAddress?: string;
      targetChainId?: ChainId;
      sourceDeliveryProvider?: string;
      senderAddress?: string;
      refundDeliveryProvider?: string;
      refundChainId?: ChainId;
      refundAddress?: string;
      newSenderAddress?: string;

      // --- Attestation ---
      symbol?: string;
      name?: string;
      decimals?: number;

      // --- NFTs ---
      uri?: string;
      tokenId?: number;
      nftInfo?: INFTInfo;
    };
    standarizedProperties: {
      appIds: string[];
      fromChain: ChainId;
      fromAddress: string;
      toChain: ChainId;
      toAddress: string;
      tokenChain: ChainId;
      tokenAddress: string;
      amount: string;
      feeAddress: string;
      feeChain: ChainId;
      fee: string;

      wrappedTokenAddress?: string;
      wrappedTokenSymbol?: string;
      overwriteFee?: string;
      overwriteRedeemAmount?: string;
      overwriteSourceSymbol?: string;
      overwriteSourceTokenAddress?: string;
      overwriteSourceTokenChain?: ChainId;
      overwriteTargetSymbol?: string;
      overwriteTargetTokenAddress?: string;
      overwriteTargetTokenChain?: ChainId;
    };
  };
  sourceChain: {
    chainId: ChainId;
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
        originChainId: ChainId;
        originTxHash: string;
      };
    };
    fee?: string;
    gasTokenNotional?: string;
    feeUSD?: string;
  };
  targetChain: {
    chainId: ChainId;
    timestamp: Date | string;
    transaction: {
      txHash: string;
    };
    status: string;
    from: string;
    to: string;
    fee?: string;
    gasTokenNotional?: string;
    feeUSD?: string;
  };
  data: {
    symbol: string;
    tokenAmount: string;
    usdAmount: string;
  };
  decodedVaa?: any;
  status?: IStatus;
  isBigTransaction?: boolean;
  isDailyLimitExceeded?: boolean;
  transactionLimit?: number;
  relayerInfo?: DeliveryLifecycleRecord;
  releaseTimestamp?: Date;
}
[];
