"use client";

import React, { useEffect } from 'react';
import '@rainbow-me/rainbowkit/styles.css';
import { ThemeProvider } from 'next-themes';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, connectorsForWallets, getDefaultConfig, darkTheme } from '@rainbow-me/rainbowkit';
import { base, baseSepolia } from 'wagmi/chains';
import {
  metaMaskWallet,
  trustWallet,
  walletConnectWallet,
  rainbowWallet,
  coinbaseWallet,
  braveWallet,
  ledgerWallet,
} from '@rainbow-me/rainbowkit/wallets';

const appName = 'ElementPay';
const queryClient = new QueryClient();

// Wallet connectors configuration using connectorsForWallets
const connectors = connectorsForWallets(
    [
      {
        groupName: "Popular",
        wallets: [
          metaMaskWallet,
          trustWallet,
          walletConnectWallet,
          rainbowWallet,
          coinbaseWallet,
        ],
      },
      {
        groupName: "More",
        wallets: [
          braveWallet,
          ledgerWallet,
        ],
      },
    ],
    {
      appName: "Element",
      projectId: "fe08c4f70d95451a77e389e0c893cfd5",
    }
  );

// configuration using getDefaultConfig
export const config = getDefaultConfig({
  appName: "Element",
  projectId: 'fe08c4f70d95451a77e389e0c893cfd5',
  chains: [baseSepolia, base],
  ssr: true,
  // @ts-ignore
  connectors,
});

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          initialChain={process.env.NEXT_PUBLIC_ENVIRONMENT === 'mainnet' ? base : baseSepolia}
          theme={darkTheme({
            borderRadius: 'large',
            accentColor: '#3384F7',
            fontStack: 'system',
          })}
        >
          {children}
        </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  );
}
