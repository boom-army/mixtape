export const NftTemplates = {
  // MIXTAPE: {
  //   name: "MixtApe",
  //   runtime: 30,
  //   price: 0.1,
  //   image: "/images/mixtape-ape-1024.png",
  //   releaseDate: "2023-09-08",
  // },
  BRITE: {
    name: "Brite",
    runtime: 30,
    price: 0.1,
    image: "/images/mixtape-rainbow-1024.png",
    releaseDate: "2023-09-06",
  },
  SHOEY: {
    name: "Shoey",
    runtime: 30,
    price: 0.1337,
    image: "/images/mixtape-shoey.png",
    releaseDate: "2023-09-19",
  },
  BTC: {
    name: "SOL",
    runtime: 30,
    price: 0.142069,
    image: "/images/mixtape-sol-1024.png",
    releaseDate: "2023-09-06",
  },
};
export type NftTemplate = (typeof NftTemplates)[keyof typeof NftTemplates];

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
