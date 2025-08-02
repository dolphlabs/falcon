import type { Hex } from "viem";

export const blockChains: string[] = [
  "SOLANA_DEVNET",
  "ETH_SEPOLIA",
  "AVAX_FUJI",
  "BASE_SEPOLIA",
  "SONIC_BLAZE",
  "LINEA_SEPOLIA",
  "ARBITRUM_SEPOLIA",
  "WORLDCHAIN_SEPOLIA",
  "OPTIMISM_SEPOLIA",
  "CODEX_TESTNET",
  "UNICHAIN_SEPOLIA",
  "POLYGON_AMOY",
];

export enum SupportedChainId {
  ETH_SEPOLIA = 11155111,
  AVAX_FUJI = 43113,
  BASE_SEPOLIA = 84532,
  SONIC_BLAZE = 57054,
  LINEA_SEPOLIA = 59141,
  ARBITRUM_SEPOLIA = 421614,
  WORLDCHAIN_SEPOLIA = 4801,
  OPTIMISM_SEPOLIA = 11155420,
  SOLANA_DEVNET = 103,
  CODEX_TESTNET = 812242,
  UNICHAIN_SEPOLIA = 1301,
  POLYGON_AMOY = 80002,
}

export const DEFAULT_MAX_FEE = 1000n;
export const DEFAULT_FINALITY_THRESHOLD = 2000;

export const CHAIN_TO_CHAIN_NAME: Record<number, string> = {
  [SupportedChainId.ETH_SEPOLIA]: "Ethereum Sepolia",
  [SupportedChainId.AVAX_FUJI]: "Avalanche Fuji",
  [SupportedChainId.BASE_SEPOLIA]: "Base Sepolia",
  [SupportedChainId.SONIC_BLAZE]: "Sonic Blaze",
  [SupportedChainId.LINEA_SEPOLIA]: "Linea Sepolia",
  [SupportedChainId.ARBITRUM_SEPOLIA]: "Arbitrum Sepolia",
  [SupportedChainId.WORLDCHAIN_SEPOLIA]: "Worldchain Sepolia",
  [SupportedChainId.OPTIMISM_SEPOLIA]: "Optimism Sepolia",
  [SupportedChainId.SOLANA_DEVNET]: "Solana Devnet",
  [SupportedChainId.CODEX_TESTNET]: "Codex Testnet",
  [SupportedChainId.UNICHAIN_SEPOLIA]: "Unichain Sepolia",
  [SupportedChainId.POLYGON_AMOY]: "Polygon Amoy",
};

export const EthereumUSDCAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
export const AvalancheUSDCAddress =
  "0xB97EF9e8734C71904dC006fc2d93eAA8d99f84eC";
export const LineaUSDCAddress = "0xA21943924Bf91167c1e6e0E88b9076D74e5088d1";
export const ArbitrumUSDCAddress = "0xaf88d065e77c8cC223D8E79B95F0Cc232abCDA50";
export const OptimismUSDCAddress = "0x0b2c639c533813f4aa9d7837caf62653d097fcc2";
export const PolygonUSDCAddress = "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359";
export const BaseUSDCAddress = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
export const SOLUSDCAddress = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

export const chainsMap = {
  ETH: EthereumUSDCAddress,
  LINEA: LineaUSDCAddress,
  ARBITRUM: ArbitrumUSDCAddress,
  OPT: OptimismUSDCAddress,
  POLYGON: PolygonUSDCAddress,
  BASE: BaseUSDCAddress,
  SOL: SOLUSDCAddress,
  AVAX: AvalancheUSDCAddress,
};

export const CHAIN_IDS_TO_USDC_ADDRESSES: Record<number, Hex | string> = {
  [SupportedChainId.ETH_SEPOLIA]: "0x1c7d4b196cb0c7b01d743fbc6116a902379c7238",
  [SupportedChainId.AVAX_FUJI]: "0x5425890298aed601595a70AB815c96711a31Bc65",
  [SupportedChainId.BASE_SEPOLIA]: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
  [SupportedChainId.SONIC_BLAZE]: "0xA4879Fed32Ecbef99399e5cbC247E533421C4eC6",
  [SupportedChainId.LINEA_SEPOLIA]:
    "0xFEce4462D57bD51A6A552365A011b95f0E16d9B7",
  [SupportedChainId.ARBITRUM_SEPOLIA]:
    "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d",
  [SupportedChainId.WORLDCHAIN_SEPOLIA]:
    "0x66145f38cBAC35Ca6F1Dfb4914dF98F1614aeA88",
  [SupportedChainId.OPTIMISM_SEPOLIA]:
    "0x5fd84259d66Cd46123540766Be93DFE6D43130D7",
  [SupportedChainId.SOLANA_DEVNET]:
    "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
  [SupportedChainId.CODEX_TESTNET]:
    "0x6d7f141b6819C2c9CC2f818e6ad549E7Ca090F8f",
  [SupportedChainId.UNICHAIN_SEPOLIA]:
    "0x31d0220469e10c4E71834a79b1f276d740d3768F",
  [SupportedChainId.POLYGON_AMOY]: "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582",
};

