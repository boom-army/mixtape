import React, { ReactNode, useEffect, useState } from "react";
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import CloseIcon from "@mui/icons-material/Close";
import YouTubeIcon from "@mui/icons-material/YouTube";
import { toPng } from "html-to-image";
import {
  Box,
  Button,
  TextField,
  Typography,
  List,
  ListItem,
  useTheme,
  Tooltip,
  IconButton,
  Modal,
  CircularProgress,
  styled,
} from "@mui/material";
import { formatDuration, fromYouTubeURL } from "../utils/tracks";
import Link from "next/link";
import TapeGallery from "../components/TapeGallery";
import { useWallet } from "@solana/wallet-adapter-react";
import HelpIcon from "@mui/icons-material/Help";
import { useSnackbar } from "../contexts/SnackbarProvider";
import { nftMetaTemplate } from "../utils/nft";
import { NftTemplates } from "../types/nftTemplates";
import { useMintNFT } from "../hooks/useMintNFT";
import router from "next/router";
import { isEmpty } from "lodash";

const PASSWORD = "HYPERVIBES";

interface DraggableItemProps {
  id: string;
  children: ReactNode;
  onRemove: (id: string) => void;
  trackError?: boolean;
}

const DraggableItem: React.FC<DraggableItemProps> = ({
  id,
  children,
  onRemove,
  trackError,
}) => {
  const [isCloseHovered, setCloseHovered] = useState(false);
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
    disabled: isCloseHovered,
  });
  const theme = useTheme();

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        cursor: "grabbing",
        display: "flex",
        alignItems: "center",
      }
    : {
        cursor: "grab",
        display: "flex",
        alignItems: "center",
      };

  return (
    <ListItem
      ref={setNodeRef}
      sx={{
        backgroundColor: trackError ? theme.palette.error.light : "inherit",
        ...style,
      }}
      {...listeners}
      {...attributes}
    >
      <DragIndicatorIcon
        style={{ marginRight: "0.25em", fill: theme.palette.secondary.dark }}
      />{" "}
      {children}
      <CloseIcon
        sx={{ marginLeft: "auto", cursor: "pointer" }}
        onClick={() => onRemove(id)}
        onMouseEnter={() => setCloseHovered(true)}
        onMouseLeave={() => setCloseHovered(false)}
      />
    </ListItem>
  );
};

interface DroppableAreaProps {
  children: ReactNode;
}

const DroppableArea: React.FC<DroppableAreaProps> = ({ children }) => {
  const theme = useTheme();
  const { isOver, setNodeRef } = useDroppable({
    id: "tracklist",
  });
  const style = {
    backgroundColor: isOver ? theme.palette.secondary.main : undefined,
  };

  return (
    <List ref={setNodeRef} sx={style}>
      {children}
    </List>
  );
};

