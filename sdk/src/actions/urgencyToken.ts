import { type PublicClient, type WalletClient, type Hash } from "viem";
import { abis } from "../abis/index.js";
import type { ChainAddresses } from "../addresses.js";
import { write, read } from "../helpers.js";

export type Deposit = {
  owner: `0x${string}`;
  amount: bigint;
  expiry: bigint;
  consumed: boolean;
};

/**
 * Mint urgency tokens with a TTL. Underlying tokens are locked.
 */
export async function mint(
  walletClient: WalletClient,
  addrs: ChainAddresses,
  amount: bigint,
  ttlSeconds: bigint,
): Promise<Hash> {
  return write(walletClient, {
    address: addrs.urgencyToken, abi: abis.UrgencyToken,
    functionName: "mint", args: [amount, ttlSeconds],
  });
}

/**
 * Consume an urgency deposit by routing it to a sink (authorized consumers only).
 */
export async function consume(
  walletClient: WalletClient,
  addrs: ChainAddresses,
  depositId: bigint,
  sink: `0x${string}`,
): Promise<Hash> {
  return write(walletClient, {
    address: addrs.urgencyToken, abi: abis.UrgencyToken,
    functionName: "consume", args: [depositId, sink],
  });
}

/**
 * Burn an expired deposit.
 */
export async function burn(
  walletClient: WalletClient,
  addrs: ChainAddresses,
  depositId: bigint,
): Promise<Hash> {
  return write(walletClient, {
    address: addrs.urgencyToken, abi: abis.UrgencyToken,
    functionName: "burn", args: [depositId],
  });
}

/**
 * Batch-burn expired deposits.
 */
export async function batchBurn(
  walletClient: WalletClient,
  addrs: ChainAddresses,
  depositIds: bigint[],
): Promise<Hash> {
  return write(walletClient, {
    address: addrs.urgencyToken, abi: abis.UrgencyToken,
    functionName: "batchBurn", args: [depositIds],
  });
}

/**
 * Get deposit details.
 */
export async function getDeposit(
  publicClient: PublicClient,
  addrs: ChainAddresses,
  depositId: bigint,
): Promise<Deposit> {
  return read<Deposit>(publicClient, {
    address: addrs.urgencyToken, abi: abis.UrgencyToken,
    functionName: "getDeposit", args: [depositId],
  });
}

/**
 * Check if a deposit has expired.
 */
export async function isExpired(
  publicClient: PublicClient,
  addrs: ChainAddresses,
  depositId: bigint,
): Promise<boolean> {
  return read<boolean>(publicClient, {
    address: addrs.urgencyToken, abi: abis.UrgencyToken,
    functionName: "isExpired", args: [depositId],
  });
}

/**
 * Get remaining TTL in seconds (0 if expired).
 */
export async function remainingTTL(
  publicClient: PublicClient,
  addrs: ChainAddresses,
  depositId: bigint,
): Promise<bigint> {
  return read<bigint>(publicClient, {
    address: addrs.urgencyToken, abi: abis.UrgencyToken,
    functionName: "remainingTTL", args: [depositId],
  });
}

/**
 * Get total active urgency deposits.
 */
export async function totalActive(
  publicClient: PublicClient,
  addrs: ChainAddresses,
): Promise<bigint> {
  return read<bigint>(publicClient, {
    address: addrs.urgencyToken, abi: abis.UrgencyToken,
    functionName: "totalActive",
  });
}

/**
 * Get total burned urgency deposits.
 */
export async function totalBurned(
  publicClient: PublicClient,
  addrs: ChainAddresses,
): Promise<bigint> {
  return read<bigint>(publicClient, {
    address: addrs.urgencyToken, abi: abis.UrgencyToken,
    functionName: "totalBurned",
  });
}
