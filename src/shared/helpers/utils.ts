import {
  Blockchain,
  FeeLevel,
  generateEntitySecret,
  initiateDeveloperControlledWalletsClient,
  registerEntitySecretCiphertext,
} from "@circle-fin/developer-controlled-wallets";
import envConfig, { isDev, isProd } from "../configs/env.config";
import {
  blockChains,
  CHAIN_IDS_TO_TOKEN_MESSENGER,
  CHAIN_IDS_TO_USDC_ADDRESSES,
  chainConfigs,
} from "./chains.helper";
import * as crypto from "crypto";
import { createCircleClient } from "@circle-fin/usdckit";
import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import {
  decodeNonceFromMessage,
  evmAddressToBytes32,
  getAnchorConnection,
  getDepositForBurnPdas,
  getMessages,
  getPrograms,
  getReceiveMessagePdas,
  solanaAddressToHex,
} from "./solana.helper";
import { BN } from "@coral-xyz/anchor";
import { getAssociatedTokenAddress } from "@solana/spl-token";

const entitySecret = envConfig.circle.entityKey || generateEntitySecret();
console.log("Generated Entity Secret:", entitySecret);

async function registerEntitySecret() {
  const apiKey = isProd()
    ? envConfig.circle.apiKeyProd
    : envConfig.circle.apiKeyTest;
  try {
    const response = await registerEntitySecretCiphertext({
      apiKey,
      entitySecret,
    });
    console.log("Entity Secret registered successfully:", response.data);
  } catch (error) {
    console.error("Error registering Entity Secret:", error);
    throw error;
  }
}

// Commented out after first run
// registerEntitySecret();

export async function createTreasuryWallet(organisationName: string) {
  const client = initiateDeveloperControlledWalletsClient({
    apiKey: isProd()
      ? envConfig.circle.apiKeyProd
      : envConfig.circle.apiKeyTest,
    entitySecret,
    baseUrl: isProd()
      ? "https://api.circle.com"
      : "https://api-sandbox.circle.com",
  });

  const walletSetResponse = await client.createWalletSet({
    name: `${organisationName} - Payroll Treasury Wallet`,
  });

  const walletSetId = walletSetResponse.data?.walletSet?.id;

  const walletsResponse = await client.createWallets({
    blockchains: isProd() ? ["BASE", "SOL"] : ["BASE-SEPOLIA", "SOL-DEVNET"],
    // blockchains: ["SOL-DEVNET", "BASE-SEPOLIA"],
    count: 1,
    walletSetId,
  });

  return {
    base: walletsResponse.data?.wallets[0],
    sol: walletsResponse.data?.wallets[1],
  };
}

export async function createUserWallet(
  username: string,
  blockchain: Blockchain
) {
  const client = initiateDeveloperControlledWalletsClient({
    apiKey: isProd()
      ? envConfig.circle.apiKeyProd
      : envConfig.circle.apiKeyTest,
    entitySecret,
    baseUrl: isProd()
      ? "https://api.circle.com"
      : "https://api-sandbox.circle.com",
  });

  const walletSetResponse = await client.createWalletSet({
    name: `${username} - Payroll Treasury`,
  });

  const walletSetId = walletSetResponse.data?.walletSet?.id;

  const walletsResponse = await client.createWallets({
    blockchains: [blockchain],
    count: 1,
    walletSetId,
  });

  return walletsResponse.data?.wallets[0];
}