export const CHAIN_IDS_TO_TOKEN_MESSENGER: Record<number, Hex | string> = {
  [SupportedChainId.ETH_SEPOLIA]: "0x8fe6b999dc680ccfdd5bf7eb0974218be2542daa",
  [SupportedChainId.AVAX_FUJI]: "0x8fe6b999dc680ccfdd5bf7eb0974218be2542daa",
  [SupportedChainId.BASE_SEPOLIA]: "0x8fe6b999dc680ccfdd5bf7eb0974218be2542daa",
  [SupportedChainId.SONIC_BLAZE]: "0x8fe6b999dc680ccfdd5bf7eb0974218be2542daa",
  [SupportedChainId.LINEA_SEPOLIA]:
    "0x8fe6b999dc680ccfdd5bf7eb0974218be2542daa",
  [SupportedChainId.ARBITRUM_SEPOLIA]:
    "0x8fe6b999dc680ccfdd5bf7eb0974218be2542daa",
  [SupportedChainId.WORLDCHAIN_SEPOLIA]:
    "0x8fe6b999dc680ccfdd5bf7eb0974218be2542daa",
  [SupportedChainId.OPTIMISM_SEPOLIA]:
    "0x8fe6b999dc680ccfdd5bf7eb0974218be2542daa",
  [SupportedChainId.SOLANA_DEVNET]:
    "CCTPV2vPZJS2u2BBsUoscuikbYjnpFmbFsvVuJdgUMQe",
  [SupportedChainId.CODEX_TESTNET]:
    "0x8fe6b999dc680ccfdd5bf7eb0974218be2542daa",
  [SupportedChainId.UNICHAIN_SEPOLIA]:
    "0x8fe6b999dc680ccfdd5bf7eb0974218be2542daa",
  [SupportedChainId.POLYGON_AMOY]: "0x8fe6b999dc680ccfdd5bf7eb0974218be2542daa",
};

export const CHAIN_IDS_TO_MESSAGE_TRANSMITTER: Record<number, Hex | string> = {
  [SupportedChainId.ETH_SEPOLIA]: "0xe737e5cebeeba77efe34d4aa090756590b1ce275",
  [SupportedChainId.AVAX_FUJI]: "0xe737e5cebeeba77efe34d4aa090756590b1ce275",
  [SupportedChainId.BASE_SEPOLIA]: "0xe737e5cebeeba77efe34d4aa090756590b1ce275",
  [SupportedChainId.SONIC_BLAZE]: "0xe737e5cebeeba77efe34d4aa090756590b1ce275",
  [SupportedChainId.LINEA_SEPOLIA]:
    "0xe737e5cebeeba77efe34d4aa090756590b1ce275",
  [SupportedChainId.ARBITRUM_SEPOLIA]:
    "0xe737e5cebeeba77efe34d4aa090756590b1ce275",
  [SupportedChainId.WORLDCHAIN_SEPOLIA]:
    "0xe737e5cebeeba77efe34d4aa090756590b1ce275",
  [SupportedChainId.OPTIMISM_SEPOLIA]:
    "0xe737e5cebeeba77efe34d4aa090756590b1ce275",
  [SupportedChainId.SOLANA_DEVNET]:
    "CCTPV2Sm4AdWt5296sk4P66VBZ7bEhcARwFaaS9YPbeC",
  [SupportedChainId.CODEX_TESTNET]:
    "0xe737e5cebeeba77efe34d4aa090756590b1ce275",
  [SupportedChainId.UNICHAIN_SEPOLIA]:
    "0xe737e5cebeeba77efe34d4aa090756590b1ce275",
  [SupportedChainId.POLYGON_AMOY]: "0xe737e5cebeeba77efe34d4aa090756590b1ce275",
};

