import {
  Card,
  CardContent,
  CardMedia,
  Grid,
  Typography,
  useTheme,
} from "@mui/material";
import Link from "next/link";

interface TrackCardProps {
  latestTracks: any;
}

const TrackCards: React.FC<TrackCardProps> = ({ latestTracks }) => {
  const theme = useTheme();
  return (
    <Grid container mb={4}>
      <Grid item xs={12}>
        <h3>Latest degen mixes:</h3>
      </Grid>
      {latestTracks.map((track: any) => (
        <Grid
          item
          xs={12}
          sm={6}
          md={3}
          key={track.id}
          sx={{ p: 1 }}
        >
          <Link href={`/sol/${track.mint}`}>
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
              <Grid container>
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
                    sx={{ height: "80px", width: "80px", objectFit: "contain" }}
                    image={
                      track.meta.properties.files[0]
                        ? track.meta.properties.files[0].uri
                        : track.image
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
              </Grid>
            </Card>
          </Link>
        </Grid>
      ))}
    </Grid>
  );
};

export default TrackCards;
