import { Network } from "@certusone/wormhole-sdk";
import { queryClient } from "src/App";
import { createClient } from "src/api";

let currentNetwork: Network = "MAINNET";
let client = createClient(process.env.WORMSCAN_API_BASE_URL);

const getBaseURL = (network: Network) => {
  return network === "MAINNET"
    ? process.env.WORMSCAN_API_BASE_URL
    : process.env.WORMSCAN_TESTNET_API_BASE_URL;
};

const createNewClient = (baseURL: string) => {
  client = createClient(baseURL);
};

const resetQueries = async () => {
  await queryClient.resetQueries();
};

export const isOfTypeNetwork = (value: string): value is Network => {
  return ["MAINNET", "TESTNET"].includes(value);
};

export const changeClientNetwork = (network: Network) => {
  if (currentNetwork === network) return;

  currentNetwork = network;
  const baseURL = getBaseURL(network);

  createNewClient(baseURL);
  resetQueries();
};

export const getClient = () => {
  return client;
};
