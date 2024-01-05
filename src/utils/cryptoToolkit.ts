import { ChainId, Network } from "@certusone/wormhole-sdk";
import { fetchWithTimeout } from "./asyncUtils";

interface IWrappedResponse {
  wrappedToken: string;
  tokenSymbol: string;
}

interface IRedeemResponse {
  redeemTxHash: string;
  timestamp: number;
}

interface IAlgorandTokenResponse {
  assetId: string;
  decimals?: number;
  symbol?: string;
}

const BFF_URL = process.env.WORMSCAN_BFF_URL;

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
      `${BFF_URL}/getRedeemTxn?network=${network}&fromChain=${fromChain}&toChain=${toChain}&address=${address}&tokenAddress=${tokenAddress}&timestamp=${timestamp}&amount=${amount}&txHash=${txHash}&sequence=${sequence}`,
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
    const wrappedTokenRequest = await fetchWithTimeout(
      `${BFF_URL}/getWrappedAsset?network=${network}&tokenChain=${tokenChain}&tokenAddress=${tokenAddress}&targetChain=${targetChain}`,
    );

    const wrappedTokenResponse = (await wrappedTokenRequest.json()) as IWrappedResponse | null;
    return wrappedTokenResponse;
  } catch (e) {
    return null;
  }
};

export const getAlgorandTokenInfo = async (network: Network, tokenAddress: string) => {
  try {
    const algoTokenRequest = await fetchWithTimeout(
      `${BFF_URL}/getAlgoAssetInfo?network=${network}&tokenAddress=${tokenAddress}`,
    );

    const algoTokenResponse = (await algoTokenRequest.json()) as IAlgorandTokenResponse | null;
    return algoTokenResponse;
  } catch (e) {
    return null;
  }
};
