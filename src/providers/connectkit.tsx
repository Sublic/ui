import { PropsWithChildren } from "react";
import {
  ConnectKitProvider,
  getDefaultConfig,
  getDefaultConnectors,
} from "connectkit";
import { bscTestnet } from "viem/chains";
import { WC_ID, GRPC_URL } from "@/config";
import { WagmiProvider, createConfig } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { injected, walletConnect } from "wagmi/connectors";

const config = createConfig(
  getDefaultConfig({
    appName: "Sublic Admin",
    connectors: [
      injected(),
      walletConnect({
        projectId: WC_ID,
        showQrModal: false,
      }),
    ],
    chains: [
      bscTestnet,
      {
        id: 5600,
        name: "Greenfield Testnet",
        nativeCurrency: {
          decimals: 18,
          symbol: "BNB",
          name: "BNB",
        },
        testnet: true,
        rpcUrls: {
          default: {
            http: [GRPC_URL],
          },
        },
      },
    ],

    walletConnectProjectId: WC_ID,
  })
);

const queryClient = new QueryClient();

export function Web3Provider({ children }: PropsWithChildren) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>{children}</ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
