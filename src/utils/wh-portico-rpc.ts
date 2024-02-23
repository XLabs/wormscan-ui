import {
  CHAIN_ID_ARBITRUM,
  CHAIN_ID_AVAX,
  CHAIN_ID_BASE,
  CHAIN_ID_BSC,
  CHAIN_ID_ETH,
  CHAIN_ID_OPTIMISM,
  CHAIN_ID_POLYGON,
  ChainId,
} from "@certusone/wormhole-sdk";
import { hexStripZeros } from "ethers/lib/utils";
import { ethers } from "ethers";
import { Environment, getChainInfo, getEthersProvider } from "./environment";
import { parseTx } from "./crypto";
import { getTokenInformation } from "./fetchWithRPCsFallthrough";
import { GetOperationsOutput } from "src/api/guardian-network/types";

const porticoSwapFinishedEvent =
  "0xc2addcb063016f6dc1647fc8cd7206c3436cc4293c4acffe4feac288459ca7fc";

const porticoAddresses: any = {
  MAINNET: {
    [CHAIN_ID_ARBITRUM]: ["0x48fa7528bfd6164ddf09df0ed22451cf59c84130"],
    [CHAIN_ID_AVAX]: ["0xe565e118e75304dd3cf83dff409c90034b7ea18a"],
    [CHAIN_ID_BASE]: ["0x610d4dfac3ec32e0be98d18ddb280dacd76a1889"],
    [CHAIN_ID_BSC]: ["0x05498574bd0fa99eecb01e1241661e7ee58f8a85"],
    [CHAIN_ID_ETH]: ["0x48b6101128c0ed1e208b7c910e60542a2ee6f476"],
    [CHAIN_ID_OPTIMISM]: ["0x9ae506cddd27dee1275fd1fe6627e5dc65257061"],
    [CHAIN_ID_POLYGON]: ["0x227babe533fa9a1085f5261210e0b7137e44437b"],
  },
  // TODO: PORTICO TESTNET ADDRESSES
  TESTNET: {
    [CHAIN_ID_ARBITRUM]: ["0x0000000000000000000000000000000000000000"],
    [CHAIN_ID_AVAX]: ["0x0000000000000000000000000000000000000000"],
    [CHAIN_ID_BASE]: ["0x0000000000000000000000000000000000000000"],
    [CHAIN_ID_BSC]: ["0x0000000000000000000000000000000000000000"],
    [CHAIN_ID_ETH]: ["0x0000000000000000000000000000000000000000"],
    [CHAIN_ID_OPTIMISM]: ["0x0000000000000000000000000000000000000000"],
    [CHAIN_ID_POLYGON]: ["0x0000000000000000000000000000000000000000"],
  },
};

export function isPortico(network: any, toChain: ChainId, toAddress: string) {
  const address = toAddress?.toLowerCase();
  return porticoAddresses[network][toChain]?.includes(address.toLowerCase()) ?? false;
}

export async function getPorticoInfo(
  env: Environment,
  data: GetOperationsOutput,
  onlyTarget = false,
) {
  const sourceChain = data?.content?.standarizedProperties?.fromChain as ChainId;
  const targetChain = data?.content?.standarizedProperties?.toChain as ChainId;
  const sourceTxHash = parseTx({ chainId: 2, value: data.sourceChain?.transaction?.txHash });
  const targetTxHash = parseTx({ chainId: 2, value: data.targetChain?.transaction?.txHash });
  const payload = data?.content?.payload?.payload;

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

    const payloadBuffer = Buffer.from(payload, "base64");
    const parsedPayload = parsePorticoPayload(payloadBuffer);

    const shouldWrapNative = parsedPayload?.flagSet?.shouldWrapNative;
    const shouldUnwrapNative = parsedPayload?.flagSet?.shouldUnwrapNative;

    if (shouldWrapNative) {
      shouldShowSourceTokenUrl = false;
      sourceSymbol = getChainInfo(env, sourceChain as ChainId).nativeCurrencyName;
    }

    const redeemTokenAddress = parsedPayload.finalTokenAddress;

    if (shouldUnwrapNative) {
      shouldShowTargetTokenUrl = false;
      targetSymbol = getChainInfo(env, targetChain as ChainId).nativeCurrencyName;
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

    formattedRelayerFee = ethers.utils.formatUnits(parsedPayload.relayerFee, decimals - 8); // -8 because it later gets formatted with 8

    const processTarget = async () => {
      const targetReceipt = await targetProvider.getTransactionReceipt(targetTxHash);

      const swapFinishedLog = targetReceipt.logs.find(
        log => log.topics[0] === porticoSwapFinishedEvent,
      );

      if (!swapFinishedLog) {
        throw new Error("Swap finished log not found");
      }

      // handle the case for when the swap failed
      const swapCompleted = swapFinishedLog.data.slice(0, 66).endsWith("1");
      if (!swapCompleted) {
        console.log("swap didnt complete");
      }
      // if we get here then the swap succeeded or did not occur if the destination chain is Ethereum.
      // no swap needs to be done on Ethereum since the canonical/bridged token is the final token
      else {
        const finalUserAmount = ethers.BigNumber.from(`0x${swapFinishedLog.data.slice(66, 130)}`);
        const relayerFeeAmount = ethers.BigNumber.from(`0x${swapFinishedLog.data.slice(130, 194)}`);

        formattedFinalUserAmount = ethers.utils.formatUnits(finalUserAmount, decimals);
        formattedRelayerFee = ethers.utils.formatUnits(relayerFeeAmount, decimals - 8);
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

const parseAddress = (buffer: Buffer): string => {
  return ethers.utils.hexZeroPad(hexStripZeros(buffer), 20);
};

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
    startTokenAddress: parseAddress(payload.slice(32, 64)),
    canonAssetAddress: parseAddress(payload.slice(64, 96)),
    finalTokenAddress: parseAddress(payload.slice(96, 128)),
    recipientAddress: parseAddress(payload.slice(128, 160)),
    destinationPorticoAddress: parseAddress(payload.slice(160, 192)),
    amountSpecified: ethers.BigNumber.from(payload.slice(192, 224))?.toString(),
    minAmountStart: ethers.BigNumber.from(payload.slice(224, 256))?.toString(),
    minAmountFinish: ethers.BigNumber.from(payload.slice(256, 288))?.toString(),
    relayerFee: ethers.BigNumber.from(payload.slice(288, 320))?.toString(),
  };
}

interface IParsedPorticoPayload {
  flagSet: IParsedFlags;
  finalTokenAddress: string;
  recipientAddress: string;
  canonAssetAmount: string;
  minAmountFinish: string;
  relayerFee: string;
}
export function parsePorticoPayload(payload: Buffer): IParsedPorticoPayload {
  return {
    flagSet: parseFlagSet(payload),
    finalTokenAddress: parseAddress(payload.slice(32, 64)),
    recipientAddress: parseAddress(payload.slice(64, 96)),
    canonAssetAmount: ethers.BigNumber.from(payload.slice(96, 128))?.toString(),
    minAmountFinish: ethers.BigNumber.from(payload.slice(128, 160))?.toString(),
    relayerFee: ethers.BigNumber.from(payload.slice(160, 192))?.toString(),
  };
}
