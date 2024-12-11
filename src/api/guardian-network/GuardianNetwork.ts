import { APIClient } from "src/api/api-client";
import { DefaultPageRequest, PageRequest, VAASearchCriteria } from "src/api/model";
import { _get } from "src/api/utils/Objects";

import {
  AssetsByVolumeInput,
  AssetsByVolumeOutput,
  ChainPairsByTransfersInput,
  ChainPairsByTransfersOutput,
  CrossChainActivity,
  CrossChainActivityInput,
  DateRange,
  GetOperationsInput,
  GetOperationsOutput,
  GetParsedVaaOutput,
  IChainActivity,
  IChainActivityInput,
  IProtocolActivity,
  IProtocolActivityInput,
  LastTxs,
  Observation,
  ProtocolsStatsOutput,
  ScoresOutput,
  TokensSymbolActivityInput,
  TokensSymbolActivityOutput,
  TokensSymbolVolumeInput,
  TokensSymbolVolumeOutput,
  VAACount,
} from "./types";
import {
  CONNECT_APP_ID,
  FAST_TRANSFERS_APP_ID,
  LIQUIDITY_LAYER_APP_ID,
  MAYAN_SHUTTLE_APP_ID,
  SWAP_LAYER_APP_ID,
} from "src/consts";

export class GuardianNetwork {
  constructor(private readonly _client: APIClient) {}

  async getScores(): Promise<ScoresOutput> {
    return await this._client.doGet<ScoresOutput>("/scorecards");
  }

  async getOperations({
    address,
    appId,
    exclusiveAppId,
    from,
    pagination = DefaultPageRequest,
    payloadType,
    sourceChain,
    targetChain,
    to,
    txHash,
    vaaID,
    filterRepeatedTxs = false,
  }: GetOperationsInput): Promise<GetOperationsOutput[]> {
    const path = vaaID ? `/operations/${vaaID}` : "/operations";
    const response: any = await this._client.doGet(path, {
      ...pagination,
      address,
      appId,
      exclusiveAppId,
      from,
      payloadType,
      sourceChain,
      targetChain,
      to,
      txHash,
    });

    const result = (
      response?.operations ? response.operations : [response]
    ) as GetOperationsOutput[];

    // LIQUIDITY LAYER PATCH
    const resultProcessed = result.map(data => {
      if (data?.content?.standarizedProperties?.appIds?.includes(FAST_TRANSFERS_APP_ID)) {
        // AppID patch
        if (data?.content?.standarizedProperties?.appIds?.includes(SWAP_LAYER_APP_ID)) {
          data.content.standarizedProperties.appIds = [MAYAN_SHUTTLE_APP_ID];
        } else {
          data.content.standarizedProperties.appIds = [LIQUIDITY_LAYER_APP_ID];
        }

        // Fix for when user got a refund in another chain
        if (
          !!data?.targetChain?.chainId &&
          data?.targetChain?.chainId !== data?.content?.standarizedProperties?.toChain
        ) {
          data.content.standarizedProperties.toChain = data?.targetChain?.chainId;
        }
      }

      return data;
    });

    // LIQUIDITY LAYER FILTER REPEATED TXS PATCH
    if (filterRepeatedTxs) {
      const uniqueResults = resultProcessed.reduce((acc: GetOperationsOutput[], current) => {
        const lastElement = acc[acc.length - 1];

        // If this is first element or has different txHash than previous, keep it
        if (
          !lastElement ||
          lastElement?.sourceChain?.transaction?.txHash !==
            current?.sourceChain?.transaction?.txHash
        ) {
          acc.push(current);
        }

        return acc;
      }, []);

      return uniqueResults;
    }

    return resultProcessed;
  }

  async getParsedVaa(vaa: string): Promise<GetParsedVaaOutput> {
    const path = "/vaas/parse";

    const result: any = await this._client.doPost(path, {
      vaa,
    });

    // UNCOMMENT TO RUN VAA-PAYLOAD-PARSER LOCALLY
    // const request = await fetch("http://localhost:3005/vaas/parse", {
    //   method: "POST",
    //   headers: [["Content-Type", "text/plain"]],
    //   body: vaa,
    // });
    // const result = await request.json();

    return result;
  }

