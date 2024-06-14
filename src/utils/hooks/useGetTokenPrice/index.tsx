import { useQuery } from "react-query";
import { getClient } from "src/api/Client";

interface Props {
  coingeckoId: string;
  date: string;
}

/**
 *
 * @param coingeckoId
 * @param date The date of data snapshot in dd-mm-yyyy eg. 30-12-2022
 * @returns
 */
function useGetTokenPrice({ coingeckoId, date }: Props) {
  const {
    isLoading: tokenPriceIsLoading,
    error: tokenPriceError,
    data: tokenPrice,
  } = useQuery(
    ["getTokenPrice", coingeckoId, date],
    () =>
      getClient().search.getTokenPrice({
        coingeckoId,
        query: {
          date,
        },
      }),
    {
      enabled: Boolean(coingeckoId && date),
      staleTime: Infinity,
    },
  );

  return {
    tokenPriceIsLoading,
    tokenPriceError,
    tokenPrice,
  };
}

export default useGetTokenPrice;
