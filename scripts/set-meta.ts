import { readFileSync } from "fs";
import { program } from "commander";
import { Metaplex } from "@metaplex-foundation/js";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { getBundlrURI } from "./helpers";
import path from "path";
import Bundlr from "@bundlr-network/client";

program
  .command("updateNFT")
  .argument(
    "<mintAddress>",
    "JSON file containing an array of mints to update",
    (val) => val
  )
  .option(
    "-e, --env <string>",
    "Solana cluster env name. One of: mainnet-beta, testnet, devnet",
    "devnet"
  )
  .option(
    "-k, --key <path>",
    `Solana wallet location`,
    "--Solana wallet not provided"
  )
  .action(async (mintAddress: string, options) => {
    try {
      const { key, env } = options;

      const cluster = clusterApiUrl(env);
      const bundlrURI = getBundlrURI(env);

      const connection = new Connection(cluster, "confirmed");
      const metaplex = new Metaplex(connection);

      const keyFile = readFileSync(key, "utf8");
      const keyToJSON = JSON.parse(keyFile);

      const bundlr = new Bundlr(bundlrURI, "solana", keyToJSON, {
        providerUrl: cluster,
      });

      const mintPubKey = new PublicKey(mintAddress);
      const nft = await metaplex.nfts().findByMint({ mintAddress: mintPubKey });

      if (!nft) {
        throw new Error("NFT not found");
      }

      const filePath = path.join(__dirname, "data", "metadata.json");
      const file = readFileSync(filePath, "utf8");
      const fileType = path.extname(filePath).slice(1);

      // Get size of file
      const size = Buffer.byteLength(file);
      // Get cost to upload "size" bytes
      const price = await bundlr.getPrice(size);
      console.log(
        `Uploading ${size} bytes costs ${bundlr.utils.fromAtomic(price)}`
      );
      // Fund the node
      await bundlr.fund(price);

      const response = await bundlr.upload(file);
      console.log(
        `File uploaded ==> https://arweave.net/${response.id}`,
        response
      );

      // const cleanMeta = {};

      // const mintKeys = Keypair.fromSecretKey(key);
      // const { response } = await metaplex.nfts().update({
      //   nftOrSft: nft,
      //   uri: uploadedMeta.uri,
      //   authority: mintKeys,
      // });

      // if (!response) {
      //   throw new Error("NFT update failed");
      // }

      console.log("NFT updated successfully");
    } catch (error) {
      console.error(error);
    }
  });

program.parse(process.argv);
