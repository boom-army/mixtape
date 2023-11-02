import {
  Box,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Grid,
  Skeleton,
  Typography,
  useTheme,
} from "@mui/material";
import Link from "next/link";
import { useState } from "react";

interface TrackCardProps {
  latestTracks: any[];
}

const TrackCards: React.FC<TrackCardProps> = ({ latestTracks }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState<number | null>(null);

  const handleClick = (index: number) => {
    setLoading(index);
  };

  return (
    <Grid container mb={4} mt={1}>
      <Grid item xs={12}>
        <h3>Latest mixes: {!latestTracks && <CircularProgress size={12} />}</h3>
      </Grid>
      {!latestTracks.length ? (
        <Grid container spacing={3}>
          {[...Array(16)].map((_, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Grid container spacing={1}>
                <Grid item xs={4}>
                  <Skeleton variant="rectangular" height={80} />
                </Grid>
                <Grid item xs={8}>
                  <Skeleton variant="text" sx={{ mb: 1.5 }} />
                  <Skeleton variant="text" />
                </Grid>
              </Grid>
            </Grid>
          ))}
        </Grid>
      ) : null}
      {latestTracks.map((track: any, index: number) => (
        <Grid
          item
          xs={12}
          sm={6}
          md={3}
          key={`track-${track.mint}`}
          sx={{ pb: 1 }}
        >
          <Link href={`/sol/${track.mint}`} onClick={() => handleClick(index)}>
            <Card
              variant="outlined"
              sx={{
                borderRadius: "0px",
                display: "flex",
                flexDirection: "column",
                height: "100%",
                backgroundColor: theme.palette.background.default,
                border: "3px solid",
                borderColor: "transparent",
                "&:hover": {
                  borderColor: theme.palette.secondary.main,
                },
              }}
            >
              <Grid container justifyContent="space-between">
                {!(loading === index) && (
                  <>
                    <Grid
                      item
                      xs={4}
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100px",
                        width: "100px",
                      }}
                    >
                      <CardMedia
                        component="img"
                        sx={{
                          height: "80px",
                          width: "80px",
                          objectFit: "contain",
                        }}
                        image={
                          track.meta.properties.files[0]?.uri ||
                          track.image ||
                          "/images/mixtape-1024.png"
                        }
                        alt={track.title}
                      />
                    </Grid>
                    <Grid item xs={8}>
                      <CardContent>
                        <Typography variant="h6" component="div">
                          {track.meta.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ textDecoration: "none" }}
                        >
                          {track.meta.description}
                        </Typography>
                      </CardContent>
                    </Grid>
                  </>
                )}
                {loading === index && (
                  <Grid item xs={12}>
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      sx={{ minHeight: "100px" }}
                    >
                      <CircularProgress />
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Card>
          </Link>
        </Grid>
      ))}
    </Grid>
  );
};

export default TrackCards;
