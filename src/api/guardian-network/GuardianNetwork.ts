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
} from "./types";

export class GuardianNetwork {
  constructor(private readonly _client: APIClient) {}

  async getScores(): Promise<ScoresOutput> {
    return await this._client.doGet<ScoresOutput>("/scorecards");
  }

  async getProtocolsStats(): Promise<ProtocolsStatsOutput[]> {
    // TODO: THIS IS THE ONLY LINE THAT SHOULD BE CALLED HERE:
    // return await this._client.doGet<ProtocolsStatsOutput[]>("/protocols/stats");

    const dateNow = new Date();
    const date24hsAgo = new Date(dateNow.getTime() - 24 * 60 * 60 * 1000);

    const formattedNow = dateNow.toISOString();
    const formatted24hsAgo = date24hsAgo.toISOString();

    const getMayan = async () => {
      const mayanResp = await fetch(
        `https://explorer-api.mayan.finance/v3/stats/wh/activity?from=${formatted24hsAgo}&to=${formattedNow}`,
      );

      if (mayanResp.ok) {
        const mayanResponse = await mayanResp.json();
        return mayanResponse;
      }
      return null;
    };

    const getAllBridge = async () => {
      const allBridgeResp = await fetch(
        `https://analytics.api.allbridgecoreapi.net/wormhole/activity?from=${formatted24hsAgo}&to=${formattedNow}`,
      );

      if (allBridgeResp.ok) {
        const allBridgeResponse = await allBridgeResp.json();
        return allBridgeResponse;
      }
      return null;
    };

    const getPortal = async () => {
      try {
        const portalResp = await this._client.doGet<any>(
          `/x-chain-activity/tops?from=${formatted24hsAgo}&to=${formattedNow}&timespan=1h&appId=PORTAL_TOKEN_BRIDGE`,
        );

        let totalVolume = 0;
        let totalCount = 0;

        portalResp.forEach((a: any) => {
          totalVolume += a.volume / 10 ** 8;
          totalCount += a.count;
        });

        return { totalVolume };
      } catch {
        return null;
      }
    };

    const getCCTP = async () => {
      try {
        const cctpResp = await this._client.doGet<any>(
          `/x-chain-activity/tops?from=${formatted24hsAgo}&to=${formattedNow}&timespan=1h&appId=CCTP_WORMHOLE_INTEGRATION`,
        );

        let totalVolume = 0;
        let totalCount = 0;

        cctpResp.forEach((a: any) => {
          totalVolume += a.volume / 10 ** 8;
          totalCount += a.count;
        });

        return { totalVolume };
      } catch {
        return null;
      }
    };

    const getNTT = async () => {
      try {
        const nttResp = await this._client.doGet<any>(
          `/x-chain-activity/tops?from=${formatted24hsAgo}&to=${formattedNow}&timespan=1h&appId=NATIVE_TOKEN_TRANSFER`,
        );

        let totalVolume = 0;
        let totalCount = 0;

        nttResp.forEach((a: any) => {
          totalVolume += a.volume / 10 ** 8;
          totalCount += a.count;
        });

        return { totalVolume };
      } catch {
        return null;
      }
    };

    const protocolStats = await this._client.doGet<ProtocolsStatsOutput[]>("/protocols/stats");
    const mayanStats = await getMayan();
    const allBridgeStats = await getAllBridge();
    const portalStats = await getPortal();
    const cctpStats = await getCCTP();
    const nttStats = await getNTT();

    for (const protocol of protocolStats) {
      if (protocol.protocol === "mayan" && mayanStats) {
        protocol.last_day_volume = mayanStats.volume;
      }

      if (protocol.protocol === "allbridge" && allBridgeStats) {
        protocol.last_day_volume = +allBridgeStats.total_value_transferred;
      }

      if (protocol.protocol === "portal_token_bridge" && portalStats) {
        protocol.last_day_volume = portalStats.totalVolume;
      }

      if (protocol.protocol === "cctp" && cctpStats) {
        protocol.last_day_volume = null; // cctpStats.totalVolume;
      }

      if (protocol.protocol === "native_token_transfer" && nttStats) {
        protocol.last_day_volume = nttStats.totalVolume;
      }
    }

    return protocolStats;
  }

  async getOperations({
    address,
    appId,
    exclusiveAppId,
    pagination = DefaultPageRequest,
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
