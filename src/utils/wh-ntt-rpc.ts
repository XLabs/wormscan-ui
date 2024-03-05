import { CHAIN_ID_SOLANA, ChainId, tryHexToNativeString } from "@certusone/wormhole-sdk";
import { ethers } from "ethers";
import { Environment, getChainInfo, getEthersProvider } from "./environment";
import { GetOperationsOutput } from "src/api/guardian-network/types";

const NTT_MANAGER_TOKENS = {
  // SOLANA DEVNET
  "7nMTXqo19kzwyisGCdcRP5AErEBToYpVYg2C5PNrjsa2": "SCAmk7zfNKXemDjap14aGJJyQXZXXhq9X2Fs8oVSsdr",
  // ARBITRUM SEPOLIA
  "0xcc1ebd7a6661c0f6e19d2bbdb881b11f3b3f40ff": "0xb12C77938c09d81F1e9797d48501b5c4E338B45B",
  // ETH SEPOLIA
  "0x459b4d6df31c1c1f8b6fda0f8ad77e1eff832bcf": "0xce0bd78b496bc8ddd25c8a192771e4537f0794c8",
  //
} as any;

export async function getNttInfo(env: Environment, data: GetOperationsOutput, parsedPayload: any) {
  const targetChain = data?.content?.standarizedProperties?.toChain as ChainId;
  let contractAddress: string = parsedPayload?.transceiverMessage?.recipientNttManager;

  try {
    contractAddress = tryHexToNativeString(contractAddress, targetChain);

    if (NTT_MANAGER_TOKENS[contractAddress]) {
      return {
        targetTokenAddress: NTT_MANAGER_TOKENS[contractAddress],
      };
    }

    console.log("ntt token not found");

    if (targetChain !== CHAIN_ID_SOLANA) {
      const contractProvider = getEthersProvider(getChainInfo(env, targetChain as ChainId));
      const tokenAbi = ["function token() view returns (address)"];
      const contract = new ethers.Contract(contractAddress, tokenAbi, contractProvider);

      const targetTokenAddress = await contract.token();

      return {
        targetTokenAddress,
      };
    }

    return null;
  } catch (e) {
    console.error(`something went wrong getting ntt token`, e);
    return null;
  }
}
