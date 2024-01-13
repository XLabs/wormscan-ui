import { atom } from "recoil";

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
