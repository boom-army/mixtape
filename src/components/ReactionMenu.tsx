import AddReactionOutlinedIcon from "@mui/icons-material/AddReactionOutlined";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { EmoteType } from "../types";
import {
  CircularProgress,
  Fab,
  Menu,
  MenuItem,
  Stack,
  styled,
} from "@mui/material";
import { useRouter } from "next/router";
import { useSnackbar } from "../contexts/SnackbarProvider";
import { useWallet } from "@solana/wallet-adapter-react";

const StyledFab = styled(Fab)(({ theme }) => ({
  position: "fixed",
  bottom: theme.spacing(2),
  right: theme.spacing(2),
}));

interface Reaction {
  id: string;
  cImage: string;
  name: string;
}

interface ReactionMenuProps {
  emote: EmoteType | null;
  setEmote: (emote: EmoteType | null) => void;
}

export const ReactionMenu: React.FC<ReactionMenuProps> = ({
  emote,
  setEmote,
}) => {
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [emojiMenuAnchorEl, setEmojiMenuAnchorEl] =
    useState<null | HTMLElement>(null);
  const [loading, setLoading] = useState(false);
  const fabRef = React.useRef(null);

  const { enqueueSnackbar } = useSnackbar();
  const { publicKey } = useWallet();
  const router = useRouter();

  const fetchReactionNFTs = async () => {
    if (!reactions.length) {
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
        setReactions(data.nftEmotes);
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
      const getEmote = await fetch(
        `/api/reaction/read?mintAddress=${address}&userId=${publicKey.toBase58()}`
      );
      const emote = await getEmote.json();

      emote.mintEmote.length && setEmote(emote.mintEmote[0].emote);
    } catch (error) {
      enqueueSnackbar(`Failed to add reaction: ${error}`);
    }
  };
  return (
    <>
      <StyledFab
        ref={fabRef}
        color="primary"
        aria-label="add reaction"
        onClick={handleEmojiMenuOpen}
      >
        {emote ? (
          <Image src={emote.cImage} alt={emote.name} width={30} height={30} />
        ) : (
          <AddReactionOutlinedIcon style={{ fill: "white" }} />
        )}
      </StyledFab>
      <Menu
        anchorEl={emojiMenuAnchorEl}
        open={Boolean(emojiMenuAnchorEl)}
        onClose={handleEmojiMenuClose}
        sx={{
          transform: "translateY(-5rem)",
          right: "5rem",
          width: "100%",
          overflowY: "auto",
        }}
      >
        <Stack direction="row" spacing={0.5}>
          <MenuItem>
            {loading ? (
              <CircularProgress size={20} />
            ) : reactions.length ? (
              reactions.map((item, index) => (
                <MenuItem key={index} onClick={() => handleEmojiClick(item.id)}>
                  <Image
                    src={item.cImage}
                    alt={item.name}
                    width={20}
                    height={20}
                  />
                </MenuItem>
              ))
            ) : null}
          </MenuItem>
        </Stack>
      </Menu>
    </>
  );
};
