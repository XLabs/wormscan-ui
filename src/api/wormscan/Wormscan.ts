import { AxiosClient, APIClient } from "src/api/api-client";
import { Governor } from "src/api/governor";
import { GuardianNetwork } from "src/api/guardian-network";
import { Search } from "src/api/search";
import { _get } from "src/api/utils/Objects";
import { NttApi } from "../native-token-transfer";

export class Wormscan {
  private readonly _governor: Governor;
  private readonly _guardian: GuardianNetwork;
  private readonly _search: Search;
  private readonly _native_token_transfer: NttApi;

  constructor(private readonly _client: APIClient) {
    this._governor = new Governor(this._client);
    this._guardian = new GuardianNetwork(this._client);
    this._search = new Search(this._client);
    this._native_token_transfer = new NttApi(this._client);
  }

  get governor(): Governor {
    return this._governor;
  }

  get guardianNetwork(): GuardianNetwork {
    return this._guardian;
  }

  get nttApi(): NttApi {
    return this._native_token_transfer;
  }

  get search(): Search {
    return this._search;
  }

  async isReady(): Promise<boolean> {
    return this._getStatus("/ready");
  }

  async isHealth(): Promise<boolean> {
    return this._getStatus("/health");
  }

  private async _getStatus(path: string) {
    try {
      const payload = await this._client.doGet<{ status: string }>(path);
      const status = payload.status || "";
      return status === "OK";
    } catch (err) {
      return false;
    }
  }
}

export function createClient(baseUrl: string = "https://api.wormscan.io/api/v1") {
  return new Wormscan(new AxiosClient(baseUrl));
}
