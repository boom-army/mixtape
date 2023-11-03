import AddReactionOutlinedIcon from "@mui/icons-material/AddReactionOutlined";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import {
  Box,
  CircularProgress,
  Fab,
  Menu,
  MenuItem,
  Stack,
  Typography,
  styled,
} from "@mui/material";
import { useRouter } from "next/router";
import { useSnackbar } from "../contexts/SnackbarProvider";
import { useWallet } from "@solana/wallet-adapter-react";
import { Emote, EmoteData } from "../types";

const StyledFab = styled(Fab)(({ theme }) => ({
  position: "fixed",
  bottom: theme.spacing(2),
  right: theme.spacing(2),
}));

export const ReactionMenu: React.FC = () => {
  const [reactions, setReactions] = useState<Emote[]>([]);
  const [userReaction, setUserReaction] = useState<Emote | null>(null);
  const [userReactionOptions, setUserReactionOptions] = useState<Emote[]>([]);
  const [emojiMenuAnchorEl, setEmojiMenuAnchorEl] =
    useState<null | HTMLElement>(null);
  const [loading, setLoading] = useState(false);
  const fabRef = React.useRef(null);

  const { enqueueSnackbar } = useSnackbar();
  const { publicKey } = useWallet();
  const router = useRouter();
  const { address } = router.query;

  useEffect(() => {
    const fetchEmotes = async () => {
      if (!address) return;
      const response = await fetch(`/api/reaction/read?mintAddress=${address}`);
      const data = await response.json();
      setReactions(data?.mintEmotes?.map((d: EmoteData) => d.emote));

      if (!publicKey) return;
      const userEmote = data.mintEmotes.find(
        (d: EmoteData) => d.userId === publicKey?.toBase58()
      );
      setUserReaction(userEmote ? userEmote.emote : null);
    };
    fetchEmotes();
  }, [publicKey, address, userReactionOptions, userReaction]);

  const fetchReactionNFTs = async () => {
    if (!userReactionOptions.length) {
      setLoading(true);
      try {
        const response = await fetch("/api/fetch-reaction-nfts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ownerAddress: publicKey?.toBase58(),
          }),
        });
        const data = await response.json();
        setUserReactionOptions(data.nftEmotes);
      } catch (error) {
        enqueueSnackbar(`Failed to fetch reaction NFTs: ${error}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEmojiMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setEmojiMenuAnchorEl(event.currentTarget);
    fetchReactionNFTs();
  };

  const handleEmojiMenuClose = () => {
    setEmojiMenuAnchorEl(null);
  };

  const handleEmojiClick = (reactionId: string) => {
    handleReactionToggle(reactionId);
    handleEmojiMenuClose();
  };

  const handleReactionToggle = async (reactionId: string) => {
    if (!publicKey) return enqueueSnackbar("Please connect your wallet");
    const { address } = router.query;

    try {
      const response = await fetch("/api/reaction/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: publicKey?.toBase58(),
          emoteId: reactionId,
          mintAddress: address,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error);
      }

      setUserReaction(data.mintEmote.emote);
    } catch (error) {
      enqueueSnackbar(`Failed to add reaction: ${error}`);
    }
  };
  return (
    <>
      <Stack
        direction="column"
        spacing={-0.7}
        sx={{ position: "fixed", bottom: "4.3rem", right: "2.2rem" }}
      >
        {reactions?.map((item, i) => (
          <Image
            key={`${item.name}-${i}`}
            src={item.cImage}
            alt={item.name}
            width={20}
            height={20}
          />
        ))}
      </Stack>
      {!publicKey && reactions?.length ? (
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            backgroundColor: "white",
            position: "fixed",
            bottom: "2rem",
            right: "1.5rem",
            border: "5px solid black",
          }}
        />
      ) : null}
      {publicKey && (
        <StyledFab
          ref={fabRef}
          color="primary"
          aria-label="add reaction"
          onClick={(e) => !userReaction && handleEmojiMenuOpen(e)}
          sx={
            userReaction
              ? {
                  backgroundColor: "white",
                  border: "5px solid black",
                  cursor: "default",
                }
              : {}
          }
        >
          {userReaction ? (
            <Image
              src={userReaction.cImage}
              alt={userReaction.name}
              width={30}
              height={30}
            />
          ) : (
            <AddReactionOutlinedIcon style={{ fill: "white" }} />
          )}
        </StyledFab>
      )}
      <Menu
        anchorEl={emojiMenuAnchorEl}
        open={Boolean(emojiMenuAnchorEl)}
        onClose={handleEmojiMenuClose}
        sx={{
          transform: "translateY(-5rem)",
          width: "100%",
          overflowY: "auto",
        }}
      >
        <Stack
          direction="row"
          spacing={0.5}
          sx={{ width: "300px", flexWrap: "wrap" }}
        >
          {loading ? (
            <Box p={2} display="flex" justifyContent="center" width="100%">
              <CircularProgress size={20} />
            </Box>
          ) : userReactionOptions.length ? (
            userReactionOptions.map((item, index) => (
              <MenuItem key={index} onClick={() => handleEmojiClick(item.id)}>
                <Image
                  src={item.cImage}
                  alt={item.name}
                  width={20}
                  height={20}
                />
              </MenuItem>
            ))
          ) : (
            <Box p={2}>
              <Typography variant="body2" color="text.secondary">
                No reaction NFTs found
              </Typography>
            </Box>
          )}
        </Stack>
      </Menu>
    </>
  );
};
