import { useState } from "react";
import { TipLink } from "@tiplink/api";
import { SystemProgram, PublicKey } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { useMetaplex } from "../contexts/MetaplexProvider";
import useGetNFTOwner from "./useGetNFTOwner";

const TIPLINK_MINIMUM_LAMPORTS = 4083560;

const useTipLink = () => {
  const [tipLinkURL, setTipLinkURL] = useState<string | null>(null);

  const Metaplex = useMetaplex();
  const { userOwnsNFT } = useGetNFTOwner();
  const wallet = useWallet();

  const actionTipLink = async (nftAddress: string) => {
    const { publicKey, signTransaction, signMessage, signAllTransactions } =
      wallet;
    if (
      !publicKey ||
      !signTransaction ||
      !signMessage ||
      !signAllTransactions
    ) {
      throw new Error("Wallet not connected");
    }
    if (!Metaplex) {
      throw new Error("Metaplex not initialized");
    }

    const hasMint = await userOwnsNFT(nftAddress, publicKey as PublicKey);
    if (!hasMint) {
      throw new Error("The user does not own the specified NFT");
    }

    try {
      const readTipLink = await fetch("/api/tiplink-read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mintAddress: nftAddress,
        }),
      });
      if (readTipLink.ok) {
        const data = await readTipLink.json();
        setTipLinkURL(data.tipLinkData.tipLink);
        return;
      }

      const tiplink = await TipLink.create();

      const mintPublicKey = new PublicKey(nftAddress);
      const nftOrSft = await Metaplex.nfts().findByMint({
        mintAddress: mintPublicKey,
      });
      const transaction = Metaplex.nfts().builders().transfer({
        nftOrSft,
        toOwner: tiplink.keypair.publicKey,
      });
      const fundTiplink = SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: tiplink.keypair.publicKey,
        lamports: TIPLINK_MINIMUM_LAMPORTS,
      });
      transaction.add({
        instruction: fundTiplink,
        signers: [
          { publicKey, signTransaction, signMessage, signAllTransactions },
        ],
      });
      const signedTransaction = await transaction.sendAndConfirm(Metaplex);
      const signature = signedTransaction.response.signature;

      if (!signature) {
        throw new Error("Transaction failed");
      }

      const response = await fetch("/api/tiplink-create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: publicKey.toString(),
          mintAddress: nftAddress,
          tipLink: tiplink.url.href,
          signature: signature,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create TipLink");
      }

      const data = await response.json();
      setTipLinkURL(data.tipLinkData.tipLink);
    } catch (err) {
      return err;
    }
  };

  return {
    actionTipLink,
    tipLinkURL,
  };
};

export default useTipLink;
