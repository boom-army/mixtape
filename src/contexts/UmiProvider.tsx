import { createContext, useContext, ReactNode } from "react";
import { Umi } from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { useWallet } from "@solana/wallet-adapter-react";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";

type UmiContext = {
  umi: Umi | null;
};

const DEFAULT_CONTEXT: UmiContext = {
  umi: null,
};

export const UmiContext = createContext<UmiContext>(DEFAULT_CONTEXT);

export const UmiProvider = ({
  endpoint,
  children,
}: {
  endpoint: string;
  children: ReactNode;
}) => {
  const wallet = useWallet();
  const umi = createUmi(endpoint)
    .use(walletAdapterIdentity(wallet));

  return <UmiContext.Provider value={{ umi }}>{children}</UmiContext.Provider>;
};

export const useUmi = (): Umi => {
  const umi = useContext(UmiContext).umi;
  if (!umi) {
    throw new Error(
      "Umi context was not initialized. " +
        "Did you forget to wrap your app with <UmiProvider />?"
    );
  }
  return umi;
};
