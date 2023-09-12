import { useCallback, useState } from "react";
import { useSnackbar } from "../contexts/SnackbarProvider";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { HARKL_ID, MIXTAPE_TX, STORAGE_FEES } from "../utils/nft";
import { LAMPORTS_PER_SOL, SystemProgram, Transaction } from "@solana/web3.js";
import { NftTemplate } from "../types/nftTemplates";
import { JsonMetadata } from "@metaplex-foundation/js";

export interface MintNFT {
  template: NftTemplate;
  nftImageBlob: string;
  nftMetadata: JsonMetadata;
}

export const useMintNFT = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const [isMinting, setMinting] = useState<boolean>(false);

  const mintNFT = useCallback(
    async ({ template, nftImageBlob, nftMetadata }: MintNFT) => {
      setMinting(true);
      try {
        if (!publicKey || !signTransaction)
          throw new Error("Wallet not connected");

        // payment gets split between harkl and mixtape
        const payment = parseFloat((template.price - STORAGE_FEES).toFixed(4));
        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: HARKL_ID,
            lamports: BigInt(Math.floor(payment * LAMPORTS_PER_SOL)),
          })
        );
        transaction.add(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: MIXTAPE_TX,
            lamports: BigInt(Math.floor(STORAGE_FEES * LAMPORTS_PER_SOL)),
          })
        );

        transaction.feePayer = publicKey;
        const blockhash = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash.blockhash;

        const signedTransaction = await signTransaction(transaction);
        const signature = await connection.sendRawTransaction(
          signedTransaction.serialize()
        );
        await connection.confirmTransaction(signature, "singleGossip");

        // const locReq = await fetch("https://www.cloudflare.com/cdn-cgi/trace", {
        //   method: "GET",
        // });
        // const locReqRes = await locReq.text();
        // const location = locReqRes
        //   .trim()
        //   .split("\n")
        //   .reduce(function (obj: any, pair: any) {
        //     pair = pair.split("=");
        //     return (obj[pair[0]] = pair[1]), obj;
        //   }, {});
        // const nonce = Buffer.from(JSON.stringify(location)).toString("base64");

        const mintNFTResponse = await fetch("/api/mint", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nftImageBlob,
            nftMetadata,
            template,
            signature,
            // nonce,
          }),
        });

        if (!mintNFTResponse.ok) {
          const errorMessage = await mintNFTResponse.text();
          throw new Error(`Failed to mint NFT: ${errorMessage}`);
        }

        const mintNFT: { mintAddress: string } = await mintNFTResponse.json();
        enqueueSnackbar(`Successful mint for address: ${mintNFT.mintAddress}`);
        return mintNFT;
      } catch (e: any) {
        console.log(e);
        enqueueSnackbar(e.message);
      } finally {
        setMinting(false);
      }
    },
    [publicKey, signTransaction, enqueueSnackbar, connection]
  );

  return { mintNFT, isMinting };
};
