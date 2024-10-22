import {
  ChainId,
  chainIdToChain,
  chainToChainId,
  circleConnectPayload,
  contracts,
  deserializeLayout,
  deserializePayload,
  Network,
  payloadDiscriminator,
  platformToChains,
  toNative,
  UniversalAddress,
} from "@wormhole-foundation/sdk";
import { ethers_contracts } from "@wormhole-foundation/sdk-evm-core";
import { ethers_contracts as circle_contracts } from "@wormhole-foundation/sdk-evm-cctp";
import { Contract, TransactionReceipt, formatUnits as ethersFormatUnits } from "ethers";
import { CCTP_MANUAL_APP_ID, GR_APP_ID, IStatus, getGuardianSet } from "src/consts";
import { Order, WormholeTokenList } from "src/api";
import { getClient } from "src/api/Client";
import {
  Environment,
  SLOW_FINALITY_CHAINS_MAINNET,
  SLOW_FINALITY_CHAINS_TESTNET,
  getChainInfo,
  getEthersProvider,
} from "./environment";
import { formatUnits, parseAddress } from "./crypto";
import { isConnect, parseConnectPayload } from "./wh-connect-rpc";
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

  const SLOW_FINALITY_CHAINS =
    env.network === "Mainnet" ? SLOW_FINALITY_CHAINS_MAINNET : SLOW_FINALITY_CHAINS_TESTNET;

  for (const chain of SLOW_FINALITY_CHAINS) {
    const ethersProvider = getEthersProvider(getChainInfo(env, chain as ChainId));

    if (ethersProvider) {
      const thisPromise = ethersProvider
        .getTransactionReceipt(searchValue)
        .then(async receipt => {
          if ((await receipt.confirmations()) > 0) {
            console.log(`tx is from chain ${chain} (${chainIdToChain(chain)})`);
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
export async function fetchWithRpcFallThrough(env: Environment, searchValue: string) {
  const result = await hitAllSlowChains(env, searchValue);

  if (result) {
    const chainName = chainIdToChain(result.chainId);

    // This is the hash for topic[0] of the core contract event LogMessagePublished
    // https://github.com/wormhole-foundation/wormhole/blob/main/ethereum/contracts/Implementation.sol#L12
    const LOG_MESSAGE_PUBLISHED_TOPIC =
      "0x6eb224fb001ed210e379b335e35efe88672a8ce935d981a6896b27ffdf52a3b2";
    const LOG_TRANSFER_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
    const LOG_MANUAL_CCTP_DEPOSITFORBURN_TOPIC =
      "0x2fa9ca894982930190727e75500a97d8dc500233a5065e0f3126c48fbe0343c0";

    const wrappedTokenAddress = result.receipt?.logs.findLast(
      l => l.topics[0] === LOG_TRANSFER_TOPIC,
    )?.address;

    // getting block to read the timestamp
    const ethersProvider = getEthersProvider(getChainInfo(env, result.chainId as ChainId));
    const block = await ethersProvider.getBlock(result.receipt.blockNumber);
    const timestamp = Number(BigInt(block.timestamp)) * 1000;
    const tokenList = await getClient()
      .governor.getTokenList()
      .catch(() => null);

    let fromAddress = result.receipt.from;
    let parsedFromAddress = parseAddress({
      chainId: result.chainId,
      value: fromAddress,
    });

    const txsData: Promise<RPCResponse>[] = result.receipt?.logs
      .filter(
        l =>
          l.address.toLowerCase() ===
            contracts.coreBridge.get(env.network, chainName)?.toLowerCase() &&
          l.topics[0] === LOG_MESSAGE_PUBLISHED_TOPIC,
      )
      .map(async l => {
        const { args } = ethers_contracts.Implementation__factory.createInterface().parseLog(l);
        const { consistencyLevel, payload, sender, sequence } = args;

        const emitterAddress = l.topics[1].slice(2);
        const emitterNattiveAddress = parseAddress({
          chainId: result.chainId,
          value: emitterAddress,
        });

        const VAA_ID = `${result.chainId}/${emitterAddress}/${sequence}`;
        let extraRawInfo = {};

        // get already signed guardians
        try {
          const observations = await getClient().guardianNetwork.getObservation(
            {
              chainId: result.chainId,
              emmiter: emitterAddress,
              specific: { sequence: sequence },
            },
            { pageSize: 20, page: 0, sortOrder: Order.ASC },
          );

          if (!!observations?.length) {
            const guardianSetList = getGuardianSet(4);

            const signedGuardians = observations.map(({ guardianAddr, signature }) => ({
              signature: Buffer.from(signature).toString(),
              name: guardianSetList?.find(a => a.pubkey === guardianAddr)?.name,
            }));

            extraRawInfo = { ...extraRawInfo, signatures: signedGuardians };
          }
        } catch (error) {
          console.log("no observations");
        }

        // block info
        let lastFinalizedBlock: number;
        try {
          lastFinalizedBlock = (await ethersProvider.getBlock("finalized")).number;
        } catch (error) {
          lastFinalizedBlock = await ethersProvider.getBlockNumber();
        }

        const TOKEN_BRIDGE_CONTRACT = contracts.tokenBridge.get(env.network, chainName);
        const CCTP_CONTRACT = contracts.circleContracts.get(env.network, chainName)?.wormhole;

        // checking if we know how to read the payloads:
        //   token bridge
        if (emitterNattiveAddress.toUpperCase() === TOKEN_BRIDGE_CONTRACT.toUpperCase()) {
          const buff = Buffer.from(payload.slice(2), "hex");
          const payloadType = buff.subarray(0, 1)?.[0];
          const amount = BigInt(`0x${buff.subarray(1, 33).toString("hex")}`).toString();

          const tokenChain = buff.readUInt16BE(65) as ChainId;
          const tokenAddress = buff.subarray(33, 65)?.toString("hex");

          const toChain = buff.readUInt16BE(99) as ChainId;
          let toAddress = buff.subarray(67, 99)?.toString("hex");

          // gateway target
          if (
            platformToChains("Cosmwasm")
              .map(a => chainToChainId(a))
              .includes(toChain as any)
          ) {
            const cosmAddr = new UniversalAddress(toAddress)
              ?.toNative(chainIdToChain(toChain))
              ?.toString();
            toAddress = cosmAddr;
          }

          let fee =
            payloadType === 1
              ? BigInt(`0x${buff.subarray(101, 133).toString("hex")}`).toString()
              : null;

          fromAddress =
            payloadType === 3 ? buff.subarray(101, 133)?.toString("hex") : result.receipt.from;

          parsedFromAddress = parseAddress({
            chainId: result.chainId,
            value: fromAddress,
          });

          const tokenTransferPayload =
            payloadType === 3 ? buff.subarray(133)?.toString("hex") : null;

          let appIds = ["PORTAL_TOKEN_BRIDGE"];
          if (tokenTransferPayload) {
            if (isConnect(env.network, result.chainId, fromAddress)) {
              appIds = ["PORTAL_TOKEN_BRIDGE", "CONNECT"];
              const parsed = parseConnectPayload(buff.subarray(133));

              if (toChain === chainToChainId("Sui")) {
                toAddress = `0x${parsed.recipientWallet}`;
              } else {
                toAddress = toNative(
                  chainIdToChain(toChain as ChainId),
                  parsed.recipientWallet,
                )?.toString();
              }
              fee = parsed.targetRelayerFee.toString();
            }
          }

          // other values
          const parsedTokenAddress = parseAddress({
            chainId: tokenChain,
            value: tokenAddress,
            anyChain: true,
          });

          const { name, symbol, tokenDecimals } = await getTokenInformation(
            tokenChain,
            env,
            parsedTokenAddress,
            wrappedTokenAddress,
            result.chainId,
          );
          const decimals = tokenDecimals ? Math.min(8, tokenDecimals) : 8;

          const tokenAmount = amount && decimals ? ethersFormatUnits(amount, decimals) : null;

          const usdAmount =
            "" +
              tokenList?.find((t: WormholeTokenList) =>
                t.originAddress.toLowerCase().includes(tokenAddress.toLowerCase()),
              )?.price *
                Number(tokenAmount) || null;

          return {
            amount:
              amount && decimals ? ethersFormatUnits(amount, decimals) : amount ? amount : null,
            appIds,
            blockNumber: result.receipt.blockNumber,
            chain: result.chainId,
            consistencyLevel,
            emitterAddress,
            emitterNattiveAddress,
            extraRawInfo,
            fee: fee && decimals ? ethersFormatUnits(fee, decimals) : fee ? fee : null,
            fromAddress: parsedFromAddress,
            id: VAA_ID,
            lastFinalizedBlock,
            name,
            payloadType,
            sender,
            sequence: sequence.toString(),
            STATUS: "IN_PROGRESS" as IStatus,
            symbol,
            timestamp,
            toAddress,
            toChain,
            tokenAddress: parsedTokenAddress,
            tokenAmount,
            tokenChain,
            txHash: searchValue,
            usdAmount,
          };
        }
        // CCTP USDC-BRIDGE
        else if (emitterNattiveAddress?.toUpperCase() === CCTP_CONTRACT?.toUpperCase()) {
          const parsed = deserializePayload("AutomaticCircleBridge:DepositWithPayload", payload);
          const parsed2 = deserializePayload("AutomaticCircleBridge:TransferWithRelay", payload);
          const stable = deserializeLayout(circleConnectPayload, parsed.payload);
          const isStable = !!stable?.targetRecipient;

          const circleInfo = {
            amount: parsed.token?.amount?.toString(),
            appIds: isStable
              ? ["CCTP_WORMHOLE_INTEGRATION", "STABLE"]
              : ["CCTP_WORMHOLE_INTEGRATION"],
            feeAmount: isStable
              ? stable.targetRelayerFee?.toString()
              : parsed2.payload?.targetRelayerFee?.toString(),
            fromDomain: parsed.sourceDomain,
            toDomain: parsed.targetDomain,
            nonce: parsed.nonce?.toString(),
            tokenAddress: parsed.token?.address?.toNative("Ethereum")?.toString(),
            toNativeAmount: isStable
              ? stable.toNativeTokenAmount?.toString()
              : parsed2.payload?.toNativeTokenAmount?.toString(),
            toAddress: isStable
              ? stable.targetRecipient?.toNative("Ethereum")?.toString()
              : parsed2?.payload?.targetRecipient?.toNative("Ethereum")?.toString(),
          };

          const amount = "" + 0.000001 * +circleInfo.amount; // 6 decimals for USDC
          const fee = "" + 0.000001 * +circleInfo.feeAmount; // 6 decimals for USDC
          const toNativeAmount = "" + 0.000001 * +circleInfo.toNativeAmount; // 6 decimals for USDC

          const usdAmount =
            "" +
              tokenList?.find((t: WormholeTokenList) =>
                t.originAddress
                  .toLowerCase()
                  .includes(circleInfo.tokenAddress.slice(2).toLowerCase()),
              )?.price *
                Number(amount) || amount;

          return {
            amount,
            appIds: circleInfo.appIds,
            chain: result.chainId,
            consistencyLevel,
            emitterAddress,
            emitterNattiveAddress,
            extraRawInfo,
            fee: `${+fee + +toNativeAmount}`,
            fromAddress,
            id: VAA_ID,
            parsedFromAddress,
            sequence: sequence.toString(),
            STATUS: "IN_PROGRESS" as IStatus,
            symbol: "USDC",
            timestamp,
            toAddress: circleInfo.toAddress,
            toChain: getCctpDomain(circleInfo.toDomain),
            tokenAddress: circleInfo.tokenAddress,
            tokenAmount: amount,
            tokenChain: result.chainId,
            toNativeAmount,
            txHash: searchValue,
            usdAmount,
            wrappedTokenAddress: getUsdcAddress(env.network, getCctpDomain(circleInfo.toDomain)),
          };
        }
        // GENERIC-RELAYER
        else if (
          emitterNattiveAddress.toUpperCase() ===
          getRelayersEmitterAddress(env, result.chainId)?.toUpperCase()
        ) {
          const buildDelivery = async (
            deliveryInstructions: DeliveryPayload,
          ): Promise<RPCResponse> => {
            const targetAddress = deliveryInstructions.target?.address
              ?.toNative("Ethereum")
              ?.toString();
            const targetChainId = chainToChainId(deliveryInstructions.target?.chain);

            extraRawInfo = {
              ...extraRawInfo,
              targetChainId,
              targetAddress,
              payload: deliveryInstructions.payload
                ? Buffer.from(deliveryInstructions.payload).toString("hex")
                : "",
              requestedReceiverValue: deliveryInstructions.requestedReceiverValue.toString(),
              extraReceiverValue: deliveryInstructions.extraReceiverValue.toString(),
              encodedExecutionInfo: deliveryInstructions.executionInfo,
              refundChainId: chainToChainId(deliveryInstructions.refund?.chain),
              refundAddress: deliveryInstructions.refund?.address?.toNative("Ethereum")?.toString(),
              refundDeliveryProvider: deliveryInstructions.refundDeliveryProvider
                ?.toNative("Ethereum")
                ?.toString(),
              sourceDeliveryProvider: deliveryInstructions.sourceDeliveryProvider
                ?.toNative("Ethereum")
                ?.toString(),
              senderAddress: deliveryInstructions.senderAddress?.toNative("Ethereum")?.toString(),
              vaaKeys: deliveryInstructions.messageKeys,
            };

            const deliveryResult = {
              appIds: [GR_APP_ID],
              blockNumber: result.receipt.blockNumber,
              chain: result.chainId,
              consistencyLevel,
              emitterAddress,
              emitterNattiveAddress,
              extraRawInfo,
              fromAddress: parsedFromAddress,
              id: VAA_ID,
              lastFinalizedBlock,
              payloadType: 1,
              sequence: sequence.toString(),
              STATUS: "IN_PROGRESS" as IStatus,
              timestamp,
              toAddress: targetAddress,
              toChain: targetChainId,
              tokenAddress: wrappedTokenAddress,
              tokenChain: result.chainId,
              txHash: searchValue,
            };

            return deliveryResult;
          };

          const buildRedelivery = async (
            redeliveryInstructions: RedeliveryPayload,
          ): Promise<any> => {
            const targetChainId = chainToChainId(redeliveryInstructions.targetChain);

            extraRawInfo = {
              ...extraRawInfo,
              payloadType: 2,
              targetChainId,
              newRequestedReceiverValue:
                redeliveryInstructions.newRequestedReceiverValue.toString(),
              newEncodedExecutionInfo: redeliveryInstructions.newEncodedExecutionInfo,
              newSourceDeliveryProvider: redeliveryInstructions.newSourceDeliveryProvider
                ?.toNative("Ethereum")
                ?.toString(),
              newSenderAddress: redeliveryInstructions.newSenderAddress
                ?.toNative("Ethereum")
                ?.toString(),
            };

            const redeliveryResult = {
              appIds: [GR_APP_ID],
              blockNumber: result.receipt.blockNumber,
              chain: result.chainId,
              consistencyLevel,
              emitterAddress,
              emitterNattiveAddress,
              extraRawInfo,
              fromAddress: parsedFromAddress,
              id: VAA_ID,
              lastFinalizedBlock,
              payloadType: 2,
              sequence: sequence.toString(),
              STATUS: "IN_PROGRESS" as IStatus,
              timestamp,
              toChain: targetChainId,
              tokenAddress: wrappedTokenAddress,
              tokenChain: result.chainId,
              txHash: searchValue,
            };
            return redeliveryResult;
          };

          const [name, parsed]: GrPayloads = deserializePayload(grDiscriminator, payload);

          switch (name) {
            case "Relayer:DeliveryInstruction":
              return buildDelivery(parsed);
            case "Relayer:RedeliveryInstruction":
              return buildRedelivery(parsed);
            default:
              throw new Error(`Unknown payload type: ${name}`);
          }
        }
        // default, no token-bridge nor cctp ones
        // (can add other wormhole payload readers here)
        else {
          return null;
        }
      });

    if (!!txsData.length) return txsData;

    // Check if receipt is from non-wormhole CCTP
    const manualCctpData: Promise<RPCResponse>[] = result.receipt?.logs
      .filter(
        l => l.topics[0]?.toLowerCase() === LOG_MANUAL_CCTP_DEPOSITFORBURN_TOPIC.toLowerCase(),
      )
      .map(async l => {
        const { args } = circle_contracts.TokenMessenger__factory.createInterface().parseLog(l);

        const emitterAddress = l.address;
        const emitterNattiveAddress = parseAddress({
          chainId: result.chainId,
          value: emitterAddress,
        });

        const { amount, burnToken, destinationDomain: domain, mintRecipient } = args;
        const destinationDomain = Number(domain);

        const toChain = getCctpDomain(destinationDomain);
        const toAddress =
          toChain === 1 ? hexToBase58(mintRecipient) : "0x" + mintRecipient.substring(26);

        return {
          amount: "" + formatUnits(amount.toString(), 6),
          appIds: [CCTP_MANUAL_APP_ID],
          chain: result.chainId,
          emitterAddress,
          emitterNattiveAddress,
          fee: "0",
          fromAddress,
          parsedFromAddress,
          payloadAmount: amount.toString(),
          symbol: "USDC",
          timestamp,
          toAddress,
          toChain,
          tokenAddress: burnToken,
          tokenAmount: "" + formatUnits(amount.toString(), 6),
          tokenChain: result.chainId,
          txHash: searchValue,
          usdAmount: "" + formatUnits(amount.toString(), 6),
          wrappedTokenAddress: getUsdcAddress(env.network, getCctpDomain(destinationDomain)),
          STATUS: "EXTERNAL_TX" as IStatus,

          // no data properties
          id: null,
          payloadType: null,
          sequence: null,
          toNativeAmount: null,
          blockNumber: null,
          lastFinalizedBlock: null,
        };
      });

    return !!manualCctpData.length ? manualCctpData : null;
  } else {
    return null;
  }
}

// CCTP UTILS -----
interface CircleRelayerPayload {
  amount: string;
  appIds: Array<string>;
  feeAmount: string;
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

export const getCctpDomain = (dom: number) => {
  if (dom === 0) return chainToChainId("Ethereum");
  if (dom === 1) return chainToChainId("Avalanche");
  if (dom === 2) return chainToChainId("Optimism");
  if (dom === 3) return chainToChainId("Arbitrum");
  if (dom === 5) return chainToChainId("Solana");
  if (dom === 6) return chainToChainId("Base");
  if (dom === 7) return chainToChainId("Polygon");
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
    if (chain === chainToChainId("Polygon")) return "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359";
  } else {
    if (chain === chainToChainId("Ethereum")) return "0x07865c6e87b9f70255377e024ace6630c1eaa37f";
    if (chain === chainToChainId("Avalanche")) return "0x5425890298aed601595a70ab815c96711a31bc65";
    if (chain === chainToChainId("Arbitrum")) return "0xfd064a18f3bf249cf1f87fc203e90d8f650f2d63";
    if (chain === chainToChainId("Optimism")) return "0xe05606174bac4a6364b31bd0eca4bf4dd368f8c6";
    if (chain === chainToChainId("Solana")) return "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";
    if (chain === chainToChainId("Base")) return "0xf175520c52418dfe19c8098071a252da48cd1c19";
    if (chain === chainToChainId("Polygon")) return "0x9999f7fea5938fd3b1e26a12c3f2fb024e194f97";
  }
  return null;
};
// -----

// RPCs UTILS -----
const getRelayersEmitterAddress = (env: Environment, chain: ChainId) => {
  const relayeEmitterAddress = contracts.relayer.get(env.network, chainIdToChain(chain));

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

const grDiscriminator = payloadDiscriminator([
  "Relayer",
  ["DeliveryInstruction", "RedeliveryInstruction"],
]);

type GrPayloads = ReturnType<typeof deserializePayload<typeof grDiscriminator>>;
type DeliveryPayload = ReturnType<typeof deserializePayload<"Relayer:DeliveryInstruction">>;
type RedeliveryPayload = ReturnType<typeof deserializePayload<"Relayer:RedeliveryInstruction">>;
