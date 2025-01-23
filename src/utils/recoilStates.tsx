import { atom } from "recoil";
import { IArkhamResponse } from "./arkham";

export const liveModeState = atom<boolean>({
  key: "liveMode",
  default: true,
});

export const loadPageState = atom({
  key: "loadPageState",
  default: false,
});

export const showSourceTokenUrlState = atom({
  key: "showSourceTokenUrlState",
  default: true,
});

export const showTargetTokenUrlState = atom({
  key: "showTargetTokenUrlState",
  default: true,
});

// state to store the Arkham info and show it along addresses
export interface IAddressInfo {
  [addressHash: string]: IArkhamResponse;
}
export const addressesInfoState = atom({
  key: "showAddressesInfo",
  default: {} as any,
});
