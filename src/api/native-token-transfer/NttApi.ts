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
    return await this._client.doGet<GetListResult[]>("/native-token-transfer/token-list");
  }

  async getNttSummary({ coingecko_id }: GetSummary): Promise<GetSummaryResult> {
    return await this._client.doGet<GetSummaryResult>("/native-token-transfer/summary", {
      coingecko_id,
    });
  }

  async getNttTopHolder({ coingecko_id }: GetTopHolder): Promise<GetTopHolderResult> {
    return await this._client.doGet<GetTopHolderResult>("/native-token-transfer/top-holder", {
      coingecko_id,
    });
  }
}
