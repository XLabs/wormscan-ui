// import {
//   CHAIN_ID_SUI,
//   CONTRACTS,
//   Network,
//   coalesceChainName,
//   isCosmWasmChain,
//   isEVMChain,
//   tryHexToNativeString,
//   tryUint8ArrayToNative,
//   uint8ArrayToHex,
// } from "@certusone/wormhole-sdk";
// import {
//   RelayerPayloadId,
//   parseWormholeRelayerPayloadType,
//   parseWormholeRelayerResend,
//   parseWormholeRelayerSend,
// } from "@certusone/wormhole-sdk/lib/cjs/relayer";
// import { Implementation__factory } from "@certusone/wormhole-sdk/lib/cjs/ethers-contracts";
// import { humanAddress } from "@certusone/wormhole-sdk/lib/cjs/cosmos";

import {
  Network,
  chainIdToChain,
  chainToChainId,
  contracts,
  platformToChains,
  toNative,
} from "@wormhole-foundation/sdk";
import { Contract, TransactionReceipt } from "ethers";
import { CCTP_MANUAL_APP_ID, GR_APP_ID, IStatus, getGuardianSet } from "src/consts";
import { Order, WormholeTokenList } from "src/api";
import { ChainId } from "@wormhole-foundation/sdk";
import { getClient } from "src/api/Client";
import { Environment, SLOW_FINALITY_CHAINS, getChainInfo, getEthersProvider } from "./environment";
import { formatUnits, parseAddress } from "./crypto";
import { isConnect, parseConnectPayload } from "./wh-connect-rpc";
import { TokenMessenger__factory } from "./TokenMessenger__factory";
import { hexToBase58 } from "./string";

type TxReceiptHolder = {
  receipt: TransactionReceipt;
  chainId: ChainId;
};

interface RPCResponse {
  amount?: string;
  appIds?: string[];
  blockNumber?: number;
  chain?: ChainId;
  consistencyLevel?: any;
  emitterAddress?: string;
  emitterNattiveAddress?: string;
  extraRawInfo?: any;
  fee?: string;
  fromAddress?: string;
  id?: string;
  lastFinalizedBlock?: number;
  parsedFromAddress?: string;
  payloadAmount?: string;
  payloadType?: any;
  sequence?: number;
  signaturesCount?: number;
  symbol?: string;
  timestamp?: number;
  toAddress?: string;
  toChain?: ChainId;
  tokenAddress?: string;
  tokenAmount?: string;
  tokenChain?: ChainId;
  toNativeAmount?: string;
  txHash?: string;
  usdAmount?: string;
  wrappedTokenAddress?: string;
  STATUS?: IStatus;
}

async function hitAllSlowChains(
  env: Environment,
  searchValue: string,
): Promise<TxReceiptHolder | null> {
  //map of chainId to promises
  const allPromises: Map<ChainId, Promise<TransactionReceipt | null>> = new Map();

  for (const chain of SLOW_FINALITY_CHAINS) {
    const ethersProvider = getEthersProvider(getChainInfo(env, chain as ChainId));

    if (ethersProvider) {
      const thisPromise = ethersProvider
        .getTransactionReceipt(searchValue)
        .then(async receipt => {
          if ((await receipt.confirmations()) > 0) {
            console.log(`tx is from chain ${chain}`);
            return receipt;
          } else {
            console.log(`no confirmations for this tx on chain ${chain}`);
            return null;
          }
        })
        .catch(_err => {
          console.log(`tx is not from chain ${chain}`);
          return null;
        });
      allPromises.set(chain as ChainId, thisPromise);
    } else {
      console.log("no ethers provider for", { chain, searchValue });
    }
  }

  //filter over all the promises, return the first one that's not null
  for (const [chainId, promise] of allPromises.entries()) {
    const receipt = await promise;
    if (receipt) {
      return { receipt, chainId };
    }
  }

  return null;
}

// Before this, a normal search should be performed.
// If unsuccessful, we hit the RPCs.
// export async function fetchWithRpcFallThrough(env: Environment, searchValue: string) {
//   const result = await hitAllSlowChains(env, searchValue);

