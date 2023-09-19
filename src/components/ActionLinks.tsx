import { Box, Link, List, ListItem, styled } from "@mui/material";
import React, { useEffect, useState } from "react";
import useTipLink from "../hooks/useTipLink";
import { useRouter } from "next/router";
import useGetNFTOwner from "../hooks/useGetNFTOwner";
import { useWallet } from "@solana/wallet-adapter-react";

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
  const [isOwner, setIsOwner] = useState(false);

  const { publicKey, signTransaction } = useWallet();
  const { actionTipLink, tipLinkURL, error } = useTipLink();
  const router = useRouter();
  const { userOwnsNFT } = useGetNFTOwner();

  useEffect(() => {
    if (!publicKey || !router.query.address) return;
    const nftOwner = async () => {
      try {
        const hasMint = await userOwnsNFT(
          router.query.address as string,
          publicKey
        );        
        setIsOwner(!!hasMint);
      } catch (error) {
        console.error("Failed to fetch nft owner:", error);
      }
    };
    nftOwner();
  }, [publicKey, router.query.address, userOwnsNFT]);

  const handleTipLink = async () => {
    if (!isOwner || !router.query.address) return;
    await actionTipLink(router.query.address as string);
    console.log("tipLink", tipLinkURL);
  };

  return (
    <Box>
      <List>
        <ListItem disablePadding>
          <LinkAction href="/create">
            Mint<span>&nbsp;a new mix</span>
          </LinkAction>
        </ListItem>
        <ListItem disablePadding>
          <LinkAction onClick={handleMenuOpen}>
            Share<span>&nbsp;this mix</span>
          </LinkAction>
        </ListItem>
        {router.pathname === "/sol/[address]" && isOwner && (
          <ListItem disablePadding>
            <LinkAction onClick={handleTipLink}>
              Send<span>&nbsp;this mix</span>
            </LinkAction>
          </ListItem>
        )}
      </List>
    </Box>
  );
};

export default ActionLinks;
