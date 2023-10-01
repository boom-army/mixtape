import React, { useEffect, useState } from "react";
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
import dayjs from "dayjs";
import { NftTemplate } from "../types/nftTemplates";

interface GalleryItem {
  item: NftTemplate;
  mixtapeTitle: string;
  selectedTape: string | null | undefined;
  setSelectedTape: React.Dispatch<
    React.SetStateAction<string | null | undefined>
  >;
}

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

const HeadText = styled(Typography)(({ theme }) => ({
  fontSize: "14px",
  fontWeight: 100,
  overflow: "hidden",
  color: theme.palette.secondary.dark,
}));

export const TapeGalleryItem: React.FC<GalleryItem> = ({
  item,
  mixtapeTitle,
  selectedTape,
  setSelectedTape,
}) => {
  const [countdown, setCountdown] = useState<string>("");

  useEffect(() => {
    const timer = setInterval(() => {
      const now = dayjs();
      if (item.endDate && !item.isExpired) {        
        const endDate = dayjs(item.endDate);
        const diff = endDate.diff(now, "second");
        if (diff > 0) {
          const duration = dayjs.duration(diff, "seconds");
          const totalDays = duration.asDays();
          const countdownString = `${Math.floor(totalDays)}d ${duration.hours()}h ${duration.minutes()}m ${duration.seconds()}s`;
          setCountdown(`Mint closes in ${countdownString}`);
        } else {
          item.isExpired = true;
          setCountdown("Minting closed");
        }
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [item]);

  return (
    <Grid item key={item.id}>
      <Card
        sx={{
          width: 250,
          cursor: "pointer",
          border: selectedTape === item.id ? "5px solid black" : "none",
          opacity: item.isExpired ? 0.5 : 1,
        }}
        onClick={() => !item.isExpired && setSelectedTape(item.id)}
      >
        <Box sx={{ width: "100%", pt: "100%", position: "relative" }}>
          <Box sx={{ position: "absolute", top: "0.7rem", left: "1rem" }}>
            {item.isExpired && <HeadText>Minted out</HeadText>}
            {item.endDate && !item.isExpired && (
              <HeadText>{countdown}</HeadText>
            )}
            {item.maxSupply && !item.isExpired && (
              <HeadText>{`${item.maxSupply - (item.mintCount || 0)}/${
                item.maxSupply
              } NFTs remaining`}</HeadText>
            )}
          </Box>
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
            {selectedTape === item.id && <TapeText>{mixtapeTitle}</TapeText>}
          </Box>
        </Box>
        <CardContent>
          <Typography variant="h5">{`${item.name} - C${item.runtime}`}</Typography>
          <Typography variant="body2">{`mint: ⦾${item.price}`}</Typography>
        </CardContent>
      </Card>
    </Grid>
  );
};
