import { JsonMetadata, PublicKey } from "@metaplex-foundation/js";

export const MIXTAPE_COLLECTION = new PublicKey(
  process.env.NEXT_PUBLIC_COLLECTION_KEY!
);
export const MIXTAPE_TX = new PublicKey(
  "MXTPExF3AYg6bW31ucCWHjh2wYaoDsF1Kx8jbHpD41N"
);
export const HARKL_ID = new PublicKey(
  "harkLSUe2Puud2TVQUhHW4vs45mF1YMLU3PThPCuWd8"
);

export const STORAGE_FEES = 0.027;

export const nftMetaTemplate = (): JsonMetadata => ({
  name: "Mixtape",
  symbol: "MXTAPE",
  description: "",
  external_url: "https://mixt-ape.com",
  attributes: [],
  seller_fee_basis_points: 500,
  collection: { name: "MixtApe 1", family: "MixtApe" },
  properties: {
    files: [],
    category: "image",
    creators: [{ address: HARKL_ID.toBase58(), share: 100 }],
  },
});
