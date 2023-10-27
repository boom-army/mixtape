import React, { useContext, useEffect, useState } from "react";
import TapeGallery from "../components/TapeGallery";
import { Button, CircularProgress, Stack, TextField } from "@mui/material";
import { useWallet } from "@solana/wallet-adapter-react";
import html2canvas from "html2canvas";
import { PublicKey } from "@solana/web3.js";
import { MetaplexContext } from "../contexts/MetaplexProvider";
import { Sft, SftWithToken, Nft, NftWithToken } from "@metaplex-foundation/js";

const UpdateNFT = () => {
  const [mixtapeTitle, setMixtapeTitle] = useState("");
  const [selectedTape, setSelectedTape] = useState<string | null | undefined>(
    null
  );
  const [mintAddress, setMintAddress] = useState("");
  const [fetchedMeta, setFetchedMeta] = useState<
    Sft | SftWithToken | Nft | NftWithToken | null
  >(null);
  const [loading, setLoading] = useState(false);

  const { publicKey } = useWallet();
  const metaplex = useContext(MetaplexContext);

  useEffect(() => {
    (async () => {
      try {
        if (!mintAddress) return;
        if (!mixtapeTitle) return;
        const address = new PublicKey(mintAddress);
        const fetchedMetadata = await metaplex?.nfts().findByMint({
          mintAddress: address,
        });
        if (!fetchedMetadata) throw new Error("Failed to fetch NFT metadata");

        if (fetchedMetadata.json) {
          fetchedMetadata.json.description = mixtapeTitle;
          // fetchedMetadata.json.tracks = fetchedMetadata.json.tracks || [];
          fetchedMetadata.json.track_meta = {
            // @ts-ignore
            cover_notes: fetchedMetadata.json.track_meta?.cover_notes || "",
          };
          fetchedMetadata.json.attributes =
            fetchedMetadata.json.attributes || [];
          if (fetchedMetadata.json.attributes) {
            fetchedMetadata.json.attributes =
              fetchedMetadata.json.attributes.filter(
                (attribute) =>
                  !attribute?.trait_type?.includes("track") &&
                  !attribute?.trait_type?.includes("duration")
              );
          }
          // if (fetchedMetadata.json.tracks) {
          //   fetchedMetadata.json.tracks = await Promise.all(
          //     map(fetchedMetadata.json.tracks, async (track: TrackMeta) => {
          //       let videoId: string;
          //       try {
          //         videoId = fromYouTubeURL(track.id);
          //       } catch (error) {
          //         console.error(`Invalid YouTube URL: ${track.id}`);
          //         return track;
          //       }
          //       const response = await fetch(
          //         `/api/trackmeta?urls=${encodeURIComponent(track.id)}`
          //       );
          //       if (!response.ok) {
          //         throw new Error(
          //           "Failed to load track meta. Remove and add the track to try again."
          //         );
          //       }
          //       const data = await response.json();
          //       const meta = data[0];
          //       return {
          //         id: meta.id || videoId,
          //         title: meta.title,
          //         lengthSeconds: meta.lengthSeconds,
          //       };
          //     })
          //   );
          // }
        }
        console.log(fetchedMetadata);
        setFetchedMeta(fetchedMetadata);
      } catch (err) {
        throw new Error(String(err));
      }
    })();
  }, [mintAddress]);

  const handleUpdate = async () => {
    setLoading(true);
    if (!mintAddress) throw new Error("Mint address not set");
    if (!mixtapeTitle) throw new Error("Mixtape title not set");
    const tapeElement = selectedTape && document.getElementById(selectedTape);
    if (!tapeElement) throw new Error("Tape not selected");

    try {
      const canvas = await html2canvas(tapeElement, {
        backgroundColor: null,
        scale: window.devicePixelRatio * 2.135,
      });
      const image = canvas.toDataURL();
      const response = await fetch("/api/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mintAddress,
          password: publicKey?.toString(),
          image,
          fetchedMeta,
        }),
      });
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error(error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack spacing={2} p={2}>
      <TextField
        value={mixtapeTitle}
        onChange={(e) => setMixtapeTitle(e.target.value)}
        label="Mixtape Title"
        variant="outlined"
        fullWidth
      />
      <TapeGallery
        mixtapeTitle={mixtapeTitle}
        selectedTape={selectedTape}
        setSelectedTape={setSelectedTape}
      />
      <TextField
        value={mintAddress}
        onChange={(e) => {
          setMintAddress(e.target.value);
        }}
        label="Mint Address"
        variant="outlined"
        fullWidth
      />
      <Button variant="contained" onClick={handleUpdate} disabled={loading}>
        {loading ? <CircularProgress size={24} /> : "Update NFT"}
      </Button>
    </Stack>
  );
};

export default UpdateNFT;