export async function transferUSDC(
  treasuryWalletId: string,
  recipientAddress: string,
  amount: string,
  sourceChain: string,
  destinationChain: string
) {
  const client = createCircleClient({
    apiKey: isProd()
      ? envConfig.circle.apiKeyProd
      : envConfig.circle.apiKeyTest,
    entitySecret: entitySecret || envConfig.circle.entityKey,
  });

  if (sourceChain === "SOL" || "SOL-DEVNET") {
    // Solana-specific transfer logic
    const keypair = Keypair.fromSecretKey(
      Buffer.from(envConfig.solana.key, "base64")
    ); // Load securely
    const provider = getAnchorConnection(keypair);
    const { messageTransmitterProgram, tokenMessengerMinterProgram } =
      getPrograms(provider);
    const usdcAddress = new PublicKey(chainConfigs[sourceChain].usdcContract);
    const destinationDomain = chainConfigs[destinationChain].destinationDomain;

    // Get PDAs for depositForBurn
    const pdas = getDepositForBurnPdas(
      { messageTransmitterProgram, tokenMessengerMinterProgram },
      usdcAddress,
      destinationDomain
    );

    // Convert recipient address to bytes32 for EVM destination chains
    const recipientBytes32 =
      destinationChain !== "SOL" || "SOL-DEVNET"
        ? evmAddressToBytes32(recipientAddress)
        : solanaAddressToHex(recipientAddress);

    // Approve and burn USDC on Solana
    const burnTx = await tokenMessengerMinterProgram.methods
      .depositForBurn(
        new BN(amount),
        recipientBytes32,
        new BN(destinationDomain),
        usdcAddress
      )
      .accounts({
        // owner: provider.wallet.publicKey,
        eventRentPayer: provider.wallet.publicKey,
        burnTokenMint: usdcAddress,
        messageTransmitter: pdas.messageTransmitterAccount.publicKey,
        messageSentEventData: Keypair.generate().publicKey,
        program: tokenMessengerMinterProgram.programId,
        tokenMessenger: pdas.tokenMessengerAccount.publicKey,
        tokenMinter: pdas.tokenMinterAccount.publicKey,
        // localToken: pdas.localToken.publicKey,
        remoteTokenMessenger: pdas.remoteTokenMessengerKey.publicKey,
        burnTokenAccount: await getAssociatedTokenAddress(
          usdcAddress,
          provider.wallet.publicKey
        ),
      })
      .transaction();

    const burnTxHash = await provider.sendAndConfirm(burnTx);

    // Fetch attestation using getMessages
    const attestationResponse = await getMessages(burnTxHash);
    console.log(
      "Attestation Response:",
      JSON.stringify(attestationResponse, null, 2)
    );
    const message = attestationResponse.messages[0].message;
    const attestation = attestationResponse.messages[0].attestation;

    // If destination is Solana, mint on Solana; otherwise, mint on destination chain
    if (destinationChain === "SOL" || "SOL-DEVNET") {
      const nonce = decodeNonceFromMessage(message);
      const receivePdas = await getReceiveMessagePdas(
        { messageTransmitterProgram, tokenMessengerMinterProgram },
        usdcAddress,
        chainConfigs[sourceChain].usdcContract,
        chainConfigs[sourceChain].destinationDomain.toString(),
        nonce
      );

      // Check available methods if receiveMessage fails
      console.log(
        "TokenMessengerMinter methods:",
        Object.keys(tokenMessengerMinterProgram.methods)
      );

      const mintTx = await tokenMessengerMinterProgram.methods
        .handleReceiveFinalizedMessage(message, attestation)
        .accounts({
          tokenPair: receivePdas.tokenPair.publicKey,
          program: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
          recipientTokenAccount: await getAssociatedTokenAddress(
            usdcAddress,
            new PublicKey(recipientAddress)
          ),
          remoteTokenMessenger: receivePdas.remoteTokenMessengerKey.publicKey,
          tokenMessenger: receivePdas.tokenMessengerAccount.publicKey,
          tokenMinter: receivePdas.tokenMinterAccount.publicKey,
        })
        .transaction();

      const mintTxHash = await provider.sendAndConfirm(mintTx);
      console.log("Transfer Complete:", { burnTxHash, mintTxHash });
      return { burnTxHash, mintTxHash };
    } else {
      // Mint on EVM chain
      const mintResponse = await client.createContractExecutionTransaction({
        walletId: treasuryWalletId,
        contractAddress: chainConfigs[destinationChain].tokenMessenger,
        abiFunctionSignature: "receiveMessage(bytes,bytes)",
        abiParameters: [message, attestation],
        fee: {
          type: "absolute",
          config: {
            maxFee: "10000",
            priorityFee: "100",
            gasLimit: "10000",
          },
        },
      });

      console.log("mintResponse:", JSON.stringify(mintResponse, null, 2));
      console.log("Transfer Complete:", mintResponse);
      return mintResponse;
    }
  } else {
    // EVM chain transfer logic
    // Approve TokenMessenger to burn USDC
    const approveResponse = await client.createContractExecutionTransaction({
      walletId: treasuryWalletId,
      contractAddress: chainConfigs[sourceChain].tokenMessenger,
      abiFunctionSignature: "approve(address,uint256)",
      abiParameters: [chainConfigs[sourceChain].usdcContract, amount],
      fee: {
        type: "absolute",
        config: {
          maxFee: "10000",
          priorityFee: "100",
          gasLimit: "10000",
        },
      },
    });

    console.log("approveResponse:", JSON.stringify(approveResponse, null, 2));

    // Burn USDC on source chain
    const burnResponse = await client.createContractExecutionTransaction({
      walletId: treasuryWalletId,
      contractAddress: chainConfigs[sourceChain].tokenMessenger,
      abiFunctionSignature: "depositForBurn(uint256,bytes32,uint32,address)",
      abiParameters: [
        amount,
        destinationChain === "SOL" || "SOL-DEVNET"
          ? solanaAddressToHex(recipientAddress)
          : evmAddressToBytes32(recipientAddress),
        chainConfigs[destinationChain].destinationDomain,
        chainConfigs[sourceChain].usdcContract,
      ],
      fee: {
        type: "absolute",
        config: {
          maxFee: "10000",
          priorityFee: "100",
          gasLimit: "10000",
        },
      },
    });

    console.log("burnResponse:", JSON.stringify(burnResponse, null, 2));

    // Fetch attestation using getMessages
    const attestationResponse = await getMessages(burnResponse.txHash);
    console.log(
      "Attestation Response:",
      JSON.stringify(attestationResponse, null, 2)
    );
    const message = attestationResponse.messages[0].message;
    const attestation = attestationResponse.messages[0].attestation;

    // Mint USDC on destination chain
    if (destinationChain !== "SOL" || "SOL-DEVNET") {
      const mintResponse = await client.createContractExecutionTransaction({
        walletId: treasuryWalletId,
        contractAddress: chainConfigs[destinationChain].tokenMessenger,
        abiFunctionSignature: "receiveMessage(bytes,bytes)",
        abiParameters: [message, attestation],
        fee: {
          type: "absolute",
          config: {
            maxFee: "10000",
            priorityFee: "100",
            gasLimit: "10000",
          },
        },
      });

      console.log("mintResponse:", JSON.stringify(mintResponse, null, 2));
      console.log("Transfer Complete:", mintResponse);
      return mintResponse;
    } else {
      // Mint on Solana
      const keypair = Keypair.fromSecretKey(
        Buffer.from(envConfig.solana.key, "hex")
      );
      const provider = getAnchorConnection(keypair);
      const { messageTransmitterProgram, tokenMessengerMinterProgram } =
        getPrograms(provider);
      const usdcAddress = new PublicKey(
        chainConfigs[destinationChain].usdcContract
      );
      const nonce = decodeNonceFromMessage(message);
      const receivePdas = await getReceiveMessagePdas(
        { messageTransmitterProgram, tokenMessengerMinterProgram },
        usdcAddress,
        chainConfigs[sourceChain].usdcContract,
        chainConfigs[sourceChain].destinationDomain.toString(),
        nonce
      );

      console.log(
        "TokenMessengerMinter methods:",
        Object.keys(tokenMessengerMinterProgram.methods)
      );

      const mintTx = await tokenMessengerMinterProgram.methods
        .handleReceiveFinalizedMessage(message, attestation) // Replace with correct method name from IDL
        .accounts({
          program: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
          recipientTokenAccount: await getAssociatedTokenAddress(
            usdcAddress,
            new PublicKey(recipientAddress)
          ),
          remoteTokenMessenger: receivePdas.remoteTokenMessengerKey.publicKey,
          tokenMessenger: receivePdas.tokenMessengerAccount.publicKey,
          tokenMinter: receivePdas.tokenMinterAccount.publicKey,
          tokenPair: receivePdas.tokenPair.publicKey,
        })
        .transaction();

      const mintTxHash = await provider.sendAndConfirm(mintTx);
      console.log("Transfer Complete:", {
        burnTxHash: burnResponse.txHash,
        mintTxHash,
      });
      return { burnTxHash: burnResponse.txHash, mintTxHash };
    }
  }
}