//   if (result) {
//     const chainName = chainIdToChain(result.chainId);

//     // This is the hash for topic[0] of the core contract event LogMessagePublished
//     // https://github.com/wormhole-foundation/wormhole/blob/main/ethereum/contracts/Implementation.sol#L12
//     const LOG_MESSAGE_PUBLISHED_TOPIC =
//       "0x6eb224fb001ed210e379b335e35efe88672a8ce935d981a6896b27ffdf52a3b2";
//     const LOG_TRANSFER_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
//     const LOG_MANUAL_CCTP_DEPOSITFORBURN_TOPIC =
//       "0x2fa9ca894982930190727e75500a97d8dc500233a5065e0f3126c48fbe0343c0";

//     const wrappedTokenAddress = result.receipt?.logs.findLast(
//       l => l.topics[0] === LOG_TRANSFER_TOPIC,
//     )?.address;

//     // getting block to read the timestamp
//     const ethersProvider = getEthersProvider(getChainInfo(env, result.chainId as ChainId));
//     const block = await ethersProvider.getBlock(result.receipt.blockNumber);
//     const timestamp = Number(BigInt(block.timestamp)) * 1000;
//     const tokenList = await getClient()
//       .governor.getTokenList()
//       .catch(() => null);

//     let fromAddress = result.receipt.from;
//     let parsedFromAddress = parseAddress({
//       chainId: result.chainId,
//       value: fromAddress,
//     });

//     const txsData: Promise<RPCResponse>[] = result.receipt?.logs
//       .filter(
//         l =>
//           l.address.toLowerCase() === contracts.coreBridge.get(env.network, chainName)?.toLowerCase() &&
//           l.topics[0] === LOG_MESSAGE_PUBLISHED_TOPIC,
//       )
//       .map(async l => {
//         const { args } = Implementation__factory.createInterface().parseLog(l);
//         const { consistencyLevel, payload, sender, sequence } = args;

//         const emitterAddress = l.topics[1].slice(2);
//         const emitterNattiveAddress = parseAddress({
//           chainId: result.chainId,
//           value: emitterAddress,
//         });

//         const VAA_ID = `${result.chainId}/${emitterAddress}/${sequence}`;
//         let extraRawInfo = {};

//         // get already signed guardians
//         try {
//           const observations = await getClient().guardianNetwork.getObservation(
//             {
//               chainId: result.chainId,
//               emmiter: emitterAddress,
//               specific: { sequence: sequence },
//             },
//             { pageSize: 20, page: 0, sortOrder: Order.ASC },
//           );

//           if (!!observations?.length) {
//             const guardianSetList = getGuardianSet(4);

//             const signedGuardians = observations.map(({ guardianAddr, signature }) => ({
//               signature: Buffer.from(signature).toString(),
//               name: guardianSetList?.find(a => a.pubkey === guardianAddr)?.name,
//             }));

//             extraRawInfo = { ...extraRawInfo, signatures: signedGuardians };
//           }
//         } catch (error) {
//           console.log("no observations");
//         }

//         // block info
//         let lastFinalizedBlock: number;
//         try {
//           lastFinalizedBlock = (await ethersProvider.getBlock("finalized")).number;
//         } catch (error) {
//           lastFinalizedBlock = await ethersProvider.getBlockNumber();
//         }

//         // checking if we know how to read the payloads:
//         //   token bridge
//         const TOKEN_BRIDGE_CONTRACT = contracts.tokenBridge.get(env.network, chainName);
//         if (emitterNattiveAddress.toUpperCase() === TOKEN_BRIDGE_CONTRACT.toUpperCase()) {
//           const buff = Buffer.from(payload.slice(2), "hex");
//           const payloadType = buff.subarray(0, 1)?.[0];
//           const amount = BigInt(`0x${buff.subarray(1, 33).toString("hex")}`).toString();

//           const tokenChain = buff.readUInt16BE(65);
//           const tokenAddress = buff.subarray(33, 65)?.toString("hex");

//           const toChain = buff.readUInt16BE(99);
//           let toAddress = buff.subarray(67, 99)?.toString("hex");

