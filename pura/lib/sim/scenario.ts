import type { ScenarioPhase } from "./agents";

interface PhaseConfig {
  duration: number;
  flowRateMultiplier: number;
}

const PHASES: Record<ScenarioPhase, PhaseConfig> = {
  RAMP:    { duration: 10, flowRateMultiplier: 0.5 },
  STEADY:  { duration: 20, flowRateMultiplier: 1.0 },
  SPIKE:   { duration: 10, flowRateMultiplier: 2.0 },
  SHOCK:   { duration: 5,  flowRateMultiplier: 3.0 },
  RECOVER: { duration: 15, flowRateMultiplier: 0.7 },
};

const PHASE_ORDER: ScenarioPhase[] = ["RAMP", "STEADY", "SPIKE", "SHOCK", "RECOVER"];
const CYCLE_LENGTH = PHASE_ORDER.reduce((sum, p) => sum + PHASES[p].duration, 0);

export interface ScenarioState {
  phase: ScenarioPhase;
  tickInPhase: number;
  tickInCycle: number;
  flowRateMultiplier: number;
}

export function getScenarioState(tickNumber: number): ScenarioState {
  const tickInCycle = tickNumber % CYCLE_LENGTH;

  let elapsed = 0;
  for (const phase of PHASE_ORDER) {
    const config = PHASES[phase];
    if (tickInCycle < elapsed + config.duration) {
      return {
        phase,
        tickInPhase: tickInCycle - elapsed,
        tickInCycle,
        flowRateMultiplier: config.flowRateMultiplier,
      };
    }
    elapsed += config.duration;
  }

  return {
    phase: "RAMP",
    tickInPhase: 0,
    tickInCycle,
    flowRateMultiplier: 0.5,
  };
}

export const BASE_FLOW_RATE = 1000000000000000n;

export function getFlowRate(scenario: ScenarioState): bigint {
  return BigInt(Math.floor(Number(BASE_FLOW_RATE) * scenario.flowRateMultiplier));
}
