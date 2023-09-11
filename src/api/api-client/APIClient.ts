import axios, { Axios, AxiosError } from "axios";

export interface APIClient {
  doGet<T>(path: string, params?: any): Promise<T> | T;
}

export class AxiosClient implements APIClient {
  private readonly _client: Axios;

  constructor(baseURL: string) {
    this._client = axios.create({ baseURL });
  }

  async doGet<T>(path: string, params?: any): Promise<T> {
    try {
      const response = await this._client.get(path, { params });
      return response.data;
    } catch (e: any) {
      const errors = e as Error | AxiosError;
      throw new Error(errors.message);
    }
  }
}
