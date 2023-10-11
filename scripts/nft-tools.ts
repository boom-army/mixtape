import { readFileSync } from "fs";
import { program } from "commander";
import {
  Metaplex,
  bundlrStorage,
  keypairIdentity,
  walletAdapterIdentity,
} from "@metaplex-foundation/js";
import { Connection, Keypair, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { getBundlrURI } from "../src/utils";

program
  .name("nft-tools")
  .description("CLI for general NFT interactions")
  .version("0.0.1");

// ts-node scripts/nft-tools.ts createCollection -k testKey-MXTPExF3AYg6bW31ucCWHjh2wYaoDsF1Kx8jbHpD41N.json -e devnet
// DQCCPUVm89LGu7nftE8LxXwbEhAvFeAyAa9STRqxwvv8
program
  .command("createCollection")
  .option(
    "-e, --env <string>",
    "Solana cluster env name. One of: mainnet-beta, testnet, devnet (or URI)",
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

      const collectionConfig = {
        name: "MixtApe 2",
        symbol: "MXTAPE",
        description: "MixtApes on Solana at mixt-ape.com - mix, share, ape, repeat",
        seller_fee_basis_points: 0,
        image:
          "https://nftstorage.link/ipfs/bafkreiawri2iatz2fl7avzzqtgwdtveigdgmhpnm2o3lea64gzv23wo77e?ext=image/png",
        properties: {
          files: [
            {
              type: "image/png",
              uri: "https://nftstorage.link/ipfs/bafkreiawri2iatz2fl7avzzqtgwdtveigdgmhpnm2o3lea64gzv23wo77e",
            },
          ],
          category: "image",
          creators: [
            {
              address: "MXTPExF3AYg6bW31ucCWHjh2wYaoDsF1Kx8jbHpD41N",
              share: 100,
            },
          ],
        },
      };

      const keyFile = readFileSync(key, "utf8");
      const keyToJSON = JSON.parse(keyFile);
      const seed = Uint8Array.from(keyToJSON).slice(0, 32);
      const keypair = Keypair.fromSeed(seed);
      const cluster = env.includes("https://") ? env : clusterApiUrl(env);

      const connection = new Connection(cluster, "finalized");
      const metaplex = new Metaplex(connection, env).use(keypairIdentity(keypair)).use(
        bundlrStorage({
          address: getBundlrURI(env),
          timeout: 60000,
          identity: keypair,
        })
      );;

      const metadata = await metaplex?.nfts().uploadMetadata(
        {
          ...collectionConfig,
          payer: keypair.publicKey,
        },
        {
          commitment: "finalized",
        }
      );
      if (!metadata) throw new Error("Metadata upload failed");

      const collection = await metaplex.nfts().create({
        name: collectionConfig.name,
        symbol: collectionConfig.symbol,
        uri: metadata.uri,
        sellerFeeBasisPoints: collectionConfig.seller_fee_basis_points,
        isCollection: true,
        collectionIsSized: true,
        updateAuthority: keypair,
      });

      if (!collection) {
        throw new Error("Collection mint failed");
      }

      console.log(
        `Collection mint ${collection.mintAddress.toBase58()} created in tx ${
          collection.response.signature
        }`
      );
    } catch (error) {
      console.error(error);
    }
  });

// ts-node scripts/nft-tools.ts delegateCollectionToHelius 12goZzd26JopD1jhcXWBjDhJh74zpBJjYKgVj8DaQfU5 -e devnet -k testKey-MXTPExF3AYg6bW31ucCWHjh2wYaoDsF1Kx8jbHpD41N.json
program
  .command("delegateCollectionToHelius")
  .argument("<collectionMint>", "The collection address to delegate to Helius")
  .option(
    "-e, --env <string>",
    "Solana cluster env name. One of: mainnet-beta, testnet, devnet (or URI)",
    "devnet"
  )
  .option(
    "-k, --key <path>",
    `Solana wallet location`,
    "--Solana wallet not provided"
  )
  .action(async (collectionMint, options) => {
    try {
      const { key, env } = options;

      const COLLECTION = new PublicKey(collectionMint);

      const HELIUS_COLLECTION_AUTHORITY =
        env === "devnet"
          ? "2LbAtCJSaHqTnP9M5QSjvAMXk79RNLusFspFN5Ew67TC"
          : "HnT5KVAywGgQDhmh6Usk4bxRg4RwKxCK4jmECyaDth5R";

      const keyFile = readFileSync(key, "utf8");
      const keyToJSON = JSON.parse(keyFile);
      const seed = Uint8Array.from(keyToJSON).slice(0, 32);
      const keypair = Keypair.fromSeed(seed);
      const cluster = env.includes("https://") ? env : clusterApiUrl(env);

      const connection = new Connection(cluster, "finalized");
      const metaplex = new Metaplex(connection).use(
        walletAdapterIdentity(keypair)
      );

      const { response } = await metaplex.nfts().approveCollectionAuthority({
        mintAddress: COLLECTION,
        collectionAuthority: new PublicKey(HELIUS_COLLECTION_AUTHORITY),
        updateAuthority: keypair,
      });

      if (!response) {
        throw new Error("Delegation failed");
      }

      console.log(
        `${COLLECTION.toBase58()} delegated to ${HELIUS_COLLECTION_AUTHORITY}`
      );
    } catch (error) {
      console.error(error);
    }
  });

// ts-node scripts/nft-tools.ts revokeCollectionFromHelius DQCCPUVm89LGu7nftE8LxXwbEhAvFeAyAa9STRqxwvv8 -e devnet -k testKey-MXTPExF3AYg6bW31ucCWHjh2wYaoDsF1Kx8jbHpD41N.json
program
  .command("revokeCollectionFromHelius")
  .argument("<collectionMint>", "The collection address to delegate to Helius")
  .option(
    "-e, --env <string>",
    "Solana cluster env name. One of: mainnet-beta, testnet, devnet (or URI)",
    "devnet"
  )
  .option(
    "-k, --key <path>",
    `Solana wallet location`,
    "--Solana wallet not provided"
  )
  .action(async (collectionMint, options) => {
    try {
      const { key, env } = options;

      const COLLECTION = new PublicKey(collectionMint);

      const HELIUS_COLLECTION_AUTHORITY =
        env === "devnet"
          ? "2LbAtCJSaHqTnP9M5QSjvAMXk79RNLusFspFN5Ew67TC"
          : "HnT5KVAywGgQDhmh6Usk4bxRg4RwKxCK4jmECyaDth5R";

      const keyFile = readFileSync(key, "utf8");
      const keyToJSON = JSON.parse(keyFile);
      const seed = Uint8Array.from(keyToJSON).slice(0, 32);
      const keypair = Keypair.fromSeed(seed);
      const cluster = env.includes("https://") ? env : clusterApiUrl(env);

      const connection = new Connection(cluster, "finalized");
      const metaplex = new Metaplex(connection).use(
        walletAdapterIdentity(keypair)
      );

      const { response } = await metaplex.nfts().revokeCollectionAuthority({
        mintAddress: COLLECTION,
        collectionAuthority: new PublicKey(HELIUS_COLLECTION_AUTHORITY),
        revokeAuthority: keypair,
      });

      if (!response) {
        throw new Error("Delegation failed");
      }

      console.log(
        `${COLLECTION.toBase58()} revoked authority address ${HELIUS_COLLECTION_AUTHORITY}`
      );
    } catch (error) {
      console.error(error);
    }
  });

program.parse(process.argv);
