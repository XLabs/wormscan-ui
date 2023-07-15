import { Network } from "@certusone/wormhole-sdk";
import {
  DeliveryInstruction,
  RedeliveryInstruction,
  parseEVMExecutionInfoV1,
} from "@certusone/wormhole-sdk/lib/cjs/relayer";
import axios from "axios";
import { Environment } from "./environment";
import { decode } from "punycode";

function foo() {
  const ins: DeliveryInstruction = null as any;
  ins.encodedExecutionInfo; //!Should be parsed into executionInfoEvmv1, has basically one important field, the gasLimit of the target delivery
  ins.extraReceiverValue; //!This field is an additional field which can increase the amount of receiver value the relayer needs to pay
  ins.payload; //!This payload is the integrator's black box payload that they can send along with their delivery. Probably useful to the integrator.
  ins.refundAddress; //! this is the address where any remaining funds will be sent in the event of a refund.
  ins.refundChainId; //! this is the chain id of the refund address, if it's not the same as the target chain ID, then a cross chain refund will be initiated
  ins.refundDeliveryProvider; //the delivery provider which will do the cross chain refund, not very important
  ins.requestedReceiverValue; //! this is the amount of receiver value that the integrator requested, in combination with the maximumRefund & extraReceiverValue, this can be used to calculate the minimum msg.value for the delivery
  ins.senderAddress; //!! this is the address of the contract or wallet that initially requested the delivery. Not the same as the emitter address!
  ins.sourceDeliveryProvider; //! this is the delivery provider which was specified to be used for the delivery. Usually the default.
  ins.targetAddress; //! this is the address of the contract that will be receiving the delivery.
  ins.targetChainId; //! the chain where the delivery is being sent
  ins.vaaKeys; //! an array of additional VAAs that should be delivered along with the delivery. Potentially empty. If the VAAs here are invalid, the delivery will be invalid status.

  const decodeExecution = parseEVMExecutionInfoV1(ins.encodedExecutionInfo, 0)[0];
  decodeExecution.gasLimit; //!! gas limit the recepient contract will be called with when the delivery is performed
  decodeExecution.targetChainRefundPerGasUnused; //!! the amount of target chain tokens in wei that will be refunded per unit of gas spent. gasLimit * targetChainRefundPerGasUnused = maximum refund, maximumRefund + receiverValue + extraReceiverValue = msg.value / minimum budget of the delivery
}

function foo2() {
  const ins: RedeliveryInstruction = null as any;
  ins.deliveryVaaKey; //Vaa Key i.e emitter address, sequence, chain id. If this is not a valid delivery VAA, the redelivery will be invalid status.
  ins.newEncodedExecutionInfo; //!Should be parsed into executionInfoEvmv1, has basically one important field. If gasLimit is less than the original delivery, the redelivery will be invalid status.
  ins.newRequestedReceiverValue; //! newReceiver value. If it is less than the original delivery, the redelivery will be invalid status.
  ins.newSenderAddress; //! Address that requested this redelivery. Somewhat important.
  ins.newSourceDeliveryProvider; //!! delivery provider which should perform this new delivery. Interesting if it's not the same as the original delivery.
  ins.targetChainId; //! the chain where the delivery is being sent, if it's not the same as the original delivery, the redelivery will be invalid status.
}

export type RedeliveryRecord = {
  //TODO this
};

