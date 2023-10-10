import { Cluster } from "@solana/web3.js";

export const ARWEAVE_PROTOCOL = "https";

export const handleNFTError = (error: unknown) => {
  if (error instanceof Error) {
    throw new Error(error.message);
  } else {
    throw new Error("An unknown error occurred");
  }
};

export const getBundlrURI = (env: Cluster) => {
  switch (env) {
    case "mainnet-beta":
      return "https://node1.bundlr.network";
    default:
      return "https://devnet.bundlr.network";
  }
}

export const getCluster = () => {
  switch (process.env.NEXT_PUBLIC_SOLANA_NETWORK) {
    case 'https://api.devnet.solana.com':
      return 'devnet';
    default:
      return 'mainnet-beta';
  }
}