export type NftTemplate = {
  id: string;
  name: string;
  runtime: number;
  price: number;
  image: string;
  releaseDate: string;
  endDate?: string;
  maxSupply?: number;
  status?: string;
};

export type Track = {
  id: string;
  title: string;
  lengthSeconds: number;
};

export type Attribute = {
  value: string;
  trait_type: string;
};

export type Collection = {
  name: string;
  family: string;
};

export type File = {
  uri: string;
  type: string;
};

export type Creator = {
  share: number;
  address: string;
};

export type Properties = {
  files: File[];
  category: string;
  creators: Creator[];
};

export type Mixtape = {
  name: string;
  symbol: string;
  tracks: Track[];
  attributes: Attribute[];
  collection: Collection;
  properties: Properties;
  description: string;
  external_url: string;
  seller_fee_basis_points: number;
};
