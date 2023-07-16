import {
  CHAIN_ID_TO_NAME,
  ChainId,
  ChainName,
  ParsedVaa,
  getSignedVAAWithRetry,
  parseVaa,
  relayer,
  tryNativeToHexString,
  tryUint8ArrayToNative,
} from "@certusone/wormhole-sdk";
import { ChainInfo, Environment, getChainInfo, getEthersProvider } from "./environment";
import {
  DeliveryInfo,
  DeliveryInstruction,
  DeliveryOverrideArgs,
  RedeliveryInstruction,
  RelayerPayloadId,
  getWormholeRelayerInfoBySourceSequence,
  packOverrides,
  parseEVMExecutionInfoV1,
  parseWormholeRelayerPayloadType,
  parseWormholeRelayerResend,
  parseWormholeRelayerSend,
  vaaKeyPrintable,
} from "@certusone/wormhole-sdk/lib/cjs/relayer";
import {
  Implementation__factory,
  WormholeRelayer__factory,
} from "@certusone/wormhole-sdk/lib/cjs/ethers-contracts";
import { ethers } from "ethers";
import {
  DeliveryProviderStatus,
  getDeliveryProviderStatusBySourceTransaction,
  getDeliveryProviderStatusByTargetTransaction,
  getDeliveryProviderStatusByVaaInfo,
} from "./deliveryProviderStatusApi";
import { getClient } from "src/api/Client";
import { GetTransactionsOutput } from "@xlabs-libs/wormscan-sdk";
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
  DeliveryStatuses?: DeliveryProviderStatus[];
  targetTransactions?: {
    targetTxHash?: string;
    targetTxReceipt?: ethers.providers.TransactionReceipt;
    targetChainId?: ChainId;
  }[];
};

export async function populateDeliveryLifeCycleRecordsByTxHash(
  environment: Environment,
  txHash: string,
): Promise<DeliveryLifecycleRecord[]> {
  let sourceTransactionResponse;
  let targetTransactionResponse;
  const output = [] as DeliveryLifecycleRecord[];

  try {
    sourceTransactionResponse = await getDeliveryProviderStatusBySourceTransaction(
      environment,
      txHash,
    );
  } catch (e) {
    console.error("err txhash", e);
    //swallow
  }

  try {
    targetTransactionResponse = await getDeliveryProviderStatusByTargetTransaction(
      environment,
      txHash,
    );
  } catch (e) {
    console.error("err target tx", e);
    //swallow
  }

  if (!sourceTransactionResponse && !targetTransactionResponse) {
    return output;
  }

  if (sourceTransactionResponse && targetTransactionResponse) {
    //This transaction both completes and starts a new transaction, assume it's a source transaction.
    targetTransactionResponse = undefined;
  }

  console.log("source transaction response: " + JSON.stringify(sourceTransactionResponse));

  if (sourceTransactionResponse) {
    for (const status of sourceTransactionResponse) {
      output.push(await populateDeliveryLifecycleRecordByVaa(environment, status.vaa));
    }
  }

  if (targetTransactionResponse) {
    for (const status of targetTransactionResponse) {
      output.push(await populateDeliveryLifecycleRecordByVaa(environment, status.vaa));
    }
  }

  return output;
}

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

  const deliveryStatus = await getDeliveryProviderStatusByVaaInfo(
    environment,
    parsedVaa.emitterChain.toString(),
    parsedVaa.emitterAddress.toString("hex"),
    parsedVaa.sequence.toString(),
  );

  if (deliveryStatus.length === 0) {
    console.log("no info on relayStatus, get source tx hash from wormhole scan api");
    const tx = (await getClient().search.getTransactions({
      chainId: parsedVaa.emitterChain,
      emitter: parsedVaa.emitterAddress.toString("hex"),
      seq: Number(parsedVaa.sequence),
    })) as GetTransactionsOutput;

    output.sourceTxHash = `0x${tx.txHash}`;
    output.sourceSequence = Number(parsedVaa.sequence);
    output.sourceChainId = tx.emitterChain as ChainId;

    return output;
  } else {
    output.DeliveryStatuses = deliveryStatus;
  }

  const sourceTransactions = deliveryStatus.map(status => {
    return status.fromTxHash;
  });

  //All the sourceTransactions should be the same, so just grab the first one
  const sourceTxHash = sourceTransactions[0];
  const sourceChainId = parsedVaa.emitterChain;
  if (sourceTxHash) {
    await getEthersProvider(getChainInfo(environment, sourceChainId as ChainId))
      .getTransactionReceipt(sourceTxHash)
      .then(receipt => {
        output.sourceTxReceipt = receipt;
      })
      .catch(e => {
        console.log("error getting source tx receipt: " + e);
        console.log("source chain: " + sourceChainId);
        console.log("source tx hash: " + sourceTxHash);
      });
  }

  output.sourceTxHash = sourceTxHash || undefined;
  output.sourceChainId = sourceChainId as ChainId;
  output.targetTransactions = [];
  for (const status of deliveryStatus) {
    const targetTxHash = status.toTxHash;
    if (targetTxHash) {
      await getEthersProvider(getChainInfo(environment, targetChain as ChainId))
        .getTransactionReceipt(targetTxHash)
        .then(receipt => {
          output.targetTransactions?.push({
            targetTxHash: targetTxHash,
            targetTxReceipt: receipt,
            targetChainId: targetChain as ChainId,
          });
        })
        .catch(e => {
          console.log("error getting target tx receipt: " + e);
          console.log("target chain: " + targetChain);
          console.log("target tx hash: " + targetTxHash);
        });
    }
  }

  return output;
}

