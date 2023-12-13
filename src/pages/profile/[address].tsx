import PsychologyAltIcon from "@mui/icons-material/PsychologyAlt";
import TrackCards from "../../components/TrackCards";
import {
  Avatar,
  Box,
  CircularProgress,
  Container,
  Grid,
  Paper,
  Typography,
} from "@mui/material";
import { Header } from "../../components/Header";
import { truncatePublicKey } from "../../utils";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSnackbar } from "../../contexts/SnackbarProvider";
import { useWallet } from "@solana/wallet-adapter-react";
import { createAvatar } from "@dicebear/core";
import { bigSmile } from "@dicebear/collection";
import { GetServerSideProps } from "next";
import Head from "next/head";

interface ProfileProps {
  avatarSvg: string;
  latestTracks: any[];
  shortAddress: string;
}

const Profile: React.FC<ProfileProps> = ({
  avatarSvg: initialAvatarSvg,
  latestTracks: initialLatestTracks,
  shortAddress,
}) => {
  const [latestTracks, setLatestTracks] = useState(initialLatestTracks);
  const [avatarSvg, setAvatarSvg] = useState(initialAvatarSvg);
  const [loading, setLoading] = useState(false);

  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const { address } = router.query;
  const { publicKey } = useWallet();

  useEffect(() => {
    setLoading(true);
    if (!address) return;
    const fetchProfileNfts = async () => {
      try {
        const response = await fetch(
          `/api/nft/get-profile-nfts?address=${address}`
        );
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        const data = await response.json();
        setLatestTracks(data.profileNfts);
      } catch (error) {
        console.error("Failed to fetch profile NFTs:", error);
        enqueueSnackbar(
          "Failed to fetch profile NFTs. Refresh the page to try again."
        );
      }
    };

    fetchProfileNfts().then(() => setLoading(false));

    const generateAvatar = async () => {
      const avatar = createAvatar(bigSmile, { seed: address as string });
      const avatarUri = await avatar.toDataUri();
      setAvatarSvg(avatarUri);
    };

    generateAvatar();
  }, [address, publicKey]);

  return (
    <>
      <Head>
        <title>Mixtapes from {shortAddress}</title>
        <meta name="description" content={`Mixtape profile`} />
        <meta property="og:title" content={`Mixtape profile`} />
        <meta
          property="og:description"
          content={`Straight dope from the brain of ${shortAddress}`}
        />
        <meta property="og:image" content={avatarSvg} />
      </Head>
      <Container maxWidth="lg" disableGutters>
        {address && (
          <Paper
            elevation={0}
            sx={{
              padding: 3,
              marginBottom: 2,
              background: "linear-gradient(to right, #EEE 1%, #FFF)",
            }}
          >
            <Box display="flex" alignItems="center">
              <Avatar sx={{ bgcolor: "#b4d7e3" }} src={avatarSvg} />
              <Typography
                variant="h6"
                sx={{
                  marginLeft: 2,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: "calc(100vw - 200px)",
                }}
              >
                {address}
              </Typography>
            </Box>
          </Paper>
        )}
        <Header />
        {loading ? (
          <Grid container justifyContent="center">
            <CircularProgress />
          </Grid>
        ) : latestTracks.length > 0 ? (
          <TrackCards title={`Mixtape NFTs:`} latestTracks={latestTracks} />
        ) : (
          <Grid container mb={4} mt={1}>
            {address && (
              <Grid item xs={12}>
                <h3>
                  No tracks found for {shortAddress}
                </h3>
              </Grid>
            )}
            <Grid item xs={12} display="flex" justifyContent="center">
              <PsychologyAltIcon sx={{ fontSize: 100 }} />
            </Grid>
          </Grid>
        )}
      </Container>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const params = context.params as { address: string };
  const { address } = params;

  let avatarSvg = "";
  let latestTracks: any = null;
  let shortAddress = truncatePublicKey(address as string);

  if (address) {
    try {
      const req = context.req;
      const protocol = req.headers["x-forwarded-proto"] || "http";
      const host = req.headers["x-forwarded-host"] || req.headers["host"];
      const baseUrl = `${protocol}://${host}`;

      const response = await fetch(
        `${baseUrl}/api/nft/get-profile-nfts?address=${address}`
      );
      const data = await response.json();
      latestTracks = data.profileNfts || [];

      const avatar = createAvatar(bigSmile, { seed: address });
      const avatarUri = await avatar.png().toDataUri();
      avatarSvg = avatarUri
    } catch (error) {
      console.error(`Failed to fetch profile NFTs: ${error}`);
    }
  }

  return {
    props: {
      avatarSvg,
      latestTracks,
      shortAddress,
    },
  };
};

export default Profile;
