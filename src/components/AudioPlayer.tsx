import React, { useEffect, useState } from "react";
import {
  type Palette,
  type Theme,
  type SxProps,
  type SliderProps,
  Box,
  IconButton,
  Paper,
  Slider,
  Stack,
  Typography,
} from "@mui/material";

import type { IconButtonProps } from "@mui/material/IconButton";

import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import { debounce } from "lodash";

interface AudioPlayerProps {
  src: string;
  id?: string;
  display?: "waveform" | "timeline";
  inline?: boolean;
  paperize?: boolean;
  waveColor?: keyof Palette | string;
  waveHeight?: number;
  showTimestamps?: boolean;
  playPauseIconButtonProps?: IconButtonProps;
  containerSx?: SxProps<Theme>;
  containerHeight?: string | number;
  containerWidth?: string | number;

  inlineSliderProps?: SliderProps;
  size?: "small" | "medium" | "large";
}

export default function AudioPlayer(props: AudioPlayerProps) {
  const {
    src,
    inline = false,
    paperize = true,
    showTimestamps = true,
    playPauseIconButtonProps,
    containerSx,
    containerHeight = "auto",
    containerWidth = 250,
    size,
  } = props;

  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(
    null
  );

  useEffect(() => {
    initializeForTimeline({
      src,
      audioElement,
      setAudioElement,
      setLoading,
      setCurrentTime,
      setEndTime,
      setPosition,
      setPlaying,
    });
  }, [src]);

  useEffect(
    () => () => {
      audioElement?.remove();
    },
    []
  );

  const mergedContainerStyle = {
    height: containerHeight,
    width: containerWidth,

    ...(containerSx || {}),
  };

  return (
    <Stack
      sx={mergedContainerStyle}
      direction={inline ? "row" : "column"}
      component={paperize ? Paper : "div"}
      alignItems="center"
    >
      {inline ? (
        <PlayPauseButton
          //   disabled={loading}
          audioElement={audioElement}
          playing={playing}
          playPauseIconButtonProps={{
            size: size,
            ...playPauseIconButtonProps,
          }}
        />
      ) : null}
      <Stack
        component={Box}
        direction="row"
        flexGrow={loading ? 0 : 1}
        height="100%"
        width="100%"
        alignItems="center"
        spacing={1}
      >
        <TimeStamp time={currentTime} loading={loading} show={showTimestamps} />
        <Box flexGrow={1} height="100%" width="100%" alignItems="center">
          {!loading && (
            <Box mx={1} display="flex" alignItems="center" height="100%">
              <Slider
                onChange={changeCurrentTimeForTimeline(audioElement)}
                size={size === "large" ? `medium` : size ?? "small"}
                value={position}
              />
            </Box>
          )}
        </Box>
        <TimeStamp time={endTime} loading={loading} show={showTimestamps} />
      </Stack>
      {!inline ? (
        <Box display="flex" justifyContent="center" alignItems="center">
          <PlayPauseButton
            // disabled={loading}
            audioElement={audioElement}
            playing={playing}
            playPauseIconButtonProps={playPauseIconButtonProps}
          />
        </Box>
      ) : null}
    </Stack>
  );
}

function changeCurrentTimeForTimeline(
  audioElement: HTMLAudioElement | null
): SliderProps["onChange"] {
  return (e, v) => {
    if (audioElement && typeof v === "number") {
      const currentPosition = (audioElement.duration / 100) * v;

      if (audioElement.fastSeek instanceof Function) {
        audioElement.fastSeek(currentPosition);
      } else {
        audioElement.currentTime = currentPosition;
      }
    }
  };
}

function toTimeString(time: number) {
  const date = new Date();
  date.setHours(0);
  date.setMinutes(0);
  date.setSeconds(time);
  return date.toTimeString().slice(3, 8);
}

function TimeStamp(props: { time: number; loading?: boolean; show?: boolean }) {
  const { time, loading = false, show = true } = props;

  const defaultTimeStr = "00:00";
  const invalidTimeStr = "--:--";

  if (!show) {
    return null;
  }

  const timeStr = Number.isNaN(time) ? invalidTimeStr : toTimeString(time);

  return (
    <Box sx={containerStyle.timestamp}>
      <Typography>{loading ? defaultTimeStr : timeStr}</Typography>
    </Box>
  );
}

interface InitializeForTimelineArgs {
  src: string;
  audioElement: HTMLAudioElement | null;
  setAudioElement: React.Dispatch<
    React.SetStateAction<HTMLAudioElement | null>
  >;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setCurrentTime: React.Dispatch<React.SetStateAction<number>>;
  setEndTime: React.Dispatch<React.SetStateAction<number>>;
  setPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  setPosition: React.Dispatch<React.SetStateAction<number>>;
}

function initializeForTimeline(args: InitializeForTimelineArgs) {
  const {
    src,
    audioElement,
    setAudioElement,
    setLoading,
    setCurrentTime,
    setEndTime,
    setPosition,
    setPlaying,
  } = args;

  audioElement?.pause();

  const audio = new Audio(src);

  const makePlaying = () => setPlaying(true);
  const makeNotPlaying = () => setPlaying(false);

  audio.addEventListener("canplaythrough", () => {
    setLoading(false);
    setEndTime(audio.duration);
  });
  audio.addEventListener("playing", makePlaying);
  audio.addEventListener(
    "timeupdate",
    debounce(() => {
      setCurrentTime(audio.currentTime);
      setPosition((audio.currentTime / audio.duration) * 100);
    }, 100)
  );

  audio.addEventListener("pause", makeNotPlaying);
  audio.addEventListener("ended", makeNotPlaying);
  audio.addEventListener("error", (e) => {
    makeNotPlaying();
    console.error(e);
  });

  setAudioElement(audio);
}

interface PlayPauseButtonProps
  extends Pick<AudioPlayerProps, "display" | "playPauseIconButtonProps"> {
  disabled?: boolean;
  audioElement: HTMLAudioElement | null;
  playing: boolean;
}

function PlayPauseButton(props: PlayPauseButtonProps) {
  const {
    disabled = false,
    audioElement,
    playing,
    playPauseIconButtonProps = {},
  } = props;

  const handlePlay = () => {
    if (audioElement) {
      playOrPauseForTimeline(playing, audioElement);
      return null;
    }
  };

  function playOrPauseForTimeline(
    playing: PlayPauseButtonProps["playing"],
    audioElement: PlayPauseButtonProps["audioElement"]
  ) {
    playing ? audioElement?.pause() : audioElement?.play();
  }

  const { sx: iconButtonSx, ...restIconButtonProps } = playPauseIconButtonProps;
  const mergedSx = { ...containerStyle.playButton, ...iconButtonSx };

  return (
    <IconButton
      disabled={disabled}
      color="primary"
      onClick={handlePlay}
      sx={mergedSx}
      {...restIconButtonProps}
    >
      {playing ? <PauseIcon /> : <PlayArrowIcon />}
    </IconButton>
  );
}

const containerStyle = {
  timestamp: {
    minWidth: "50px",
  },
  playButton: {
    m: 1,
  },
};
