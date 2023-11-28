import React, { useEffect, useState } from "react";
import PointsTable from "../components/Leaderboards/PointsTable";
import {
  Container,
  Grid,
  Typography,
  Box,
  Tabs,
  Tab,
  Skeleton,
  Button,
} from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/router";

export default function TopMints() {
  const [value, setValue] = useState("mixtapes");
  const [topMints, setTopMints] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [topNFTs, setTopNFTs] = useState([]);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const fetchTopMints = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/points/mix-leaders");
      const data = await response.json();
      setTopMints(data.topMints);
    } catch (error) {
      console.error("Failed to fetch top mints:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/points/user-leaders");
      const data = await response.json();
      setTopUsers(data.topUsers);
    } catch (error) {
      console.error("Failed to fetch top users:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopNFT = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/points/nft-leaders?id=${process.env.NEXT_PUBLIC_NFT_LEADER}`
      );
      const data = await response.json();
      setTopNFTs(data.topNFTs);
    } catch (error) {
      console.error("Failed to fetch top NFTs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const tab = router.query.tab as string;
    setValue(tab || "mixtapes");

    if (tab === "mixtapes" || !tab) {
      fetchTopMints();
    } else if (tab === "mixers") {
      fetchTopUsers();
    } else if (tab === "thugbirdz") {
      fetchTopNFT();
    }
  }, [router.query.tab]);

  const handleChange = async (
    event: React.ChangeEvent<{}>,
    newValue: string
  ) => {
    setValue(newValue);
    router.push(`/leaderboards?tab=${newValue}`, undefined, { shallow: true });

    if (newValue === "mixtapes") {
      fetchTopMints();
    } else if (newValue === "mixers") {
      fetchTopUsers();
    } else if (newValue === "thugbirdz") {
      fetchTopNFT();
    }
  };

  return (
    <Container maxWidth="lg" disableGutters>
      <Box mb={1} mt={2}>
        <Button component={Link} href="/">
          <Typography>&lt; Home</Typography>
        </Button>
      </Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h4" gutterBottom mt={3}>
            Leaderboards
          </Typography>
          <Box mb={2}>
            <Typography variant="body1">
              Leaders on MixtApe ranked by points
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="leaderboard-tabs"
          >
            <Tab label="Mixtapes" value="mixtapes" sx={{ cursor: "pointer" }} />
            <Tab label="Mixers" value="mixers" sx={{ cursor: "pointer" }} />
            {/* {process.env.NEXT_PUBLIC_NFT_LEADER && (
              <Tab
                label="Thugbirdz"
                value="thugbirdz"
                sx={{ cursor: "pointer" }}
              />
            )} */}
          </Tabs>
          {loading ? (
            [...Array(10)].map((_, i) => (
              <Skeleton key={i} variant="text" height={50} />
            ))
          ) : (
            <PointsTable
              topItems={
                value === "mixtapes"
                  ? topMints
                  : value === "mixers"
                  ? topUsers
                  : topNFTs
              }
            />
          )}
        </Grid>
      </Grid>
    </Container>
  );
}
