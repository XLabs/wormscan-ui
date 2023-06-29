import { Path, To } from "react-router-dom";
import { isOfTypeNetwork } from "src/api/Client";
import { NETWORK } from "src/types";

export const parseTo = (to: string | Partial<Path>, network: NETWORK): To => {
  if (typeof to === "string") {
    const url = to.includes("?") ? to.split("?")[0] : to;
    const queryString = to.includes("?") ? to.split("?")[1] : "";
    const queryNetwork =
      isOfTypeNetwork(network) && network !== "mainnet" ? `network=${network}` : "";
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