//           if (platformToChains('Cosmwasm').map(a => chainToChainId(a)).includes(toChain as any)) {
//             const addressBytes = ethers.utils.arrayify("0x" + toAddress);
//             /* TODO ??
//              * backend should probably NOT use last20bytes and use all bytes here.
//              * but for now, to maintain the same info with or without VAA, we use last 20 bytes */
//             const addressLast20Bytes = new Uint8Array(addressBytes.buffer.slice(-20));
//             const chainName = chainIdToChain(toChain as ChainId);
//             const cosmAddr = humanAddress(chainName, addressLast20Bytes);
//             toAddress = cosmAddr;
//           } else {
//             try {
//               toAddress = tryUint8ArrayToNative(buff.subarray(67, 99), toChain as ChainId);
//             } catch {
//               //
//             }
//           }

//           let fee =
//             payloadType === 1
//               ? BigInt(`0x${buff.subarray(101, 133).toString("hex")}`).toString()
//               : null;

//           fromAddress =
//             payloadType === 3 ? buff.subarray(101, 133)?.toString("hex") : result.receipt.from;

//           parsedFromAddress = parseAddress({
//             chainId: result.chainId,
//             value: fromAddress,
//           });

//           const tokenTransferPayload =
//             payloadType === 3 ? buff.subarray(133)?.toString("hex") : null;

//           let appIds = ["PORTAL_TOKEN_BRIDGE"];
//           if (tokenTransferPayload) {
//             if (isConnect(env.network, result.chainId, fromAddress)) {
//               appIds = ["PORTAL_TOKEN_BRIDGE", "CONNECT"];
//               const parsed = parseConnectPayload(buff.subarray(133));

//               if (toChain === chainToChainId("Sui")) {
//                 toAddress = `0x${parsed.recipientWallet}`;
//               } else {
//                 toAddress = toNative(chainIdToChain(toChain as ChainId), parsed.recipientWallet)?.toString();
//               }
//               fee = parsed.targetRelayerFee.toString();
//             }
//           }

//           // other values
//           const parsedTokenAddress = parseAddress({
//             chainId: tokenChain as ChainId,
//             value: tokenAddress,
//             anyChain: true,
//           });

//           const { name, symbol, tokenDecimals } = await getTokenInformation(
//             tokenChain,
//             env,
//             parsedTokenAddress,
//             wrappedTokenAddress,
//             result.chainId,
//           );
//           const decimals = tokenDecimals ? Math.min(8, tokenDecimals) : 8;

//           const tokenAmount =
//             amount && decimals ? ethers.formatUnits(amount, decimals) : null;

//           const usdAmount =
//             "" +
//               tokenList?.find((t: WormholeTokenList) =>
//                 t.originAddress.toLowerCase().includes(tokenAddress.toLowerCase()),
//               )?.price *
//                 Number(tokenAmount) || null;

//           return {
//             amount:
//               amount && decimals
//                 ? ethers.formatUnits(amount, decimals)
//                 : amount
//                 ? amount
//                 : null,
//             appIds,
//             blockNumber: result.receipt.blockNumber,
//             chain: result.chainId,
//             consistencyLevel,
//             emitterAddress,
//             emitterNattiveAddress,
//             extraRawInfo,
//             fee: fee && decimals ? ethers.formatUnits(fee, decimals) : fee ? fee : null,
//             fromAddress: parsedFromAddress,
//             id: VAA_ID,
//             lastFinalizedBlock,
//             name,
//             payloadType,
//             sender,
//             sequence: sequence.toString(),
//             STATUS: "IN_PROGRESS",
//             symbol,
//             timestamp,
//             toAddress,
//             toChain,
//             tokenAddress: parsedTokenAddress,
//             tokenAmount,
//             tokenChain,
//             txHash: searchValue,
//             usdAmount,
//           };
//         }
//         // CCTP USDC-BRIDGE
//         else if (
//           emitterNattiveAddress.toUpperCase() ===
//           getCctpEmitterAddress(env, result.chainId)?.toUpperCase()
//         ) {
//           const parseCCTPRelayerPayload = (payloadArray: Buffer): CircleRelayerPayload => {
//             // start vaa payload
//             let offset = 0;
//             const version = payloadArray.readUint8(offset);
//             offset += 1; // 1
//             const tokenAddress = parseAddress({
//               chainId: result.chainId,
//               value: payloadArray.subarray(offset, offset + 32)?.toString("hex"),
//             });
//             offset += 32; // 33
//             const amount = ethers.BigNumber.from(payloadArray.subarray(offset, offset + 32));
//             offset += 32; // 65
//             const fromDomain = payloadArray.readUInt32BE(offset);
//             offset += 4; // 69
//             const toDomain = payloadArray.readUInt32BE(offset);
//             offset += 4; // 73

