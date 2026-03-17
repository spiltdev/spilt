import { type PublicClient, type WalletClient, type Hash } from "viem";
import { abis } from "../abis/index.js";
import type { ChainAddresses } from "../addresses.js";
import { write, read } from "../helpers.js";

/**
 * Wrap underlying tokens into VelocityTokens.
 */
export async function wrap(
  walletClient: WalletClient,
  addrs: ChainAddresses,
  amount: bigint,
): Promise<Hash> {
  return write(walletClient, {
    address: addrs.velocityToken, abi: abis.VelocityToken,
    functionName: "wrap", args: [amount],
  });
}

/**
 * Unwrap VelocityTokens back to underlying (at current decayed value).
 */
export async function unwrap(
  walletClient: WalletClient,
  addrs: ChainAddresses,
  amount: bigint,
): Promise<Hash> {
  return write(walletClient, {
    address: addrs.velocityToken, abi: abis.VelocityToken,
    functionName: "unwrap", args: [amount],
  });
}

/**
 * Force-apply idle decay to an account.
 */
export async function applyIdleDecay(
  walletClient: WalletClient,
  addrs: ChainAddresses,
  account: `0x${string}`,
): Promise<Hash> {
  return write(walletClient, {
    address: addrs.velocityToken, abi: abis.VelocityToken,
    functionName: "applyIdleDecay", args: [account],
  });
}

/**
 * Get the real balance after idle decay.
 */
export async function realBalanceOf(
  publicClient: PublicClient,
  addrs: ChainAddresses,
  account: `0x${string}`,
): Promise<bigint> {
  return read<bigint>(publicClient, {
    address: addrs.velocityToken, abi: abis.VelocityToken,
    functionName: "realBalanceOf", args: [account],
  });
}

/**
 * Get seconds the balance has been idle.
 */
export async function idleDuration(
  publicClient: PublicClient,
  addrs: ChainAddresses,
  account: `0x${string}`,
): Promise<bigint> {
  return read<bigint>(publicClient, {
    address: addrs.velocityToken, abi: abis.VelocityToken,
    functionName: "idleDuration", args: [account],
  });
}

/**
 * Check if an account is stream-exempt from decay.
 */
export async function isStreamExempt(
  publicClient: PublicClient,
  addrs: ChainAddresses,
  account: `0x${string}`,
): Promise<boolean> {
  return read<boolean>(publicClient, {
    address: addrs.velocityToken, abi: abis.VelocityToken,
    functionName: "isStreamExempt", args: [account],
  });
}
