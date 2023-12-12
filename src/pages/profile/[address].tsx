import TrackCards from "../../components/TrackCards";
import { Container } from "@mui/material";
import { Header } from "../../components/Header";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSnackbar } from "../../contexts/SnackbarProvider";
import { truncatePublicKey } from "../../utils";

const Profile: React.FC = () => {
  const [latestTracks, setLatestTracks] = useState([]);

  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const { address } = router.query;

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
  }, [address]);

  return (
    <>
      <Container maxWidth="lg" disableGutters>
        <Header />
        <TrackCards
          title={`Mixtapes mints${
            address ? ` for ${truncatePublicKey(address as string)}` : ""
          }:`}
          latestTracks={latestTracks}
        />
      </Container>
    </>
  );
};

export default Profile;
