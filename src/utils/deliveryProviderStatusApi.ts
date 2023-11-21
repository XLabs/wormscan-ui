import {
  DeliveryInstruction,
  DeliveryStatus,
  RedeliveryInstruction,
  RefundStatus,
} from "@certusone/wormhole-sdk/lib/cjs/relayer";
import axios from "axios";
import { Environment } from "./environment";

export type RedeliveryRecord = {
  //TODO this
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
  redeliveryRecord?: RedeliveryRecord;

  fatalStackTrace?: string;
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

function getBaseUrl(environment: Environment): string {
  if (environment.network === "MAINNET") {
    return (
      CORS_PROXY +
      "http://ade18dde9976749fca82c41f05d29cbe-364125254.us-east-2.elb.amazonaws.com/relay-status?"
    );
    // return CORS_PROXY + ""; //"http://a6163c82a2a6f4c1d9c2cf2c35f0733b-758274193:80/relay-status?";
  } else if (environment.network === "TESTNET") {
    return (
      CORS_PROXY +
      "http://a6163c82a2a6f4c1d9c2cf2c35f0733b-758274193.us-east-2.elb.amazonaws.com:80/relay-status?"
    );
  } else {
    return "";
  }
}

// const CORS_PROXY = "";
const CORS_PROXY = "https://corsproxy.io/?";

//Don't call this function directly, use the wrapped functions with fewer args
function getDeliveryProviderStatusRaw(
  Environment: Environment,
  fromTxHash?: string,
  emitterChain?: string,
  emitterAddress?: string,
  sequence?: string,
  status?: string,
  toTxHash?: string,
  fromChain?: string,
  toChain?: string,
): Promise<DeliveryProviderStatus[]> {
  let URL = getBaseUrl(Environment);
  if (Environment.network === "DEVNET") {
    throw new Error("DEVNET not supported yet");
  }

  if (fromTxHash) {
    URL += `fromTxHash=${fromTxHash}&`;
  }
  if (emitterChain) {
    URL += `emitterChain=${emitterChain}&`;
  }
  if (emitterAddress) {
    URL += `emitterAddress=${emitterAddress}&`;
  }
  if (sequence) {
    URL += `sequence=${sequence}&`;
  }
  if (status) {
    URL += `status=${status}&`;
  }
  if (toTxHash) {
    URL += `toTxHash=${toTxHash}&`;
  }
  if (fromChain) {
    URL += `fromChain=${fromChain}&`;
  }
  if (toChain) {
    URL += `toChain=${toChain}&`;
  }
  return axios
    .get(URL)
    .then(value => value.data)
    .catch(e => {
      console.error(e);
      return [];
    }) as Promise<DeliveryProviderStatus[]>;
}

export async function getDeliveryProviderStatusBySourceTransaction(
  Environment: Environment,
  fromTxHash: string,
): Promise<DeliveryProviderStatus[]> {
  return getDeliveryProviderStatusRaw(Environment, fromTxHash);
}

export async function getDeliveryProviderStatusByTargetTransaction(
  Environment: Environment,
  toTxHash: string,
): Promise<DeliveryProviderStatus[]> {
  return getDeliveryProviderStatusRaw(
    Environment,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    toTxHash,
  );
}

export async function getDeliveryProviderStatusByVaaInfo(
  Environment: Environment,
  emitterChain: string,
  emitterAddress: string,
  sequence: string,
): Promise<DeliveryProviderStatus[]> {
  return getDeliveryProviderStatusRaw(
    Environment,
    undefined,
    emitterChain,
    emitterAddress,
    sequence,
  );
}
