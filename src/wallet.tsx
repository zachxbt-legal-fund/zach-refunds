import {
  connectorsForWallets,
  darkTheme,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import {
  injectedWallet,
  rainbowWallet,
  metaMaskWallet,
  rabbyWallet,
  ledgerWallet,
  walletConnectWallet,
  frameWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { type ReactNode } from "react";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { arbitrum, mainnet } from "wagmi/chains";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";

const { chains, publicClient } = configureChains(
  [mainnet, arbitrum],
  [
    jsonRpcProvider({
      rpc: (chain) => ({
        http:
          chain.id === arbitrum.id
            ? "https://rpc.ankr.com/arbitrum"
            : "https://eth.llamarpc.com",
      }),
    }),
  ]
);

const connectors = connectorsForWallets([
  {
    groupName: "Popular",
    wallets: [
      injectedWallet({ chains }),
      rabbyWallet({ chains }),
      frameWallet({ chains }),
      ledgerWallet({ chains, projectId: "6cfc14dee47a36d9b983e0079d4de1ad" }),
      metaMaskWallet({ chains, projectId: "6cfc14dee47a36d9b983e0079d4de1ad" }),
      rainbowWallet({ chains, projectId: "6cfc14dee47a36d9b983e0079d4de1ad" }),
      walletConnectWallet({
        chains,
        projectId: "6cfc14dee47a36d9b983e0079d4de1ad",
      }),
    ],
  },
]);

const config = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

export const WalletConfig = ({ children }: { children: ReactNode }) => {
  return (
    <WagmiConfig config={config}>
      <RainbowKitProvider
        chains={chains}
        theme={darkTheme({
          fontStack: "system",
          borderRadius: "none",
        })}
      >
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  );
};
