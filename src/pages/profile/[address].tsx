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

const Profile: React.FC = () => {
  const [latestTracks, setLatestTracks] = useState([]);
  const [avatarSvg, setAvatarSvg] = useState("");
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
      console.log(avatarUri);
      setAvatarSvg(avatarUri);
    };

    generateAvatar();
  }, [address, publicKey]);

  return (
    <>
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
              <Avatar sx={{ bgcolor: "#000" }} src={avatarSvg} />
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
                  No tracks found for {truncatePublicKey(address as string)}
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

export default Profile;
