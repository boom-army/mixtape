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
} from "@mui/material";
import Link from "next/link";

const templateId = "123e4567-e89b-12d3-a456-426614174004";

export default function TopMints() {
  const [value, setValue] = useState(0);
  const [topMints, setTopMints] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [topNFTs, setTopNFTs] = useState([]);
  const [loading, setLoading] = useState(false);

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
      const response = await fetch(`/api/points/nft-leaders?id=${templateId}`);
      const data = await response.json();
      setTopNFTs(data.topNFTs);
    } catch (error) {
      console.error("Failed to fetch top NFTs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopMints();
  }, []);

  const handleChange = async (
    event: React.ChangeEvent<{}>,
    newValue: number
  ) => {
    setValue(newValue);

    if (newValue === 0) {
      fetchTopMints();
    } else if (newValue === 1) {
      fetchTopUsers();
    } else if (newValue === 2) {
      fetchTopNFT();
    }
  };

  return (
    <Container maxWidth="lg" disableGutters>
      <Box mb={1} mt={1}>
        <Link href="/">
          <Typography>&lt; Home</Typography>
        </Link>
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
            <Tab label="Mixtapes" sx={{ cursor: "pointer" }} />
            <Tab label="Mixers" sx={{ cursor: "pointer" }} />
            <Tab label="NFTs" sx={{ cursor: "pointer" }} />
          </Tabs>
          {loading ? (
            [...Array(10)].map((_, i) => (
              <Skeleton key={i} variant="text" height={50} />
            ))
          ) : (
            <PointsTable topItems={value === 0 ? topMints : value === 1 ? topUsers : topNFTs} />
          )}
        </Grid>
      </Grid>
    </Container>
  );
}
