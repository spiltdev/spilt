import { type PublicClient, type WalletClient, type Hash } from "viem";
import { abis } from "../abis/index.js";
import type { ChainAddresses } from "../addresses.js";
import { write, read } from "../helpers.js";

/**
 * Register a child pool under a parent task type in the hierarchy.
 */
export async function registerChild(
  walletClient: WalletClient,
  addrs: ChainAddresses,
  parentTaskTypeId: Hash,
  childTaskTypeId: Hash,
): Promise<Hash> {
  return write(walletClient, {
    address: addrs.nestedPool, abi: abis.NestedPool,
    functionName: "registerChild", args: [parentTaskTypeId, childTaskTypeId],
  });
}

/**
 * Deregister a child pool from a parent task type.
 */
export async function deregisterChild(
  walletClient: WalletClient,
  addrs: ChainAddresses,
  parentTaskTypeId: Hash,
  childTaskTypeId: Hash,
): Promise<Hash> {
  return write(walletClient, {
    address: addrs.nestedPool, abi: abis.NestedPool,
    functionName: "deregisterChild", args: [parentTaskTypeId, childTaskTypeId],
  });
}

/**
 * Trigger a bottom-up hierarchical rebalance starting from a task type.
 */
export async function rebalanceHierarchy(
  walletClient: WalletClient,
  addrs: ChainAddresses,
  taskTypeId: Hash,
  maxDepth: bigint,
): Promise<Hash> {
  return write(walletClient, {
    address: addrs.nestedPool, abi: abis.NestedPool,
    functionName: "rebalanceHierarchy", args: [taskTypeId, maxDepth],
  });
}

/**
 * Check if a task type is a child of another.
 */
export async function isChildPool(
  publicClient: PublicClient,
  addrs: ChainAddresses,
  parentTaskTypeId: Hash,
  childTaskTypeId: Hash,
): Promise<boolean> {
  return read<boolean>(publicClient, {
    address: addrs.nestedPool, abi: abis.NestedPool,
    functionName: "isChildPool", args: [parentTaskTypeId, childTaskTypeId],
  });
}

/**
 * Get the effective capacity of a task type (includes child pool capacity).
 */
export async function getEffectiveCapacity(
  publicClient: PublicClient,
  addrs: ChainAddresses,
  taskTypeId: Hash,
): Promise<bigint> {
  return read<bigint>(publicClient, {
    address: addrs.nestedPool, abi: abis.NestedPool,
    functionName: "getEffectiveCapacity", args: [taskTypeId],
  });
}

/**
 * Get all child task type IDs for a parent.
 */
export async function getChildren(
  publicClient: PublicClient,
  addrs: ChainAddresses,
  parentTaskTypeId: Hash,
): Promise<Hash[]> {
  return read<Hash[]>(publicClient, {
    address: addrs.nestedPool, abi: abis.NestedPool,
    functionName: "getChildren", args: [parentTaskTypeId],
  });
}
