import type { DiagramProps } from "@/app/components/AnimatedDiagram";
import type { SequenceProps } from "@/app/components/AnimatedSequence";
import {
  bufferDiagram,
  circuitBreakerSequence,
  demurrageDiagram,
  domainsDiagram,
  dvmAdapterDiagram,
  fiveObjectsDiagram,
  fourPlanesDiagram,
  lightningDiagram,
  nostrDiagram,
  openclawSequence,
  pipelineDiagram,
  priceDiagram,
  problemDiagram,
  reputationDiagram,
  routeDiagram,
  settlementRailsDiagram,
  shadowModeDiagram,
  solutionDiagram,
  stakeDiagram,
  thermoDiagram,
  verifySequence,
} from "@/app/explainer/diagrams";
import { HERO_DIAGRAM, PRODUCT_GRAPH_DIAGRAM } from "@/lib/siteDiagrams";

export interface DiagramLocation {
  href: string;
  label: string;
}

interface DiagramCatalogBase {
  id: string;
  title: string;
  summary: string;
  category: "product" | "core" | "thermo" | "domains";
  locations: DiagramLocation[];
}

interface DiagramCatalogDiagram extends DiagramCatalogBase {
  kind: "diagram";
  diagram: DiagramProps;
}

interface DiagramCatalogSequence extends DiagramCatalogBase {
  kind: "sequence";
  sequence: SequenceProps;
}

export type DiagramCatalogEntry = DiagramCatalogDiagram | DiagramCatalogSequence;

export const DIAGRAM_CATEGORIES = [
  { id: "product", label: "Product surfaces" },
  { id: "core", label: "Core protocol" },
  { id: "thermo", label: "Thermodynamic layer" },
  { id: "domains", label: "Domain adapters" },
] as const;

