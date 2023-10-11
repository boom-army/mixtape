import { readFileSync } from "fs";
import { program } from "commander";
import { Metaplex, walletAdapterIdentity } from "@metaplex-foundation/js";
import { Connection, Keypair, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { MIXTAPE_COLLECTION } from "../src/utils/nft";

program
  .name("nft-tools")
  .description("CLI for general NFT interactions")
  .version("0.0.1");

// ts-node scripts/nft-tools.ts createCollection -e devnet -k testKey-MXTPExF3AYg6bW31ucCWHjh2wYaoDsF1Kx8jbHpD41N.json
//  DQCCPUVm89LGu7nftE8LxXwbEhAvFeAyAa9STRqxwvv8
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
        name: "MixtApe",
        symbol: "MXTAPE",
        description: "MixtApes on Solana at mixt-ape.com - mix, share, repeat",
        seller_fee_basis_points: 0,
        image:
          "https://nftstorage.link/ipfs/bafkreiawri2iatz2fl7avzzqtgwdtveigdgmhpnm2o3lea64gzv23wo77e",
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
      const metaplex = new Metaplex(connection).use(
        walletAdapterIdentity(keypair)
      );

      const collection = await metaplex.nfts().create({
        name: collectionConfig.name,
        uri: "https://nftstorage.link/ipfs/bafkreibwsac5joamimxi5vseyfy3oddap4jk3zzs25qxxsnc4av6xn57l4",
        sellerFeeBasisPoints: collectionConfig.seller_fee_basis_points,
        isCollection: true,
        updateAuthority: keypair,
      });

      if (!collection) {
        throw new Error("Collection mint failed");
      }

      console.log(`Collection mint ${collection.mintAddress.toBase58()} created in tx ${collection.response.signature}`);
    } catch (error) {
      console.error(error);
    }
  });

program
  .command("delegateCollectionToHelius")
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
  .action(async (_, options) => {
    try {
      const { key, env } = options;

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
        mintAddress: MIXTAPE_COLLECTION,
        collectionAuthority: new PublicKey(HELIUS_COLLECTION_AUTHORITY),
        updateAuthority: keypair,
      });

      if (!response) {
        throw new Error("Delegation failed");
      }

      console.log(
        `${MIXTAPE_COLLECTION.toBase58()} delegated to ${HELIUS_COLLECTION_AUTHORITY}`
      );
    } catch (error) {
      console.error(error);
    }
  });

program.parse(process.argv);
