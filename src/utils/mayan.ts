import { fetchWithTimeout } from "./asyncUtils";

type MayanMctpResponse = {
  fromTokenSymbol: string;
  fromAmount: string;
  toTokenSymbol: string;
  toAmount: string;
  fromTokenAddress: string;
  toTokenAddress: string;
  destAddress: string;
  fromTokenChain: number;
  toTokenChain: number;
  destChain: number;
};

const getMayanMctpInfo = async (txHash: string): Promise<MayanMctpResponse> => {
  const mayanInfo = await fetchWithTimeout(
    `https://explorer-api.mayan.finance/v3/swap/trx/${txHash}`,
  );

  if (!mayanInfo || !mayanInfo.ok) {
    throw new Error(
      `Failed to fetch Mayan MCTP info for tx ${txHash}: ${
        mayanInfo?.statusText || "Unknown error"
      }`,
    );
  }

  const mayanInfoJson = await mayanInfo?.json();

  if (!mayanInfoJson) {
    throw new Error(`Invalid JSON response from Mayan MCTP API for tx ${txHash}`);
  }

  return mayanInfoJson;
};

export default getMayanMctpInfo;
