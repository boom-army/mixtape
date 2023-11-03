import React, { useState, useEffect, useRef } from "react";
import {
  Typography,
  List,
  ListItem,
  Box,
  Grid,
  useTheme,
  CircularProgress,
  Button,
  Skeleton,
} from "@mui/material";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { useRouter } from "next/router";
import { formatDuration } from "../utils/tracks";
import Image from "next/image";
import { useWallet } from "@solana/wallet-adapter-react";
import { useSnackbar } from "../contexts/SnackbarProvider";

dayjs.extend(duration);

interface TrackListProps {
  data: TrackMeta[] | null | undefined;
}

const TrackList: React.FC<TrackListProps> = ({ data }) => {
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [playingTime, setPlayingTime] = useState(0);
  const [currentPlayingTrackId, setCurrentPlayingTrackId] = useState<
    string | null
  >(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const theme = useTheme();
  const { publicKey } = useWallet();
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();

  const { address } = router.query;

  useEffect(() => {
    audioRef.current = new Audio();
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleFetchAudioURL = async (trackId: string) => {
    const apiUrl = `/api/stream?url=${encodeURIComponent(
      `http://www.youtube.com/watch?v=${trackId}`
    )}${publicKey ? `&publicKey=${publicKey}` : ""}${
      address ? `&mintAddress=${address}` : ""
    }`;

    try {
      setAudioURL(apiUrl);
      setCurrentPlayingTrackId(trackId);
    } catch (error) {
      enqueueSnackbar("Failed to fetch audio URL");
      console.error("Failed to fetch audio URL:", error);
    }
  };

  const handleClickTrack = (trackId: string) => {
    setIsLoading(true);
    setCurrentPlayingTrackId(trackId);
    if (
      currentPlayingTrackId === trackId &&
      audioRef.current?.paused === false
    ) {
      audioRef.current.pause();
      setIsLoading(false);
    } else if (
      currentPlayingTrackId === trackId &&
      audioRef.current?.paused === true
    ) {
      audioRef.current.play();
      setIsLoading(false);
    } else {
      handleFetchAudioURL(trackId);
    }
  };

  const playNextTrack = () => {
    setPlayingTime(0);
    if (!data || !currentPlayingTrackId) return;
    const currentTrackIndex = data.findIndex(
      (track) => track.id === currentPlayingTrackId
    );
    if (currentTrackIndex === data.length - 1) {
      return;
    }
    const nextTrackId = data[currentTrackIndex + 1].id;
    handleClickTrack(nextTrackId);
  };

  const handleRouteChange = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  useEffect(() => {
    router.events.on("routeChangeStart", handleRouteChange);
    return () => {
      router.events.off("routeChangeStart", handleRouteChange);
    };
  }, []);

  useEffect(() => {
    if (audioURL && audioRef.current) {
      // Reset the timer as soon as the audio source changes
      setPlayingTime(0);

      audioRef.current.src = audioURL;
      audioRef.current.oncanplay = () => {
        setIsLoading(false);
      };

      audioRef.current.play();

      audioRef.current.onended = () => {
        playNextTrack();
      };

      const intervalId = setInterval(() => {
        setPlayingTime(audioRef.current ? audioRef.current.currentTime : 0);
      }, 1000);

      return () => clearInterval(intervalId);
    }
  }, [audioURL]);

  if (data === null || data?.length === 0) {
    return (
      <List>
        {Array.from(new Array(5)).map((_, index) => (
          <ListItem key={index}>
            <Grid container sx={{ height: "100%" }}>
              <Grid
                item
                xs={10}
                sx={{ display: "flex", flexDirection: "column" }}
              >
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="40%" />
              </Grid>
              <Grid item xs={2} sx={{ height: "100%" }}>
                <Skeleton variant="circular" width={50} height={50} />
              </Grid>
            </Grid>
          </ListItem>
        ))}
      </List>
    );
  }

  return (
    <List>
      {data?.map((track) => (
        <ListItem
          key={track.id}
          onClick={() => handleClickTrack(track.id)}
          sx={{
            cursor: `url(${
              currentPlayingTrackId === track.id &&
              audioRef.current?.paused === false
                ? "/images/pause.svg"
                : "/images/play_arrow.svg"
            }), auto`,
            backgroundColor:
              currentPlayingTrackId === track.id
                ? theme.palette.secondary.main
                : "transparent",
            fontSize: { xs: 0.5, sm: "inherit" },
          }}
        >
          <Grid container sx={{ height: "100%" }}>
            <Grid
              item
              xs={10}
              sx={{ display: "flex", flexDirection: "column" }}
            >
              <Typography
                variant="h5"
                sx={{ fontSize: { xs: "1rem", sm: "1.5rem" }, pt: 1 }}
                align="left"
                component="p"
              >
                {track.title}
              </Typography>
              <Box display="flex" alignItems="center">
                <Typography
                  variant={"body1"}
                  sx={{ fontSize: { sm: "1rem", md: "1rem" } }}
                  align="left"
                  display="inline"
                >
                  {formatDuration(track.lengthSeconds)}
                </Typography>
                {(currentPlayingTrackId === track.id &&
                  audioRef.current?.paused &&
                  !isLoading) ||
                (!currentPlayingTrackId &&
                  data?.[0]?.id === track.id &&
                  !isLoading) ? (
                  <Button
                    size="small"
                    sx={{
                      cursor: `url("/images/play_arrow.svg"), auto`,
                      p: 0,
                      minWidth: 55,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClickTrack(track.id);
                    }}
                  >
                    <Image
                      src="/images/play_arrow.svg"
                      alt="play"
                      width={16}
                      height={16}
                    />
                    Play
                  </Button>
                ) : null}
              </Box>
            </Grid>
            <Grid item xs={2} sx={{ height: "100%" }}>
              <Box
                display="flex"
                height="100%"
                justifyContent="flex-end"
                alignItems="flex-start"
              >
                {currentPlayingTrackId === track.id && isLoading ? (
                  <CircularProgress size={50} sx={{ display: "inline-flex" }} />
                ) : (
                  <Typography
                    component="p"
                    variant="h6"
                    sx={{ fontSize: { xs: "1.2rem", sm: "3rem" } }}
                  >
                    {currentPlayingTrackId === track.id &&
                      audioURL &&
                      formatDuration(playingTime)}
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>
        </ListItem>
      ))}
      <audio ref={audioRef} />
    </List>
  );
};

export default TrackList;
