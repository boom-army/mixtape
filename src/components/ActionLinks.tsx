import { Box, Link, List, ListItem, Typography, styled } from "@mui/material";
import React from "react";

const LinkAction = styled(Link)(({ theme }) => ({
  display: "inline",
  fontSize: "1.5rem",
  fontWeight: 700,
  cursor: "pointer",
  textDecoration: "underline",
  color: theme.palette.text.primary,
  lineHeight: 2,
  "& span": {
    display: "inline-block",
    textDecoration: "none!important",
    color: theme.palette.secondary.main,
  },
  "&:hover": {
    textDecoration: "underline",
  },
}));

interface ActionLinksProps {
  handleMenuOpen: (event: any) => void;
}

const ActionLinks: React.FC<ActionLinksProps> = ({ handleMenuOpen }) => {
  return (
    <Box>
      <List>
        <ListItem disablePadding>
          <LinkAction href="/create">Create<span>&nbsp;your own mix</span></LinkAction>
        </ListItem>
        <ListItem disablePadding>
          <LinkAction onClick={handleMenuOpen}>
            Share<span>&nbsp;this mix</span>
          </LinkAction>
        </ListItem>
      </List>
    </Box>
  );
};

export default ActionLinks;
