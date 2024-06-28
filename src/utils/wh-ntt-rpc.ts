import { ChainId, chainToChainId, toChain, toNative } from "@wormhole-foundation/sdk";
import { ethers } from "ethers";
import { Environment, getChainInfo, getEthersProvider } from "./environment";
import { GetOperationsOutput } from "src/api/guardian-network/types";

// SOLANA MANAGET <--> TOKEN
const NTT_MANAGER_TOKENS = {
  MAINNET: {
    // W
    NTtAaoDJhkeHeaVUHnyhwbPNAN6WgBpHkHBTc6d7vLK: "85VBFQZC9TZkfaptBWjvUw7YbZjy52A6mjtPGjstQAmQ",
    // BORG
    NttBm3HouTCFnUBz32fEs5joQFRjFoJPA8AyhtgjFrw: "3dQTr7ror2QPKQ3GbBCokJUmjErGg8kTJzdnYjNfvi3Z",
  },
  TESTNET: {
    // W
    NTtAaoDJhkeHeaVUHnyhwbPNAN6WgBpHkHBTc6d7vLK: "EetppHswYvV1jjRWoQKC1hejdeBDHR9NNzNtCyRQfrrQ",
  },
} as any;

export async function getNttInfo(env: Environment, data: GetOperationsOutput, parsedPayload: any) {
  const targetChain = data?.content?.standarizedProperties?.toChain as ChainId;
  let contractAddress: string = parsedPayload?.transceiverMessage?.recipientNttManager;

  try {
    contractAddress = toNative(toChain(targetChain), contractAddress).toString();

    if (NTT_MANAGER_TOKENS[env.network][contractAddress]) {
      return {
        targetTokenAddress: NTT_MANAGER_TOKENS[env.network][contractAddress],
      };
    }

    console.log("ntt token not found");

    if (targetChain !== chainToChainId("Solana")) {
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
