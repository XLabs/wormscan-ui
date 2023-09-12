import { APIClient } from "src/api/api-client";
import { ChainId } from "src/api/model";
import { _get } from "src/api/utils/Objects";

type Notional = {
  id: string;
  chainId: ChainId;
  nodeName: string;
  notionalLimit: number;
  availableNotional: number;
  maxTransactionSize: number;
  createdAt: Date;
  updatedAt: Date;
};

type Node<C = any, T = any> = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  nodeName: string;
  counter: number;
  chains: C[];
  tokens: T[];
};

export type ChainNotionalAvailable = Omit<Notional, "maxTransactionSize" | "notionalLimit">;

export type NotionalAvailable = Omit<
  Notional,
  "id" | "maxTransactionSize" | "notionalLimit" | "nodeName" | "createdAt" | "updatedAt"
>;

export type ChainNotionalLimit = Omit<Notional, "availableNotional">;

export type NotionalLimit = Omit<Notional, "id" | "nodeName" | "createdAt" | "updatedAt">;

export type VAA = {
  sequence: number;
  chainId: ChainId;
  emitterAddress: string;
  notionalValue: number;
  txHash: string;
  releaseTime: number;
};

export interface Chain {
  chainId: ChainId;
  enqueuedVAA: Omit<VAA, "releaseTime">[];
}

export type NodeConfiguration = Node<ChainConfiguration, TokenConfiguration>;

export type ChainConfiguration = {
  chainId: ChainId;
  notionalLimit: number;
  bigTransactionSize: number;
};

export type TokenConfiguration = {
  originChainId: ChainId;
  originAddress: string;
  price: number;
};

export type NodeStatus = Omit<Node<ChainStatus>, "tokens" | "counter">;
export type ChainStatus = {
  chainId: ChainId;
  remainingAvailableNotional: number;
  emitters: EmitterStatus[];
};

export type EmitterStatus = {
  emitterAddress: string;
  totalEnqueuedVAAs: number;
};

export class Governor {
  constructor(private readonly _client: APIClient) {}

  async getConfiguration(): Promise<NodeConfiguration[]>;
  async getConfiguration(guardianId: string): Promise<NodeConfiguration>;
  async getConfiguration(guardianId: string = null) {
    const effectivePath = guardianId ? `/governor/config/${guardianId}` : "/governor/config";
    const payload = await this._client.doGet<any>(effectivePath);
    const result = _get(payload, "data", []).map(this._mapNodeConfiguration);
    return guardianId ? result.pop() : result;
  }

  async getEnqueuedVaas(): Promise<Chain[]>;
  async getEnqueuedVaas(chainId: ChainId): Promise<VAA[]>;
  async getEnqueuedVaas(chainId: ChainId = null) {
    const effectivePath = chainId ? `/governor/enqueued_vaa/${chainId}` : "/governor/enqueued_vaa";
    const payload = await this._client.doGet<any>(effectivePath);
    const result = _get(payload, "data", []);
    return result.map(chainId ? this._mapVAA : this._mapChainVAA);
  }

  //TODO API is returning 500
  async getMaxAvailableNotional(chainId: ChainId) {
    return this._client.doGet(`/governor/notional/max_available/${chainId}`);
  }

  async getAvailableNotional(): Promise<NotionalAvailable[]>;
  async getAvailableNotional(chainId: ChainId): Promise<ChainNotionalAvailable[]>;
  async getAvailableNotional(chainId: ChainId = null) {
    const effectivePath = chainId
      ? `/governor/notional/available/${chainId}`
      : "/governor/notional/available";
    const payload = await this._client.doGet<any>(effectivePath);
    const result = _get(payload, "data", []);
    return result.map(chainId ? this._mapChainAvailableNotional : this._mapAvailableNotional);
  }

  async getNotionalLimit(): Promise<NotionalLimit[]>;
  async getNotionalLimit(chainId: ChainId): Promise<ChainNotionalLimit[]>;
  async getNotionalLimit(chainId: ChainId = null) {
    const effectivePath = chainId
      ? `/governor/notional/limit/${chainId}`
      : "/governor/notional/limit";
    const payload = await this._client.doGet<any>(effectivePath);
    const result = _get(payload, "data", []);
    return result.map(chainId ? this._mapChainNotionalLimit : this._mapNotionalLimit);
  }

