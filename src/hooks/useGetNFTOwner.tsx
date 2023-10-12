import { PublicKey } from "@solana/web3.js";

const useGetNFTOwner = () => {
  const userOwnsNFT = async (nftAddress: string, publicKey: PublicKey) => {
    const res = await fetch(`/api/nft/read-meta?address=${nftAddress}`);
    const nftData = await res.json();
    const hasMint = nftData.asset.ownership.owner === publicKey.toBase58();
    return hasMint;
  };

  return { userOwnsNFT };
};

export default useGetNFTOwner;