export const DESTINATION_DOMAINS: Record<number, number> = {
  [SupportedChainId.ETH_SEPOLIA]: 0,
  [SupportedChainId.AVAX_FUJI]: 1,
  [SupportedChainId.BASE_SEPOLIA]: 6,
  [SupportedChainId.SONIC_BLAZE]: 13,
  [SupportedChainId.LINEA_SEPOLIA]: 11,
  [SupportedChainId.ARBITRUM_SEPOLIA]: 3,
  [SupportedChainId.WORLDCHAIN_SEPOLIA]: 14,
  [SupportedChainId.OPTIMISM_SEPOLIA]: 2,
  [SupportedChainId.SOLANA_DEVNET]: 5,
  [SupportedChainId.CODEX_TESTNET]: 12,
  [SupportedChainId.UNICHAIN_SEPOLIA]: 10,
  [SupportedChainId.POLYGON_AMOY]: 7,
};

export const SUPPORTED_CHAINS = [
  SupportedChainId.ETH_SEPOLIA,
  SupportedChainId.AVAX_FUJI,
  SupportedChainId.BASE_SEPOLIA,
  SupportedChainId.SONIC_BLAZE,
  SupportedChainId.LINEA_SEPOLIA,
  SupportedChainId.ARBITRUM_SEPOLIA,
  SupportedChainId.WORLDCHAIN_SEPOLIA,
  SupportedChainId.OPTIMISM_SEPOLIA,
  SupportedChainId.SOLANA_DEVNET,
  SupportedChainId.CODEX_TESTNET,
  SupportedChainId.UNICHAIN_SEPOLIA,
  SupportedChainId.POLYGON_AMOY,
];

// Solana RPC endpoint
export const SOLANA_RPC_ENDPOINT = "https://api.devnet.solana.com";

// IRIS API URL for CCTP attestations (testnet)
export const IRIS_API_URL =
  process.env.IRIS_API_URL ?? "https://iris-api-sandbox.circle.com";

export const chainConfigs: Record<
  string,
  {
    chainId: number;
    usdcContract: string;
    tokenMessenger: string;
    destinationDomain: number;
    messageTransmitter?: string;
  }
