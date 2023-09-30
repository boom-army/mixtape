import React, { useEffect } from "react";
import { Grid } from "@mui/material";
import { map } from "lodash";
import { useRecoilState } from "recoil";
import { activeNFTTemplates } from "../state";
import { NftTemplate } from "../types/nftTemplates";
import { TapeGalleryItem } from "./TapeGalleryItem";

interface GalleryItems {
  mixtapeTitle: string;
  selectedTape: string | null | undefined;
  setSelectedTape: React.Dispatch<
    React.SetStateAction<string | null | undefined>
  >;
}

const TapeGallery: React.FC<GalleryItems> = ({
  mixtapeTitle,
  selectedTape,
  setSelectedTape,
}) => {
  const [nftTemplates, setNftTemplates] = useRecoilState(activeNFTTemplates);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/nft-templates");
        if (!response.ok) {
          return;
        }
        const { nftTemplates } = await response.json();
        console.log(nftTemplates);
        setNftTemplates(nftTemplates);
        const firstNonExpiredTape = nftTemplates.find(
          (tape: NftTemplate) => !tape.isExpired
        );
        if (firstNonExpiredTape) {
          setSelectedTape(firstNonExpiredTape.id);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };
    fetchData();
  }, []);

  return (
    <Grid container spacing={2} mb={4}>
      {map(nftTemplates, (item) => (
        <TapeGalleryItem
          item={item}
          mixtapeTitle={mixtapeTitle}
          selectedTape={selectedTape}
          setSelectedTape={setSelectedTape}
        />
      ))}
    </Grid>
  );
};

export default TapeGallery;
