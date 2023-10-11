export interface Emote {
  id: string;
  name: string;
  image: string;
  cImage: string;
  collection: string;
  description: string;
  symbol: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmoteData {
  id: number;
  mintAddress: string;
  emoteId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  emote: Emote;
}

export enum AwardType {
  MINT = "mint",
  STREAM = "stream",
  REACT = "reaction",
}