  async getVAACount(): Promise<VAACount[]> {
    const payload = await this._client.doGet<any>("/vaas/vaa-counts");
    const result = _get(payload, "data", []);
    return result.map(this._mapVAACount);
  }

  async getTokensSymbolVolume({
    limit,
    timeRange,
  }: TokensSymbolVolumeInput): Promise<TokensSymbolVolumeOutput[]> {
    const params = new URLSearchParams();

    if (limit) params.append("limit", limit.toString());
    if (timeRange) params.append("timeRange", timeRange);

    const url = `/tokens-symbol-volume?${params.toString()}`;
    const payload = await this._client.doGet<TokensSymbolVolumeOutput[]>(url);
    return payload;
  }

  async getTokensSymbolActivity({
    from,
    to,
    symbol,
    timespan,
    sourceChain,
    targetChain,
  }: TokensSymbolActivityInput): Promise<TokensSymbolActivityOutput> {
    const params: Record<string, string> = {
      from: from.toString(),
      to: to.toString(),
      symbol: symbol.toString(),
      timespan: timespan.toString(),
    };

    if (sourceChain && sourceChain.length > 0) {
      params.sourceChain = sourceChain.join(",");
    }

    if (targetChain && targetChain.length > 0) {
      params.targetChain = targetChain.join(",");
    }

    const queryString = new URLSearchParams(params).toString();

    const response = await this._client.doGet<TokensSymbolActivityOutput>(
      `/tokens-symbol-activity?${queryString}`,
    );

    if (response.tokens) {
      return response;
    } else {
      return {
        tokens: [],
      };
    }
  }

  async getAssetsByVolume(
    params: AssetsByVolumeInput = { timeSpan: "7d" },
  ): Promise<AssetsByVolumeOutput[]> {
    const payload = await this._client.doGet<AssetsByVolumeOutput>("/top-symbols-by-volume", {
      ...params,
    });
    const result = _get(payload, "symbols", []);
    return result;
  }

  async getChainPairsByTransfers(
    params: ChainPairsByTransfersInput = { timeSpan: "7d" },
  ): Promise<ChainPairsByTransfersOutput[]> {
    const payload = await this._client.doGet<AssetsByVolumeOutput>(
      "/top-chain-pairs-by-num-transfers",
      { ...params },
    );
    const result = _get(payload, "chainPairs", []);
    return result;
  }

  async getCrossChainActivity({
    by,
    timeSpan,
  }: CrossChainActivityInput): Promise<CrossChainActivity> {
    const payload = await this._client.doGet<[]>("/x-chain-activity/", {
      timeSpan,
      by,
    });
    const result = _get(payload, "txs", []);
    return result;
  }

  async getChainActivity({
    from,
    to,
    timespan,
    sourceChain,
    targetChain,
    appId,
  }: IChainActivityInput): Promise<IChainActivity[]> {
    const params: Record<string, string> = {
      from: from.toString(),
      to: to.toString(),
      timespan: timespan.toString(),
    };

    if (sourceChain && sourceChain.length > 0) {
      params.sourceChain = sourceChain.join(",");
    }

    if (targetChain && targetChain.length > 0) {
      params.targetChain = targetChain.join(",");
    }

    if (appId) {
      params.appId = appId;
    }

    const queryString = new URLSearchParams(params).toString();

    const response = await this._client.doGet<IChainActivity[]>(
      `/x-chain-activity/tops?${queryString}`,
    );

    return response || [];
  }