//             function readBigUint64BE(arr: any, offset = 0) {
//               let result = BigInt(0);
//               for (let i = 0; i < 8; i++) {
//                 result = (result << BigInt(8)) + BigInt(arr[offset + i]);
//               }
//               return result;
//             }
//             const nonce = readBigUint64BE(payloadArray, offset).toString();
//             offset += 8; // 81
//             const fromAddressBytes = payloadArray.subarray(offset, offset + 32);
//             offset += 32; // 113
//             const mintRecipientBuff = payloadArray.subarray(offset, offset + 32);
//             offset += 32; // 145
//             offset += 2; // 147 (2 bytes for payload length)
//             const payload = payloadArray.subarray(offset);
//             // end vaa payload

//             // different cctp payloads here:
//             // STABLE
//             let appIds = ["CCTP_WORMHOLE_INTEGRATION"];
//             let payloadId = null;
//             let feeAmount = null;
//             let toNativeAmount = null;
//             let toAddress = null;
//             if (STABLE_ADDRESSES[env.network].includes(fromAddressBytes.toString("hex"))) {
//               appIds = ["CCTP_WORMHOLE_INTEGRATION", "STABLE"];

//               // start payload of vaa payload reading
//               offset = 0;
//               payloadId = payload.readUint8(offset);
//               offset += 1; // 148
//               feeAmount = ethers.BigNumber.from(payload.subarray(offset, offset + 32));
//               offset += 32; // 180
//               toNativeAmount = ethers.BigNumber.from(
//                 payload.subarray(offset, offset + 32),
//               ).toString();
//               offset += 32; // 212

//               const recipientWalletBytes = Uint8Array.from(payload.subarray(offset, offset + 32));
//               toAddress = uint8ArrayToHex(recipientWalletBytes);
//               // end payload
//             }

//             const circleInfo = {
//               amount,
//               appIds,
//               feeAmount,
//               fromAddressBytes,
//               fromDomain,
//               mintRecipientBuff,
//               nonce,
//               payload,
//               payloadId,
//               toAddress,
//               toDomain,
//               tokenAddress,
//               toNativeAmount,
//               version,
//             };
//             return circleInfo;
//           };

//           const cctpResult = parseCCTPRelayerPayload(Buffer.from(payload.slice(2), "hex"));
//           const amount = "" + 0.000001 * +cctpResult.amount; // 6 decimals for USDC
//           const fee = "" + 0.000001 * +cctpResult.feeAmount; // 6 decimals for USDC
//           const toNativeAmount = "" + 0.000001 * +cctpResult.toNativeAmount; // 6 decimals for USDC

//           const usdAmount =
//             "" +
//               tokenList?.find((t: WormholeTokenList) =>
//                 t.originAddress
//                   .toLowerCase()
//                   .includes(cctpResult.tokenAddress.slice(2).toLowerCase()),
//               )?.price *
//                 Number(amount) || amount;

