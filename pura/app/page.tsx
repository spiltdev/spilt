"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";

interface SectionSummary {
  relays: { count: number; avgCapacity: number } | null;
  lightning: { nodeCount: number; avgFee: number } | null;
  agents: { agentCount: number; avgReputation: number } | null;
  gateway: { completions: number; providers: number } | null;
}

const SECTIONS = [
  {
    href: "/relays",
    name: "Relays",
    color: "#8b5cf6",
    desc: "On-chain relay capacity registry with backpressure payment pools.",
    stat: (s: SectionSummary) =>
      s.relays ? `${s.relays.count} relays` : null,
  },
  {
    href: "/lightning",
    name: "Lightning",
    color: "#f59e0b",
    desc: "Smoothed capacity routing and fee discovery for the Lightning network.",
    stat: (s: SectionSummary) =>
      s.lightning ? `${s.lightning.nodeCount} nodes` : null,
  },
  {
    href: "/agents",
    name: "Agents",
    color: "#06b6d4",
    desc: "Agent reputation, measurability gaps, and verifiable evidence hashes.",
    stat: (s: SectionSummary) =>
      s.agents ? `${s.agents.agentCount} agents` : null,
  },
  {
    href: "/gateway",
    name: "Gateway",
    color: "#d97706",
    desc: "Capacity-weighted LLM routing across providers with streaming and BYOK.",
    stat: (s: SectionSummary) =>
      s.gateway ? `${s.gateway.completions} completions` : null,
  },
  {
    href: "/sim",
    name: "Simulator",
    color: "#ef4444",
    desc: "Live economy simulation with 3-agent backpressure pricing on Base Sepolia.",
    stat: () => null,
  },
];

export default function LandingPage() {
  const [summary, setSummary] = useState<SectionSummary>({
    relays: null,
    lightning: null,
    agents: null,
    gateway: null,
  });

  useEffect(() => {
    const endpoints = [
      { key: "relays", url: "/api/relays/state" },
      { key: "lightning", url: "/api/lightning/state" },
      { key: "agents", url: "/api/agents/state" },
      { key: "gateway", url: "/api/gateway/state" },
    ] as const;

    Promise.allSettled(
      endpoints.map((ep) =>
        fetch(ep.url)
          .then((r) => (r.ok ? r.json() : null))
          .then((data) => ({ key: ep.key, data })),
      ),
    ).then((results) => {
      const next: SectionSummary = {
        relays: null,
        lightning: null,
        agents: null,
        gateway: null,
      };
      for (const r of results) {
        if (r.status !== "fulfilled" || !r.value?.data) continue;
        const { key, data } = r.value;
        if (key === "relays" && data.relays) {
          next.relays = {
            count: data.relays.length,
            avgCapacity:
              data.relays.reduce(
                (s: number, r: { compositeCapacity: string }) =>
                  s + Number(r.compositeCapacity),
                0,
              ) / (data.relays.length || 1),
          };
        } else if (key === "lightning" && data.nodes) {
          next.lightning = {
            nodeCount: data.nodes.length,
            avgFee:
              data.nodes.reduce(
                (s: number, n: { routingFee: string }) =>
                  s + Number(n.routingFee),
                0,
              ) / (data.nodes.length || 1),
          };
        } else if (key === "agents" && data.agents) {
          next.agents = {
            agentCount: data.agents.length,
            avgReputation:
              data.agents.reduce(
                (s: number, a: { reputation: string }) =>
                  s + Number(a.reputation),
                0,
              ) / (data.agents.length || 1),
          };
        } else if (key === "gateway") {
          next.gateway = {
            completions: Number(data.totalCompletions ?? 0),
            providers: Number(data.providerCount ?? 0),
          };
        }
      }
      setSummary(next);
    });
  }, []);

  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <h1 className={styles.title}>Backpressure infrastructure for Nostr</h1>
        <p className={styles.subtitle}>
          On-chain capacity verification, payment routing, and relay hosting.
          All running on Base.
        </p>
        <a href="/deploy" className={styles.cta}>
          Deploy your relay
        </a>
      </section>

      <section className={styles.grid}>
        {SECTIONS.map((sec) => {
          const stat = sec.stat(summary);
          return (
            <a
              key={sec.href}
              href={sec.href}
              className={styles.sectionCard}
              style={{ borderTopColor: sec.color }}
            >
              <h2 className={styles.sectionName} style={{ color: sec.color }}>
                {sec.name}
              </h2>
              <p className={styles.sectionDesc}>{sec.desc}</p>
              {stat && <span className={styles.sectionStat}>{stat}</span>}
            </a>
          );
        })}
      </section>
    </main>
  );
}
