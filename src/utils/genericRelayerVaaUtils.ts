import { ethers } from "ethers";
import { ChainId, Network, toChainId } from "@wormhole-foundation/sdk";
import { callWithTimeout, wait } from "src/utils/asyncUtils";
import { getClient } from "src/api/Client";
import { AutomaticRelayOutput } from "src/api/search/types";
import { GetOperationsOutput } from "src/api/guardian-network/types";
import { Environment, getChainInfo, getEthersProvider } from "./environment";

export type WormholeTransaction = {
  chainId: ChainId;
  txHash: string;
};

export type RelayerOverviewProps = {
  budgetText: () => string;
  copyBudgetText: () => string;
  currentNetwork: Network;
  decodeExecution: any;
  deliveryAttempt: string;
  deliveryInstruction: any;
  deliveryParsedRefundAddress: string;
  deliveryParsedRefundProviderAddress: string;
  deliveryParsedSenderAddress: string;
  deliveryParsedSourceProviderAddress: string;
  deliveryParsedTargetAddress: string;
  deliveryStatus: AutomaticRelayOutput;
  fromChain: ChainId;
  gasUsed: number;
  gasUsedText: () => string;
  guardianSignaturesCount: number;
  isDelivery: boolean;
  isDuplicated: boolean;
  maxRefundText: () => string;
  parsedEmitterAddress: string;
  parsedVaa: any;
  receiverValueText: () => string;
  refundStatus: string;
  refundText: () => string;
  resultLog: string;
  sourceAddress: string;
  sourceTxHash: string;
  targetTxTimestamp: number;
  totalGuardiansNeeded: number;
  VAAId: string;
};

export type DeliveryLifecycleRecord = {
  sourceTxHash?: string;
  sourceTxReceipt?: ethers.TransactionReceipt;
  sourceChainId?: ChainId;
  sourceSequence?: number;
  vaa?: Uint8Array;
  DeliveryStatus?: AutomaticRelayOutput;
  targetTransaction?: {
    targetTxHash?: string;
    targetTxReceipt?: ethers.TransactionReceipt;
    targetChainId?: ChainId;
    targetTxTimestamp?: number;
  };
  props?: RelayerOverviewProps;
};

export async function populateRelayerInfo(
  environment: Environment,
  data: GetOperationsOutput,
): Promise<DeliveryLifecycleRecord> {
  if (!data) return;

  const output = {} as DeliveryLifecycleRecord;
  const rawVaa = decodeVaaFromBase64orHex(data.vaa?.raw);
  output.vaa = rawVaa;

  const targetChain = data.targetChain?.chainId || data.content?.standarizedProperties?.toChain;

  let count = 0;
  let relayerEndpoint;
  // retry relayer endpoint cause newest transactions take around 15 sec to be there
  while (count <= 4) {
    count++;
    relayerEndpoint = await getClient().search.getAutomaticRelay({
      emitterChain: toChainId(data.emitterChain),
      emitterAddress: data.emitterAddress.hex,
      sequence: Number(data.sequence),
    });

    if (relayerEndpoint.data) {
      count = 5;
    } else {
      await wait(5500);
    }
  }

  output.DeliveryStatus = relayerEndpoint;
  if (!relayerEndpoint.data) {
    return;
  }

  const sourceChainId = toChainId(data.emitterChain);

  const MAX_WAIT_TIME = 10000;
  const sourceTxHash = relayerEndpoint.data.fromTxHash;

  output.sourceTxHash = sourceTxHash || undefined;
  output.sourceChainId = sourceChainId;

  // getting target receipt and timestamp
  const targetTxHash = relayerEndpoint.data.toTxHash;

  if (targetTxHash) {
    const targetEthersProvider = getEthersProvider(
      getChainInfo(environment, targetChain as ChainId),
    );
    const defaultResponse = {
      targetChainId: targetChain as ChainId,
      targetTxHash: targetTxHash,
      targetTxReceipt: null as ethers.TransactionReceipt,
      targetTxTimestamp: null as number,
    };

    const getTargetReceiptAndTimestamp = new Promise<typeof defaultResponse>(resolve =>
      targetEthersProvider
        .getTransactionReceipt(targetTxHash)
        .then(async receipt => {
          try {
            const block = await targetEthersProvider.getBlock(receipt.blockNumber);
            resolve({
              targetChainId: targetChain as ChainId,
              targetTxHash: targetTxHash,
              targetTxReceipt: receipt,
              targetTxTimestamp: Number(BigInt(block.timestamp)),
            });
          } catch (err) {
            console.log("failed to get timestamp for target tx", err);
            console.log("(but got receipt correctly)");
            resolve({
              targetChainId: targetChain as ChainId,
              targetTxHash: targetTxHash,
              targetTxReceipt: receipt,
              targetTxTimestamp: null as number,
            });
          }
        })
        .catch(e => {
          console.log("error getting target tx receipt: " + e);
          resolve(defaultResponse);
        }),
    );

    const targetTxResponse = await callWithTimeout(
      MAX_WAIT_TIME,
      getTargetReceiptAndTimestamp,
      defaultResponse,
    );

    output.targetTransaction = targetTxResponse;
  }

  const noSourceTxHash = !relayerEndpoint.data.fromTxHash;
  if (noSourceTxHash && data && !!data.sourceChain?.transaction?.txHash) {
    output.sourceTxHash = data.sourceChain?.transaction?.txHash.startsWith("0x")
      ? data.sourceChain?.transaction?.txHash
      : `0x${data.sourceChain?.transaction?.txHash}`;
    output.sourceSequence = Number(data.sequence);
  }

  // getting source receipt
  const sourceEthersProvider = getEthersProvider(
    getChainInfo(environment, sourceChainId as ChainId),
  );
  if (output.sourceTxHash) {
    const getSourceReceipt = new Promise<any>(resolve =>
      sourceEthersProvider
        .getTransactionReceipt(output.sourceTxHash)
        .then(receipt => {
          output.sourceTxReceipt = receipt;
          resolve("OK");
        })
        .catch(e => {
          console.log(`error getting source tx receipt (tx hash: ${output.sourceTxHash})`, e);
          resolve("NO RECEIPT");
        }),
    );
    await callWithTimeout(MAX_WAIT_TIME, getSourceReceipt, "");
  }

  return output;
}

function decodeVaaFromBase64orHex(vaaRaw: string): Uint8Array {
  let cloned;
  //detect if the string is base64 encoded
  const isBase64 = vaaRaw.match(/^[a-zA-Z0-9+/]+={0,2}$/);
  const isHexEncoded = vaaRaw.match(/^0x[a-fA-F0-9]+$/) || vaaRaw.match(/^[a-fA-F0-9]+$/);
  //if it is, convert it to hex
  if (isHexEncoded) {
    cloned = vaaRaw;
  } else if (isBase64) {
    cloned = Buffer.from(vaaRaw, "base64").toString("hex");
  } else {
    throw new Error("Invalid VAA");
  }
  //remove all whitespace from the hex string, and also remove the 0x prefix if it exists,
  const trimmed = cloned.replace(/\s/g, "").replace(/^0x/, "") || "";

  //convert the trimmed hex string into a Uint8Array
  const vaaBytes = new Uint8Array(trimmed.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));

  return vaaBytes;
}
