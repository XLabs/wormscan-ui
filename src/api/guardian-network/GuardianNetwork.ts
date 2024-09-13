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
  IAllbridgeActivity,
  IAllbridgeActivityInput,
  IChainActivity,
  IChainActivityInput,
  IMayanActivity,
  IMayanActivityInput,
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

export class GuardianNetwork {
  constructor(private readonly _client: APIClient) {}

  async getScores(): Promise<ScoresOutput> {
    return await this._client.doGet<ScoresOutput>("/scorecards");
  }

  async getOperations({
    address,
    appId,
    exclusiveAppId,
    pagination = DefaultPageRequest,
    payloadType,
    sourceChain,
    targetChain,
    txHash,
    vaaID,
  }: GetOperationsInput): Promise<GetOperationsOutput[]> {
    const path = vaaID ? `/operations/${vaaID}` : "/operations";
    const result: any = await this._client.doGet(path, {
      ...pagination,
      address,
      appId,
      exclusiveAppId,
      payloadType,
      sourceChain,
      targetChain,
      txHash,
    });

    return (result?.operations ? result.operations : [result]) as GetOperationsOutput[];
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
  }: TokensSymbolVolumeInput): Promise<TokensSymbolVolumeOutput[]> {
    const url = limit ? `/tokens-symbol-volume?limit=${limit}` : "/tokens-symbol-volume";
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
    return await this._client.doGet<ProtocolsStatsOutput[]>("/protocols/stats");
  }

  async getMayanActivity({ from, to }: IMayanActivityInput): Promise<IMayanActivity> {
    const mayanResp = await fetch(
      `https://explorer-api.mayan.finance/v3/stats/wh/activity?from=${from}&to=${to}`,
    );

    if (mayanResp.ok) {
      const mayanResponse = await mayanResp.json();
      return mayanResponse;
    }
    return null;
  }

  async getAllbridgeActivity({ from, to }: IAllbridgeActivityInput): Promise<IAllbridgeActivity> {
    const mayanResp = await fetch(
      `https://analytics.api.allbridgecoreapi.net/wormhole/activity?from=${from}&to=${to}`,
    );

    if (mayanResp.ok) {
      const mayanResponse = await mayanResp.json();
      return mayanResponse;
    }
    return null;
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

    // --- Frontend hack to merge CONNECT and PORTAL_TOKEN_BRIDGE data together ---
    // If the user ask for Portal Bridge, we need to get the data from both CONNECT and PORTAL_TOKEN_BRIDGE.
    if (appId === "CONNECT" || appId === "PORTAL_TOKEN_BRIDGE") {
      const params2 = { ...params, appId: appId === "CONNECT" ? "PORTAL_TOKEN_BRIDGE" : "CONNECT" };
      const queryString2 = new URLSearchParams(params2).toString();

      const response2 = await this._client.doGet<IProtocolActivity[]>(
        `/application-activity?${queryString2}`,
      );

      response.push(...response2);
    }

    // Actually merging the data
    if (response) {
      const portalTokenBridgeIndex = response.findIndex(
        item => item.app_id === "PORTAL_TOKEN_BRIDGE",
      );
      const connectIndex = response.findIndex(item => item.app_id === "CONNECT");

      if (portalTokenBridgeIndex !== -1 && connectIndex !== -1) {
        const portalData = response[portalTokenBridgeIndex];
        const connectData = response[connectIndex];

        // Merge time_range_data
        portalData.time_range_data.forEach((portalTimeRange, index) => {
          const connectTimeRange = connectData.time_range_data[index];

          if (connectTimeRange) {
            portalTimeRange.total_messages += connectTimeRange.total_messages;
            portalTimeRange.total_value_transferred += connectTimeRange.total_value_transferred;

            // Merge aggregations
            connectTimeRange.aggregations.forEach(connectAgg => {
              if (connectAgg.app_id === "CONNECT") {
                const portalTokenBridgeAgg = portalTimeRange.aggregations.find(
                  agg => agg.app_id === "PORTAL_TOKEN_BRIDGE",
                );
                if (portalTokenBridgeAgg) {
                  portalTokenBridgeAgg.total_messages += connectAgg.total_messages;
                  portalTokenBridgeAgg.total_value_transferred +=
                    connectAgg.total_value_transferred;
                } else {
                  connectAgg.app_id = "PORTAL_TOKEN_BRIDGE";
                  portalTimeRange.aggregations.push(connectAgg);
                }
              } else {
                const existingAgg = portalTimeRange.aggregations.find(
                  agg => agg.app_id === connectAgg.app_id,
                );
                if (existingAgg) {
                  existingAgg.total_messages += connectAgg.total_messages;
                  existingAgg.total_value_transferred += connectAgg.total_value_transferred;
                } else {
                  portalTimeRange.aggregations.push(connectAgg);
                }
              }
            });

            // Remove any remaining CONNECT aggregations
            portalTimeRange.aggregations = portalTimeRange.aggregations.filter(
              agg => agg.app_id !== "CONNECT",
            );
          }
        });

        // Remove CONNECT object from response
        response.splice(connectIndex, 1);
      }
    }
    // --- End of Frontend hack to merge CONNECT and PORTAL_TOKEN_BRIDGE data together ---

    return response || [];
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
