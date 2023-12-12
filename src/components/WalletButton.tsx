import React, { useState } from "react";
import { Box, IconButton, Menu, MenuItem, Tooltip } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletDialog } from "./WalletAdapter/useWalletDialog";
import { FabMenu } from "./FabMenu";
import Image from "next/image";
import { useRouter } from "next/router";

const WalletButton: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [hovered, setHovered] = useState(false);

  const router = useRouter();
  const { setOpen } = useWalletDialog();
  const { wallet, connected, disconnect, publicKey } = useWallet();

  const handleFabClick = async () => {
    if (!connected) {
      setOpen(true);
    }
  };

  const handleRouterClick = (url: string) => {
    if (publicKey) {
      router.push(url ?? "/");
      handleMenuClose();
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDisconnectClick = () => {
    disconnect();
    handleMenuClose();
  };

  const handleMouseEnter = () => {
    setHovered(true);
  };

  const handleMouseLeave = () => {
    setHovered(false);
  };

  return (
    <Tooltip title={hovered && connected && !anchorEl ? "Profile Menu" : null}>
      <FabMenu
        color={connected ? "success" : "primary"}
        aria-label="add"
        onClick={handleFabClick}
        variant={connected ? "circular" : "extended"}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {!connected ? (
          <>
            <Box display="flex">
              <Image
                src="/images/solana.svg"
                alt="Solana Logo"
                width={24}
                height={24}
              />
            </Box>
            <Box ml={1}>Connect Wallet</Box>
          </>
        ) : (
          <>
            <IconButton
              edge="end"
              color="inherit"
              aria-label="menu"
              onClick={handleMenuClick}
            >
              {anchorEl ? (
                <CloseIcon sx={{ fontSize: 30, m: "auto" }} />
              ) : (
                <MenuIcon sx={{ fontSize: 30, m: "auto" }} />
              )}
            </IconButton>
            <Menu
              id="simple-menu"
              anchorEl={anchorEl}
              keepMounted
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              sx={{ mt: 3 }}
            >
              <MenuItem onClick={() => handleRouterClick("/")}>Home</MenuItem>
              <MenuItem
                onClick={() =>
                  publicKey &&
                  handleRouterClick(`/profile/${publicKey.toBase58()}`)
                }
              >
                View profile
              </MenuItem>
              <MenuItem onClick={handleDisconnectClick}>
                Disconnect wallet
              </MenuItem>
            </Menu>
          </>
        )}
      </FabMenu>
    </Tooltip>
  );
};

export default WalletButton;