//           return {
//             amount,
//             appIds: cctpResult.appIds,
//             chain: result.chainId,
//             consistencyLevel,
//             emitterAddress,
//             emitterNattiveAddress,
//             extraRawInfo,
//             fee: `${+fee + +toNativeAmount}`,
//             fromAddress,
//             id: VAA_ID,
//             parsedFromAddress,
//             sequence: sequence.toString(),
//             STATUS: "IN_PROGRESS",
//             symbol: "USDC",
//             timestamp,
//             toAddress: cctpResult.toAddress,
//             toChain: getCctpDomain(cctpResult.toDomain),
//             tokenAddress: cctpResult.tokenAddress,
//             tokenAmount: amount,
//             tokenChain: result.chainId,
//             toNativeAmount,
//             txHash: searchValue,
//             usdAmount,
//             wrappedTokenAddress: getUsdcAddress(env.network, getCctpDomain(cctpResult.toDomain)),
//           };
//         }
//         // GENERIC-RELAYER
//         else if (
//           emitterNattiveAddress.toUpperCase() ===
//           getRelayersEmitterAddress(env, result.chainId)?.toUpperCase()
//         ) {
//           const parseGenericRelayerDelivery = async (
//             payloadArray: Buffer,
//           ): Promise<RPCResponse> => {
//             const deliveryInstructions = parseWormholeRelayerSend(payloadArray);

//             extraRawInfo = {
//               ...extraRawInfo,
//               targetChainId: deliveryInstructions.targetChainId,
//               targetAddress: deliveryInstructions.targetAddress.toString("hex"),
//               payload: deliveryInstructions.payload.toString("hex"),
//               requestedReceiverValue: deliveryInstructions.requestedReceiverValue.toString(),
//               extraReceiverValue: deliveryInstructions.extraReceiverValue.toString(),
//               encodedExecutionInfo: deliveryInstructions.encodedExecutionInfo.toString("hex"),
//               refundChainId: deliveryInstructions.refundChainId,
//               refundAddress: deliveryInstructions.refundAddress.toString("hex"),
//               refundDeliveryProvider: deliveryInstructions.refundDeliveryProvider.toString("hex"),
//               sourceDeliveryProvider: deliveryInstructions.sourceDeliveryProvider.toString("hex"),
//               senderAddress: deliveryInstructions.senderAddress.toString("hex"),
//               // deliveryInstructions.vaaKeys was deleted from wormholes sdk
//               //vaaKeys: serializeVaaKeys(deliveryInstructions.vaaKeys),
//             };

//             const deliveryResult = {
//               appIds: [GR_APP_ID],
//               blockNumber: result.receipt.blockNumber,
//               chain: result.chainId,
//               consistencyLevel,
//               emitterAddress,
//               emitterNattiveAddress,
//               extraRawInfo,
//               fromAddress: parsedFromAddress,
//               id: VAA_ID,
//               lastFinalizedBlock,
//               payloadType: RelayerPayloadId.Delivery,
//               sequence: sequence.toString(),
//               STATUS: "IN_PROGRESS" as IStatus,
//               timestamp,
//               toAddress: deliveryInstructions.targetAddress.toString("hex"),
//               toChain: deliveryInstructions.targetChainId,
//               tokenAddress: wrappedTokenAddress,
//               tokenChain: result.chainId,
//               txHash: searchValue,
//             };

//             return deliveryResult;
//           };

//           const parseGenericRelayerRedelivery = async (payloadArray: Buffer): Promise<any> => {
//             const redeliveryInstructions = parseWormholeRelayerResend(payloadArray);

//             extraRawInfo = {
//               ...extraRawInfo,
//               payloadType: RelayerPayloadId.Redelivery,
//               targetChainId: redeliveryInstructions.targetChainId,
//               newRequestedReceiverValue:
//                 redeliveryInstructions.newRequestedReceiverValue.toString(),
//               newEncodedExecutionInfo:
//                 redeliveryInstructions.newEncodedExecutionInfo.toString("hex"),
//               newSourceDeliveryProvider:
//                 redeliveryInstructions.newSourceDeliveryProvider.toString("hex"),
//               newSenderAddress: redeliveryInstructions.newSenderAddress.toString("hex"),
//             };

//             const redeliveryResult = {
//               appIds: [GR_APP_ID],
//               blockNumber: result.receipt.blockNumber,
//               chain: result.chainId,
//               consistencyLevel,
//               emitterAddress,
//               emitterNattiveAddress,
//               extraRawInfo,
//               fromAddress: parsedFromAddress,
//               id: VAA_ID,
//               lastFinalizedBlock,
//               payloadType: RelayerPayloadId.Redelivery,
//               sequence: sequence.toString(),
//               STATUS: "IN_PROGRESS" as IStatus,
//               timestamp,
//               toChain: redeliveryInstructions.targetChainId,
//               tokenAddress: wrappedTokenAddress,
//               tokenChain: result.chainId,
//               txHash: searchValue,
//             };
//             return redeliveryResult;
//           };

