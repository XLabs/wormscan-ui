import { ethers } from "ethers";
import { ChainId, ParsedVaa, parseVaa } from "@certusone/wormhole-sdk";
import {
  DeliveryInstruction,
  RedeliveryInstruction,
  RelayerPayloadId,
  parseWormholeRelayerPayloadType,
  parseWormholeRelayerResend,
  parseWormholeRelayerSend,
} from "@certusone/wormhole-sdk/lib/cjs/relayer";
import { callWithTimeout } from "src/utils/asyncUtils";
import { getClient } from "src/api/Client";
import { AutomaticRelayOutput, GetTransactionsOutput } from "src/api/search/types";
import { Environment, getChainInfo, getEthersProvider } from "./environment";

export type WormholeTransaction = {
  chainId: ChainId;
  txHash: string;
};

export type DeliveryLifecycleRecord = {
  sourceTxHash?: string;
  sourceTxReceipt?: ethers.providers.TransactionReceipt;
  sourceChainId?: ChainId;
  sourceSequence?: number;
  vaa?: Uint8Array;
  DeliveryStatus?: AutomaticRelayOutput;
  targetTransaction?: {
    targetTxHash?: string;
    targetTxReceipt?: ethers.providers.TransactionReceipt;
    targetChainId?: ChainId;
    targetTxTimestamp?: number;
  };
};

export async function populateDeliveryLifecycleRecordByVaa(
  environment: Environment,
  vaa: string,
): Promise<DeliveryLifecycleRecord> {
  const output = {} as DeliveryLifecycleRecord;
  const rawVaa = decodeVaaFromBase64orHex(vaa);
  output.vaa = rawVaa;
  const parsedVaa = parseVaa(rawVaa);
  const genericRelayerVaa = parseGenericRelayerVaa(parsedVaa);
  const targetChain = genericRelayerVaa.targetChainId;

  vaa = Buffer.from(rawVaa).toString("hex");

  let tx;
  try {
    tx = (await getClient().search.getTransactions({
      chainId: parsedVaa.emitterChain,
      emitter: parsedVaa.emitterAddress.toString("hex"),
      seq: Number(parsedVaa.sequence),
    })) as GetTransactionsOutput;
  } catch (e) {
    console.error("err on getTransaction wormhole api", e);
  }

  const relayerEndpoint = await getClient().search.getAutomaticRelay({
    emitterChain: parsedVaa.emitterChain,
    emitterAddress: parsedVaa.emitterAddress.toString("hex"),
    sequence: Number(parsedVaa.sequence),
  });

  const sourceChainId = parsedVaa.emitterChain;

  output.DeliveryStatus = relayerEndpoint;

  const MAX_WAIT_TIME = 10000;
  const sourceTxHash = relayerEndpoint.data.fromTxHash;

  output.sourceTxHash = sourceTxHash || undefined;
  output.sourceChainId = sourceChainId as ChainId;

  // getting target receipt and timestamp
  const targetTxHash = relayerEndpoint.data.toTxHash;

  if (targetTxHash) {
    const targetEthersProvider = getEthersProvider(
      getChainInfo(environment, targetChain as ChainId),
    );
    const defaultResponse = {
      targetChainId: targetChain as ChainId,
      targetTxHash: targetTxHash,
      targetTxReceipt: null as ethers.providers.TransactionReceipt,
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
              targetTxTimestamp: ethers.BigNumber.from(block.timestamp).toNumber(),
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
  if (noSourceTxHash && tx && !!tx.txHash) {
    output.sourceTxHash = tx.txHash.startsWith("0x") ? tx.txHash : `0x${tx.txHash}`;
    output.sourceSequence = Number(parsedVaa.sequence);
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

function parseGenericRelayerPayloads(
  payloads: Buffer[],
): (DeliveryInstruction | RedeliveryInstruction)[] {
  const output = payloads.map(payload => {
    const payloadId = parseWormholeRelayerPayloadType(payload);
    return payloadId === RelayerPayloadId.Delivery
      ? parseWormholeRelayerSend(payload)
      : parseWormholeRelayerResend(payload);
  });

  return output;
}

export function parseGenericRelayerVaa(
  vaa: ParsedVaa,
): DeliveryInstruction | RedeliveryInstruction | null {
  try {
    return parseGenericRelayerPayloads([vaa.payload])[0];
  } catch (e) {
    return null;
  }
}

export function isRedelivery(instruction: DeliveryInstruction | RedeliveryInstruction): boolean {
  return "newSenderAddress" in instruction;
}