const Create: React.FC = () => {
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [lastTrackError, setLastTrackError] = useState(false);
  const [mintButtonEnabled, setMintButtonEnabled] = useState(false);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [fetchingUrl, setFetchingUrl] = useState(false);

  const [mixtapeTitle, setMixtapeTitle] = useState("");
  const [totalDuration, setTotalDuration] = useState(0);
  const [tracklist, setTracklist] = useState<TrackMeta[]>([]);
  const [selectedTape, setSelectedTape] = useState<string | null>();

  const { connected } = useWallet();
  const { enqueueSnackbar } = useSnackbar();
  const { mintNFT, isMinting } = useMintNFT();

  const PulseButton = styled(Button)(({ theme }) => ({
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    variant: "contained",
    size: "large",
    height: "3.7em",
    minWidth: "12em",
    animation: url ? "pulse 2s infinite" : "none",
    disabled: lastTrackError,
    boxShadow: "0 0 0 0 rgba(0, 123, 255, 0.1)",
    "@keyframes pulse": {
      "0%": {
        boxShadow: "0 0 0 0 rgba(76, 175, 80, 1)",
      },
      "70%": {
        boxShadow: "0 0 0 10px rgba(76, 175, 80, 0)",
      },
      "100%": {
        boxShadow: "0 0 0 0 rgba(76, 175, 80, 0)",
      },
    },
  }));

  useEffect(() => {
    const storedPassword = localStorage.getItem("password");
    if (storedPassword !== PASSWORD) {
      setShowPasswordModal(true);
    }
  }, []);

  useEffect(() => {
    const warnings = [];
    if (!mixtapeTitle) {
      warnings.push("Mixtape title is required.");
    }
    if (tracklist.length === 0) {
      warnings.push("At least one track is required.");
    }
    if (!connected) {
      warnings.push("Solana wallet must be connected.");
    }
    if (!selectedTape) {
      warnings.push("A tape must be selected.");
    }
    setValidationWarnings(warnings);
  }, [mixtapeTitle, tracklist, connected, selectedTape]);

  useEffect(() => {
    const newTotalDuration = tracklist.reduce(
      (total, track) => total + (track.lengthSeconds || 0),
      0
    );
    setTotalDuration(newTotalDuration);
    // setLastTrackError(newTotalDuration > 1800);
  }, [tracklist]);

  useEffect(() => {
    if (
      mixtapeTitle &&
      tracklist.length > 0 &&
      connected &&
      selectedTape &&
      !fetchingUrl &&
      !lastTrackError &&
      validationWarnings.length === 0
    ) {
      setMintButtonEnabled(true);
    } else {
      setMintButtonEnabled(false);
    }
  }, [
    mixtapeTitle,
    tracklist,
    connected,
    selectedTape,
    fetchingUrl,
    lastTrackError,
    validationWarnings.length,
  ]);

  const handleQuestionMarkClick = () => {
    if (validationWarnings.length > 0) {
      enqueueSnackbar(validationWarnings.join("\n"));
    }
  };

  const handleAddUrl = async () => {
    setFetchingUrl(true);
    const youtubeUrlRegex =
      /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be|m\.youtube\.com)\/.+$/;

    try {
      if (!youtubeUrlRegex.test(url)) {
        throw new Error(
          "URL should be in format: https://www.youtube.com/watch?v=hTWKbfoikeg"
        );
      }

      const videoId = fromYouTubeURL(url);

      const isIdInTracklist = tracklist.some((track) => track.id === videoId);
      if (isIdInTracklist) {
        throw new Error("This track is already in the tracklist.");
      }

      const initialTrack: TrackMeta = {
        id: url,
        title: "",
      };

      setTracklist([...tracklist, initialTrack]);
      setUrl("");
      setError(null);

      const response = await fetch(
        `/api/trackmeta?urls=${encodeURIComponent(url)}`
      );
      if (!response.ok) {
        throw new Error(
          "Failed to load track meta. Remove and add the track to try again."
        );
      }
      const data = await response.json();
      const meta = data[0];
      setTracklist((prev) =>
        prev.map((track) =>
          track && meta && fromYouTubeURL(track.id) === videoId
            ? {
                id: meta.id || videoId,
                title: meta.title,
                lengthSeconds: meta.lengthSeconds,
              }
            : track
        )
      );
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An error occurred");
      }
    } finally {
      setFetchingUrl(false);
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = tracklist.findIndex((track) => track.id === active.id);
      const newIndex = tracklist.findIndex((track) => track.id === over.id);

      const newTracklist = [...tracklist];
      const [movedItem] = newTracklist.splice(oldIndex, 1);
      newTracklist.splice(newIndex, 0, movedItem);

      setTracklist(newTracklist);
    }
  };

  const handleRemoveTrack = (id: string) => {
    setTracklist((prev) => prev.filter((track) => track.id !== id));
  };

  const handleMint = async () => {
    const tapeElement = selectedTape && document.getElementById(selectedTape);
    if (!tapeElement) throw new Error("Tape not selected");
    const template = NftTemplates[selectedTape as keyof typeof NftTemplates];
    const nftImageBlob = await toPng(tapeElement, {
      canvasWidth: 1024,
      canvasHeight: 1024,
      backgroundColor: "transparent",
    });

    const nftMetadata = nftMetaTemplate();
    nftMetadata.name = "Mixtape NFT";
    nftMetadata.description = mixtapeTitle;
    nftMetadata.tracks = tracklist;
    nftMetadata.attributes = [
      ...(nftMetadata.attributes || []),
      { trait_type: "template_date", value: template.releaseDate },
      { trait_type: "mint_price", value: template.price.toString() },
      {
        trait_type: "tape_blank",
        value: `${template.name} - C${template.runtime}`,
      },
    ];

    const mint = await mintNFT({
      template,
      nftImageBlob,
      nftMetadata,
    });
    if (!isEmpty(mint?.mintAddress)) {
      router.push(`/sol/${mint?.mintAddress}`);
    }
  };

  return (
    <Box p={4}>
      <Box mb={1}>
        <Link href="/" passHref>
          <Typography>&lt; Home</Typography>
        </Link>
      </Box>
      <Typography variant="h4" gutterBottom>
        Create a Mixtape NFT
      </Typography>

      <Typography variant="h5" mb={1}>
        1. Set your mixtape title
      </Typography>
      <Box mb={2}>
        <TextField
          label="Mixtape Title"
          variant="outlined"
          value={mixtapeTitle}
          onChange={(e) => setMixtapeTitle(e.target.value)}
          fullWidth
          inputProps={{ maxLength: 62 }}
        />
      </Box>

      <Typography variant="h5" mb={1}>
        2. Select a blank tape
      </Typography>
      <TapeGallery
        mixtapeTitle={mixtapeTitle}
        selectedTape={selectedTape}
        setSelectedTape={setSelectedTape}
      />

      <Typography variant="h5">3. Add tracks</Typography>
      <Typography variant="body1" gutterBottom mb={2}>
        ADD any <YouTubeIcon sx={{ verticalAlign: "bottom" }} /> Youtube URL as
        a track to your mixtape.{" "}
        {tracklist.length > 0
          ? "Drag and drop the tracks to change the order."
          : ""}
      </Typography>

      <Box
        display="flex"
        flexDirection={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems="top"
        mb={2}
      >
        <TextField
          label={!lastTrackError ? "Youtube URL" : "C30 duration exceeded"}
          variant="outlined"
          value={url}
          onChange={(e) => {
            setError(null);
            setUrl(e.target.value);
          }}
          fullWidth
          sx={{
            marginRight: { sm: "1em" },
            flex: 1,
            marginBottom: { xs: "1em", sm: "0" },
          }}
          error={Boolean(error)}
          helperText={error}
          disabled={lastTrackError}
        />
        <PulseButton onClick={handleAddUrl}>Add URL</PulseButton>
      </Box>

      {lastTrackError && (
        <Typography variant="body1" color="error" gutterBottom>
          Total duration of {formatDuration(totalDuration)} is more than a C30
          mixtape can hold. Remove tracks to continue.
        </Typography>
      )}

      <DndContext onDragEnd={handleDragEnd}>
        <DroppableArea>
          {tracklist.map((track, index) => (
            <DraggableItem
              key={index}
              id={track.id}
              onRemove={handleRemoveTrack}
              trackError={lastTrackError}
            >
              {track.title ? (
                <>
                  <Typography sx={{ fontWeight: 700 }}>
                    {track.title}
                  </Typography>
                  &nbsp;
                  <Typography variant="body1">
                    ({formatDuration(track.lengthSeconds)})
                  </Typography>
                </>
              ) : (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  {track.id}
                </>
              )}
            </DraggableItem>
          ))}
        </DroppableArea>
      </DndContext>
      <Box mt={3} mb={6}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleMint}
          disabled={!mintButtonEnabled}
          size="large"
        >
          Mint your mixtape
        </Button>
        {validationWarnings.length > 0 && (
          <Tooltip title={validationWarnings.join("\n")}>
            <IconButton
              onClick={handleQuestionMarkClick}
              color="error"
              sx={{ marginLeft: 1 }}
            >
              <HelpIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>
      <Modal
        open={isMinting}
        aria-labelledby="NFT action select"
        aria-describedby="Apply action for given NFT"
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <Box
          sx={{
            padding: 3,
            border: "2px solid",
            borderRadius: 1,
            maxWidth: "25em",
            width: "95%",
            backgroundColor: "white",
          }}
        >
          <Typography id="nft-modal-title" variant="h6" component="h2">
            <Box sx={{ display: "flex", alignItems: "center" }}>
              Minting your Mixtape
              <CircularProgress size={16} sx={{ ml: 1 }} />
            </Box>
          </Typography>
          <Typography variant="body2" mb={2}>
            Confirm the transaction and wait for the mint to complete. The
            MixtApe NFT will be sent to your wallet.
          </Typography>
        </Box>
      </Modal>
    </Box>
  );
};

export default Create;
