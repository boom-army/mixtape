import React, { useState } from "react";
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
import { NftTemplates } from "../types/nftTemplates";
import { map } from "lodash";

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
  return (
    <Grid container spacing={2} mb={4}>
      {map(NftTemplates, (item, key) => (
        <Grid item key={key}>
          <Card
            sx={{
              width: 250,
              cursor: "pointer",
              border: selectedTape === key ? "5px solid black" : "none",
            }}
            onClick={() => setSelectedTape(key)}
          >
            <Box
              sx={{ width: "100%", paddingTop: "100%", position: "relative" }}
            >
              <Box
                id={key}
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
                {selectedTape === key && <TapeText>{mixtapeTitle}</TapeText>}
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
