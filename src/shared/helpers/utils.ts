import {
  Blockchain,
  FeeLevel,
  initiateDeveloperControlledWalletsClient,
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
import * as forge from "node-forge";

export function generateOrgEntityKey() {
  const entitySecretBytes = crypto.randomBytes(32);

  // Convert the bytes to a hexadecimal string
  const entitySecretHex = entitySecretBytes.toString("hex");

  return entitySecretHex;
}

async function getCirclePublicKey(apiKey: string): Promise<string> {
  const baseUrl = isDev()
    ? "https://api.circle.com"
    : "https://api-sandbox.circle.com";
  const response = await fetch(`${baseUrl}/v1/w3s/config/entity/publicKey`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Error fetching Circle public key:", errorData);
    throw new Error(
      `Failed to fetch Circle public key: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  // The public key is typically in PEM format
  return data.data.publicKey;
}

export function encryptEntitySecret(
  entitySecret: string,
  publicKeyPem: string
): string {
  const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
  const buffer = forge.util.createBuffer(forge.util.hexToBytes(entitySecret));
  // RSAES-OAEP with SHA256 and MGF1 with SHA256 (as per Circle's documentation)
  const encryptedBytes = publicKey.encrypt(buffer.getBytes(), "RSAES-OAEP", {
    md: forge.md.sha256.create(),
    mgf1: forge.mgf1.create(forge.md.sha256.create()),
  });
  // Base64 encode the ciphertext
  return forge.util.encode64(encryptedBytes);
}

async function registerEntitySecretCiphertext(
  apiKey: string,
  entitySecretCiphertext: string,
  recoveryFilePassword?: string
): Promise<any> {
  const baseUrl = isDev()
    ? "https://api.circle.com"
    : "https://api-sandbox.circle.com";
  const payload: any = {
    entitySecretCiphertext: entitySecretCiphertext,
  };
  if (recoveryFilePassword) {
    payload.recoveryFilePassword = recoveryFilePassword;
  }

  const response = await fetch(`${baseUrl}/v1/w3s/config/entitySecret`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Error registering Entity Secret Ciphertext:", errorData);
    throw new Error(
      `Failed to register Entity Secret Ciphertext: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  console.log("Entity Secret Ciphertext registered successfully:", data);
  // The response might contain a recoveryFile field if requested
  return data;
}

export async function createTreasuryWallet(
  organisationName: string,
  entityKey: string,
  organisationId: string
) {
  const circlePublicKey = await getCirclePublicKey(envConfig.circle.apiKeyProd);
  console.log("Fetched Circle Public Key.");

  const entitySecretCiphertext = encryptEntitySecret(
    entityKey,
    circlePublicKey
  );

  console.log("Generated Entity Secret Ciphertext.");

  const registrationResponse = await registerEntitySecretCiphertext(
    envConfig.circle.apiKeyProd,
    entitySecretCiphertext
    // Optional: provide a password for recovery file generation
    // crypto.randomBytes(16).toString('hex') // Example: generate a random password
  );

  console.log(
    "Entity Secret Ciphertext registration complete: ",
    registrationResponse
  );

  const client = initiateDeveloperControlledWalletsClient({
    apiKey: envConfig.circle.apiKeyProd,
    entitySecret: entityKey || envConfig.circle.entityKey,
    baseUrl: isDev()
      ? "https://api.circle.com"
      : "https://api-sandbox.circle.com",
  });

  // Create a wallet set
  const walletSetResponse = await client.createWalletSet({
    name: `${organisationName} - Payroll Treasury`,
  });
  const walletSetId = walletSetResponse.data?.walletSet?.id;

  // Create treasury wallet on multiple chains
  const walletsResponse = await client.createWallets({
    blockchains: blockChains as Blockchain[],
    count: 1,
    walletSetId,
  });

  console.log("Treasury Wallet:", walletsResponse.data?.wallets[0]);
  return walletsResponse.data?.wallets[0];
}

async function transferUSDC(
  treasuryWalletId: string,
  recipientAddress: string,
  amount: string,
  sourceChain: string,
  destinationChain: string,
  entityKey: string
) {
  const client = createCircleClient({
    apiKey: envConfig.circle.apiKeyProd,
    entitySecret: entityKey || envConfig.circle.entityKey,
  });

  if (sourceChain === "SOLANA_DEVNET") {
    // Solana-specific transfer logic
    const keypair = Keypair.fromSecretKey(
      Buffer.from(envConfig.solana.key, "hex")
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
      destinationChain !== "SOLANA_DEVNET"
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
    if (destinationChain === "SOLANA_DEVNET") {
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
        destinationChain === "SOLANA_DEVNET"
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
    if (destinationChain !== "SOLANA_DEVNET") {
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
      "ETH-SEPOLIA",
      chain,
      entityKey
    );
    console.log(
      `Disbursed ${amountPerEmployee} USDC to ${address} on ${chain}`
    );
  }
}
