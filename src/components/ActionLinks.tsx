import { Box, Link, List, ListItem, styled } from "@mui/material";
import React, { useEffect, useState } from "react";
import useTipLink from "../hooks/useTipLink";
import { useRouter } from "next/router";
import useGetNFTOwner from "../hooks/useGetNFTOwner";
import { useWallet } from "@solana/wallet-adapter-react";
import { isEmpty } from "lodash";
import { useSnackbar } from "../contexts/SnackbarProvider";

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
  const [isSender, setIsSender] = useState("");

  const { publicKey } = useWallet();
  const { actionTipLink, tipLinkURL } = useTipLink();
  const router = useRouter();
  const { userOwnsNFT } = useGetNFTOwner();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/tiplink-read", {
          method: "POST",
        });
        if (!response.ok) {
          return;
        }
        const { tipLinkData } = await response.json();
        if (tipLinkData.sender === publicKey?.toBase58()) {
          setIsSender(tipLinkData.tipLink);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };
    fetchData();
  }, [publicKey, tipLinkURL]);

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
    try {
      if (!isOwner || !router.query.address) return;
      await actionTipLink(router.query.address as string);
      enqueueSnackbar(
        `Mixtape sent to ${tipLinkURL}. You can click "View tip link" when connected to see the tip link at any time.`
      );
    } catch (error) {
      enqueueSnackbar((error as Error).message);
    }
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
        {router.pathname === "/sol/[address]" &&
          !isOwner &&
          !isEmpty(isSender) && (
            <ListItem disablePadding>
              <LinkAction href={isSender} target="_blank">
                View<span>&nbsp;your tip link</span>
              </LinkAction>
            </ListItem>
          )}
      </List>
    </Box>
  );
};

export default ActionLinks;