  async getProtocolsStats(): Promise<ProtocolsStatsOutput[]> {
    const response = await this._client.doGet<ProtocolsStatsOutput[]>("/protocols/stats");

    // --- liquidity layer patch start ---
    // (merge swap_layer and fast_transfers and then rename to wormhole_liquidity_layer)
    const responseProcessed = response
      ?.map(item => {
        // find swap_layer item
        if (item.protocol === "swap_layer") {
          // Find the fast_transfers item to merge data into
          const fastTransfersItem = response.find(i => i.protocol === "fast_transfers");
          if (fastTransfersItem) {
            // Add swap_layer volumes to fast_transfers
            fastTransfersItem.last_24_hour_volume += item.last_24_hour_volume;
            fastTransfersItem.total_messages += item.total_messages;
            fastTransfersItem.total_value_transferred += item.total_value_transferred;
            fastTransfersItem.last_day_messages += item.last_day_messages;

            // Recalculate percentages
            fastTransfersItem.last_day_diff_percentage =
              (
                ((fastTransfersItem.last_day_messages + item.last_day_messages) /
                  (fastTransfersItem.total_messages + item.total_messages)) *
                100
              ).toFixed(2) + "%";

            fastTransfersItem.last_day_diff_volume_percentage =
              (
                ((fastTransfersItem.last_24_hour_volume + item.last_24_hour_volume) /
                  (fastTransfersItem.total_value_transferred + item.total_value_transferred)) *
                100
              ).toFixed(2) + "%";
          }
          // Remove the swap_layer item since we merged it
          return null;
        }

        // change name
        if (item.protocol === "fast_transfers") {
          item.protocol = "wormhole_liquidity_layer";
        }

        return item;
      })
      .filter(item => item !== null);
    // --- liquidity layer patch end ---

    return responseProcessed;
  }

  async getProtocolActivity({
    from,
    to,
    timespan,
    appId,
  }: IProtocolActivityInput): Promise<IProtocolActivity[]> {
    const params: Record<string, string> = {
      from: from.toString(),
      to: to.toString(),
      timespan: timespan.toString(),
    };

    if (appId) {
      params.appId = appId;
    }

    const queryString = new URLSearchParams(params).toString();

    const response = await this._client.doGet<IProtocolActivity[]>(
      `/application-activity?${queryString}`,
    );

    // Take out from the response the CONNECT app as its included in Portal.
    return response.filter(a => a.app_id !== CONNECT_APP_ID) || [];
  }

  async getLastTxs(range: DateRange): Promise<LastTxs> {
    const timeSpan = { day: "1d", week: "1w", month: "1mo", "3-month": "3mo" };
    const sampleRate = { day: "1h", week: "1d", month: "1d", "3-month": "1d" };

    return await this._client.doGet<LastTxs>(
      `/last-txs?timeSpan=${timeSpan[range]}&sampleRate=${sampleRate[range]}`,
    );
  }

  async getObservation(): Promise<Observation[]>;
  async getObservation(criteria: VAASearchCriteria): Promise<Observation[]>;
  async getObservation(criteria: VAASearchCriteria, page: PageRequest): Promise<Observation[]>;
  async getObservation(criteria: VAASearchCriteria = null, page: PageRequest = DefaultPageRequest) {
    const effectivePath = this._observationCriteriaToPathSegmentFilter("/observations", criteria);
    const payload = await this._client.doGet<[]>(effectivePath, { ...page });
    return payload || [];
  }

  async getObservationForTxHash(txHash: string): Promise<Observation[]> {
    const payload = await this._client.doGet<[]>(`/observations?txHash=${txHash}`);
    return payload || [];
  }

  private _vaaSearchCriteriaToPathSegmentFilter(
    prefix: string,
    criteria: {
      chainId: number;
      emitter: string;
      seq: number;
    },
  ) {
    const { chainId, emitter, seq } = criteria || {};
    return [prefix, chainId, emitter, seq]
      .filter(segment => segment !== undefined && segment !== null)
      .join("/");
  }

  private _observationCriteriaToPathSegmentFilter(prefix: string, criteria: VAASearchCriteria) {
    const { chainId, emmiter, specific } = criteria || {};
    const { sequence, signer, hash } = specific || {};
    return [prefix, chainId, emmiter, sequence, signer, hash]
      .filter(segment => segment !== undefined && segment !== null)
      .join("/");
  }

  private _mapVAACount = ({ chainId, count }: any): VAACount => ({ chainId, count });
}
