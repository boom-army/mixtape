import { Cluster } from "@solana/web3.js";

export const ARWEAVE_PROTOCOL = "https";

export const getBundlrURI = (env: Cluster) => {
  switch (env) {
    case "mainnet-beta":
      return "https://node1.bundlr.network";
    default:
      return "https://devnet.bundlr.network";
  }
}
