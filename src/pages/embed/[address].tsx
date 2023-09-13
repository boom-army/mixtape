import {
  Box,
  Grid,
  IconButton,
  Stack,
  Typography,
  styled,
} from "@mui/material";
import { useEffect, useState, useContext } from "react";
import { useRouter } from "next/router";
import { MetaplexContext } from "../../contexts/MetaplexProvider";
import { PublicKey } from "@solana/web3.js";
import TrackList from "../../components/TrackList";
import { Share, Add, Launch } from "@mui/icons-material";
import Link from "next/link";

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
        const metadataAddress = new PublicKey(address);
        const metadata = await metaplex
          ?.nfts()
          .findByMint({ mintAddress: metadataAddress });
        if (!metadata?.json?.tracks) return;
        setMixtapeImg(metadata?.json?.image);
        setMixtapeTitle(metadata?.json?.name);
        setTrackMeta(metadata?.json?.tracks as TrackMeta[]);
      } catch (error) {
        console.error(error);
      }
    };
    fetchMetadata();
  }, [address, metaplex]);

  return (
    <Grid container spacing={2} p={1}>
      <Grid item xs={3} sx={{ maxHeight: 150, overflow: "hidden" }}>
        <Box display="flex" justifyContent="center">
          <Typography variant="h4" sx={{ fontSize: 14 }}>
            {mixtapeTitle}
          </Typography>
        </Box>
        <Box
          height="60vh"
          width="100%"
          display="flex"
          alignItems="center"
          justifyContent="center"
          sx={{
            backgroundImage: `url(${mixtapeImg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
        <Stack direction="row" spacing={1} justifyContent="center">
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
        </Stack>
      </Grid>
      <Grid item xs={9} sx={{ maxHeight: 150, overflowY: "scroll" }}>
        <TrackList data={trackMeta} />
      </Grid>
    </Grid>
  );
};

export default Embeddable;