//           const relayerVaa = Buffer.from(payload.slice(2), "hex");
//           const payloadType = parseWormholeRelayerPayloadType(relayerVaa);

//           if (payloadType === RelayerPayloadId.Delivery) {
//             return parseGenericRelayerDelivery(relayerVaa);
//           }
//           if (payloadType === RelayerPayloadId.Redelivery) {
//             return parseGenericRelayerRedelivery(relayerVaa);
//           }
//           throw new Error("Expected GR Delivery payload type");
//         }
//         // default, no token-bridge nor cctp ones
//         // (can add other wormhole payload readers here)
//         else {
//           return null;
//         }
//       });

//     if (!!txsData.length) return txsData;

//     // Check if receipt is from non-wormhole CCTP
//     const manualCctpData: Promise<RPCResponse>[] = result.receipt?.logs
//       .filter(
//         l => l.topics[0]?.toLowerCase() === LOG_MANUAL_CCTP_DEPOSITFORBURN_TOPIC.toLowerCase(),
//       )
//       .map(async l => {
//         const { args } = TokenMessenger__factory.createInterface().parseLog(l);

//         const emitterAddress = l.address;
//         const emitterNattiveAddress = parseAddress({
//           chainId: result.chainId,
//           value: emitterAddress,
//         });

//         const { amount, burnToken, destinationDomain, mintRecipient } = args;

//         const toChain = getCctpDomain(destinationDomain);
//         const toAddress =
//           toChain === 1 ? hexToBase58(mintRecipient) : "0x" + mintRecipient.substring(26);

//         return {
//           amount: "" + formatUnits(amount.toString(), 6),
//           appIds: [CCTP_MANUAL_APP_ID],
//           chain: result.chainId,
//           emitterAddress,
//           emitterNattiveAddress,
//           fee: "0",
//           fromAddress,
//           parsedFromAddress,
//           payloadAmount: amount.toString(),
//           symbol: "USDC",
//           timestamp,
//           toAddress,
//           toChain,
//           tokenAddress: burnToken,
//           tokenAmount: "" + formatUnits(amount.toString(), 6),
//           tokenChain: result.chainId,
//           txHash: searchValue,
//           usdAmount: "" + formatUnits(amount.toString(), 6),
//           wrappedTokenAddress: getUsdcAddress(env.network, getCctpDomain(destinationDomain)),
//           STATUS: "EXTERNAL_TX" as IStatus,

//           // no data properties
//           id: null,
//           payloadType: null,
//           sequence: null,
//           toNativeAmount: null,
//           blockNumber: null,
//           lastFinalizedBlock: null,
//         };
//       });

//     return !!manualCctpData.length ? manualCctpData : null;
//   } else {
//     return null;
//   }
// }

// CCTP UTILS -----
interface CircleRelayerPayload {
  amount: bigint;
  appIds: Array<string>;
  feeAmount: bigint;
  fromAddressBytes: Buffer;
  fromDomain: number;
  mintRecipientBuff: Buffer;
  nonce: string;
  payload: Buffer;
  payloadId: number;
  toAddress: string;
  toDomain: number;
  tokenAddress: string;
  toNativeAmount: string;
  version: number;
}

const STABLE_ADDRESSES: Record<Network, Array<string>> = {
  Mainnet: [
    "0000000000000000000000004cb69fae7e7af841e44e1a1c30af640739378bb2",
    "00000000000000000000000032dec3f4a0723ce02232f87e8772024e0c86d834",
    "0000000000000000000000004cb69fae7e7af841e44e1a1c30af640739378bb2",
    "0000000000000000000000004cb69fae7e7af841e44e1a1c30af640739378bb2",
    "0000000000000000000000004cb69fae7e7af841e44e1a1c30af640739378bb2",
  ],
  Testnet: [
    "00000000000000000000000017da1ff5386d044c63f00747b5b8ad1e3806448d",
    "000000000000000000000000774a70bbd03327c21460b60f25b677d9e46ab458",
    "000000000000000000000000bf683d541e11320418ca78ec13309938e6c5922f",
    "0000000000000000000000004cb69fae7e7af841e44e1a1c30af640739378bb2",
  ],
  Devnet: null,
};

