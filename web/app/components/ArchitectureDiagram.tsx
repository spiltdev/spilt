"use client";

import { useState } from "react";
import styles from "./ArchitectureDiagram.module.css";

const domains = [
  { id: "bpe", label: "Core BPE", sub: "8 contracts", color: "#0d9488", x: 0 },
  { id: "demurrage", label: "Demurrage", sub: "2 contracts", color: "#d97706", x: 1 },
  { id: "lightning", label: "Lightning", sub: "3 contracts", color: "#a16207", x: 2 },
  { id: "nostr", label: "Nostr Relays", sub: "2 contracts", color: "#6366f1", x: 3 },
];

export default function ArchitectureDiagram() {
  const [hovered, setHovered] = useState<string | null>(null);

  // Layout constants
  const W = 800;
  const H = 320;
  const platformY = 40;
  const platformH = 80;
  const platformW = 560;
  const platformX = (W - platformW) / 2;
  const domainY = 200;
  const domainW = 120;
  const domainH = 72;
  const domainGap = 28;
  const totalDomainsW = domains.length * domainW + (domains.length - 1) * domainGap;
  const domainStartX = (W - totalDomainsW) / 2;

  return (
    <div className={styles.wrapper}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className={styles.svg}
        aria-label="Architecture diagram showing Platform Layer connecting to four domain layers"
      >
        <defs>
          <linearGradient id="platform-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(217,119,6,0.15)" />
            <stop offset="100%" stopColor="rgba(217,119,6,0.05)" />
          </linearGradient>
          {domains.map((d) => (
            <linearGradient key={d.id} id={`grad-${d.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={d.color} stopOpacity="0.2" />
              <stop offset="100%" stopColor={d.color} stopOpacity="0.08" />
            </linearGradient>
          ))}
        </defs>

        {/* Connection lines (drawn first = behind boxes) */}
        {domains.map((d) => {
          const dx = domainStartX + d.x * (domainW + domainGap) + domainW / 2;
          const sy = platformY + platformH;
          const dy = domainY;
          const active = !hovered || hovered === d.id;
          return (
            <path
              key={`line-${d.id}`}
              d={`M${W / 2},${sy} C${W / 2},${sy + 40} ${dx},${dy - 40} ${dx},${dy}`}
              fill="none"
              stroke={d.color}
              strokeWidth={active ? 2 : 1}
              strokeDasharray="6 4"
              opacity={active ? 0.6 : 0.15}
              className={styles.connectionLine}
            />
          );
        })}

        {/* Platform layer box */}
        <rect
          x={platformX}
          y={platformY}
          width={platformW}
          height={platformH}
          rx={10}
          fill="url(#platform-grad)"
          stroke="rgba(217,119,6,0.3)"
          strokeWidth={1}
          opacity={!hovered ? 1 : 0.5}
        />
        <text
          x={W / 2}
          y={platformY + 30}
          textAnchor="middle"
          fill="#fff"
          fontSize={14}
          fontWeight={600}
          fontFamily="var(--font-sans)"
        >
          Platform Layer
        </text>
        <text
          x={W / 2}
          y={platformY + 52}
          textAnchor="middle"
          fill="var(--text-muted)"
          fontSize={11}
          fontFamily="var(--font-mono)"
        >
          UniversalCapacityAdapter · ReputationLedger · CrossProtocolRouter
        </text>

        {/* Domain boxes */}
        {domains.map((d) => {
          const dx = domainStartX + d.x * (domainW + domainGap);
          const active = !hovered || hovered === d.id;
          return (
            <g
              key={d.id}
              onMouseEnter={() => setHovered(d.id)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: "pointer" }}
            >
              <rect
                x={dx}
                y={domainY}
                width={domainW}
                height={domainH}
                rx={8}
                fill={`url(#grad-${d.id})`}
                stroke={d.color}
                strokeWidth={active ? 1.5 : 1}
                opacity={active ? 1 : 0.35}
                className={styles.domainBox}
              />
              {/* Colored top accent bar */}
              <rect
                x={dx}
                y={domainY}
                width={domainW}
                height={3}
                rx={1.5}
                fill={d.color}
                opacity={active ? 1 : 0.3}
              />
              <text
                x={dx + domainW / 2}
                y={domainY + 32}
                textAnchor="middle"
                fill="#fff"
                fontSize={13}
                fontWeight={600}
                fontFamily="var(--font-sans)"
                opacity={active ? 1 : 0.4}
              >
                {d.label}
              </text>
              <text
                x={dx + domainW / 2}
                y={domainY + 52}
                textAnchor="middle"
                fill="var(--text-dim)"
                fontSize={11}
                fontFamily="var(--font-mono)"
                opacity={active ? 1 : 0.4}
              >
                {d.sub}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
