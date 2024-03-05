import { ChainId, tryHexToNativeString } from "@certusone/wormhole-sdk";
import { ethers } from "ethers";
import { Environment, getChainInfo, getEthersProvider } from "./environment";
import { GetOperationsOutput } from "src/api/guardian-network/types";

export async function getNttInfo(env: Environment, data: GetOperationsOutput) {
  const targetChain = data?.content?.standarizedProperties?.toChain as ChainId;

  try {
    let contractAddress = data?.content?.payload?.transceiverMessage?.recipientNttManager;
    contractAddress = tryHexToNativeString(contractAddress, targetChain);

    const contractProvider = getEthersProvider(getChainInfo(env, targetChain as ChainId));
    const tokenAbi = ["function token() view returns (address)"];
    const contract = new ethers.Contract(contractAddress, tokenAbi, contractProvider);

    const targetTokenAddress = await contract.token();

    return {
      targetTokenAddress,
    };
  } catch (e) {
    console.error(`something went wrong getting ntt stuff`, e);
    return null;
  }
}
