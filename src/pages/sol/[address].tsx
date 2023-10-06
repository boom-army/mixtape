import Head from "next/head";
import TrackList from "../../components/TrackList";
import { Box, Container, Link, Typography } from "@mui/material";
import { Header } from "../../components/Header";
import { Connection, PublicKey } from "@solana/web3.js";
import { GetServerSideProps } from "next";
import { Metaplex } from "@metaplex-foundation/js";
import { useRouter } from "next/router";
import { useState, useContext, useEffect } from "react";
import { MetaplexContext } from "../../contexts/MetaplexProvider";
import { useSnackbar } from "../../contexts/SnackbarProvider";
import { ExtendedJsonMetadata } from "../../types/nftTemplates";

interface AddressProps {
  mixtapeImg: string;
  mixtapeTitle: string;
  mixtapeDescription: string;
  trackMeta: TrackMeta[];
}

const Address: React.FC<AddressProps> = ({
  mixtapeImg,
  mixtapeTitle,
  mixtapeDescription,
  trackMeta,
}) => {
  const [mixtapeMetaState, setMixtapeMetaState] = useState<
    ExtendedJsonMetadata | undefined
  >();

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
        setMixtapeMetaState(metadata.json as ExtendedJsonMetadata);
      } catch (error) {
        console.error(error);
      }
    };
    fetchMetadata();
  }, [address, metaplex]);

  return (
    <>
      <Head>
        <meta property="og:title" content={mixtapeTitle} />
        <meta property="og:description" content={mixtapeDescription} />
        <meta property="og:image" content={mixtapeImg} />
        <meta
          property="og:url"
          content="https://octopus-app-96gy8.ondigitalocean.app"
        />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={mixtapeTitle} />
        <meta name="twitter:description" content={mixtapeDescription} />
        <meta name="twitter:image" content={mixtapeImg} />
      </Head>
      <Container maxWidth="lg" disableGutters>
        <Box mb={1} mt={1}>
          <Link href="/">
            <Typography>&lt; Home</Typography>
          </Link>
        </Box>
        <Header meta={mixtapeMetaState} />
        {!mixtapeMetaState?.tracks && !trackMeta ? (
          <Typography variant="h6" align="center" style={{ padding: "100px" }}>
            No mixtape tracks loaded
          </Typography>
        ) : (
          <TrackList data={mixtapeMetaState?.tracks ?? trackMeta} />
        )}
      </Container>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_NETWORK!);
  const metaplex = new Metaplex(connection);

  const params = context.params as { address: string };
  const { address } = params;
  let mixtapeImg = "/images/mixtape-1024.png";
  let mixtapeTitle = "Mixtape";
  let mixtapeDescription = "Mixtape";
  let trackMeta: any = null;

  if (address) {
    try {
      const metadataAddress = new PublicKey(address);
      const metadata = await metaplex
        ?.nfts()
        .findByMint({ mintAddress: metadataAddress });
      mixtapeImg = metadata?.json?.image ?? mixtapeImg;
      mixtapeTitle = metadata?.json?.name ?? mixtapeTitle;
      mixtapeDescription = metadata?.json?.description ?? mixtapeDescription;
      trackMeta = metadata?.json?.tracks || [];
    } catch (error) {
      console.error(`Failed to fetch metadata: ${error}`);
    }
  }

  return {
    props: {
      mixtapeImg,
      mixtapeTitle,
      mixtapeDescription,
      trackMeta,
    },
  };
};

export default Address;
