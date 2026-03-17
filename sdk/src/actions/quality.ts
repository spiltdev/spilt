import { type PublicClient, type WalletClient, type Hash } from "viem";
import { abis } from "../abis/index.js";
import type { ChainAddresses } from "../addresses.js";
import { write, read } from "../helpers.js";

export type QualityMetrics = {
  completionRate: bigint;
  avgLatencyMs: bigint;
  errorRateBps: bigint;
  satisfactionBps: bigint;
  qualityScore: bigint;
  lastUpdated: bigint;
};

/**
 * Report task completion latency for a sink.
 */
export async function reportLatency(
  walletClient: WalletClient,
  addrs: ChainAddresses,
  taskTypeId: Hash,
  sink: `0x${string}`,
  latencyMs: bigint,
): Promise<Hash> {
  return write(walletClient, {
    address: addrs.qualityOracle, abi: abis.QualityOracle,
    functionName: "reportLatency", args: [taskTypeId, sink, latencyMs],
  });
}

/**
 * Report a task error for a sink.
 */
export async function reportError(
  walletClient: WalletClient,
  addrs: ChainAddresses,
  taskTypeId: Hash,
  sink: `0x${string}`,
  taskId: Hash,
): Promise<Hash> {
  return write(walletClient, {
    address: addrs.qualityOracle, abi: abis.QualityOracle,
    functionName: "reportError", args: [taskTypeId, sink, taskId],
  });
}

/**
 * Report consumer satisfaction score (0-10000 BPS).
 */
export async function reportSatisfaction(
  walletClient: WalletClient,
  addrs: ChainAddresses,
  taskTypeId: Hash,
  sink: `0x${string}`,
  scoreBps: bigint,
): Promise<Hash> {
  return write(walletClient, {
    address: addrs.qualityOracle, abi: abis.QualityOracle,
    functionName: "reportSatisfaction", args: [taskTypeId, sink, scoreBps],
  });
}

/**
 * Compute and update the composite quality score for a sink.
 */
export async function computeQuality(
  walletClient: WalletClient,
  addrs: ChainAddresses,
  taskTypeId: Hash,
  sink: `0x${string}`,
): Promise<Hash> {
  return write(walletClient, {
    address: addrs.qualityOracle, abi: abis.QualityOracle,
    functionName: "computeQuality", args: [taskTypeId, sink],
  });
}

/**
 * Get the full quality metrics for a sink.
 */
export async function getQualityMetrics(
  publicClient: PublicClient,
  addrs: ChainAddresses,
  taskTypeId: Hash,
  sink: `0x${string}`,
): Promise<QualityMetrics> {
  return read<QualityMetrics>(publicClient, {
    address: addrs.qualityOracle, abi: abis.QualityOracle,
    functionName: "getQualityMetrics", args: [taskTypeId, sink],
  });
}

/**
 * Get the composite quality score (0-10000 BPS).
 */
export async function getQualityScore(
  publicClient: PublicClient,
  addrs: ChainAddresses,
  taskTypeId: Hash,
  sink: `0x${string}`,
): Promise<bigint> {
  return read<bigint>(publicClient, {
    address: addrs.qualityOracle, abi: abis.QualityOracle,
    functionName: "getQualityScore", args: [taskTypeId, sink],
  });
}

/**
 * Get the quality-weighted effective capacity.
 */
export async function getEffectiveCapacity(
  publicClient: PublicClient,
  addrs: ChainAddresses,
  taskTypeId: Hash,
  sink: `0x${string}`,
): Promise<bigint> {
  return read<bigint>(publicClient, {
    address: addrs.qualityOracle, abi: abis.QualityOracle,
    functionName: "getEffectiveCapacity", args: [taskTypeId, sink],
  });
}
