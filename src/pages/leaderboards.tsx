import React from "react";
import PointsTable from "../components/Leaderboards/PointsTable";
import { Container, Grid, Typography, Box } from "@mui/material";
import Link from "next/link";

export default function TopMints() {
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
              Best mixes on MixtApe ranked by points
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <PointsTable />
        </Grid>
      </Grid>
    </Container>
  );
}