export async function populateDeliveryLifecycleRecordByEmitterSequence(
  environment: Environment,
  chainId: ChainInfo,
  emitterAddress: string,
  sequence: number,
): Promise<DeliveryLifecycleRecord> {
  const VAA = await getVaa(environment, chainId, emitterAddress, sequence.toString());
  //encode vaa to hex and then pass to vaa lifecycle record
  return populateDeliveryLifecycleRecordByVaa(environment, Buffer.from(VAA).toString("hex"));
}

export function decodeVaaFromBase64orHex(vaaRaw: string): Uint8Array {
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

export async function getGenericRelayerVaasFromTransaction(
  environment: Environment,
  chainInfo: ChainInfo,
  txHash: string,
): Promise<Uint8Array[]> {
  const vaas = await getAllVaasFromTransaction(environment, txHash, chainInfo);

  console.log("vaas found during transaction: " + vaas.length);

  const parsedVaas = vaas.map(vaa => {
    return parseVaa(vaa);
  });

  const indexes: number[] = [];

  parsedVaas.forEach((vaa, index) => {
    if (
      vaa.emitterAddress.toString("hex") ===
      tryNativeToHexString(chainInfo.relayerContractAddress, "ethereum")
    ) {
      indexes.push(index);
    }
  });

  const filtered = vaas.filter((vaa, index) => {
    return indexes.includes(index);
  });

  return filtered;
}

export async function getVaa(
  environment: Environment,
  chainInfo: ChainInfo,
  emitterAddress: string,
  sequence: string,
): Promise<Uint8Array | null> {
  const vaa = await getSignedVAAWithRetry(
    environment.guardianRpcs,
    chainInfo.chainId,
    emitterAddress,
    sequence,
    {},
    1000,
    5,
  );
  if (!vaa) {
    return null;
  } else {
    return vaa.vaaBytes;
  }
}

export function parseGenericRelayerVaas(
  vaas: ParsedVaa[],
): (DeliveryInstruction | RedeliveryInstruction)[] {
  const output = vaas.map(vaa => {
    return parseGenericRelayerPayloads([vaa.payload])[0];
  });

  return output;
}

export function parseGenericRelayerPayloads(
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

export async function getAllVaasFromTransaction(
  environment: Environment,
  txHash: string,
  chainInfo: ChainInfo,
): Promise<Uint8Array[]> {
  //Connect to the source chain
  const provider = getEthersProvider(chainInfo);

  //Get the transaction receipt
  const receipt = await provider.getTransactionReceipt(txHash);

  console.log("receipt logs : " + JSON.stringify(receipt.logs));

  //pull all the logs from the bridge transaction
  const bridgeLogs = receipt.logs.filter(l => {
    return l.address.toLowerCase() === chainInfo.coreBridgeAddress.toLowerCase();
  });

  console.log("bridge logs: " + bridgeLogs.length);

  const keys = bridgeLogs.map(bridgeLog => {
    const {
      args: { sequence, sender },
    } = Implementation__factory.createInterface().parseLog(bridgeLog);
    return { sequence, sender };
  });

  const vaas: Uint8Array[] = [];

  for (const key of keys) {
    console.log("about to fetch vaas found during transaction");
    console.log(key.sender, key.sequence);
    const vaa = await getSignedVAAWithRetry(
      environment.guardianRpcs,
      CHAIN_ID_TO_NAME[chainInfo.chainId],
      tryNativeToHexString(key.sender, "ethereum"),
      key.sequence.toString(),
      {},
      1000,
      5,
    );

    vaas.push(vaa.vaaBytes);
  }

  return vaas;
}

export async function getDeliveryStatus(
  env: Environment,
  chainInfo: ChainInfo,
  txHash: string,
  instruction: DeliveryInstruction,
  txIndexPosition: number,
): Promise<DeliveryInfo> {
  const targetChainInfo = env.chainInfos.find(c => c.chainId === instruction.targetChainId);
  if (!targetChainInfo) throw new Error("No chainInfo found for target chain");

  return (await relayer.getWormholeRelayerInfo(CHAIN_ID_TO_NAME[chainInfo.chainId], txHash, {
    sourceChainProvider: getEthersProvider(chainInfo),
    environment: env.network,
    targetChainProviders: getTargetChainProviders(env),
    wormholeRelayerWhMessageIndex: txIndexPosition,
  })) as relayer.DeliveryInfo;
}

export async function getDeliveryStatusByVaa(
  env: Environment,
  vaa: ParsedVaa,
  blockstart: number,
  blockend: number | "latest",
): Promise<relayer.DeliveryTargetInfo[]> {
  const instruction = parseGenericRelayerVaa(vaa);
  const deliveryInstruction = instruction as DeliveryInstruction;

  if (!instruction) {
    throw new Error("Invalid VAA");
  }
  if (isRedelivery(instruction)) {
    throw new Error("Redelivery instruction not supported");
  }
  const targetChainProvider = getTargetChainProviders(env).get(
    CHAIN_ID_TO_NAME[deliveryInstruction.targetChainId as ChainId],
  );
  if (!targetChainProvider) {
    throw new Error("No target chain provider found");
  }
  //defaults
  //const blockNumbers = [-2040, "latest"];

  const targetWormholeRelayerContractAddress = env.chainInfos.find(
    c => c.chainId === deliveryInstruction.targetChainId,
  )?.relayerContractAddress;
  if (!targetWormholeRelayerContractAddress) {
    throw new Error("No target wormhole relayer contract address found");
  }

  const infos = await getWormholeRelayerInfoBySourceSequence(
    env.network,
    CHAIN_ID_TO_NAME[deliveryInstruction.targetChainId as ChainId],
    targetChainProvider,
    CHAIN_ID_TO_NAME[vaa.emitterChain as ChainId],
    ethers.BigNumber.from(vaa.sequence),
    blockstart,
    blockend,
    targetWormholeRelayerContractAddress,
  );

  return infos.events;
}

export function getTargetChainProviders(
  environment: Environment,
): Map<ChainName, ethers.providers.JsonRpcProvider> {
  const output = new Map<ChainName, ethers.providers.JsonRpcProvider>();

  for (const chainInfo of environment.chainInfos) {
    output.set(CHAIN_ID_TO_NAME[chainInfo.chainId], getEthersProvider(chainInfo));
  }

  return output;
}

export function isRedelivery(instruction: DeliveryInstruction | RedeliveryInstruction): boolean {
  return "newSenderAddress" in instruction;
}

export async function manualDeliver(
  environment: Environment,
  chainInfo: ChainInfo,
  rawDeliveryVaa: Uint8Array | Buffer,
  signer: ethers.Signer,
  relayerRefundAddress: string,
  overrides?: DeliveryOverrideArgs,
): Promise<ethers.providers.TransactionResponse> {
  const deliveryInstructionVaa = parseVaa(rawDeliveryVaa);
  const delivery = parseGenericRelayerVaa(deliveryInstructionVaa) as DeliveryInstruction;

  //This code is blatantly stolen from the relayer code
  if (delivery.vaaKeys.findIndex(m => !m.emitterAddress || !m.sequence || !m.chainId) !== -1) {
    throw new Error(`Received an invalid additional VAA key`);
  }
  const vaaKeysString = delivery.vaaKeys.map(m => vaaKeyPrintable(m));
  console.log(`Fetching vaas from parsed delivery vaa manifest...`, {
    vaaKeys: vaaKeysString,
  });

  const vaaIds = delivery.vaaKeys.map(m => ({
    emitterAddress: m.emitterAddress!,
    emitterChain: m.chainId! as ChainId,
    sequence: m.sequence!.toBigInt(),
  }));

  const results: Uint8Array[] = [];

  try {
    for (let i = 0; i < vaaIds.length; i++) {
      const vaaId = vaaIds[i];
      const vaa = await getSignedVAAWithRetry(
        environment.guardianRpcs,
        CHAIN_ID_TO_NAME[vaaId.emitterChain],
        //emitter address is a buffer => uint8Array => wh string
        tryUint8ArrayToNative(vaaId.emitterAddress, "ethereum"),
        vaaId.sequence.toString(),
        {},
        1000,
        5,
      );
      results.push(vaa.vaaBytes);
    }
  } catch (e: any) {
    console.error(`Failed while attempting to pull additional VAAs: ${e}`);
    throw e;
  }

  const receiverValue = overrides?.newReceiverValue
    ? overrides.newReceiverValue
    : delivery.requestedReceiverValue.add(delivery.extraReceiverValue);
  const getMaxRefund = (encodedDeliveryInfo: Buffer) => {
    const [deliveryInfo] = parseEVMExecutionInfoV1(encodedDeliveryInfo, 0);
    return deliveryInfo.targetChainRefundPerGasUnused.mul(deliveryInfo.gasLimit);
  };
  const maxRefund = getMaxRefund(
    overrides?.newExecutionInfo ? overrides.newExecutionInfo : delivery.encodedExecutionInfo,
  );
  const budget = receiverValue.add(maxRefund);

  try {
    const wormholeRelayer = WormholeRelayer__factory.connect(
      chainInfo.relayerContractAddress,
      signer,
    );

    //TODO properly import this type from the SDK for safety
    const input: any = {
      encodedVMs: results,
      encodedDeliveryVAA: rawDeliveryVaa,
      relayerRefundAddress: relayerRefundAddress,
      overrides: overrides ? packOverrides(overrides) : [],
    };

    const receipt = await wormholeRelayer
      .deliver(
        input.encodedVMs,
        input.encodedDeliveryVAA,
        input.relayerRefundAddress,
        input.overrides,
        {
          value: budget,
          gasLimit: 3000000,
        },
      ) //TODO more intelligent gas limit
      .then((x: any) => x.wait());

    return receipt;
  } catch (e: any) {
    console.error(`Failed to deliver: ${e}`);
    throw e;
  }
}

type CoinAmount = {
  nativeQuote: number;
  chain: ChainId;
  spotPrice: number;
  usdValue: number;
};

//TODO sdk
type SendEventRecord = {
  sequence: string;
  deliveryQuote: string;
  paymentForExtraReceiverValue: string;
};

export async function getCaptureAmount(
  sourceChain: ChainInfo,
  sourceTxHash: string,
  sourceSequence: number,
  txReceipt?: ethers.providers.TransactionReceipt,
): Promise<CoinAmount> {
  if (!txReceipt) {
    const provider = getEthersProvider(sourceChain);
    txReceipt = await provider.getTransactionReceipt(sourceTxHash);
  }

  const relayerContractLogs = txReceipt.logs.filter(l => {
    return l.address.toLowerCase() === sourceChain.relayerContractAddress.toLowerCase();
  });

  //TODO pull this off the sdk, don't hardcode
  const eventAbi = [
    "event SendEvent(uint64 indexed sequence, uint256 deliveryQuote, uint256 paymentForExtraReceiverValue)",
  ];

  const requiredSendEvent = relayerContractLogs.filter(log => {
    const iface = new ethers.utils.Interface(eventAbi);
    try {
      const parsedEvent = iface.parseLog(log);
      if (parsedEvent.args[0].toString() === sourceSequence.toString()) {
        return true;
      }
    } catch (e) {
      //If it explodes, it was a deliver event
      return false;
    }
  });

  if (requiredSendEvent.length !== 1) {
    throw new Error(
      "Could not find send event for sequence " + sourceSequence + "in transaction " + sourceTxHash,
    );
  }

  const iface = new ethers.utils.Interface(eventAbi);
  const parsedEvent = iface.parseLog(requiredSendEvent[0]);

  const deliveryQuote = parsedEvent.args[1].toString();
  const paymentForExtraReceiverValue = parsedEvent.args[2].toString();

  const deliveryQuoteNative = parseFloat(
    ethers.utils.formatUnits(deliveryQuote, sourceChain.nativeCurrencyDecimals),
  );
  const paymentForExtraReceiverValueNative = parseFloat(
    ethers.utils.formatUnits(paymentForExtraReceiverValue, sourceChain.nativeCurrencyDecimals),
  );

  const totalCapture = deliveryQuoteNative + paymentForExtraReceiverValueNative;

  return {
    nativeQuote: totalCapture,
    chain: sourceChain.chainId,
    spotPrice: sourceChain.nativeCurrencyUsdPrice,
    usdValue: totalCapture * sourceChain.nativeCurrencyUsdPrice,
  };
}
