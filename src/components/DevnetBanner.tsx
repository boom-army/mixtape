import * as React from "react";
import { Box, Typography } from "@mui/material";
import Link from "next/link";

const DevnetBanner = () => {
  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 0,
        width: "100%",
        bgcolor: "error.main",
        color: "white",
        p: 2,
        textAlign: "center",
        zIndex: 9999,
      }}
    >
      <Typography>
        You are in test mode and not on MAINNET.{" "}
        <Link
          href="https://solana.fm/?cluster=devnet-solana"
          passHref
          target="_blank"
        >
          Use DEVNET explorer
        </Link>{" "}
        to search for NFT mints.{" "}
        <Link href="https://solfaucet.com" passHref target="_blank">
          Get DEVNET SOL for free minting here.
        </Link>
      </Typography>
    </Box>
  );
};

export default DevnetBanner;