> = {
  ETH_SEPOLIA: {
    chainId: SupportedChainId.ETH_SEPOLIA,
    usdcContract: CHAIN_IDS_TO_USDC_ADDRESSES[
      SupportedChainId.ETH_SEPOLIA
    ] as string,
    tokenMessenger: CHAIN_IDS_TO_TOKEN_MESSENGER[
      SupportedChainId.ETH_SEPOLIA
    ] as string,
    destinationDomain: DESTINATION_DOMAINS[SupportedChainId.ETH_SEPOLIA],
  },
  AVAX_FUJI: {
    chainId: SupportedChainId.AVAX_FUJI,
    usdcContract: CHAIN_IDS_TO_USDC_ADDRESSES[
      SupportedChainId.AVAX_FUJI
    ] as string,
    tokenMessenger: CHAIN_IDS_TO_TOKEN_MESSENGER[
      SupportedChainId.AVAX_FUJI
    ] as string,
    destinationDomain: DESTINATION_DOMAINS[SupportedChainId.AVAX_FUJI],
  },
  BASE_SEPOLIA: {
    chainId: SupportedChainId.BASE_SEPOLIA,
    usdcContract: CHAIN_IDS_TO_USDC_ADDRESSES[
      SupportedChainId.BASE_SEPOLIA
    ] as string,
    tokenMessenger: CHAIN_IDS_TO_TOKEN_MESSENGER[
      SupportedChainId.BASE_SEPOLIA
    ] as string,
    destinationDomain: DESTINATION_DOMAINS[SupportedChainId.BASE_SEPOLIA],
  },
  SONIC_BLAZE: {
    chainId: SupportedChainId.SONIC_BLAZE,
    usdcContract: CHAIN_IDS_TO_USDC_ADDRESSES[
      SupportedChainId.SONIC_BLAZE
    ] as string,
    tokenMessenger: CHAIN_IDS_TO_TOKEN_MESSENGER[
      SupportedChainId.SONIC_BLAZE
    ] as string,
    destinationDomain: DESTINATION_DOMAINS[SupportedChainId.SONIC_BLAZE],
  },
  LINEA_SEPOLIA: {
    chainId: SupportedChainId.LINEA_SEPOLIA,
    usdcContract: CHAIN_IDS_TO_USDC_ADDRESSES[
      SupportedChainId.LINEA_SEPOLIA
    ] as string,
    tokenMessenger: CHAIN_IDS_TO_TOKEN_MESSENGER[
      SupportedChainId.LINEA_SEPOLIA
    ] as string,
    destinationDomain: DESTINATION_DOMAINS[SupportedChainId.LINEA_SEPOLIA],
  },
  ARBITRUM_SEPOLIA: {
    chainId: SupportedChainId.ARBITRUM_SEPOLIA,
    usdcContract: CHAIN_IDS_TO_USDC_ADDRESSES[
      SupportedChainId.ARBITRUM_SEPOLIA
    ] as string,
    tokenMessenger: CHAIN_IDS_TO_TOKEN_MESSENGER[
      SupportedChainId.ARBITRUM_SEPOLIA
    ] as string,
    destinationDomain: DESTINATION_DOMAINS[SupportedChainId.ARBITRUM_SEPOLIA],
  },
  WORLDCHAIN_SEPOLIA: {
    chainId: SupportedChainId.WORLDCHAIN_SEPOLIA,
    usdcContract: CHAIN_IDS_TO_USDC_ADDRESSES[
      SupportedChainId.WORLDCHAIN_SEPOLIA
    ] as string,
    tokenMessenger: CHAIN_IDS_TO_TOKEN_MESSENGER[
      SupportedChainId.WORLDCHAIN_SEPOLIA
    ] as string,
    destinationDomain: DESTINATION_DOMAINS[SupportedChainId.WORLDCHAIN_SEPOLIA],
  },
  OPTIMISM_SEPOLIA: {
    chainId: SupportedChainId.OPTIMISM_SEPOLIA,
    usdcContract: CHAIN_IDS_TO_USDC_ADDRESSES[
      SupportedChainId.OPTIMISM_SEPOLIA
    ] as string,
    tokenMessenger: CHAIN_IDS_TO_TOKEN_MESSENGER[
      SupportedChainId.OPTIMISM_SEPOLIA
    ] as string,
    destinationDomain: DESTINATION_DOMAINS[SupportedChainId.OPTIMISM_SEPOLIA],
  },
  SOLANA_DEVNET: {
    chainId: SupportedChainId.SOLANA_DEVNET,
    usdcContract: CHAIN_IDS_TO_USDC_ADDRESSES[
      SupportedChainId.SOLANA_DEVNET
    ] as string,
    tokenMessenger: CHAIN_IDS_TO_TOKEN_MESSENGER[
      SupportedChainId.SOLANA_DEVNET
    ] as string,
    destinationDomain: DESTINATION_DOMAINS[SupportedChainId.SOLANA_DEVNET],
    messageTransmitter: CHAIN_IDS_TO_MESSAGE_TRANSMITTER[
      SupportedChainId.SOLANA_DEVNET
    ] as string,
  },
  CODEX_TESTNET: {
    chainId: SupportedChainId.CODEX_TESTNET,
    usdcContract: CHAIN_IDS_TO_USDC_ADDRESSES[
      SupportedChainId.CODEX_TESTNET
    ] as string,
    tokenMessenger: CHAIN_IDS_TO_TOKEN_MESSENGER[
      SupportedChainId.CODEX_TESTNET
    ] as string,
    destinationDomain: DESTINATION_DOMAINS[SupportedChainId.CODEX_TESTNET],
  },
  UNICHAIN_SEPOLIA: {
    chainId: SupportedChainId.UNICHAIN_SEPOLIA,
    usdcContract: CHAIN_IDS_TO_USDC_ADDRESSES[
      SupportedChainId.UNICHAIN_SEPOLIA
    ] as string,
    tokenMessenger: CHAIN_IDS_TO_TOKEN_MESSENGER[
      SupportedChainId.UNICHAIN_SEPOLIA
    ] as string,
    destinationDomain: DESTINATION_DOMAINS[SupportedChainId.UNICHAIN_SEPOLIA],
  },
  POLYGON_AMOY: {
    chainId: SupportedChainId.POLYGON_AMOY,
    usdcContract: CHAIN_IDS_TO_USDC_ADDRESSES[
      SupportedChainId.POLYGON_AMOY
    ] as string,
    tokenMessenger: CHAIN_IDS_TO_TOKEN_MESSENGER[
      SupportedChainId.POLYGON_AMOY
    ] as string,
    destinationDomain: DESTINATION_DOMAINS[SupportedChainId.POLYGON_AMOY],
  },
};
