import { PublicKey } from "@solana/web3.js";
import { useMetaplex } from "../contexts/MetaplexProvider";

const useGetNFTOwner = () => {
  const Metaplex = useMetaplex();

  const userOwnsNFT = async (nftAddress: string, publicKey: PublicKey) => {
    const nftData = await Metaplex?.nfts().findAllByOwner({ owner: publicKey });
    const hasMint = nftData?.filter(
      // @ts-ignore
      (nft) => nft.mintAddress.toBase58() === nftAddress
    );
    if (hasMint && hasMint.length > 0) {
      // @ts-ignore
      return hasMint[0].mintAddress.toBase58();
    }
    return "";
  };

  return { userOwnsNFT };
};

export default useGetNFTOwner;