export const DIAGRAM_CATALOG: DiagramCatalogEntry[] = [
  {
    id: "homepage-gateway-routing",
    title: "Gateway routing overview",
    summary:
      "This is the homepage opener. It shows the shortest explanation of the hosted product: one agent, one gateway, four providers, Lightning on the back end, and a marketplace loop when your own agent starts earning.",
    category: "product",
    kind: "diagram",
    diagram: HERO_DIAGRAM,
    locations: [{ href: "/", label: "Homepage hero" }],
  },
  {
    id: "product-ecosystem",
    title: "Product ecosystem map",
    summary:
      "This is the whole stack in one frame. It shows how the gateway, OpenClaw skill, Lightning settlement, contracts, dashboard, and reference apps fit together without forcing you to read five pages first.",
    category: "product",
    kind: "diagram",
    diagram: PRODUCT_GRAPH_DIAGRAM,
    locations: [
      { href: "/", label: "Homepage: how the pieces fit" },
      { href: "/docs/products", label: "Docs: products" },
    ],
  },
  {
    id: "problem-diagram",
    title: "Payment keeps flowing after free capacity is gone",
    summary:
      "This is the failure case Pura is built around. Work and money keep moving into a saturated service because ordinary payment rails do not carry a live capacity signal.",
    category: "core",
    kind: "diagram",
    diagram: problemDiagram,
    locations: [{ href: "/explainer#the-problem", label: "Explainer: the problem" }],
  },
  {
    id: "solution-diagram",
    title: "Backpressure reroutes payment toward spare capacity",
    summary:
      "This is the protocol answer to the overload problem. Payment share shifts toward sinks that still have room instead of blindly paying whoever was chosen first.",
    category: "core",
    kind: "diagram",
    diagram: solutionDiagram,
    locations: [{ href: "/explainer#the-problem", label: "Explainer: protocol answer" }],
  },
  {
    id: "four-planes",
    title: "Four architectural planes",
    summary:
      "This diagram splits the system into capacity, verification, pricing, and settlement. It is the quickest way to see where each contract family sits and how pressure moves up and down the stack.",
    category: "core",
    kind: "diagram",
    diagram: fourPlanesDiagram,
    locations: [{ href: "/explainer#four-planes", label: "Explainer: four planes" }],
  },
  {
    id: "five-objects",
    title: "Five standard protocol objects",
    summary:
      "Every interaction in Pura turns into one of five typed objects. This is the data model view of the protocol rather than the money-flow view.",
    category: "core",
    kind: "diagram",
    diagram: fiveObjectsDiagram,
    locations: [{ href: "/explainer#five-objects", label: "Explainer: five objects" }],
  },
  {
    id: "pipeline",
    title: "Five-step pipeline",
    summary:
      "This is the high-level flow: declare, verify, price, route, buffer. It is the shortest route through the core mechanism before the explainer dives into each step.",
    category: "core",
    kind: "diagram",
    diagram: pipelineDiagram,
    locations: [{ href: "/explainer#step-by-step", label: "Explainer: step by step" }],
  },
  {
    id: "stake-weighting",
    title: "Stake-weighted capacity admission",
    summary:
      "This diagram explains why the protocol does not trust raw self-reporting. Capacity claims are bounded by stake so fake abundance costs real capital.",
    category: "core",
    kind: "diagram",
    diagram: stakeDiagram,
    locations: [{ href: "/explainer#declare", label: "Explainer: declare" }],
  },
  {
    id: "verification-sequence",
    title: "Dual-signature completion verification",
    summary:
      "This sequence turns finished work into a receipt both sides must sign. It is the core honesty mechanism behind routing weights, slashing, and reputation.",
    category: "core",
    kind: "sequence",
    sequence: verifySequence,
    locations: [{ href: "/explainer#verify", label: "Explainer: verify" }],
  },
  {
    id: "price-curve",
    title: "Congestion pricing",
    summary:
      "Price rises in two places: globally when the whole system is busy and locally when one sink backs up. This is how demand gets pushed away from bottlenecks without a central operator.",
    category: "core",
    kind: "diagram",
    diagram: priceDiagram,
    locations: [{ href: "/explainer#price", label: "Explainer: price" }],
  },
  {
    id: "routing-pool",
    title: "BackpressurePool redistribution",
    summary:
      "Incoming flow lands in a pool and gets split according to spare capacity. This diagram is the money router at the center of the protocol.",
    category: "core",
    kind: "diagram",
    diagram: routeDiagram,
    locations: [{ href: "/explainer#route", label: "Explainer: route" }],
  },
  {
    id: "escrow-buffer",
    title: "Overflow buffer",
    summary:
      "When every sink is full, flow does not disappear or keep pretending everything is fine. It lands in escrow until capacity returns or the system signals the source to stop.",
    category: "core",
    kind: "diagram",
    diagram: bufferDiagram,
    locations: [{ href: "/explainer#buffer", label: "Explainer: buffer" }],
  },
  {
    id: "thermodynamic-layer",
    title: "Thermodynamic overlay",
    summary:
      "This frame adds the physics analogy on top of the routing core. Variance becomes temperature, capital balance becomes the virial ratio, and stress turns into circuit-breaker state.",
    category: "thermo",
    kind: "diagram",
    diagram: thermoDiagram,
    locations: [{ href: "/explainer#thermo", label: "Explainer: thermodynamic layer" }],
  },
  {
    id: "demurrage-loop",
    title: "Adaptive demurrage feedback loop",
    summary:
      "Idle balances decay faster when the system is over-capitalized. This closes the loop between throughput, bound capital, and the cost of sitting on tokens.",
    category: "thermo",
    kind: "diagram",
    diagram: demurrageDiagram,
    locations: [{ href: "/explainer#demurrage", label: "Explainer: adaptive demurrage" }],
  },
  {
    id: "circuit-breaker",
    title: "Pipeline circuit breaker",
    summary:
      "This sequence shows how a failing stage gets isolated before it drags the rest of the pipeline down. It is the protocol's answer to cascade failure.",
    category: "thermo",
    kind: "sequence",
    sequence: circuitBreakerSequence,
    locations: [{ href: "/explainer#breaker", label: "Explainer: circuit breaker" }],
  },
  {
    id: "dvm-adapters",
    title: "Nostr DVM adapter stack",
    summary:
      "This shows how an existing NIP-90 data vending machine can plug into Pura without rewriting the service itself. Capacity, verification, and pricing sit in sidecar contracts around the DVM.",
    category: "domains",
    kind: "diagram",
    diagram: dvmAdapterDiagram,
    locations: [{ href: "/explainer#dvm-adapters", label: "Explainer: DVM adapters" }],
  },
  {
    id: "settlement-rails",
    title: "Settlement rail selector",
    summary:
      "Pura does not bet on one payment rail. This diagram shows Lightning, Superfluid, and direct ERC-20 settlement living behind one routing interface.",
    category: "domains",
    kind: "diagram",
    diagram: settlementRailsDiagram,
    locations: [{ href: "/explainer#settlement", label: "Explainer: settlement rails" }],
  },
  {
    id: "shadow-mode",
    title: "Shadow mode sidecar",
    summary:
      "This is the no-commitment path into the protocol. A local sidecar simulates the routing and monitoring logic against real workload before capital goes on-chain.",
    category: "domains",
    kind: "diagram",
    diagram: shadowModeDiagram,
    locations: [{ href: "/explainer#shadow", label: "Explainer: shadow mode" }],
  },
  {
    id: "domain-map",
    title: "Research domain map",
    summary:
      "This is the expansion frame. It shows that the core declare-verify-price-route-buffer loop is not tied to one product category or one protocol.",
    category: "domains",
    kind: "diagram",
    diagram: domainsDiagram,
    locations: [{ href: "/explainer#domains", label: "Explainer: research domains" }],
  },
  {
    id: "lightning-sidecar",
    title: "Lightning capacity signaling",
    summary:
      "This diagram shows how Lightning nodes can expose fresh capacity signals without exposing individual channel balances. Routing income then follows verified ability to move payments.",
    category: "domains",
    kind: "diagram",
    diagram: lightningDiagram,
    locations: [{ href: "/explainer#lightning", label: "Explainer: Lightning" }],
  },
  {
    id: "nostr-relays",
    title: "Nostr relay economics",
    summary:
      "This is the relay version of the same story: declare capacity, price congestion, and pay relays for real throughput instead of hoping volunteer infrastructure scales forever.",
    category: "domains",
    kind: "diagram",
    diagram: nostrDiagram,
    locations: [{ href: "/explainer#nostr", label: "Explainer: Nostr relays" }],
  },
  {
    id: "reputation-ledger",
    title: "Cross-domain reputation",
    summary:
      "This frame shows how performance in one domain can matter in another. Reputation becomes portable instead of getting trapped inside one marketplace or protocol silo.",
    category: "domains",
    kind: "diagram",
    diagram: reputationDiagram,
    locations: [{ href: "/explainer#platform", label: "Explainer: platform layer" }],
  },
  {
    id: "openclaw-flow",
    title: "OpenClaw coordination flow",
    summary:
      "This sequence shows how an OpenClaw skill execution becomes a priced, verified, reputation-bearing action inside Pura while the framework itself stays unchanged.",
    category: "domains",
    kind: "sequence",
    sequence: openclawSequence,
    locations: [{ href: "/explainer#openclaw", label: "Explainer: OpenClaw agents" }],
  },
];

export function getDiagramEntry(id: string) {
  return DIAGRAM_CATALOG.find((entry) => entry.id === id);
}