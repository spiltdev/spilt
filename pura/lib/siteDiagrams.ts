import type { DiagramProps } from "@/app/components/AnimatedDiagram";

export const HERO_DIAGRAM: DiagramProps = {
  nodes: [
    { id: "agent", label: "Your Agent", x: 0.1, y: 0.45, color: "#22d3ee", shape: "pill" },
    { id: "gateway", label: "Pura\nGateway", x: 0.3, y: 0.45, color: "#f97316", shape: "rect" },
    { id: "openai", label: "OpenAI", x: 0.6, y: 0.0, color: "#4ade80", shape: "rect" },
    { id: "anthropic", label: "Anthropic", x: 0.6, y: 0.3, color: "#a78bfa", shape: "rect" },
    { id: "groq", label: "Groq", x: 0.6, y: 0.6, color: "#f97316", shape: "rect" },
    { id: "gemini", label: "Gemini", x: 0.6, y: 0.9, color: "#3b82f6", shape: "rect" },
    {
      id: "lightning",
      label: "Lightning\nSettlement",
      x: 0.3,
      y: 0.95,
      color: "#fbbf24",
      shape: "diamond",
    },
    { id: "market", label: "Marketplace", x: 0.92, y: 0.45, color: "#22d3ee", shape: "pill" },
  ],
  edges: [
    { from: "agent", to: "gateway", color: "#22d3ee" },
    { from: "gateway", to: "openai", color: "#4ade80" },
    { from: "gateway", to: "anthropic", color: "#a78bfa" },
    { from: "gateway", to: "groq", color: "#f97316" },
    { from: "gateway", to: "gemini", color: "#3b82f6" },
    { from: "gateway", to: "lightning", color: "#fbbf24", dashed: true },
    { from: "gateway", to: "market", color: "#22d3ee", dashed: true },
    { from: "market", to: "agent", color: "#22d3ee", dashed: true },
  ],
  groups: [
    {
      id: "providers",
      label: "LLM PROVIDERS",
      x: 0.58,
      y: 0.05,
      w: 0.04,
      h: 0.8,
      color: "#808090",
    },
  ],
  height: 300,
  direction: "LR",
  ariaLabel: "Agent routing through Pura Gateway to LLM providers with Lightning settlement",
};

export const PRODUCT_GRAPH_DIAGRAM: DiagramProps = {
  nodes: [
    { id: "gateway", label: "Gateway\nAPI", x: 0.5, y: 0.1, color: "#f97316", shape: "rect" },
    { id: "openclaw", label: "OpenClaw\nSkill", x: 0.2, y: 0.1, color: "#22d3ee", shape: "pill" },
    { id: "lightning", label: "Lightning\nSettle", x: 0.8, y: 0.1, color: "#fbbf24", shape: "diamond" },
    { id: "contracts", label: "Smart\nContracts", x: 0.5, y: 0.55, color: "#a78bfa", shape: "rect" },
    { id: "dashboard", label: "Dashboard", x: 0.82, y: 0.55, color: "#4ade80", shape: "rect" },
    { id: "bitrecipes", label: "bit.recipes", x: 0.18, y: 0.55, color: "#f87171", shape: "pill" },
    { id: "vrdev", label: "vr.dev", x: 0.18, y: 0.9, color: "#f87171", shape: "pill" },
    { id: "nostr", label: "Nostr\nRelays", x: 0.82, y: 0.9, color: "#a78bfa", shape: "rect" },
    { id: "base", label: "Base L2", x: 0.5, y: 0.9, color: "#3b82f6", shape: "rect" },
  ],
  edges: [
    { from: "openclaw", to: "gateway", color: "#22d3ee" },
    { from: "gateway", to: "lightning", color: "#fbbf24" },
    { from: "gateway", to: "contracts", color: "#f97316" },
    { from: "gateway", to: "dashboard", color: "#4ade80", dashed: true },
    { from: "bitrecipes", to: "gateway", color: "#f87171" },
    { from: "contracts", to: "base", color: "#a78bfa" },
    { from: "contracts", to: "nostr", color: "#a78bfa", dashed: true },
    { from: "vrdev", to: "contracts", color: "#f87171", dashed: true },
    { from: "lightning", to: "contracts", color: "#fbbf24", dashed: true },
  ],
  groups: [
    { id: "onchain", label: "ON-CHAIN", x: 0.48, y: 0.6, w: 0.04, h: 0.3, color: "#a78bfa" },
    { id: "offchain", label: "OFF-CHAIN", x: 0.2, y: 0.02, w: 0.6, h: 0.04, color: "#808090" },
  ],
  height: 340,
  direction: "TB",
  ariaLabel: "Pura product ecosystem: how Gateway, OpenClaw, Lightning, contracts, and tools interact",
};