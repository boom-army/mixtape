import { Cluster, Keypair, clusterApiUrl } from "@solana/web3.js";
import Arweave from "arweave";
import { JWKInterface } from "arweave/node/lib/wallet";

export const ARWEAVE_PROTOCOL = "https";

export const getBundlrURI = (env: Cluster) => {
  switch (env) {
    case "mainnet-beta":
      return "https://node1.bundlr.network";
    default:
      return "https://devnet.bundlr.network";
  }
}

export const doUpload = async (
  arweave: Arweave,
  data: Buffer | string,
  fileType: string,
  jwk: JWKInterface,
  isUploadByChunk = false
) => {
  const tx = await arweave.createTransaction({ data }, jwk);
  console.log("************", tx);
  
  tx.addTag("Content-Type", fileType);
  await arweave.transactions.sign(tx, jwk);
  if (isUploadByChunk) {
    const uploader = await arweave.transactions.getUploader(tx);
    while (!uploader.isComplete) {
      await uploader.uploadChunk();
      console.log(
        `${uploader.pctComplete}% complete, ${uploader.uploadedChunks}/${uploader.totalChunks}`
      );
    }
  }
  await arweave.transactions.post(tx);
  return tx;
};
