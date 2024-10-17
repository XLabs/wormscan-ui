import axios, { Axios, AxiosError } from "axios";

export interface APIClient {
  doGet<T>(path: string, params?: any): Promise<T> | T;
  doPost<T>(path: string, params?: any): Promise<T> | T;
}

export class AxiosClient implements APIClient {
  private readonly _client: Axios;

  constructor(baseURL: string) {
    this._client = axios.create({ baseURL });

    // Add interceptor to include the DB_LAYER header when URL contains 'wormscan'
    this._client.interceptors.request.use(
      config => {
        console.log("YES", { config });
        if (config.baseURL?.includes("wormscan")) {
          config.headers["DB_LAYER"] = "postgres";
        }
        return config;
      },
      error => {
        console.log("NO");
        return Promise.reject(error);
      },
    );
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

  async doPost<T>(path: string, body?: any): Promise<T> {
    try {
      const response = await this._client.post(path, body);
      return response.data;
    } catch (e: any) {
      const errors = e as Error | AxiosError;
      throw new Error(errors.message);
    }
  }
}
