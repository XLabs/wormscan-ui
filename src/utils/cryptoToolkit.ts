import { ChainId, Network } from "@certusone/wormhole-sdk";
import { ethers } from "ethers";

interface IWrappedResponse {
  wrappedToken: string;
  tokenSymbol: string;
}

interface IRedeemResponse {
  redeemTxHash: string;
  timestamp: number;
}

// const WH_UTILS_URL = "http://localhost:8080";
const WH_UTILS_URL = "https://cryptotruco.com";

export const tryGetRedeemTxn = async (
  network: Network,
  fromChain: ChainId,
  toChain: ChainId,
  address: string,
  tokenAddress: string,
  timestamp: string | Date,
  amount: string,
  txHash: string,
  sequence: number,
): Promise<IRedeemResponse | null> => {
  try {
    const redeemTxn = await fetch(
      `${WH_UTILS_URL}/getRedeemTxn?network=${network}&fromChain=${fromChain}&toChain=${toChain}&address=${address}&tokenAddress=${tokenAddress}&timestamp=${timestamp}&amount=${amount}&txHash=${txHash}&sequence=${sequence}`,
    );

    const redeemData = (await redeemTxn.json()) as IRedeemResponse;
    return redeemData?.redeemTxHash ? redeemData : null;
  } catch (e) {
    return null;
  }
};

export const tryGetWrappedToken = async (
  network: Network,
  tokenChain: ChainId,
  tokenAddress: string,
  targetChain: ChainId,
) => {
  try {
    const wrappedTokenRequest = await fetch(
      `${WH_UTILS_URL}/getWrappedAsset?network=${network}&tokenChain=${tokenChain}&tokenAddress=${tokenAddress}&targetChain=${targetChain}`,
    );

    const wrappedTokenResponse = (await wrappedTokenRequest.json()) as IWrappedResponse | null;
    return wrappedTokenResponse;
  } catch (e) {
    return null;
  }
};
