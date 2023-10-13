import TrackCards from "../components/TrackCards";
import { Box, Button, Container, Pagination, TextField } from "@mui/material";
import { Header } from "../components/Header";
import { PublicKey } from "@solana/web3.js";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

const HomePage: React.FC = () => {
  const [latestTracks, setLatestTracks] = useState([]);
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const fetchLatestTracks = async () => {
      try {
        const response = await fetch(`/api/nft/latest?page=${page}`);
        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Failed to fetch latest tracks:", error);
      }
    };

    fetchLatestTracks().then((data) => {
      setLatestTracks(data.latestTracks);
      setTotalPages(Math.ceil(data.totalTracks / 16));
    });
  }, [page]);

  const handleAddressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(event.target.value);
  };

  const handleAddressSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    try {
      if (address) {
        new PublicKey(address);
        router.push(`/sol/${address}`);
      }
    } catch {
      setError("Solana NFT mint address is not valid");
    }
  };

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
  };

  return (
    <>
      <Container maxWidth="lg" disableGutters>
        <Header />
        <Box
          component="form"
          onSubmit={handleAddressSubmit}
          noValidate
          autoComplete="off"
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start", // Align items to the top
            width: "100%",
          }}
        >
          <TextField
            error={!!error}
            helperText={error}
            value={address}
            onChange={handleAddressChange}
            label="Enter any MixtApe NFT mint address to listen to a mixtape"
            sx={{ flexGrow: 1 }}
          />
          <Button
            type="submit"
            size="large"
            variant="contained"
            sx={{
              alignSelf: "flex-start", // Align self to the top
              ml: 1,
              height: "3.7em",
              minWidth: "12em",
            }}
          >
            Listen to mix
          </Button>
        </Box>
        <TrackCards latestTracks={latestTracks} />
        <Pagination
          sx={{ mb: "3rem" }}
          color="primary"
          count={totalPages}
          siblingCount={1}
          boundaryCount={1}
          page={page}
          onChange={handlePageChange}
        />
      </Container>
    </>
  );
};

export default HomePage;
