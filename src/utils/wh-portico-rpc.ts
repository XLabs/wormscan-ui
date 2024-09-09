import { ChainId, chainIdToChain, UniversalAddress } from "@wormhole-foundation/sdk";
import { formatUnits } from "ethers";
import {
  Environment,
  getChainInfo,
  getEthersProvider,
  mainnetNativeCurrencies,
  testnetNativeCurrencies,
} from "./environment";
import { parseTx } from "./crypto";
import { getTokenInformation } from "./fetchWithRPCsFallthrough";
import { GetOperationsOutput } from "src/api/guardian-network/types";
import { USDT_TRANSFER_APP_ID } from "src/consts";

const porticoSwapFinishedEvent =
  "0xc2addcb063016f6dc1647fc8cd7206c3436cc4293c4acffe4feac288459ca7fc";

export async function getPorticoInfo(
  env: Environment,
  data: GetOperationsOutput,
  onlyTarget = false,
) {
  const sourceChain = data?.content?.standarizedProperties?.fromChain as ChainId;
  const targetChain = data?.content?.standarizedProperties?.toChain as ChainId;
  const sourceTxHash = parseTx({ chainId: 2, value: data.sourceChain?.transaction?.txHash });
  const targetTxHash = parseTx({ chainId: 2, value: data.targetChain?.transaction?.txHash });

  const sourceProvider = getEthersProvider(getChainInfo(env, sourceChain as ChainId));
  const targetProvider = getEthersProvider(getChainInfo(env, targetChain as ChainId));

  try {
    let shouldShowSourceTokenUrl = true;
    let shouldShowTargetTokenUrl = true;
    let sourceSymbol;
    let targetSymbol;
    let decimals: number;
    let formattedFinalUserAmount = "";
    let formattedRelayerFee = "";

    const parsedPayload = data?.content?.payload?.parsedPayload;
    if (!parsedPayload?.flagSet) return null;

    const shouldWrapNative =
      parsedPayload?.flagSet?.shouldWrapNative || parsedPayload?.flagSet?.flags?.shouldWrapNative;
    const shouldUnwrapNative =
      parsedPayload?.flagSet?.shouldUnwrapNative ||
      parsedPayload?.flagSet?.flags?.shouldUnwrapNative;

    if (shouldWrapNative) {
      shouldShowSourceTokenUrl = false;
      sourceSymbol =
        env.network === "Testnet"
          ? testnetNativeCurrencies[sourceChain]
          : mainnetNativeCurrencies[sourceChain];
    }

    const redeemTokenAddress = new UniversalAddress(parsedPayload.finalTokenAddress)
      .toNative(
        parsedPayload.recipientChain ? chainIdToChain(parsedPayload.recipientChain) : "Ethereum",
      )
      ?.toString();

    if (shouldUnwrapNative) {
      shouldShowTargetTokenUrl = false;
      targetSymbol =
        env.network === "Testnet"
          ? testnetNativeCurrencies[targetChain]
          : mainnetNativeCurrencies[targetChain];
      decimals = getChainInfo(env, targetChain as ChainId).nativeCurrencyDecimals;
    } else {
      const tokenDetails = await getTokenInformation(
        targetChain,
        env,
        parsedPayload.finalTokenAddress,
      );
      if (tokenDetails?.tokenDecimals) {
        decimals = tokenDetails.tokenDecimals;
      }
    }

    formattedRelayerFee = data.content.standarizedProperties.appIds.includes(USDT_TRANSFER_APP_ID)
      ? "" + parsedPayload.relayerFee * 10 ** 2 // +2 decimals because fee gets formated later with 8
      : formatUnits(parsedPayload.relayerFee, decimals - 8); // -8 because fee gets formated later with 8
    // formattedRelayerFee = parsedPayload.relayerFee;

    const processTarget = async () => {
      const targetReceipt = await targetProvider.getTransactionReceipt(targetTxHash);

      const swapFinishedLog = targetReceipt.logs.find(
        log => log.topics[0] === porticoSwapFinishedEvent,
      );

      if (!swapFinishedLog) {
        console.log("Swap finished log not found");
        return;
      }

      // handle the case for when the swap failed
      const swapCompleted = swapFinishedLog.data.slice(0, 66).endsWith("1");
      if (!swapCompleted) {
        console.log("swap didnt complete");
      }
      // if we get here then the swap succeeded or did not occur if the destination chain is Ethereum.
      // no swap needs to be done on Ethereum since the canonical/bridged token is the final token
      else {
        const finalUserAmount = BigInt(`0x${swapFinishedLog.data.slice(66, 130)}`);
        const relayerFeeAmount = BigInt(`0x${swapFinishedLog.data.slice(130, 194)}`);

        formattedFinalUserAmount = formatUnits(finalUserAmount, decimals);
        formattedRelayerFee = data.content.standarizedProperties.appIds.includes(
          USDT_TRANSFER_APP_ID,
        )
          ? "" + parsedPayload.relayerFeeAmount * 10 ** 2 // +2 decimals because fee gets formated later with 8
          : formatUnits(relayerFeeAmount, decimals - 8); // -8 because fee gets formated later with 8
      }
    };

    if (!onlyTarget) {
      const sourceTx = await sourceProvider.getTransaction(sourceTxHash);

      if (sourceTx && sourceTx.data) {
        // skip 0x and function selector (10 bytes)
        const sourceInputData = sourceTx.data.slice(10);

        const sourceTransferBuffer = Buffer.from(sourceInputData, "hex");
        const parsedSourceTransfer = parsePorticoTransfer(sourceTransferBuffer);

        const tokenAddress = parsedSourceTransfer.startTokenAddress;

        if (targetTxHash) {
          await processTarget();
        }

        return {
          formattedFinalUserAmount,
          formattedRelayerFee,
          parsedPayload,
          redeemTokenAddress,
          shouldShowSourceTokenUrl,
          shouldShowTargetTokenUrl,
          sourceSymbol,
          tokenAddress,
          targetSymbol,
        };
      }
    } else {
      if (targetTxHash) {
        await processTarget();
      }

      return {
        formattedFinalUserAmount,
        formattedRelayerFee,
      };
    }

    return null;
  } catch (e) {
    console.error(`something went wrong getting portico swap stuff`, e);
    return null;
  }
}

