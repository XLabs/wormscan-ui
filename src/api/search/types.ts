import {
  DeliveryInstruction,
  DeliveryStatus,
  RefundStatus,
} from "@certusone/wormhole-sdk/lib/cjs/relayer";
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

export type DeliveryRecord = {
  additionalVaaKeysFormatValid?: boolean;
  additionalVaaKeysPrintable?: string;
  additionalVaasDidFetch?: boolean;
  additionalVaasHex?: string;
  budget?: string;
  budgetUsd: number;
  chainId?: number;
  deliveryInstructionPrintable?: string;
  estimatedTransactionFee?: string;
  estimatedTransactionFeeEther?: string;
  fetAdditionalVaasTimeEnd?: number;
  fetchAdditionalVaasTimeStart?: number;
  gasPrice?: string;
  gasPriceEstimate?: string;
  gasUnitsEstimate?: number;
  gasUsed?: number;
  hasAdditionalVaas?: boolean;
  maxRefund?: string;
  maxRefundUsd: number;
  receiverValue?: string;
  receiverValueUsd: number;
  resultLog?: {
    status: DeliveryStatus | string;
    gasUsed: string;
    overrides?: {
      newReceiverValue: string;
      redeliveryHash: string;
      newExecutionInfo: string;
    };
    sourceChain: string;
    sourceVaaSequence: string | null;
    transactionHash: string | null;
    vaaHash: string | null;
    refundStatus: RefundStatus;
    revertString: string | undefined;
  };
  resultLogDidParse?: boolean;
  targetChainAssetPriceUSD: number;
  targetChainDecimals?: number;
  transactionDidSubmit?: boolean;
  transactionHashes?: string[];
  transactionSubmitTimeEnd?: number;
  transactionSubmitTimeStart?: number;
  walletAcquisitionDidSucceed?: boolean;
  walletAcquisitionEndTime?: number;
  walletAcquisitionStartTime?: number;
  walletAddress?: string;
  walletBalanceAfter?: string;
  walletBalanceBefore?: string;
  walletNonce?: number;
};

export type DeliveryMetaData = {
  attempts?: number;
  maxAttempts?: number;
  didError?: boolean;
  errorName?: string;
  didSubmitTransaction?: boolean;
  executionStartTime?: number;
  executionEndTime?: number;
  emitterChain?: number;
  emitterAddress?: string;
  sequence?: number;
  rawVaaHex?: string;
  deliveryRecord?: DeliveryRecord;

  rawVaaPayloadHex?: string;
  payloadType?: number;
  didParse?: boolean;
  instructions?: DeliveryInstruction;
};

export type DeliveryProviderStatus = {
  _id?: string;
  emitterChain?: number;
  emitterAddress?: string;
  sequence?: number;
  vaa?: string;
  fromTxHash?: string;
  status?: string;
  addedTimes?: number;
  attempts?: number;
  maxAttempts?: number;
  receivedAt?: string;
  completedAt?: string;
  failedAt?: string;
  errorMessage?: string;
  toTxHash?: string;
  metadata?: DeliveryMetaData;
  specifiedDeliveryProvider?: string;
  didMatchDeliveryProvider?: boolean;
  redeliveryRecord?: null; // todo ?
  fatalStackTrace?: string;
};