async function disbursePayroll(
  employeeWallets: any[],
  amountPerEmployee: string,
  treasuryWalletId: string,
  entityKey: string
) {
  for (const { address, chain } of employeeWallets) {
    await transferUSDC(
      treasuryWalletId,
      address,
      amountPerEmployee,
      "BASE",
      chain
    );
    console.log(
      `Disbursed ${amountPerEmployee} USDC to ${address} on ${chain}`
    );
  }
}

export async function getWalletBalances(
  address: string,
  blockchain: Blockchain,
  tokenAddress?: string
): Promise<any | null> {
  const client = initiateDeveloperControlledWalletsClient({
    apiKey: envConfig.circle.apiKeyProd,
    entitySecret,
    baseUrl: isProd()
      ? "https://api.circle.com"
      : "https://api-sandbox.circle.com",
  });

  try {
    const response = await client.getWalletsWithBalances({
      blockchain,
      address,
      tokenAddress,
    });

    const tokenBalances = (response.data.wallets[0] as any).tokenBalances;

    console.log(JSON.stringify(tokenBalances));

    if (!tokenBalances) {
      console.error(
        `Wallet with address ${address} not found or has no balances.`
      );
      return "0.0000";
    }

    const usdcToken = tokenBalances.find(
      (balance: any) => balance.token.symbol === "USDC"
    );

    if (usdcToken) {
      console.log(`Balances for wallet address ${address}:`, usdcToken);
      return usdcToken.amount || "0.0000";
    } else {
      console.log(`USDC balance not found for wallet address ${address}.`);
      return "0.0000";
    }
  } catch (error) {
    console.error(
      `Error fetching balances for wallet address ${address}:`,
      error
    );
    return null;
  }
}
