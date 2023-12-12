import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import MenuItem from "@mui/material/MenuItem";
import React, { useState } from "react";
import { FabMenu } from "./FabMenu";

export const ProfileMenu = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    document.body.classList.add("no-padding");
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    document.body.classList.remove("no-padding");
    setAnchorEl(null);
  };

  return (
    <FabMenu>
      <IconButton
        edge="end"
        color="inherit"
        aria-label="menu"
        onClick={handleClick}
      >
        {anchorEl ? <CloseIcon /> : <MenuIcon />}
      </IconButton>
      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={handleClose}>Option 1</MenuItem>
        <MenuItem onClick={handleClose}>Option 2</MenuItem>
        <MenuItem onClick={handleClose}>Option 3</MenuItem>
      </Menu>
    </FabMenu>
  );
};
