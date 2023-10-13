import React from 'react';
import PointsTable from '../components/Leaderboards/PointsTable';
import { Container, Grid, Typography, Box } from '@mui/material';

export default function TopMints() {
  return (
    <Container maxWidth="lg" disableGutters>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h4" gutterBottom mt={3}>
            Leaderboards
          </Typography>
          <Box mb={2}>
            <Typography variant="body1">
              Check out the top mints and their scores here.
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