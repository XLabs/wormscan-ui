import { useQuery } from "react-query";
import client from "src/api/Client";

interface Props {
  tokenChain: number;
  tokenAddress: string;
}

export function useGetTokenData({ tokenChain, tokenAddress }: Props) {
  const parseTokenAddress: string =
    tokenAddress && tokenAddress.startsWith("0x") ? tokenAddress.slice(2) : tokenAddress;

  const {
    isLoading: tokenDataIsLoading,
    error: tokenDataError,
    data: tokenData,
  } = useQuery(
    ["getTokenData", tokenAddress],
    () =>
      client.search.getToken({
        chainId: tokenChain,
        tokenAddress: parseTokenAddress,
      }),
    {
      enabled: Boolean(tokenChain && tokenAddress),
      staleTime: Infinity,
    },
  );

  return {
    tokenDataIsLoading,
    tokenDataError,
    tokenData,
  };
}
