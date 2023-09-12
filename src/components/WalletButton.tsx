import React, { useState } from "react";
import { Box, Fab, styled, Tooltip } from "@mui/material";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletDialog } from "./WalletAdapter/useWalletDialog";
import Image from "next/image";

const StyledFab = styled(Fab)({
  position: "fixed",
  top: 16,
  right: 16,
  svg: {
    fill: "white",
    marginRight: "0.3em",
  },
});

const WalletButton: React.FC = () => {
  const { connected, connect, disconnect } = useWallet();
  const { setOpen } = useWalletDialog();
  const [hovered, setHovered] = useState(false);

  const handleFabClick = async () => {
    if (connected) {
      disconnect();
    } else {
      setOpen(true);
    }
  };

  const handleMouseEnter = () => {
    setHovered(true);
  };

  const handleMouseLeave = () => {
    setHovered(false);
  };

  return (
    <Tooltip title={hovered && connected ? "Disconnect Wallet" : null}>
      <StyledFab
        color={connected ? "success" : "primary"}
        aria-label="add"
        onClick={handleFabClick}
        variant={connected ? "circular" : "extended"}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Box display="flex">
          <Image
            src="/images/solana.svg"
            alt="Solana Logo"
            width={24}
            height={24}
          />
        </Box>
        {!connected ? <Box ml={1}>Connect Wallet</Box> : null}
      </StyledFab>
    </Tooltip>
  );
};

export default WalletButton;
