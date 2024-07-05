import { APIClient } from "src/api/api-client";
import { ChainId } from "@wormhole-foundation/sdk";
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

export interface GovernorVaa {
  amount: number;
  chainId: ChainId;
  emitterAddress: string;
  releaseTime: Date;
  sequence: string;
  status: string;
  txHash: string;
  vaaId: string;
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

export type ChainLimit = {
  chainId: number;
  availableNotional: number;
  notionalLimit: number;
  maxTransactionSize: number;
};

export type WormholeTokenList = {
  originChainId: ChainId;
  originAddress: string;
  price: number;
};

export class Governor {
  constructor(private readonly _client: APIClient) {}
  async getMaxAvailableNotional(chainId: ChainId) {
    return this._client.doGet(`/governor/notional/max_available/${chainId}`);
  }

  async getLimit(): Promise<NotionalLimit[]> {
    const payload = await this._client.doGet<{ data: any }>("/governor/limit");
    const result = _get(payload, "data", []);
    return result;
  }

  async getEnqueuedTransactions(): Promise<GovernorVaa[]> {
    const result = await this._client.doGet<GovernorVaa[]>("/governor/vaas");
    return result;
  }

  async getTokenList(): Promise<WormholeTokenList[]> {
    const payload = await this._client.doGet<any>(
      "https://api.wormholescan.io/v1/governor/token_list",
    );
    const result = _get(payload, "entries", []);
    return result;
  }
}
