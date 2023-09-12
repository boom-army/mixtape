import React, { useContext, useEffect, useState } from "react";
import TapeGallery from "../components/TapeGallery";
import { Button, CircularProgress, Stack, TextField } from "@mui/material";
import { useWallet } from "@solana/wallet-adapter-react";
import { Attribute, NftTemplates } from "../types/nftTemplates";
import { toPng } from "html-to-image";
import { PublicKey } from "@solana/web3.js";
import { MetaplexContext } from "../contexts/MetaplexProvider";
import { map } from "lodash";
import { formatDuration, fromYouTubeURL } from "../utils/tracks";
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
          if (fetchedMetadata.json.attributes) {
            fetchedMetadata.json.attributes =
              fetchedMetadata.json.attributes.filter(
                (attribute) => !attribute?.trait_type?.includes("track")
              );
          }
          if (fetchedMetadata.json.tracks) {
            fetchedMetadata.json.tracks = await Promise.all(
              map(fetchedMetadata.json.tracks, async (track: TrackMeta) => {
                let videoId: string;
                try {
                  videoId = fromYouTubeURL(track.id);
                } catch (error) {
                  console.error(`Invalid YouTube URL: ${track.id}`);
                  return track;
                }
                const response = await fetch(
                  `/api/trackmeta?urls=${encodeURIComponent(track.id)}`
                );
                if (!response.ok) {
                  throw new Error(
                    "Failed to load track meta. Remove and add the track to try again."
                  );
                }
                const data = await response.json();
                const meta = data[0];
                const trackIndex: any =
                  (fetchedMetadata?.json?.tracks as TrackMeta[])?.indexOf(
                    track
                  ) + 1;
                fetchedMetadata?.json?.attributes?.push({
                  trait_type: `track_${trackIndex}`,
                  value: meta.title,
                });
                return {
                  id: meta.id || videoId,
                  title: meta.title,
                  lengthSeconds: meta.lengthSeconds,
                };
              })
            );
            const newTotalDuration = (
              fetchedMetadata.json.tracks as { lengthSeconds: number }[]
            ).reduce((total, track) => total + (track.lengthSeconds || 0), 0);
            const formattedDuration = formatDuration(newTotalDuration);
            const durationAttributeIndex =
              fetchedMetadata?.json?.attributes?.findIndex(
                (attribute) => attribute.trait_type === "duration"
              );
            if (
              durationAttributeIndex !== undefined &&
              durationAttributeIndex !== -1
            ) {
              (fetchedMetadata?.json?.attributes as Attribute[])[
                durationAttributeIndex
              ].value = formattedDuration;
            } else if (fetchedMetadata?.json?.attributes) {
              fetchedMetadata.json.attributes.push({
                trait_type: "duration",
                value: formattedDuration,
              });
            }
          }
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
    const image = await toPng(tapeElement, {
      canvasWidth: 1024,
      canvasHeight: 1024,
      backgroundColor: "transparent",
    });

    try {
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
