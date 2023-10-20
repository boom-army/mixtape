import {
  Box,
  Grid,
  IconButton,
  // Stack,
  Typography,
  styled,
} from "@mui/material";
import { useEffect, useState, useContext } from "react";
import { useRouter } from "next/router";
import { MetaplexContext } from "../../contexts/MetaplexProvider";
// import { PublicKey } from "@solana/web3.js";
import TrackList from "../../components/TrackList";
// import { Share, Add, Launch } from "@mui/icons-material";
import Link from "next/link";

/* <iframe src="https://mixt-ape.com/embed/<:mintAddress>" width="598" height="150"></iframe> */

const StyledIconButton = styled(IconButton)({
  width: 24,
  height: 24,
  "&:hover": {
    borderColor: "#CCC",
  },
});

const Embeddable = () => {
  const [mixtapeImg, setMixtapeImg] = useState<string | undefined>();
  const [mixtapeTitle, setMixtapeTitle] = useState<string | undefined>();
  const [trackMeta, setTrackMeta] = useState<TrackMeta[] | undefined>();

  const router = useRouter();
  const metaplex = useContext(MetaplexContext);
  const { address } = router.query;

  useEffect(() => {
    const fetchMetadata = async () => {
      if (!address) return;
      try {
        const response = await fetch(`/api/nft/read-meta?address=${address}`);
        const data = await response.json();
        const metadata = data.asset;
        if (!metadata) throw new Error("No metadata found");

        const contentResponse = await fetch(metadata.content.json_uri);
        const contentData = await contentResponse.json();

        if (!contentData?.tracks) return;
        setMixtapeImg(contentData?.image);
        setMixtapeTitle(contentData?.name);
        setTrackMeta(contentData?.tracks as TrackMeta[]);
      } catch (error) {
        console.error(error);
      }
    };
    fetchMetadata();
  }, [address]);

  return (
    <Grid container spacing={2} p={1}>
      <Grid item xs={3} sx={{ maxHeight: 150, overflow: "hidden" }}>
        <Box display="flex" justifyContent="center" alignItems="center">
          <Link href={`/sol/${address}`} target="_blank" passHref>
            <Typography
              variant="h4"
              sx={{
                fontSize: ["8px", "2vw"],
                textDecoration: "underline",
                textAlign: "center",
              }}
            >
              {mixtapeTitle}
            </Typography>
          </Link>
        </Box>
        <Box
          height="50vh"
          width="100%"
          display="flex"
          alignItems="center"
          justifyContent="center"
          sx={{
            maxHeight: 95,
            backgroundImage: `url(${mixtapeImg})`,
            backgroundSize: "70%",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
        {/* <Stack direction="row" spacing={1} justifyContent="center">
          <Link href={`/sol/${address}`} target="_blank" passHref>
            <StyledIconButton>
              <Share sx={{ width: 18 }} />
            </StyledIconButton>
          </Link>
          <Link href={`/create`} target="_blank" passHref>
            <StyledIconButton>
              <Add sx={{ width: 24 }} />
            </StyledIconButton>
          </Link>
          <Link href={`/sol/${address}`} target="_blank" passHref>
            <StyledIconButton>
              <Launch sx={{ width: 20 }} />
            </StyledIconButton>
          </Link>
        </Stack> */}
      </Grid>
      <Grid
        item
        xs={9}
        sx={{
          maxHeight: 150,
          overflowY: "scroll",
          "&::-webkit-scrollbar": {
            width: "3px",
          },
          "&::-webkit-scrollbar-track": {
            background: "#EAEAEA",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "#000",
          },
        }}
      >
        <TrackList data={trackMeta} />
      </Grid>
    </Grid>
  );
};

export default Embeddable;
