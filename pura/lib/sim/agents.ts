import type { Hash } from "viem";

export const TASK_TYPE_ID: Hash =
  "0x726f757465720000000000000000000000000000000000000000000000000000";

export type ScenarioPhase = "RAMP" | "STEADY" | "SPIKE" | "SHOCK" | "RECOVER";

export interface AgentPersona {
  name: AgentName;
  label: string;
  color: string;
  declaredCapacity: bigint;
  actualCapacity: bigint;
  loadMultiplier: Record<ScenarioPhase, number>;
  completionRate: number;
}

export type AgentName = "atlas" | "beacon" | "cipher";

export const agents: Record<AgentName, AgentPersona> = {
  atlas: {
    name: "atlas",
    label: "Atlas",
    color: "#22c55e",
    declaredCapacity: 80n,
    actualCapacity: 80n,
    loadMultiplier: { RAMP: 0.3, STEADY: 0.5, SPIKE: 0.9, SHOCK: 1.0, RECOVER: 0.6 },
    completionRate: 0.95,
  },
  beacon: {
    name: "beacon",
    label: "Beacon",
    color: "#3b82f6",
    declaredCapacity: 40n,
    actualCapacity: 40n,
    loadMultiplier: { RAMP: 0.2, STEADY: 0.4, SPIKE: 0.95, SHOCK: 1.0, RECOVER: 0.5 },
    completionRate: 0.90,
  },
  cipher: {
    name: "cipher",
    label: "Cipher",
    color: "#ef4444",
    declaredCapacity: 50n,
    actualCapacity: 30n,
    loadMultiplier: { RAMP: 0.2, STEADY: 0.3, SPIKE: 0.7, SHOCK: 0.8, RECOVER: 0.3 },
    completionRate: 0.60,
  },
};

export const agentList: AgentName[] = ["atlas", "beacon", "cipher"];
