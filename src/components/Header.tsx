import Image from "next/image";
import React, { useEffect, useState } from "react";
import { Box, Grid, Link, Menu, MenuItem, Typography } from "@mui/material";
import ActionLinks from "./ActionLinks";
import { useSnackbar } from "../contexts/SnackbarProvider";

interface HeaderProps {
  image?: string;
  heading?: string;
}

export const Header: React.FC<HeaderProps> = ({ image, heading }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [randomImage, setRandomImage] = useState(
    image ?? "/images/mixtape-1024.png"
  );
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const images = [
      "/images/mixtape-rainbow-1024.png",
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
        <Box display="flex" justifyContent="center">
          <Image
            src={image ?? randomImage}
            alt="cassette"
            width={360}
            height={360}
          />
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
            <Typography variant="h1">{heading ?? "MixtApe"}</Typography>
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
