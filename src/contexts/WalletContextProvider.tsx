import type { Adapter, WalletError } from "@solana/wallet-adapter-base";
import { WalletDialogProvider as MaterialUIWalletDialogProvider } from "../components/WalletAdapter";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import {
  BraveWalletAdapter,
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { type SolanaSignInInput } from "@solana/wallet-standard-features";
import { verifySignIn } from "@solana/wallet-standard-util";
import type { FC, ReactNode } from "react";
import React, { useCallback, useMemo } from "react";
import { AutoConnectProvider, useAutoConnect } from "./AutoConnectProvider";
import { SnackbarProvider, useSnackbar } from "./SnackbarProvider";
import { UmiProvider } from "./UmiProvider";
import { MetaplexProvider } from "./MetaplexProvider";

const WalletContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { autoConnect } = useAutoConnect();
  const endpoint =
    process.env.NEXT_PUBLIC_SOLANA_NETWORK ?? "https://api.devnet.solana.com"

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new BraveWalletAdapter(),
      new SolflareWalletAdapter(),
      new TorusWalletAdapter(),
    ],
    []
  );

  const { enqueueSnackbar } = useSnackbar();
  const onError = useCallback(
    (error: WalletError, adapter?: Adapter) => {
      enqueueSnackbar(
        error.message ? `${error.name}: ${error.message}` : error.name
      );
      console.error(error, adapter);
    },
    [enqueueSnackbar]
  );

  const autoSignIn = useCallback(async (adapter: Adapter) => {
    if (!("signIn" in adapter)) return true;

    const input: SolanaSignInInput = {
      domain: window.location.host,
      address: adapter.publicKey ? adapter.publicKey.toBase58() : undefined,
      statement: "Please sign in.",
    };
    const output = await adapter.signIn(input);

    if (!verifySignIn(input, output))
      throw new Error("Sign In verification failed");

    enqueueSnackbar("Auto sign in successful");

    return false;
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider
        wallets={wallets}
        onError={onError}
        autoConnect={autoConnect && autoSignIn}
      >
        <MetaplexProvider>
          <UmiProvider endpoint={endpoint}>
            <MaterialUIWalletDialogProvider>
              {children}
            </MaterialUIWalletDialogProvider>
          </UmiProvider>
        </MetaplexProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

const WalletContext: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <SnackbarProvider>
      <AutoConnectProvider>
        <WalletContextProvider>{children}</WalletContextProvider>
      </AutoConnectProvider>
    </SnackbarProvider>
  );
};

export default WalletContext;
