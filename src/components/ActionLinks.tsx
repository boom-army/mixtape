import {
  Box,
  Button,
  IconButton,
  Link,
  List,
  ListItem,
  Modal,
  Typography,
  styled,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import useTipLink from "../hooks/useTipLink";
import { useRouter } from "next/router";
import useGetNFTOwner from "../hooks/useGetNFTOwner";
import { useWallet } from "@solana/wallet-adapter-react";
import { isEmpty } from "lodash";
import { useSnackbar } from "../contexts/SnackbarProvider";
import { Close, LinkRounded } from "@mui/icons-material";
import { QRCode } from "react-qrcode-logo";
import { FastAverageColor } from "fast-average-color";

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
  imageUrl: string;
  handleMenuOpen: (event: any) => void;
}

const ActionLinks: React.FC<ActionLinksProps> = ({
  imageUrl,
  handleMenuOpen,
}) => {
  const [isOwner, setIsOwner] = useState(false);
  const [isSender, setIsSender] = useState("");
  const [openSendLinkConfirm, setOpenSendLinkConfirm] = useState(false);
  const [openViewTipLink, setOpenViewTipLink] = useState(false);
  const [eyeColor, setEyeColor] = useState("#888");

  const { publicKey } = useWallet();
  const { actionTipLink, tipLinkURL } = useTipLink();
  const router = useRouter();
  const { userOwnsNFT } = useGetNFTOwner();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const fac = new FastAverageColor();
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageUrl;
    img.onload = function () {
      const color = fac.getColor(img);
      setEyeColor(color.rgb);
    };
  }, [imageUrl]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/tiplink-read", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            mintAddress: router.query.address,
            publicKey,
          }),
        });
        const { tipLinkData } = await response.json();
        if (tipLinkData && tipLinkData.sender === publicKey?.toBase58()) {
          setIsSender(tipLinkData.tipLink);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };
    fetchData();
  }, [publicKey, tipLinkURL, router.query.address]);

  useEffect(() => {
    if (!publicKey || !router.query.address) return;
    const nftOwner = async () => {
      try {
        const hasMint = await userOwnsNFT(
          router.query.address as string,
          publicKey
        );
        setIsOwner(hasMint);
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
      setOpenSendLinkConfirm(false);
      enqueueSnackbar(
        `Mixtape sent to tiplink. You can click "View tip link" when connected to see the tip link at any time.`
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
        {router.pathname === "/" && (
          <ListItem disablePadding>
            <LinkAction href="/leaderboards">Leaderboards</LinkAction>
          </ListItem>
        )}
        {["/sol/[address]", "/profile/[address]"].includes(router.pathname) && (
          <ListItem disablePadding>
            <LinkAction onClick={handleMenuOpen}>
              Share {router.pathname === "/sol/[address]" && <span>this mix</span>}
            </LinkAction>
          </ListItem>
        )}
        {router.pathname === "/sol/[address]" && isOwner && (
          <ListItem disablePadding>
            <LinkAction onClick={() => setOpenSendLinkConfirm(true)}>
              Send<span>&nbsp;this mix</span>
            </LinkAction>
          </ListItem>
        )}
        {router.pathname === "/sol/[address]" &&
          !isOwner &&
          !isEmpty(isSender) && (
            <ListItem disablePadding>
              <LinkAction
                onClick={() => setOpenViewTipLink(true)}
                target="_blank"
              >
                View<span>&nbsp;your tip link</span>
              </LinkAction>
            </ListItem>
          )}
      </List>
      <Modal
        open={openSendLinkConfirm}
        onClose={() => setOpenSendLinkConfirm(false)}
        aria-labelledby="Create send link for MixtApe NFT"
        aria-describedby="Create send link for MixtApe NFT"
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
          }}
        >
          <IconButton
            sx={{ position: "absolute", top: 8, right: 8 }}
            onClick={() => setOpenSendLinkConfirm(false)}
          >
            <Close />
          </IconButton>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            <LinkRounded sx={{ fontSize: 16 }} /> Tip Link Explanation
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2, mb: 3 }}>
            Creating a tip link loads this MixtApe NFT onto the link. Then,
            anyone with the link can withdraw the NFT straight to their own
            Solana wallet. You&rsquo;ll be the only one with the link until you
            share it.
          </Typography>
          <Button variant="contained" onClick={handleTipLink}>
            Create tip link and load NFT
          </Button>
        </Box>
      </Modal>
      <Modal
        open={openViewTipLink}
        onClose={() => setOpenViewTipLink(false)}
        aria-labelledby="View tip link for MixtApe NFT"
        aria-describedby="View tip link for MixtApe NFT"
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
          }}
        >
          <IconButton
            sx={{ position: "absolute", top: 8, right: 8 }}
            onClick={() => setOpenViewTipLink(false)}
          >
            <Close />
          </IconButton>
          <Box mt={1} display="flex" justifyContent="center">
            <QRCode
              value={isSender}
              size={216}
              bgColor={"transparent"}
              fgColor="#000"
              logoImage={imageUrl}
              logoWidth={60}
              logoHeight={60}
              eyeRadius={12}
              eyeColor={eyeColor}
            />
          </Box>
          <Box mt={1} display="flex" justifyContent="center">
            <Link href={isSender} target="_blank">
              <Typography variant="body2">{isSender}</Typography>
            </Link>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default ActionLinks;
