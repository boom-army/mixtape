import { atom } from "recoil";
import { NftTemplate } from "../types/nftTemplates";

export const pageLoadingState = atom({
  key: "PageLoading",
  default: false,
});

export const activeNFTTemplates = atom<NftTemplate[] | null>({
  key: "activeNFTTemplatesState",
  default: [],
});