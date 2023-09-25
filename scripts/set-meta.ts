import { readFileSync } from "fs";
import { program } from "commander";
import { Metaplex, walletAdapterIdentity } from "@metaplex-foundation/js";
import { Connection, Keypair, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { getBundlrURI } from "./helpers";
import path from "path";
import Bundlr from "@bundlr-network/client";
import mime from "mime-types";

// yarn meta:update 7goCia2zgSjKx3qVofbNEF5DdvtAsLionktZahAYuWqu -e devnet -k '/Users/bowie/SitesC/mixt-ape/testKey-MXTPExF3AYg6bW31ucCWHjh2wYaoDsF1Kx8jbHpD41N.json'
program
  .command("updateNFTByMint")
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

      const keyFile = readFileSync(key, "utf8");
      const keyToJSON = JSON.parse(keyFile);
      const seed = Uint8Array.from(keyToJSON).slice(0, 32);
      const keypair = Keypair.fromSeed(seed);

      const cluster = clusterApiUrl(env);
      const bundlrURI = getBundlrURI(env);

      const connection = new Connection(cluster, "confirmed");
      const metaplex = new Metaplex(connection).use(
        walletAdapterIdentity(keypair)
      );

      const bundlr = new Bundlr(bundlrURI, "solana", keyToJSON, {
        providerUrl: cluster,
      });

      const filePath = path.join(__dirname, "data", "metadata.json");
      const file = readFileSync(filePath, "utf8");
      const fileType = path.extname(filePath).slice(1);
      const transactionOptions = {
        tags: [
          { name: "Content-Type", value: mime.lookup(fileType) as string },
        ],
      };

      // Get size of file
      const size = Buffer.byteLength(file);
      // Get cost to upload "size" bytes
      const price = await bundlr.getPrice(size);
      console.log(
        `Uploading ${size} bytes costs ${bundlr.utils.fromAtomic(price)}`
      );
      // Fund the node
      await bundlr.fund(price);

      const arweaveRes = await bundlr.upload(file, transactionOptions);
      console.log(`File uploaded ==> https://arweave.net/${arweaveRes.id}`);

      const mintPubKey = new PublicKey(mintAddress);
      const nft = await metaplex.nfts().findByMint({ mintAddress: mintPubKey });

      if (!nft) {
        throw new Error("NFT not found");
      }

      // const cleanMeta = {};
      const { response } = await metaplex.nfts().update({
        nftOrSft: nft,
        uri: `https://arweave.net/${arweaveRes.id}`,
        authority: keypair,
      });

      if (!response) {
        throw new Error("NFT update failed");
      }

      console.log("NFT updated successfully");
    } catch (error) {
      console.error(error);
    }
  });

program.parse(process.argv);
