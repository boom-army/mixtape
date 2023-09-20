import { createHash } from "crypto";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

dayjs.extend(duration);

export const formatDuration = (seconds: number | undefined) => {
  if (!seconds) return "00:00";
  const dur = dayjs.duration(seconds, "seconds");

  const hours = dur.hours();
  const minutes = dur.minutes();
  const sec = dur.seconds();
  
  if (hours > 0) {
    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = sec.toString().padStart(2, '0');
    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  } else if (minutes > 0) {
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = sec.toString().padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
  } else {
    const formattedSeconds = sec.toString().padStart(2, '0');
    return `${formattedSeconds}`;
  }
};

// Define the valid domains for path and query
const validPathDomains = /^https?:\/\/(www\.)?(youtube.com|youtu.be)\//;
const validQueryDomains = new Set(['www.youtube.com', 'm.youtube.com', 'youtube.com', 'youtube.co.uk', 'youtube.com.br', 'youtube.fr', 'youtube.es', 'youtube.it', 'youtube.nl', 'youtu.be']);

// Define the ID validation regex
const idRegex = /^[a-zA-Z0-9_-]{11}$/;

// Convert a video ID to a full YouTube URL
export const toYouTubeURL = (videoId: string): string => {
  return `https://www.youtube.com/watch?v=${videoId}`;
};

// Extract the YouTube video ID from a given URL
export const fromYouTubeURL = (url: string): string => {
  if (idRegex.test(url)) {
    return url;
  }
  let parsed;
  try {
    parsed = new URL(url.trim());
  } catch (error) {
    if (url.startsWith('https://youtu.be/')) {
      parsed = new URL('https://www.youtube.com/watch?v=' + url.split('https://youtu.be/')[1]);
    } else {
      throw Error(`Invalid URL: "${url}"`);
    }
  }
  let id = parsed.searchParams.get('v');
  if (validPathDomains.test(url.trim()) && !id) {
    const paths = parsed.pathname.split('/');
    id = parsed.host === 'youtu.be' ? paths[1] : paths[2];
  } else if (parsed.hostname && !validQueryDomains.has(parsed.hostname)) {
    throw Error('Not a YouTube domain');
  }
  if (!id) {
    throw Error(`No video id found: "${url}"`);
  }
  id = id.substring(0, 11);
  if (!idRegex.test(id)) {
    throw TypeError(`Video id (${id}) does not match expected format (${idRegex.toString()})`);
  }
  return id;
};

export const hashToGrey = (input: string): string => {
  const hash = createHash("md5").update(input).digest("hex");
  const greyValue = parseInt(hash.substring(0, 2), 16);
  const adjustedGreyValue = Math.floor((greyValue % 136) + 119).toString(16); // Range from 119 (hex: 77) to 255 (hex: FF)
  return `#${adjustedGreyValue}${adjustedGreyValue}${adjustedGreyValue}`;
};

export const removeOfficialVideoText = (title: string) => {
  return title.replace(/(\(.*video.*\)|\[.*video.*\])/gi, '').trim();
}
