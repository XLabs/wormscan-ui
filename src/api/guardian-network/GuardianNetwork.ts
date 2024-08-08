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
  LastTxs,
  Observation,
  ScoresOutput,
  VAACount,
  ProtocolsStatsOutput,
  IChainActivity,
  IChainActivityInput,
} from "./types";

export class GuardianNetwork {
  constructor(private readonly _client: APIClient) {}

  async getScores(): Promise<ScoresOutput> {
    return await this._client.doGet<ScoresOutput>("/scorecards");
  }

  async getProtocolsStats(): Promise<ProtocolsStatsOutput[]> {
    return await this._client.doGet<ProtocolsStatsOutput[]>("/protocols/stats");
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
    // appId,
    // targetChain,
    from,
    sourceChain,
    timespan,
    to,
  }: IChainActivityInput): Promise<IChainActivity[]> {
    const sourceChainString = sourceChain.join(",");

    const response = await this._client.doGet<IChainActivity[]>(
      `/x-chain-activity/tops?from=${from}&to=${to}&timespan=${timespan}&sourceChain=${sourceChainString}`,
    );

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
