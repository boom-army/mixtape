import { useState } from "react";
import { TipLink } from "@tiplink/api";
import { Transaction, SystemProgram, PublicKey } from "@solana/web3.js";
import { useConnection } from "@solana/wallet-adapter-react";
import { useMetaplex } from "../contexts/MetaplexProvider";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import useGetNFTOwner from "./useGetNFTOwner";

const TIPLINK_MINIMUM_LAMPORTS = 4083560;

const useTipLink = () => {
  const [tipLinkURL, setTipLinkURL] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { connection } = useConnection();
  const Metaplex = useMetaplex();
  const { userOwnsNFT } = useGetNFTOwner();

  const actionTipLink = async (
    nftAddress: string,
    publicKey?: PublicKey | null,
    signTransaction?: (transaction: Transaction) => Promise<Transaction>
  ) => {
    if (!publicKey || !signTransaction) {
      throw new Error("Wallet not connected");
    }
    if (!Metaplex) {
      throw new Error("Metaplex not initialized");
    }

    const hasMint = await userOwnsNFT(nftAddress, publicKey);
    if (hasMint.length === 0) {
      throw new Error("The user does not own the specified NFT");
    }

    const hasTipLink = await fetch("/api/tiplink", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (hasTipLink) {
      const data = await hasTipLink.json();
      setTipLinkURL(data.tipLinkData.tiplink);
      return;
    }
    const tiplink = await TipLink.create();
    try {
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: tiplink.keypair.publicKey,
          lamports: TIPLINK_MINIMUM_LAMPORTS,
        })
      );

      const mintPublicKey = new PublicKey(nftAddress);
      const ownerTokenAccount = await getAssociatedTokenAddress(
        mintPublicKey,
        publicKey
      );
      const recipientTokenAccount = await getAssociatedTokenAddress(
        mintPublicKey,
        publicKey
      );
      const transferInstruction = SystemProgram.transfer({
        fromPubkey: ownerTokenAccount,
        toPubkey: recipientTokenAccount,
        lamports: 1,
      });
      transaction.add(transferInstruction);

      transaction.feePayer = publicKey;
      const blockhash = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash.blockhash;

      const signedTransaction = await signTransaction(transaction);
      const signature = await connection.sendRawTransaction(
        signedTransaction.serialize()
      );

      if (!signature) {
        throw new Error("Unable to fund TipLink's public key");
      }

      const response = await fetch("/api/tiplink", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: publicKey.toString(),
          mintAddress: tiplink.keypair.publicKey.toString(),
          tipLink: tipLinkURL,
          signature: signature,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create TipLink");
      }

      const data = await response.json();
      setTipLinkURL(data.tiplink);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return {
    actionTipLink,
    tipLinkURL,
    error,
  };
};

export default useTipLink;
