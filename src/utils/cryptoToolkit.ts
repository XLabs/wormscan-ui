import { ChainId, Network } from "@wormhole-foundation/sdk";
import { fetchWithTimeout } from "./asyncUtils";
import { IArkhamResponse } from "./arkham";

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

interface ISolanaCctpResponse {
  amount: string;
  contractAddress: string;
  destinationDomain: number;
  sourceAddress: string;
  sourceTokenAddress: string;
  targetAddress: string;
  timestamp: Date;
}

const BFF_URL = process.env.WORMSCAN_BFF_URL;

export const tryGetAddressInfo = async (
  network: Network,
  address: string,
): Promise<IArkhamResponse> => {
  try {
    const addressInfoResp = await fetch(
      `${BFF_URL}/getAddressInfo?network=${network}&address=${address}`,
    );

    if (!addressInfoResp.ok) {
      return null;
    }

    const addressInfo = (await addressInfoResp.json()) as IArkhamResponse;
    return addressInfo ? addressInfo : null;
  } catch (e) {
    return null;
  }
};

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
  gatewayChain?: ChainId,
) => {
  try {
    const wrappedTokenRequest = await fetchWithTimeout(
      `${BFF_URL}/getWrappedAsset?network=${network}&tokenChain=${tokenChain}&tokenAddress=${tokenAddress}&targetChain=${targetChain}${
        gatewayChain ? `&gatewayChain=${gatewayChain}` : ""
      }`,
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

export const getSolanaCctp = async (network: Network, txHash: string) => {
  try {
    const solanaCctpRequest = await fetchWithTimeout(
      `${BFF_URL}/getSolanaCctp?network=${network}&txHash=${txHash}`,
    );

    const solanaCctpResponse = (await solanaCctpRequest.json()) as ISolanaCctpResponse | null;
    return solanaCctpResponse;
  } catch (e) {
    return null;
  }
};
