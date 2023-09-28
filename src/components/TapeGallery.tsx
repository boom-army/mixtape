import React, { useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Typography,
  styled,
} from "@mui/material";
import { handjetFont } from "../utils/theme";
import { map } from "lodash";
import { useRecoilState } from "recoil";
import { activeNFTTemplates } from "../state";

const TapeText = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.main,
  fontFamily: `${handjetFont.style.fontFamily}, "Courier New", "Consolas", "Monaco", monospace;`,
  fontSize: "14px",
  top: "78px",
  left: "50%",
  lineHeight: "12px",
  position: "absolute",
  width: "59%",
  wordBreak: "break-word",
  overflow: "hidden",
  maxHeight: "34px",
  textAlign: "center",
  transform: "translate(-50%, -50%)",
}));

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
        setNftTemplates(nftTemplates);
        setSelectedTape(nftTemplates[0].id);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };
    fetchData();
  }, []);

  return (
    <Grid container spacing={2} mb={4}>
      {map(nftTemplates, (item) => (
        <Grid item key={item.id}>
          <Card
            sx={{
              width: 250,
              cursor: "pointer",
              border: selectedTape === item.id ? "5px solid black" : "none",
            }}
            onClick={() => setSelectedTape(item.id)}
          >
            <Box
              sx={{ width: "100%", paddingTop: "100%", position: "relative" }}
            >
              <Box
                id={item.id}
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: "transparent",
                }}
              >
                <CardMedia
                  component="img"
                  alt={item.name}
                  height="100%"
                  image={item.image}
                  sx={{ objectFit: "contain", backgroundColor: "transparent" }}
                />
                {selectedTape === item.id && (
                  <TapeText>{mixtapeTitle}</TapeText>
                )}
              </Box>
            </Box>
            <CardContent>
              <Typography variant="h5">{`${item.name} - C${item.runtime}`}</Typography>
              <Typography variant="body2">{`mint: ⦾${item.price}`}</Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default TapeGallery;
