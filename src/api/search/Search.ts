import { Network } from "@wormhole-foundation/sdk/dist/cjs";
import axios, { AxiosError } from "axios";
import { APIClient } from "src/api/api-client";
import { COINGECKO_URL } from "src/api/consts";
import { _get } from "src/api/utils/Objects";

import {
  AutomaticRelayOutput,
  CctpRelayOutput,
  GetTokenInput,
  GetTokenOutput,
  GetTokenPriceInput,
  GetTokenPriceOutput,
} from "./types";

export class Search {
  constructor(private readonly _client: APIClient) {}

  async getCctpRelay({
    txHash,
    network,
  }: {
    txHash: string;
    network: Network;
  }): Promise<CctpRelayOutput> {
    // Remove CORS_PROXY when the endpoint stops responding with CORS err.
    const CORS_PROXY = "https://corsproxy.io/?";

    let cctpURL = CORS_PROXY + "https://relayer.stable.io/v1/relays?txHash=";
    if (network === "Testnet") {
      cctpURL = CORS_PROXY + "https://relayer.dev.stable.io/v1/relays?txHash=";
    }

    try {
      const response = await axios.get(cctpURL + txHash);
      if (response?.data?.data) {
        return response.data.data;
      }
      return null;
    } catch {
      return null;
    }
  }

  async getAutomaticRelay({
    emitterChain,
    emitterAddress,
    sequence,
  }: {
    emitterChain: number;
    emitterAddress: string;
    sequence: number;
  }): Promise<AutomaticRelayOutput> {
    const result = await this._client.doGet<any>(
      `/relays/${emitterChain}/${emitterAddress}/${sequence}`,
    );
    return result;
  }

  async getToken({ chainId, tokenAddress }: GetTokenInput): Promise<GetTokenOutput> {
    const result = await this._client.doGet<GetTokenOutput>(`/token/${chainId}/${tokenAddress}`);
    return result;
  }

  /**
   *
   * @param coingeckoId is the id of the token on https://www.coingecko.com
   * @param query.date The date of data snapshot in dd-mm-yyyy eg. 30-12-2022
   */
  async getTokenPrice({ coingeckoId, query }: GetTokenPriceInput): Promise<GetTokenPriceOutput> {
    try {
      const response = await axios.get(`${COINGECKO_URL}/coins/${coingeckoId}`, { params: query });
      const { market_data } = response?.data;
      const { current_price } = market_data;
      const { usd } = current_price;
      return { usd };
    } catch (e: any) {
      const errors = e as Error | AxiosError;
      throw new Error(errors.message);
    }
  }
}
