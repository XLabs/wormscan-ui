import { ChainId, chainToChainId, toChain, toNative } from "@wormhole-foundation/sdk";
import { ethers } from "ethers";
import { Environment, getChainInfo, getEthersProvider } from "./environment";
import { GetOperationsOutput } from "src/api/guardian-network/types";

// MANAGER <--> TOKEN
const NTT_MANAGER_TOKENS = {
  Mainnet: {
    // SOLANA MANAGERS
    // W
    NTtAaoDJhkeHeaVUHnyhwbPNAN6WgBpHkHBTc6d7vLK: {
      tokenAddress: "85VBFQZC9TZkfaptBWjvUw7YbZjy52A6mjtPGjstQAmQ",
      symbol: "", // same as source
    },
    // BORG
    NttBm3HouTCFnUBz32fEs5joQFRjFoJPA8AyhtgjFrw: {
      tokenAddress: "3dQTr7ror2QPKQ3GbBCokJUmjErGg8kTJzdnYjNfvi3Z",
      symbol: "", // same as source
    },
  },
  Testnet: {
    // SOLANA MANAGERS
    // W
    NTtAaoDJhkeHeaVUHnyhwbPNAN6WgBpHkHBTc6d7vLK: {
      tokenAddress: "EetppHswYvV1jjRWoQKC1hejdeBDHR9NNzNtCyRQfrrQ",
      symbol: "", // same as source
    },

    // NOBLE MANAGERS
    noble1qqqqqqqqqqqqqqqqqqqzapv4q6az98qc87yct420uussjglmn09qvcl7xx: {
      tokenAddress: "uusdn",
      symbol: "USDN",
    },
  },
} as any;

export async function getNttInfo(env: Environment, data: GetOperationsOutput, parsedPayload: any) {
  const targetChain = data?.content?.standarizedProperties?.toChain as ChainId;
  let contractAddress: string = parsedPayload?.transceiverMessage?.recipientNttManager;

  try {
    contractAddress = toNative(toChain(targetChain), contractAddress).toString();

    if (NTT_MANAGER_TOKENS[env.network]?.[contractAddress]) {
      return {
        targetTokenAddress: NTT_MANAGER_TOKENS[env.network][contractAddress].tokenAddress,
        targetTokenSymbol: NTT_MANAGER_TOKENS[env.network][contractAddress].symbol,
      };
    }

    console.log("ntt token not found in managers list, trying rpc");

    if (targetChain !== chainToChainId("Solana")) {
      const contractProvider = getEthersProvider(getChainInfo(env, targetChain as ChainId));
      const tokenAbi = ["function token() view returns (address)"];
      const contract = new ethers.Contract(contractAddress, tokenAbi, contractProvider);

      const targetTokenAddress = await contract.token();

      return {
        targetTokenAddress,
        targetTokenSymbol: null,
      };
    }

    return null;
  } catch (e) {
    console.error(`something went wrong getting ntt token`, e);
    return null;
  }
}
