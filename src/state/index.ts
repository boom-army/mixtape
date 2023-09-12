import { atom } from "recoil";

export const pageLoadingState = atom({
  key: "PageLoading",
  default: false,
});