export const getCctpDomain = (dom: number) => {
  if (dom === 0) return chainToChainId("Ethereum");
  if (dom === 1) return chainToChainId("Avalanche");
  if (dom === 2) return chainToChainId("Optimism");
  if (dom === 3) return chainToChainId("Arbitrum");
  if (dom === 5) return chainToChainId("Solana");
  if (dom === 6) return chainToChainId("Base");
  return null;
};

const getCctpEmitterAddress = (env: Environment, chain: ChainId) => {
  if (env.network === "Mainnet") {
    if (chain === chainToChainId("Ethereum")) return "0xaada05bd399372f0b0463744c09113c137636f6a";
    if (chain === chainToChainId("Avalanche")) return "0x09fb06a271faff70a651047395aaeb6265265f13";
    if (chain === chainToChainId("Arbitrum")) return "0x2703483B1a5a7c577e8680de9Df8Be03c6f30e3c";
    if (chain === chainToChainId("Optimism")) return "0x2703483B1a5a7c577e8680de9Df8Be03c6f30e3c";
    if (chain === chainToChainId("Base")) return "0x03fabb06fa052557143dc28efcfc63fc12843f1d";
  } else {
    if (chain === chainToChainId("Ethereum")) return "0x0a69146716b3a21622287efa1607424c663069a4";
    if (chain === chainToChainId("Avalanche")) return "0x58f4c17449c90665891c42e14d34aae7a26a472e";
    if (chain === chainToChainId("Arbitrum")) return "0x2e8f5e00a9c5d450a72700546b89e2b70dfb00f2";
    if (chain === chainToChainId("Optimism")) return "0x2703483B1a5a7c577e8680de9Df8Be03c6f30e3c";
    if (chain === chainToChainId("Base")) return "0x2703483B1a5a7c577e8680de9Df8Be03c6f30e3c";
  }
  return null;
};

export const getUsdcAddress = (network: Network, chain: ChainId) => {
  if (network === "Mainnet") {
    if (chain === chainToChainId("Ethereum")) return "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
    if (chain === chainToChainId("Avalanche")) return "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E";
    if (chain === chainToChainId("Arbitrum")) return "0xaf88d065e77c8cc2239327c5edb3a432268e5831";
    if (chain === chainToChainId("Optimism")) return "0x0b2c639c533813f4aa9d7837caf62653d097ff85";
    if (chain === chainToChainId("Solana")) return "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
    if (chain === chainToChainId("Base")) return "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
  } else {
    if (chain === chainToChainId("Ethereum")) return "0x07865c6e87b9f70255377e024ace6630c1eaa37f";
    if (chain === chainToChainId("Avalanche")) return "0x5425890298aed601595a70ab815c96711a31bc65";
    if (chain === chainToChainId("Arbitrum")) return "0xfd064a18f3bf249cf1f87fc203e90d8f650f2d63";
    if (chain === chainToChainId("Optimism")) return "0xe05606174bac4a6364b31bd0eca4bf4dd368f8c6";
    if (chain === chainToChainId("Solana")) return "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";
    if (chain === chainToChainId("Base")) return "0xf175520c52418dfe19c8098071a252da48cd1c19";
  }
  return null;
};
// -----

// RPCs UTILS -----
const getRelayersEmitterAddress = (env: Environment, chain: ChainId) => {
  const relayeEmitterAddress = env.chainInfos?.find(
    a => a.chainId === chain,
  )?.relayerContractAddress;

  return relayeEmitterAddress ? relayeEmitterAddress : null;
};

