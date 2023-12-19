import { APIClient } from "src/api/api-client";
import { DefaultPageRequest } from "src/api/model";
import { _get } from "src/api/utils/Objects";

import {
  AssetsByVolumeInput,
  AssetsByVolumeOutput,
  ChainPairsByTransfersInput,
  ChainPairsByTransfersOutput,
  CrossChainActivityInput,
  CrossChainActivity,
  DateRange,
  LastTxs,
  ScoresOutput,
  VAACount,
  GetOperationsInput,
  GetOperationsOutput,
} from "./types";

export class GuardianNetwork {
  constructor(private readonly _client: APIClient) {}

  async getScores(): Promise<ScoresOutput> {
    return await this._client.doGet<ScoresOutput>("/scorecards");
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

  private _mapVAACount = ({ chainId, count }: any): VAACount => ({ chainId, count });
}
