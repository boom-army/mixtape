import AddReactionOutlinedIcon from "@mui/icons-material/AddReactionOutlined";
import Image from "next/image";
import React from "react";
import { EmoteType } from "../types";
import { Fab, styled } from "@mui/material";
import { useRouter } from "next/router";
import { useSnackbar } from "../contexts/SnackbarProvider";
import { useWallet } from "@solana/wallet-adapter-react";

const StyledFab = styled(Fab)(({ theme }) => ({
  position: "fixed",
  bottom: theme.spacing(2),
  right: theme.spacing(2),
}));

interface ReactionMenuProps {
  emote: EmoteType | null;
  setEmote: (emote: EmoteType | null) => void;
}

export const ReactionMenu: React.FC<ReactionMenuProps> = ({
  emote,
  setEmote,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const { publicKey } = useWallet();
  const router = useRouter();

  const handleReactionToggle = async () => {
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
          emoteId: "J4MbMmQizFtwMo5PCWvCKPXrtrGv3FgLmXy4jaqhPoXN",
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
    <StyledFab color="primary" aria-label="add reaction">
      {emote ? (
        <Image src={emote.cImage} alt={emote.name} width={30} height={30} />
      ) : (
        <AddReactionOutlinedIcon
          style={{ fill: "white" }}
          onClick={handleReactionToggle}
        />
      )}
    </StyledFab>
  );
};
