import Image from "next/image";
import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  IconButton,
  Link,
  Menu,
  MenuItem,
  Typography,
  useTheme,
} from "@mui/material";
import ActionLinks from "./ActionLinks";
import { useSnackbar } from "../contexts/SnackbarProvider";
import { Photo, TextSnippet } from "@mui/icons-material";
import { indieFlowerFont } from "../utils/theme";

interface HeaderProps {
  image?: string;
  heading?: string;
  meta?: TrackMetadata;
}

export const Header: React.FC<HeaderProps> = ({ image, heading, meta }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [showCoverNotes, setShowCoverNotes] = useState(false);
  const [randomImage, setRandomImage] = useState(
    image ?? "/images/mixtape-1024.png"
  );
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();

  useEffect(() => {
    const images = [
      "/images/mixtape-shoey.png",
      "/images/mixtape-1024.png",
      "/images/mixtape-sol-1024.png",
    ];

    const randomIndex = Math.floor(Math.random() * images.length);
    setRandomImage(images[randomIndex]);
  }, []);

  let currentURL = "";
  if (typeof window !== "undefined") {
    currentURL = window.location.href;
  }

  const handleMenuOpen = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentURL);
    enqueueSnackbar("Mixtape link copied to clipboard");
    handleMenuClose();
  };

  return (
    <Grid container>
      <Grid item xs={12} sm={6}>
        <Box
          display="flex"
          justifyContent="center"
          sx={{ position: "relative" }}
        >
          <Box sx={{ position: "absolute", top: "2em", left: "3em" }}>
            <IconButton onClick={() => setShowCoverNotes(!showCoverNotes)}>
              {showCoverNotes ? (
                <Photo sx={{ fill: theme.palette.secondary.dark }} />
              ) : (
                <TextSnippet sx={{ fill: theme.palette.secondary.dark }} />
              )}
            </IconButton>
          </Box>
          {meta?.cover_notes && showCoverNotes ? (
            <Box
              width={360}
              height={360}
              sx={{
                backgroundColor: "white",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
                gap: "1em",
                padding: "1em",
                background: `repeating-linear-gradient(white, white 24px, ${theme.palette.error.light} 25px, ${theme.palette.error.light} 26px)`,
                paddingTop: "0.7em",
                overflow: "hidden",
              }}
            >
              <Typography
                sx={{
                  fontFamily: `${indieFlowerFont.style.fontFamily}, "Comic Sans MS", "Bradley Hand", "Brush Script MT", cursive;`,
                  lineHeight: "1.5em",
                  fontSize: "1.1rem",
                  color: "black",
                  textAlign: "center",
                }}
              >
                {meta?.cover_notes}
              </Typography>
            </Box>
          ) : (
            <Image
              src={image ?? randomImage}
              alt="cassette"
              width={360}
              height={360}
            />
          )}
        </Box>
      </Grid>
      <Grid item xs={12} sm={6}>
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="start"
          height="100%"
        >
          <Box>
            <Typography
              variant="h1"
              sx={{ fontSize: { xs: "2.5rem", sm: "3.2rem" } }}
            >
              {heading ?? "MixtApe"}
            </Typography>
          </Box>
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="start"
          >
            <ActionLinks handleMenuOpen={handleMenuOpen} />
            <Menu
              anchorEl={anchorEl}
              keepMounted
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleMenuClose}>
                <Link
                  href={`https://www.facebook.com/sharer/sharer.php?u=${currentURL}&quote=Check this out - MixtApe - ${currentURL}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Typography variant="body1">Share on Facebook</Typography>
                </Link>
              </MenuItem>
              <MenuItem onClick={handleMenuClose}>
                <Link
                  href={`https://twitter.com/intent/tweet?url=${currentURL}&text=Check this out &hashtags=MixtApe`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Typography variant="body1">Share on Twitter</Typography>
                </Link>
              </MenuItem>
              <MenuItem onClick={handleCopy}>
                <Typography>Copy URL</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
};
