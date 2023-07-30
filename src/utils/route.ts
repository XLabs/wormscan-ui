import { Network } from "@certusone/wormhole-sdk";
import { Path, To } from "react-router-dom";
import { isOfTypeNetwork } from "src/api/Client";

export const parseTo = (to: string | Partial<Path>, network: Network): To => {
  if (typeof to === "string") {
    const url = to.includes("?") ? to.split("?")[0] : to;
    const queryString = to.includes("?") ? to.split("?")[1] : "";
    const queryNetwork =
      isOfTypeNetwork(network) && network !== "MAINNET" ? `network=${network}` : "";
    const search = queryString
      ? `?${queryString}${queryNetwork && `&${queryNetwork}`}`
      : `?${queryNetwork}`;

    return {
      pathname: url,
      search,
    };
  }

  return to;
};
