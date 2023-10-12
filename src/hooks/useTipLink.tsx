import { useState } from "react";
import { TipLink } from "@tiplink/api";
import { useWallet } from "@solana/wallet-adapter-react";
import useGetNFTOwner from "./useGetNFTOwner";
import { useUmi } from "../contexts/UmiProvider";
import {
  getAssetWithProof,
  transfer,
} from "@metaplex-foundation/mpl-bubblegum";
import { transferSol } from "@metaplex-foundation/mpl-toolbox";
import {
  transactionBuilder,
  publicKey as umiPubKey,
} from "@metaplex-foundation/umi";
import { createSignerFromWalletAdapter } from "@metaplex-foundation/umi-signer-wallet-adapters";
import bs58 from "bs58";

const TIPLINK_MINIMUM_LAMPORTS = 4083560;

const useTipLink = () => {
  const [tipLinkURL, setTipLinkURL] = useState<string | null>(null);

  const umi = useUmi();
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
    if (!umi) {
      throw new Error("Metaplex not initialized");
    }

    const hasMint = await userOwnsNFT(nftAddress, publicKey);
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
          publicKey,
        }),
      });
      const { tipLinkData } = await readTipLink.json();

      if (tipLinkData) {
        setTipLinkURL(tipLinkData.tipLink);
        return;
      }
      const tiplink = await TipLink.create();

      const assetWithProof = await getAssetWithProof(
        umi,
        umiPubKey(nftAddress)
      );
      const fundAcc = transferSol(umi, {
        source: createSignerFromWalletAdapter(wallet),
        destination: umiPubKey(tiplink.keypair.publicKey),
        amount: {
          basisPoints: BigInt(TIPLINK_MINIMUM_LAMPORTS),
          identifier: "SOL",
          decimals: 9,
        },
      });
      const transferNFT = transfer(umi, {
        ...assetWithProof,
        leafOwner: umiPubKey(publicKey),
        newLeafOwner: umiPubKey(tiplink.keypair.publicKey),
      });
      let transaction = transactionBuilder().add(fundAcc).add(transferNFT);

      const sendTransfer = await transaction.sendAndConfirm(umi);
      const signature = bs58.encode(sendTransfer.signature);

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
      throw new Error(String(err));
    }
  };

  return {
    actionTipLink,
    tipLinkURL,
  };
};

export default useTipLink;
