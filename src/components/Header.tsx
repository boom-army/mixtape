import Image from "next/image";
import React, { useState } from "react";
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
import { MusicVideoOutlined, TextSnippetOutlined } from "@mui/icons-material";
import { indieFlowerFont } from "../utils/theme";
import { useRouter } from "next/router";
import { HeaderProps } from "../types/nftTemplates";
import { ReactionMenu } from "./ReactionMenu";

export const Header: React.FC<HeaderProps> = ({ meta }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [showCoverNotes, setShowCoverNotes] = useState(false);

  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const router = useRouter();

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
    <>
      <Grid container>
        <Grid item xs={12} sm={6}>
          <Box display="flex" justifyContent="center">
            {meta?.track_meta?.cover_notes && showCoverNotes ? (
              <Box
                width={360}
                height={360}
                sx={{
                  backgroundColor: "white",
                  border: `2px solid ${theme.palette.primary.main}`,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  flexDirection: "column",
                  gap: "1rem",
                  padding: "1rem",
                  background: `repeating-linear-gradient(white, white 24px, ${theme.palette.error.light} 25px, ${theme.palette.error.light} 26px)`,
                  paddingTop: "2.3rem",
                  overflow: "hidden",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: `${indieFlowerFont.style.fontFamily}, "Comic Sans MS", "Bradley Hand", "Brush Script MT", cursive;`,
                    lineHeight: "1.62rem",
                    fontSize: "1.1rem",
                    color: "black",
                    textAlign: "left",
                    whiteSpace: "pre-line",
                  }}
                >
                  {meta?.track_meta?.cover_notes}
                </Typography>
              </Box>
            ) : (
              <Image
                src={meta?.image ?? "/images/mixtape-1024.png"}
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
                sx={{
                  fontSize: { xs: "2.5rem", sm: "3.2rem" },
                  position: "relative",
                }}
                display="inline"
              >
                {meta?.name ?? "MixtApe"}
                {meta?.track_meta?.cover_notes && (
                  <Box display="inline" sx={{ position: "absolute", top: -15 }}>
                    <IconButton
                      onClick={() => setShowCoverNotes(!showCoverNotes)}
                    >
                      {showCoverNotes ? (
                        <MusicVideoOutlined
                          sx={{ fill: theme.palette.secondary.dark }}
                        />
                      ) : (
                        <TextSnippetOutlined
                          sx={{ fill: theme.palette.secondary.dark }}
                        />
                      )}
                    </IconButton>
                  </Box>
                )}
              </Typography>
            </Box>
            <Box
              display="flex"
              flexDirection="column"
              justifyContent="center"
              alignItems="start"
            >
              <ActionLinks
                imageUrl={meta?.image ?? "/images/mixtape-1024.png"}
                handleMenuOpen={handleMenuOpen}
              />
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
      {router.pathname.includes("/sol/") && <ReactionMenu />}
    </>
  );
};