const getSolanaTokenDetails = async (mintAddress: string) => {
  try {
    // Fetch the Solana token list
    const response = await fetch(
      "https://raw.githubusercontent.com/solflare-wallet/token-list/master/solana-tokenlist.json",
    );
    const data = await response.json();

    // Search for the token by its mint address
    const token = data?.tokens?.find(
      (token: any) => token.address?.toUpperCase() === mintAddress.toUpperCase(),
    );

    if (token) {
      return { name: token.name, symbol: token.symbol, tokenDecimals: token.decimals };
    }
    return null;
  } catch (error) {
    return null;
  }
};

const getEvmTokenDetails = async (env: Environment, tokenChain: ChainId, tokenAddress: string) => {
  const tokenInterfaceAbi = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
  ];

  try {
    const addr = toNative(chainIdToChain(tokenChain), tokenAddress)?.toString();

    const tokenEthersProvider = getEthersProvider(getChainInfo(env, tokenChain as ChainId));
    const evmContract = new Contract(addr, tokenInterfaceAbi, tokenEthersProvider);
    const contract = evmContract;

    const [name, symbol, tokenDecimals] = await Promise.all([
      contract.name(),
      contract.symbol(),
      contract.decimals(),
    ]);
    return { name, symbol, tokenDecimals };
  } catch (error) {
    console.error("Error fetching token info:", error);
    return { name: "Unknown", symbol: "Unknown" };
  }
};

export const getTokenInformation = async (
  tokenChain: ChainId,
  env: Environment,
  parsedTokenAddress: string,
  wrappedTokenAddress?: string,
  resultChain?: ChainId,
) => {
  // get token information
  let name: string;
  let symbol: string;
  let tokenDecimals: number;

  // --- try to get REAL token information
  // evm token
  if (
    platformToChains("Evm")
      .map(a => chainToChainId(a))
      .includes(tokenChain as any)
  ) {
    const tokenResult = await getEvmTokenDetails(env, tokenChain, parsedTokenAddress);

    name = tokenResult.name;
    symbol = tokenResult.symbol;
    tokenDecimals = Number(tokenResult.tokenDecimals);
  }

  // solana token
  if (tokenChain === chainToChainId("Solana")) {
    const tokenResult = await getSolanaTokenDetails(parsedTokenAddress);
    name = tokenResult?.name ? tokenResult.name : null;
    symbol = tokenResult?.symbol ? tokenResult.symbol : null;
    tokenDecimals = tokenResult?.tokenDecimals ? Number(tokenResult.tokenDecimals) : null;
  }

  if (name || !wrappedTokenAddress) {
    return { name, symbol, tokenDecimals };
  }

  // if wasn't possible and wrappedTokenAddress is there,
  //       try to get WRAPPED token information
  // evm wrapped token
  if (
    platformToChains("Evm")
      .map(a => chainToChainId(a))
      .includes(resultChain as any)
  ) {
    const tokenResult = await getEvmTokenDetails(env, resultChain, wrappedTokenAddress);

    name = tokenResult.name;
    symbol = tokenResult.symbol;
    tokenDecimals = Number(tokenResult.tokenDecimals);
  }

  // solana wrapped token
  if (resultChain === chainToChainId("Solana")) {
    const tokenResult = await getSolanaTokenDetails(wrappedTokenAddress);
    name = tokenResult?.name ? tokenResult.name : null;
    symbol = tokenResult?.symbol ? tokenResult.symbol : null;
    tokenDecimals = tokenResult?.tokenDecimals ? Number(tokenResult.tokenDecimals) : null;
  }

  return { name, symbol, tokenDecimals };
};

export async function getEvmBlockInfo(env: Environment, fromChain: ChainId, txHash: string) {
  const ethersProvider = getEthersProvider(getChainInfo(env, fromChain));

  let lastFinalizedBlock;
  let currentBlock;

  try {
    lastFinalizedBlock = (await ethersProvider.getBlock("finalized")).number;
  } catch (_err) {
    try {
      lastFinalizedBlock = await ethersProvider.getBlockNumber();
    } catch (_err) {
      lastFinalizedBlock = null;
    }
  }

  try {
    currentBlock = (await ethersProvider.getTransactionReceipt(txHash)).blockNumber;
  } catch (_err) {
    currentBlock = null;
  }

  return { lastFinalizedBlock, currentBlock };
}