export type DeliveryRecord = {
  //pretty much all of this can be derived from the delivery vaa
  targetChainDecimals?: number; //useful for calculating usd quotes
  deliveryInstructionPrintable?: string; //Readable stringify format. Should be redudant if the VAA is also in hand
  hasAdditionalVaas?: boolean; //! true if additional VAAs were specified in the delivery instruction
  additionalVaaKeysFormatValid?: boolean; //! if this is false, then the delivery is probably invalid
  additionalVaaKeysPrintable?: string; //Readable stringify format. Should be redudant if the VAA is also in hand
  fetchAdditionalVaasTimeStart?: number; //unneeded, time the relayer started fetching additional VAAs
  fetAdditionalVaasTimeEnd?: number; //unneeded, time the relayer finished fetching additional VAAs
  additionalVaasDidFetch?: boolean; //unneeded, if the relayer fetched additional VAAs
  additionalVaasHex?: string; //! hex encoded additional VAAs, if these fail to verify against the core contract
  chainId?: number; //chain id of the target chain, can be useful, but generally is redundant with the VAA
  receiverValue?: string; //! amount of tokens to be sent the the receiver contract on the target chain, denoted in target chain wei.
  maxRefund?: string; //! maximum amount of tokens that can be refunded to the sender, denoted in target chain wei.
  budget?: string; //! the amount of tokens that the relayer has to pass in in order to pay for the refund & receiver value budget.
  walletAcquisitionStartTime?: number; //unneeded, time the relayer started acquiring a wallet
  walletAcquisitionEndTime?: number; //unneeded, time the relayer finished acquiring a wallet
  walletAcquisitionDidSucceed?: boolean; //unneeded, if the relayer successfully acquired a wallet
  walletAddress?: string; //unneeded, address of the wallet the relayer used to send the transaction
  walletBalanceBefore?: string; //unneeded, balance of the wallet before the transaction was sent
  walletBalanceAfter?: string; //unneeded, balance of the wallet after the transaction was sent
  walletNonce?: number; //unneeded, nonce of the wallet before the transaction was sent
  gasUnitsEstimate?: number; //unneeded, gas units estimate of the transaction during simulation
  gasPriceEstimate?: string; //somewhat useful, estimated gas price at the time this attempt ran
  gasUsed?: number; //gas actually utilized in the delivered transaction. not that useful.
  gasPrice?: string; //gas price of the delivered transaction. not that useful.
  estimatedTransactionFee?: string; //estimatedTransactionFee of the delivered transaction at the time of simulation. Less useful than the real value.
  estimatedTransactionFeeEther?: string; //just the above field but denoted in ether
  transactionSubmitTimeStart?: number; //time the relayer started submitting the transaction, not useful
  transactionSubmitTimeEnd?: number; //time the relayer finished submitting the transaction, not useful
  transactionDidSubmit?: boolean; //Fairly important, if it failed to submit there is likely a problem with the relayer process
  transactionHashes?: string[]; //probably not needed, toTxHash is more useful
  resultLogDidParse?: boolean; //unneeded, if the relayer parsed the result log
  resultLog?: string; //!!! most important field, status which the relayer read after delivering the transaction.
};

export type DeliveryProviderStatus = {
  _id?: string; //Interal ID used by the API
  emitterChain?: number; //Should be redundant with the VAA
  emitterAddress?: string; //should be redundant with the VAA
  sequence?: number; //should be redundant with the VAA
  vaa?: string; //should be the vaa, base 64encode
  fromTxHash?: string; //!!! originating transaction hash of the source transaction
  status?: string; //status of the delivery process, not the status of the delivery
  addedTimes?: number; //unneeded
  attempts?: number; //unneeded
  maxAttempts?: number; //unneeded
  receivedAt?: string; //Not that useful, sourceTransaction.timestamp is better
  completedAt?: string; //Not that useful, targetTransaction.timestamp is better, but not useless
  failedAt?: string; //not that useful, only used for errors
  errorMessage?: string; //should never actually be set
  toTxHash?: string; //!!! target transaction hash of the target transaction
  metaData?: DeliveryMetaData; //meta data object
  specifiedDeliveryProvider?: string; //not that useful, is also on the source transaction
  didMatchDeliveryProvider?: boolean; //not that useful,
  redeliveryRecord?: RedeliveryRecord; //redelivery record object
  deliveryRecord?: DeliveryRecord; //delivery record object
  fatalStackTrace?: string; //not that useful, only used for errors
};

export type DeliveryMetaData = {
  attempts?: number; //unneeded
  maxAttempts?: number; //unneeded
  didError?: boolean; //unneeded
  errorName?: string; //unneeded
  didSubmitTransaction?: boolean; //unneeded
  executionStartTime?: number; //unneeded
  executionEndTime?: number; //unneeded
  emitterChain?: number; //redudant with the VAA
  emitterAddress?: string; // redudant with the VAA
  sequence?: number; //redudant with the VAA
  rawVaaHex?: string; //should be the vaa, hex encoded
  rawVaaPayloadHex?: string; //payload inside the vaa, hex encoded
  payloadType?: number; //payload type of the delivery, 1 is delivery, 2 is redelivery. Can be gotten from parsing the vaa
  didParse?: boolean; //Should always be true, not useful
  instructions?: DeliveryInstruction; //delivery instruction object, parsed delivery instruction in the case of a delivery, the original delivery instruction in the case of a redelivery
};

function getBaseUrl(environment: Environment): string {
  if (environment.network === "MAINNET") {
    return CORS_PROXY + ""; //"http://a6163c82a2a6f4c1d9c2cf2c35f0733b-758274193:80/relay-status?";
  } else if (environment.network === "TESTNET") {
    return (
      CORS_PROXY +
      "http://a6163c82a2a6f4c1d9c2cf2c35f0733b-758274193.us-east-2.elb.amazonaws.com:80/relay-status?"
    );
  } else {
    return "";
  }
}

const CORS_PROXY = "https://nextjs-cors-anywhere.vercel.app/api?endpoint=";

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
