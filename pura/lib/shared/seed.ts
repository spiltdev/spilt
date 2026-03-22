/**
 * Deterministic seed data generators for all domains.
 * Wall-clock-derived values — same numbers for every visitor at a given moment.
 */

const EPOCH = 1_710_000_000_000; // ~2024-03-09, arbitrary fixed anchor

function wave(t: number, period: number, lo: number, hi: number): number {
  const mid = (lo + hi) / 2;
  const amp = (hi - lo) / 2;
  return Math.round(mid + amp * Math.sin((2 * Math.PI * t) / period));
}

/* ---- Relay types ---- */

export interface RelayInfo {
  pubkey: string;
  operator: string;
  capacity: string;
  registered: boolean;
}

export interface RelayState {
  relays: RelayInfo[];
  antiSpamMinimums: { write: string; read: string; store: string };
  totalRelays: number;
  chainId: number;
  seed?: boolean;
}

export function generateRelaySeedState(): RelayState {
  const t = Date.now() - EPOCH;
  const hoursSinceEpoch = t / 3_600_000;

  const relays: RelayInfo[] = [
    {
      pubkey: "0xa1c3e5f708192b3d4e6a8c0f2b4d6e8a1c3e5f708192b3d4e6a8c0f2b4d6e8a",
      operator: "0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf",
      capacity: wave(t, 300_000, 420, 580).toString(),
      registered: true,
    },
    {
      pubkey: "0xb2d4f6a809213c4e5f7b9d1a3c5e7f09213c4e5f7b9d1a3c5e7f09213c4e5f7b",
      operator: "0x2B5AD5c4795c026514f8317c7a215E218DcCD6cF",
      capacity: wave(t, 420_000, 260, 340).toString(),
      registered: true,
    },
    {
      pubkey: "0xc3e5f7b90a324d5e6f8a0c2d4e6f8a0b2d4f6a8c0e2a4c6e8f0a2c4e6a8c0e2",
      operator: "0x6813Eb9362372EEF6200f3b1dbC3f819671cBA69",
      capacity: wave(t, 540_000, 700, 860).toString(),
      registered: true,
    },
  ];

  return {
    relays,
    antiSpamMinimums: {
      write: wave(t, 600_000, 8, 14).toString(),
      read: wave(t, 750_000, 3, 7).toString(),
      store: wave(t, 900_000, 15, 25).toString(),
    },
    totalRelays: 3 + Math.floor(hoursSinceEpoch / 48),
    chainId: 84532,
  };
}

/* ---- Lightning types ---- */

export interface NodeInfo {
  pubkey: string;
  capacity: string;
  fee: string;
  active: boolean;
}

export interface LightningState {
  nodes: NodeInfo[];
  totalNodes: number;
  chainId: number;
  seed?: boolean;
}

export function generateLightningSeedState(): LightningState {
  const t = Date.now() - EPOCH;

  const nodes: NodeInfo[] = [
    {
      pubkey: "0xaa11bb22cc33dd44ee55ff6677889900aa11bb22cc33dd44ee55ff6677889900",
      capacity: wave(t, 360_000, 3_200_000, 5_800_000).toString(),
      fee: wave(t, 480_000, 12, 28).toString(),
      active: true,
    },
    {
      pubkey: "0xbb22cc33dd44ee55ff6677889900aa11bb22cc33dd44ee55ff6677889900aa11",
      capacity: wave(t, 450_000, 1_800_000, 3_400_000).toString(),
      fee: wave(t, 600_000, 18, 42).toString(),
      active: true,
    },
    {
      pubkey: "0xcc33dd44ee55ff6677889900aa11bb22cc33dd44ee55ff6677889900aa11bb22",
      capacity: wave(t, 540_000, 5_500_000, 8_200_000).toString(),
      fee: wave(t, 720_000, 10, 22).toString(),
      active: true,
    },
  ];

  return { nodes, totalNodes: 3, chainId: 84532 };
}

/* ---- Agent types ---- */

