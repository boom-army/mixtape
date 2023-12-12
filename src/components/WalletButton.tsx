import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import CloseIcon from "@mui/icons-material/Close";
import HomeIcon from "@mui/icons-material/Home";
import Image from "next/image";
import MenuIcon from "@mui/icons-material/Menu";
import React, { useState } from "react";
import { Box, IconButton, Menu, MenuItem, Tooltip } from "@mui/material";
import { FabMenu } from "./FabMenu";
import { useRouter } from "next/router";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletDialog } from "./WalletAdapter/useWalletDialog";

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
              <MenuItem onClick={() => handleRouterClick("/")}>
                <HomeIcon sx={{ mr: 1 }} />
                Home
              </MenuItem>
              <MenuItem
                onClick={() =>
                  publicKey &&
                  handleRouterClick(`/profile/${publicKey.toBase58()}`)
                }
              >
                <AccountCircleIcon sx={{ mr: 1 }} />
                View profile
              </MenuItem>
              <MenuItem onClick={handleDisconnectClick}>
                <Box mr={1}>
                  <img
                    src={wallet?.adapter.icon}
                    alt={wallet?.adapter.name}
                    width={20}
                  />
                </Box>
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