export interface IParsedFlags {
  recipientChain: number;
  bridgeNonce: number;
  feeTierStart: number;
  feeTierFinish: number;
  shouldWrapNative: boolean;
  shouldUnwrapNative: boolean;
}
const parseFlagSet = (buffer: Buffer): IParsedFlags => ({
  recipientChain: buffer.readUInt16LE(0),
  bridgeNonce: buffer.readUInt32LE(2),
  feeTierStart: buffer.readUintLE(6, 3),
  feeTierFinish: buffer.readUintLE(9, 3),
  shouldWrapNative: !!(buffer.readUInt8(31) & (1 << 0)),
  shouldUnwrapNative: !!(buffer.readUInt8(31) & (1 << 1)),
});

interface IParsedSourceTransfer {
  flagSet: IParsedFlags;
  startTokenAddress: string;
  canonAssetAddress: string;
  finalTokenAddress: string;
  recipientAddress: string;
  destinationPorticoAddress: string;
  amountSpecified: string;
  minAmountStart: string;
  minAmountFinish: string;
  relayerFee: string;
}

export function parsePorticoTransfer(payload: Buffer): IParsedSourceTransfer {
  return {
    flagSet: parseFlagSet(payload),
    startTokenAddress: new UniversalAddress(payload.slice(32, 64)).toNative("Ethereum").toString(),
    canonAssetAddress: new UniversalAddress(payload.slice(64, 96)).toNative("Ethereum").toString(),
    finalTokenAddress: new UniversalAddress(payload.slice(96, 128)).toNative("Ethereum").toString(),
    recipientAddress: new UniversalAddress(payload.slice(128, 160)).toNative("Ethereum").toString(),
    destinationPorticoAddress: new UniversalAddress(payload.slice(160, 192))
      .toNative("Ethereum")
      .toString(),
    amountSpecified: BigInt("0x" + Buffer.from(payload.slice(192, 224)).toString("hex")).toString(),
    minAmountStart: BigInt("0x" + Buffer.from(payload.slice(224, 256))?.toString("hex")).toString(),
    minAmountFinish: BigInt(
      "0x" + Buffer.from(payload.slice(256, 288))?.toString("hex"),
    ).toString(),
    relayerFee: BigInt("0x" + Buffer.from(payload.slice(288, 320))?.toString("hex")).toString(),
  };
}
