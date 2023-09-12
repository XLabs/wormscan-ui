import { GlobalTxOutput } from "src/api/guardian-network/types";
import { PageRequest } from "src/api/model";
import { Pagination } from "src/api/types";

export interface FindVAAByAddressOutput {
  data: Data;
  pagination: Pagination;
}

export interface Data {
  vaas: VAA[];
}

export interface VAA {
  appId: string;
  emitterAddr: string;
  emitterChain: number;
  guardianSetIndex: number;
  id: string;
  indexedAt: string;
  nativeTxHash: string;
  payload: any;
  timestamp: string;
  txHash: string;
  updatedAt: string;
  vaa: number[];
  version: number;
}

export type GetTokenInput = {
  chainId: number;
  tokenAddress: string;
};

export type GetTokenOutput = {
  symbol: string;
  coingeckoId: string;
  decimals: number;
};

export type GetTokenPriceInput = {
  coingeckoId: string;
  query: {
    date: string;
    localization?: boolean;
  };
};

export type GetTokenPriceOutput = {
  usd: number;
};

export type GetTransactionsInput = (
  | {
      chainId?: number;
      emitter?: string;
      seq?: number;
    }
  | {
      chainId: number;
      emitter: string;
      seq: number;
    }
) & {
  query?: {
    address?: string;
  };
  pagination?: PageRequest;
};

export type GetTransactionsOutput = {
  id: string;
  timestamp: Date;
  txHash: string;
  emitterChain: number;
  emitterAddress: string;
  emitterNativeAddress: string;
  tokenAmount: string;
  usdAmount: string;
  symbol: string;
  payload: {
    amount?: string;
    callerAppId?: string;
    fee?: string;
    fromAddress?: string;
    parsedPayload?: any;
    payload?: string;
    payloadType?: number;
    toAddress?: string;
    toChain?: number;
    tokenAddress?: string;
    tokenChain?: number;
    decimals?: number;
    name?: string;
    symbol?: string;
  };
  standardizedProperties: {
    amount: string;
    appIds: string[];
    fee: string;
    feeAddress: string;
    feeChain: number;
    fromAddress: string;
    fromChain: number;
    toAddress: string;
    toChain: number;
    tokenAddress: string;
    tokenChain: number;
  };
  globalTx: GlobalTxOutput;
};