export interface AgentInfo {
  id: string;
  operator: string;
  skillTypeId: string;
  capacity: string;
  active: boolean;
  reputation: {
    score: string;
    completions: string;
    slashCount: string;
  } | null;
  measurabilityGap?: string;
  verifiedCompletions?: string;
  lastEvidenceHash?: string;
}

export interface ExplorerState {
  agents: AgentInfo[];
  totalAgents: number;
  protocolAvailable: boolean;
  chainId: number;
  seed?: boolean;
}

export function generateAgentSeedState(): ExplorerState {
  const t = Date.now() - EPOCH;
  const hoursSinceEpoch = t / 3_600_000;

  const agents: AgentInfo[] = [
    {
      id: "0x0000000000000000000000000000000000000000000000000000000000000001",
      operator: "0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf",
      skillTypeId: "0x0000000000000000000000000000000000000000000000000000000000000001",
      capacity: wave(t, 300_000, 80, 120).toString(),
      active: true,
      reputation: {
        score: wave(t, 600_000, 82, 94).toString(),
        completions: Math.floor(140 + hoursSinceEpoch * 1.2).toString(),
        slashCount: "0",
      },
      measurabilityGap: wave(t, 500_000, 5, 18).toString(),
    },
    {
      id: "0x0000000000000000000000000000000000000000000000000000000000000002",
      operator: "0x2B5AD5c4795c026514f8317c7a215E218DcCD6cF",
      skillTypeId: "0x0000000000000000000000000000000000000000000000000000000000000001",
      capacity: wave(t, 420_000, 60, 95).toString(),
      active: true,
      reputation: {
        score: wave(t, 480_000, 74, 88).toString(),
        completions: Math.floor(85 + hoursSinceEpoch * 0.8).toString(),
        slashCount: "1",
      },
      measurabilityGap: wave(t, 400_000, 22, 48).toString(),
    },
    {
      id: "0x0000000000000000000000000000000000000000000000000000000000000003",
      operator: "0x6813Eb9362372EEF6200f3b1dbC3f819671cBA69",
      skillTypeId: "0x0000000000000000000000000000000000000000000000000000000000000002",
      capacity: wave(t, 360_000, 150, 220).toString(),
      active: true,
      reputation: {
        score: wave(t, 540_000, 88, 96).toString(),
        completions: Math.floor(210 + hoursSinceEpoch * 1.5).toString(),
        slashCount: "0",
      },
      measurabilityGap: wave(t, 450_000, 3, 12).toString(),
    },
  ];

  return {
    agents,
    totalAgents: 3 + Math.floor(hoursSinceEpoch / 72),
    protocolAvailable: true,
    chainId: 84532,
  };
}

/* ---- Gateway types ---- */

export interface SinkState {
  name: string;
  configured: boolean;
  address?: string;
  units?: string;
  completionRate?: string;
  completions?: string;
  price?: string;
}

export interface GatewayState {
  providers: string[];
  sinks: SinkState[];
  pool: string | null;
  baseFee: string;
  chainId: number;
  keys: { total: number; totalRequests: number; withWallet: number };
  seed?: boolean;
}

export function generateGatewaySeedState(): GatewayState {
  const t = Date.now() - EPOCH;

  return {
    providers: ["openai", "anthropic"],
    sinks: [
      {
        name: "OpenAI",
        configured: true,
        units: wave(t, 300_000, 40, 60).toString(),
        completions: wave(t, 240_000, 1200, 1800).toString(),
        price: wave(t, 600_000, 8, 14).toString(),
      },
      {
        name: "Anthropic",
        configured: true,
        units: wave(t, 420_000, 45, 65).toString(),
        completions: wave(t, 360_000, 800, 1400).toString(),
        price: wave(t, 480_000, 10, 18).toString(),
      },
    ],
    pool: "0x8a100000000000000000000000000000000000006a",
    baseFee: wave(t, 600_000, 5, 15).toString(),
    chainId: 84532,
    keys: { total: wave(t, 900_000, 12, 28), totalRequests: wave(t, 180_000, 3400, 5600), withWallet: wave(t, 720_000, 4, 12) },
  };
}
