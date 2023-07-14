import { Network } from "@certusone/wormhole-sdk";
import { DeliveryInstruction } from "@certusone/wormhole-sdk/lib/cjs/relayer";
import axios from "axios";
import { Environment } from "./environment";

type DeliveryProviderStatusResponse = DeliveryProviderStatus[];

type RedeliveryRecord = {
  //TODO this
};

type DeliveryRecord = {
  targetChainDecimals?: number;
  deliveryInstructionPrintable?: string;
  hasAdditionalVaas?: boolean;
  additionalVaaKeysFormatValid?: boolean;
  additionalVaaKeysPrintable?: string;
  fetchAdditionalVaasTimeStart?: number;
  fetAdditionalVaasTimeEnd?: number;
  additionalVaasDidFetch?: boolean;
  additionalVaasHex?: string;
  chainId?: number;
  receiverValue?: string;
  maxRefund?: string;
  budget?: string;
  walletAcquisitionStartTime?: number;
  walletAcquisitionEndTime?: number;
  walletAcquisitionDidSucceed?: boolean;
  walletAddress?: string;
  walletBalanceBefore?: string;
  walletBalanceAfter?: string;
  walletNonce?: number;
  gasUnitsEstimate?: number;
  gasPriceEstimate?: string;
  gasUsed?: number;
  gasPrice?: string;
  estimatedTransactionFee?: string;
  estimatedTransactionFeeEther?: string;
  transactionSubmitTimeStart?: number;
  transactionSubmitTimeEnd?: number;
  transactionDidSubmit?: boolean;
  transactionHashes?: string[];
  resultLogDidParse?: boolean;
  resultLog?: string;
};

type DeliveryProviderStatus = {
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
  metaData?: DeliveryMetaData;
  specifiedDeliveryProvider?: string;
  didMatchDeliveryProvider?: boolean;
  redeliveryRecord?: RedeliveryRecord;
  deliveryRecord?: DeliveryRecord;
  fatalStackTrace?: string;
};

type DeliveryMetaData = {
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
  rawVaaPayloadHex?: string;
  payloadType?: number;
  didParse?: boolean;
  instructions?: DeliveryInstruction;
};

function getBaseUrl(environment: Environment): string {
  if (environment.network === "MAINNET") {
    return ""; //"http://a6163c82a2a6f4c1d9c2cf2c35f0733b-758274193:80/relay-status?";
  } else if (environment.network === "TESTNET") {
    return "http://a6163c82a2a6f4c1d9c2cf2c35f0733b-758274193.us-east-2.elb.amazonaws.com:80/relay-status?";
  } else {
    return "";
  }
}

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
): Promise<DeliveryProviderStatusResponse> {
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
  return axios.get(URL);
}

export async function getDeliveryProviderStatusBySourceTransaction(
  Environment: Environment,
  fromTxHash: string,
): Promise<DeliveryProviderStatusResponse> {
  return getDeliveryProviderStatusRaw(Environment, fromTxHash);
}

export async function getDeliveryProviderStatusByTargetTransaction(
  Environment: Environment,
  toTxHash: string,
): Promise<DeliveryProviderStatusResponse> {
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
): Promise<DeliveryProviderStatusResponse> {
  return getDeliveryProviderStatusRaw(
    Environment,
    undefined,
    emitterChain,
    emitterAddress,
    sequence,
  );
}