  async getStatus(): Promise<NodeStatus[]>;
  async getStatus(guardianId: string): Promise<NodeStatus>;
  async getStatus(guardianId: string = null) {
    const effectivePath = guardianId ? `/governor/status/${guardianId}` : "/governor/status";
    const payload = await this._client.doGet<any>(effectivePath);
    if (guardianId) {
      const result = _get(payload, "data", {});
      return this._mapStatus(result);
    } else {
      const result = _get(payload, "data", []);
      return result.map(this._mapStatus);
    }
  }

  async getLimit(): Promise<NotionalLimit[]> {
    const payload = await this._client.doGet<{ data: any }>("/governor/limit");
    const result = _get(payload, "data", []);
    return result.map(this._mapNotionalLimit);
  }

  private _mapNodeConfiguration = ({
    id,
    nodename,
    createdAt,
    updatedAt,
    counter,
    chains,
    tokens,
  }: any) => ({
    id,
    nodeName: nodename,
    createdAt: new Date(createdAt),
    updatedAt: new Date(updatedAt),
    counter,
    chains: chains?.map(this._mapChainConfiguration),
    tokens: tokens?.map(this._mapTokenConfiguration),
  });

  private _mapStatus = ({ id, nodename, chains, createdAt, updatedAt }: any): NodeStatus => ({
    id,
    nodeName: nodename,
    chains: chains.map(this._mapChainStatus),
    createdAt: new Date(createdAt),
    updatedAt: new Date(updatedAt),
  });

  private _mapChainStatus = ({
    chainid,
    remainingavailablenotional,
    emitters,
  }: any): ChainStatus => ({
    chainId: ChainId[chainid] as unknown as ChainId,
    remainingAvailableNotional: remainingavailablenotional,
    emitters: emitters.map(this._mapEmitterStatus),
  });

  private _mapEmitterStatus = ({ emitteraddress, totalenqueuedvaas }: any): EmitterStatus => ({
    emitterAddress: emitteraddress,
    totalEnqueuedVAAs: totalenqueuedvaas,
  });

  private _mapChainConfiguration = ({
    chainid,
    notionallimit: notionalLimit,
    bigtransactionsize: bigTransactionSize,
  }: any): ChainConfiguration => ({
    chainId: ChainId[chainid] as unknown as ChainId,
    notionalLimit,
    bigTransactionSize,
  });

  private _mapTokenConfiguration = ({
    originchainid,
    originaddress: originAddress,
    price,
  }: any): TokenConfiguration => ({
    originChainId: ChainId[originchainid] as unknown as ChainId,
    originAddress,
    price,
  });

  private _mapChainNotionalLimit = ({
    id,
    chainId,
    nodename,
    notionalLimit,
    maxTransactionSize,
    createdAt,
    updatedAt,
  }: any): ChainNotionalLimit => ({
    id,
    chainId: ChainId[chainId] as unknown as ChainId,
    nodeName: nodename,
    notionalLimit,
    maxTransactionSize,
    createdAt: new Date(createdAt),
    updatedAt: new Date(updatedAt),
  });

  private _mapNotionalLimit = ({
    chainid,
    chainId,
    availableNotional,
    notionalLimit,
    maxTransactionSize,
  }: any): NotionalLimit => ({
    chainId: ChainId[chainid | chainId] as unknown as ChainId,
    availableNotional,
    notionalLimit,
    maxTransactionSize,
  });

  private _mapChainAvailableNotional = ({
    id,
    chainId,
    nodeName,
    availableNotional,
    createdAt,
    updatedAt,
  }: any): ChainNotionalAvailable => ({
    id,
    nodeName,
    chainId: ChainId[chainId] as unknown as ChainId,
    availableNotional,
    createdAt: new Date(createdAt),
    updatedAt: new Date(updatedAt),
  });

  private _mapAvailableNotional = ({ chainId, availableNotional }: any): NotionalAvailable => ({
    chainId: ChainId[chainId] as unknown as ChainId,
    availableNotional,
  });

  private _mapChainVAA = ({ chainId, enqueuedVaas }: any): Chain => ({
    chainId: ChainId[chainId] as unknown as ChainId,
    enqueuedVAA: enqueuedVaas.map(this._mapVAA),
  });

  private _mapVAA = ({
    chainid,
    chainId,
    sequence,
    emitterAddress,
    notionalValue,
    txHash,
    releaseTime,
  }: any): VAA => ({
    chainId: ChainId[chainid || chainId] as unknown as ChainId,
    sequence,
    emitterAddress,
    notionalValue,
    txHash,
    releaseTime,
  });
}
