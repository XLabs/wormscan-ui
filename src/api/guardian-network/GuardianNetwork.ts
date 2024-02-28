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
  LastTxs,
  Observation,
  ScoresOutput,
  VAACount,
  ProtocolsStatsOutput,
} from "./types";

export class GuardianNetwork {
  constructor(private readonly _client: APIClient) {}

  async getScores(): Promise<ScoresOutput> {
    return await this._client.doGet<ScoresOutput>("/scorecards");
  }

  /*  async getProtocolsStats(): Promise<ProtocolsStatsOutput[]> {
    return await this._client.doGet<ProtocolsStatsOutput[]>("/protocols/stats");
  } */

  async getProtocolsStats(): Promise<ProtocolsStatsOutput[]> {
    const test = [
      {
        protocol: "allbridge",
        total_value_locked: "0",
        total_value_secured: "0",
        total_value_transferred: "373968516.04350078",
        total_messages: "33124",
        last_day_messages: "142",
        last_day_diff_percentage: "-5.30%",
      },
      {
        protocol: "cctp",
        total_value_locked: "0",
        total_value_secured: "0",
        total_value_transferred: "13123123123.123123",
        total_messages: "432432",
        last_day_messages: "543",
        last_day_diff_percentage: "15.21%",
      },
      {
        protocol: "portal",
        total_value_locked: "0",
        total_value_secured: "0",
        total_value_transferred: "378978978.987987",
        total_messages: "567765",
        last_day_messages: "0",
        last_day_diff_percentage: "0.00%",
      },
      {
        protocol: "mayan",
        total_value_locked: "0",
        total_value_secured: "0",
        total_value_transferred: "5555555.55555",
        total_messages: "4444",
        last_day_messages: "333",
        last_day_diff_percentage: "2.11%",
      },
    ];

    return new Promise(resolve => {
      setTimeout(() => {
        resolve(test);
      }, 3000);
    });
  }

  async getOperations({
    txHash,
    address,
    vaaID,
    pagination = DefaultPageRequest,
  }: GetOperationsInput): Promise<GetOperationsOutput[]> {
    const path = vaaID ? `/operations/${vaaID}` : "/operations";
    const result: any = await this._client.doGet(path, {
      txHash,
      address,
      ...pagination,
    });

    return (result?.operations ? result.operations : [result]) as GetOperationsOutput[];
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
