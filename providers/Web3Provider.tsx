"use client";

import { ReactNode } from "react";
import { WagmiProvider, createConfig, http } from "wagmi";
import {
  mainnet,
  polygon,
  base,
  arbitrum,
  optimism,
  bsc,
} from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";

// ✅ Add all supported chains and their Alchemy RPCs (fallback to public RPC if missing)
const alchemyId = process.env.NEXT_PUBLIC_ALCHEMY_ID!;
const transports = {
  [mainnet.id]: http(`https://eth-mainnet.g.alchemy.com/v2/${alchemyId}`),
  [polygon.id]: http(`https://polygon-mainnet.g.alchemy.com/v2/${alchemyId}`),
  [base.id]: http(`https://base-mainnet.g.alchemy.com/v2/${alchemyId}`),
  [arbitrum.id]: http(`https://arb-mainnet.g.alchemy.com/v2/${alchemyId}`),
  [optimism.id]: http(`https://opt-mainnet.g.alchemy.com/v2/${alchemyId}`),
  [bsc.id]: http("https://bsc-dataseed.binance.org"), // BSC not on Alchemy
};

const config = createConfig(
  getDefaultConfig({
    chains: [mainnet, polygon, base, arbitrum, optimism, bsc],
    transports,
    walletConnectProjectId:
      process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
    appName: "ShiftTip",
    appDescription: "Accept crypto donations instantly",
    appUrl: "https://shift-tip.com",
    appIcon: "https://shift-tip.com/logo.png",
  })
);

const queryClient = new QueryClient();

export const Web3Provider = ({ children }: { children: ReactNode }) => (
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <ConnectKitProvider>{children}</ConnectKitProvider>
    </QueryClientProvider>
  </WagmiProvider>
);
