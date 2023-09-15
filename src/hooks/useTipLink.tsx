import { useState } from "react";
import { TipLink } from "@tiplink/api";
import { Transaction, SystemProgram, PublicKey } from "@solana/web3.js";
import { useConnection } from "@solana/wallet-adapter-react";
import { useMetaplex } from "../contexts/MetaplexProvider";

const TIPLINK_MINIMUM_LAMPORTS = 4083560;

const useTipLink = () => {
  const [tipLinkURL, setTipLinkURL] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { connection } = useConnection();
  const Metaplex = useMetaplex();

  const fundTipLink = async (
    nftAddress: string,
    publicKey?: PublicKey,
    signTransaction?: (transaction: Transaction) => Promise<Transaction>
  ) => {
    if (!publicKey || !signTransaction) {
      throw new Error("Wallet not connected");
    }
    const nftData = await Metaplex?.nfts().findAllByOwner({ owner: publicKey });
    const hasMint = nftData?.some((nft) => nft.address.toBase58() === nftAddress);
    if (!hasMint) {
      throw new Error("The user does not own the specified NFT");
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
          tiplink: tipLinkURL,
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
    fundTipLink,
    tipLinkURL,
    error,
  };
};

export default useTipLink;
