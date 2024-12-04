import { APIClient } from "src/api/api-client";
import { _get } from "src/api/utils/Objects";

import {
  GetTopAddress,
  GetTopAddressResult,
  GetTransferByTime,
  GetActivity,
  GetActivityResult,
  GetSummary,
  GetSummaryResult,
  GetTopHolder,
  GetTopHolderResult,
  GetTransferByTimeResult,
  GetListResult,
} from "./types";
import { getCoinMarketCapTokenInfo } from "src/utils/cryptoToolkit";

export class NttApi {
  constructor(private readonly _client: APIClient) {}

  async getNttTopAddress({ symbol, by }: GetTopAddress): Promise<GetTopAddressResult> {
    return await this._client.doGet<GetTopAddressResult>("/native-token-transfer/top-address", {
      symbol,
      by,
    });
  }

  async getNttTransferByTime({
    symbol,
    from,
    to,
    timeSpan,
    by,
  }: GetTransferByTime): Promise<GetTransferByTimeResult> {
    return await this._client.doGet<GetTransferByTimeResult>(
      "/native-token-transfer/transfer-by-time",
      {
        symbol,
        from,
        to,
        timeSpan,
        by,
      },
    );
  }

  async getNttActivity({ symbol, by }: GetActivity): Promise<GetActivityResult> {
    return await this._client.doGet<GetActivityResult>("/native-token-transfer/activity", {
      symbol,
      by,
    });
  }

  async getNttTokenList(): Promise<GetListResult[]> {
    const tokenListResponse = await this._client.doGet<GetListResult[]>(
      "/native-token-transfer/token-list",
    );

    const tokenListWithFallback = await Promise.all(
      tokenListResponse.map(async item => {
        if (item.circulating_supply === "0" || item.market_cap === "0") {
          const symbol = item.symbol.toUpperCase();

          const coinMarketCapTokenInfo = await getCoinMarketCapTokenInfo(symbol);

          item.circulating_supply =
            coinMarketCapTokenInfo?.data[symbol]?.[0]?.circulating_supply ||
            coinMarketCapTokenInfo?.data[symbol]?.[0]?.self_reported_circulating_supply ||
            0;

          item.market_cap =
            coinMarketCapTokenInfo?.data[symbol]?.[0]?.market_cap ||
            coinMarketCapTokenInfo?.data[symbol]?.[0]?.self_reported_market_cap ||
            coinMarketCapTokenInfo?.data[symbol]?.[0]?.quote?.USD?.market_cap ||
            0;

          return item;
        }

        return item;
      }),
    );

    return tokenListWithFallback;
  }

  async getNttSummary({ coingecko_id }: GetSummary): Promise<GetSummaryResult> {
    const summaryResponse = await this._client.doGet<GetSummaryResult>(
      "/native-token-transfer/summary",
      {
        coingecko_id,
      },
    );

    if (summaryResponse.circulatingSupply === "0") {
      const coinMarketCapTokenInfo = await getCoinMarketCapTokenInfo(
        summaryResponse.symbol.toUpperCase(),
      );

      summaryResponse.circulatingSupply =
        coinMarketCapTokenInfo?.data[summaryResponse.symbol.toUpperCase()]?.[0]
          ?.circulating_supply ||
        coinMarketCapTokenInfo?.data[summaryResponse.symbol.toUpperCase()]?.[0]
          ?.self_reported_circulating_supply ||
        0;
    }

    if (summaryResponse.marketCap === "0") {
      const coinMarketCapTokenInfo = await getCoinMarketCapTokenInfo(
        summaryResponse.symbol.toUpperCase(),
      );

      summaryResponse.marketCap =
        coinMarketCapTokenInfo?.data[summaryResponse.symbol.toUpperCase()]?.[0]?.market_cap ||
        coinMarketCapTokenInfo?.data[summaryResponse.symbol.toUpperCase()]?.[0]
          ?.self_reported_market_cap ||
        coinMarketCapTokenInfo?.data[summaryResponse.symbol.toUpperCase()]?.[0]?.quote?.USD
          ?.market_cap ||
        0;
    }

    return summaryResponse;
  }

  async getNttTopHolder({ coingecko_id }: GetTopHolder): Promise<GetTopHolderResult> {
    return await this._client.doGet<GetTopHolderResult>("/native-token-transfer/top-holder", {
      coingecko_id,
    });
  }
}
