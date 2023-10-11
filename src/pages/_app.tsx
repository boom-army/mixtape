import React from "react";
import Head from "next/head";
import WalletButton from "../components/WalletButton";
import WalletContext from "../contexts/WalletContextProvider";
import createEmotionCache from "../utils/createEmotionCache";
import { AppProps } from "next/app";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { CacheProvider, EmotionCache } from "@emotion/react";
import { RecoilRoot } from "recoil";
import { SnackbarProvider } from "../contexts/SnackbarProvider";
import theme from "../utils/theme";
import { useRouter } from "next/router";

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
}

export default function MyApp(props: MyAppProps) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;
  const router = useRouter();
  return (
    <RecoilRoot>
      <SnackbarProvider>
        <WalletContext>
          <CacheProvider value={emotionCache}>
            <Head>
              <meta
                name="viewport"
                content="initial-scale=1, width=device-width"
              />
              <link rel="manifest" href="/manifest.json" />
              <link
                rel="apple-touch-icon"
                sizes="180x180"
                href="/apple-touch-icon.png"
              />
              <meta property="og:title" content="MixtApe" />
              <meta
                property="og:description"
                content="Mix. Share. Ape. Repeat."
              />
              <meta property="og:image" content="/images/mixtape-1024.png" />
              <meta property="og:url" content="https://mixt-ape.com" />
              <meta name="twitter:card" content="summary_large_image" />
              <meta name="twitter:title" content="MixtApe" />
              <meta
                name="twitter:description"
                content="Mix. Share. Ape. Repeat."
              />
              <meta name="twitter:image" content="/images/mixtape-1024.png" />
            </Head>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              {!router.pathname.includes("embed") && <WalletButton />}
              <Component {...pageProps} />
            </ThemeProvider>
          </CacheProvider>
        </WalletContext>
      </SnackbarProvider>
    </RecoilRoot>
  );
}
