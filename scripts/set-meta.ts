import { readFileSync, writeFileSync } from "fs";
import { program } from "commander";
import {
  Option,
  JsonMetadata,
  Metaplex,
  walletAdapterIdentity,
} from "@metaplex-foundation/js";
import { Connection, Keypair, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { getBundlrURI } from "./helpers";
import path from "path";
import Bundlr from "@bundlr-network/client";
import mime from "mime-types";

program
  .name("mixtape-utils")
  .description("CLI for MixtApe NFT data")
  .version("0.0.1");

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

program
  .command("getCreated")
  .option(
    "-e, --env <string>",
    "Solana cluster env name. One of: mainnet-beta, testnet, devnet",
    "devnet"
  )
  .action(async (options) => {
    try {
      const { env } = options;

      const cluster = clusterApiUrl(env);

      const connection = new Connection(cluster, "confirmed");
      const metaplex = new Metaplex(connection);

      const nftCollection = await metaplex.nfts().findAllByCreator({
        creator: new PublicKey("MXTPExF3AYg6bW31ucCWHjh2wYaoDsF1Kx8jbHpD41N"),
      });
      const mintAddresses = nftCollection.map(
        (nft) =>
          // @ts-ignore
          nft.mintAddress
      );
      // Write to JSON file
      writeFileSync(
        path.join(__dirname, "data", "nfts.json"),
        JSON.stringify(mintAddresses, null, 2)
      );

      console.log("NFTs witten to data/nfts.json");
    } catch (error) {
      console.error(error);
    }
  });

program
  .command("updateNFTs")
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
  .action(async (options) => {
    try {
      const { key, env } = options;

      const keyFile = readFileSync(key, "utf8");
      const keyToJSON = JSON.parse(keyFile);
      const seed = Uint8Array.from(keyToJSON).slice(0, 32);
      const keypair = Keypair.fromSeed(seed);

      const filePath = path.join(__dirname, "data", "nfts.json");
      const file = readFileSync(filePath, "utf8");
      const fileArray = JSON.parse(file);

      const cluster = clusterApiUrl(env);
      const bundlrURI = getBundlrURI(env);

      const connection = new Connection(cluster, "confirmed");
      const metaplex = new Metaplex(connection).use(
        walletAdapterIdentity(keypair)
      );

      const bundlr = new Bundlr(bundlrURI, "solana", keyToJSON, {
        providerUrl: cluster,
      });
      const transactionOptions = {
        tags: [{ name: "Content-Type", value: mime.lookup("json") as string }],
      };

      function transformAttributes(data: Option<JsonMetadata>) {
        let updatedData = {
          ...data,
        };
        // Filter out attributes with a trait_type that includes "track"
        let filteredAttributes = data?.attributes
          ?.filter(
            (attr) =>
              !(
                attr?.trait_type?.includes("track") ||
                attr?.trait_type?.includes("duration")
              )
          )
          .map((attr) => {
            // Update "template_release_date" to "template_date"
            if (
              attr.trait_type === "tape_blank_release_date" ||
              attr.trait_type === "template_release_date"
            ) {
              attr.trait_type = "template_date";
            }
            return attr;
          });
        updatedData.attributes = filteredAttributes;
        return { ...updatedData };
      }

      const updateAll = fileArray.map(async (mintAddress: string) => {
        try {
          const nft = await metaplex
            .nfts()
            .findByMint({ mintAddress: new PublicKey(mintAddress) });
          const data = nft.json;
          if (
            !data?.attributes?.find((attr) =>
              attr?.trait_type?.includes("duration")
            )
          ) {
            Promise.resolve();
            return;
          }
          const result = transformAttributes(data);
          const arweaveRes = await bundlr.upload(
            JSON.stringify(result),
            transactionOptions
          );
          await metaplex.nfts().update({
            nftOrSft: nft,
            uri: `https://arweave.net/${arweaveRes.id}`,
            authority: keypair,
          });
          Promise.resolve();
        } catch (error) {
          Promise.reject(error);
        }
      });

      await Promise.all(updateAll);

      console.log("NFT updated successfully");
    } catch (error) {
      console.error(error);
    }
  });

program.parse(process.argv);
