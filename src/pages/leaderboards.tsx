import React, { useEffect, useState } from "react";
import PointsTable from "../components/Leaderboards/PointsTable";
import { Container, Grid, Typography, Box, Tabs, Tab } from "@mui/material";
import Link from "next/link";

export default function TopMints() {
  const [value, setValue] = useState(0);
  const [topMints, setTopMints] = useState([]);
  const [topUsers, setTopUsers] = useState([]);

  const fetchTopMints = async () => {
    try {
      const response = await fetch("/api/points/mix-leaders");
      const data = await response.json();
      setTopMints(data.topMints);
    } catch (error) {
      console.error("Failed to fetch top mints:", error);
    }
  };

  const fetchTopUsers = async () => {
    try {
      const response = await fetch("/api/points/user-leaders");
      const data = await response.json();
      setTopUsers(data.topUsers);
    } catch (error) {
      console.error("Failed to fetch top users:", error);
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
            aria-label="simple tabs example"
          >
            <Tab label="Mixtapes" sx={{ cursor: "pointer" }} />
            <Tab label="Mixers" sx={{ cursor: "pointer" }} />
          </Tabs>
          <PointsTable topItems={value === 0 ? topMints : topUsers} />
        </Grid>
      </Grid>
    </Container>
  );
}
