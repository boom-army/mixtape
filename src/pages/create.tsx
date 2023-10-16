import React, { useEffect, useState } from "react";
import { DndContext } from "@dnd-kit/core";
import YouTubeIcon from "@mui/icons-material/YouTube";
import { toPng } from "html-to-image";
import {
  Box,
  Button,
  TextField,
  Typography,
  Tooltip,
  IconButton,
  Modal,
  CircularProgress,
  styled,
  Accordion,
  AccordionDetails,
  AccordionSummary,
} from "@mui/material";
import { formatDuration, fromYouTubeURL } from "../utils/tracks";
import Link from "next/link";
import TapeGallery from "../components/TapeGallery";
import { useWallet } from "@solana/wallet-adapter-react";
import HelpIcon from "@mui/icons-material/Help";
import { useSnackbar } from "../contexts/SnackbarProvider";
import { nftMetaTemplate } from "../utils/nft";
import { useMintNFT } from "../hooks/useMintNFT";
import router from "next/router";
import { isEmpty } from "lodash";
import { ExpandMore } from "@mui/icons-material";
import { useRecoilValue } from "recoil";
import { activeNFTTemplates } from "../state";
import dayjs from "dayjs";
import { DroppableArea, DraggableItem } from "../components/CreateDragDrop";
import { handleNFTError } from "../utils";

const PASSWORD = "HYPERVIBES";

const Create: React.FC = () => {
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [lastTrackError, setLastTrackError] = useState(false);
  const [mintButtonEnabled, setMintButtonEnabled] = useState(false);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [fetchingUrl, setFetchingUrl] = useState(false);

  const [mixtapeTitle, setMixtapeTitle] = useState("");
  const [coverNotes, setCoverNotes] = useState("");
  const [totalDuration, setTotalDuration] = useState(0);
  const [tracklist, setTracklist] = useState<TrackMeta[]>([]);
  const [selectedTape, setSelectedTape] = useState<string | null>();

  const nftTemplates = useRecoilValue(activeNFTTemplates);

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

  const handleEdit = (id: string, newTitle: string) => {
    setTracklist((prevTracklist) =>
      prevTracklist.map((track) =>
        track.id === id ? { ...track, title: newTitle } : track
      )
    );
  };

  const handleRemoveTrack = (id: string) => {
    setTracklist((prev) => prev.filter((track) => track.id !== id));
  };

  const handleMint = async () => {
    const tapeElement = selectedTape && document.getElementById(selectedTape);
    if (!tapeElement) throw new Error("Tape not selected");
    const template = nftTemplates?.find((t) => t.id === selectedTape);
    if (!template) throw new Error("Template not found");

    let nftImageBlob;

    try {
      nftImageBlob = await toPng(tapeElement, {
        canvasWidth: 1024,
        canvasHeight: 1024,
        backgroundColor: "transparent",
      });
    } catch (error) {
      handleNFTError(error);
    }

    const nftMetadata = nftMetaTemplate();
    nftMetadata.description = mixtapeTitle;
    nftMetadata.tracks = tracklist;
    nftMetadata.track_meta = {
      cover_notes: coverNotes,
    };
    nftMetadata.attributes = [
      ...(nftMetadata.attributes || []),
      {
        trait_type: "template_date",
        value: dayjs(template.releaseDate).format("DD MMM YY"),
      },
      // { trait_type: "mint_price", value: template.price.toString() },
      {
        trait_type: "tape_blank",
        value: `${template.name} - C${template.runtime}`,
      },
      ...(template.maxSupply
        ? [{ trait_type: "supply", value: String(template.maxSupply) }]
        : []),
      ...(template.endDate
        ? [
            {
              trait_type: "template_end_date",
              value: dayjs(template.endDate).format("DD MMM YY"),
            },
          ]
        : []),
    ];

    if (!nftImageBlob || !nftMetadata) {
      throw new Error("Failed to generate NFT image and metadata");
    }

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
      <Box mb={2}>
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Typography>Cover Notes</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TextField
              label="Add a personalised message or cover notes for your mix"
              variant="outlined"
              value={coverNotes}
              onChange={(e) => setCoverNotes(e.target.value.substring(0, 430))}
              fullWidth
              multiline
              rows={4}
              sx={{ backgroundColor: "white" }}
            />
          </AccordionDetails>
        </Accordion>
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
            maxWidth: { sm: "100%", md: "50%" },
          }}
          error={Boolean(error)}
          helperText={error}
          disabled={lastTrackError}
        />
        <PulseButton onClick={handleAddUrl}>
          Add {tracklist.length > 0 && "Another"} URL
        </PulseButton>
      </Box>

      {lastTrackError && (
        <Typography variant="body1" color="error" gutterBottom>
          Total duration of {formatDuration(totalDuration)} is more than a C30
          mixtape can hold. Remove tracks to continue.
        </Typography>
      )}

      <DndContext onDragEnd={handleDragEnd}>
        <DroppableArea
          handleRemoveTrack={handleRemoveTrack}
          handleEdit={handleEdit}
          lastTrackError={lastTrackError}
        >
          {tracklist}
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
            We&apos;re minting your Mixtape. It will be ready and in your wallet
            soon. Hang tight!
          </Typography>
        </Box>
      </Modal>
    </Box>
  );
};

export default Create;
