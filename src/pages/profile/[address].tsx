import TrackCards from "../../components/TrackCards";
import { Container, Grid } from "@mui/material";
import { Header } from "../../components/Header";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSnackbar } from "../../contexts/SnackbarProvider";
import { truncatePublicKey } from "../../utils";
import { useWallet } from "@solana/wallet-adapter-react";
import PsychologyAltIcon from '@mui/icons-material/PsychologyAlt';

const Profile: React.FC = () => {
  const [latestTracks, setLatestTracks] = useState([]);

  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const { address } = router.query;
  const { publicKey } = useWallet();

  useEffect(() => {
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

    fetchProfileNfts();
  }, [address, publicKey]);

  return (
    <>
      <Container maxWidth="lg" disableGutters>
        <Header />
        {latestTracks.length > 0 ? (
          <TrackCards
            title={`Mixtape mints${
              address ? ` for ${truncatePublicKey(address as string)}` : ""
            }:`}
            latestTracks={latestTracks}
          />
        ) : (
          <Grid container mb={4} mt={1}>
            <Grid item xs={12}>
              <h3>No tracks found for {truncatePublicKey(address as string)}</h3>
            </Grid>
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
