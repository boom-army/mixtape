import { Box, Typography } from "@mui/material";

// enable in next.config.js
export default function Maintenance() {
  return (
    <Box p={5}>
      <Typography variant="h1">
        Our site is currently under maintenance. Be back soon!
      </Typography>
    </Box>
  );
}
