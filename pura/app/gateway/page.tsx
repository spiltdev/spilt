"use client";

import { useState, type FormEvent } from "react";
import FlowDiagram from "./components/FlowDiagram";
import styles from "../page.module.css";
import { usePolledState } from "@/lib/shared/hooks/usePolledState";
import { generateGatewaySeedState, type SinkState } from "@/lib/shared/seed";

interface GatewayState {
  providers: string[];
  sinks: SinkState[];
  pool: string | null;
  baseFee: string;
  chainId: number;
  keys: { total: number; totalRequests: number; withWallet: number };
  seed?: boolean;
}

function hasData(data: GatewayState) {
  return data.sinks?.some((s: SinkState) => s.configured && s.completions !== "0");
}

export default function GatewayPage() {
  const { state, loading } = usePolledState<GatewayState>(
    "/api/gateway/state",
    hasData,
    generateGatewaySeedState,
  );

  const [keyLabel, setKeyLabel] = useState("");
  const [generatedKey, setGeneratedKey] = useState("");
  const [generating, setGenerating] = useState(false);

  async function handleGenerateKey(e: FormEvent) {
    e.preventDefault();
    setGenerating(true);
    setGeneratedKey("");
    try {
      const res = await fetch("/api/gateway/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: keyLabel }),
      });
      const data = await res.json();
      if (data.key) {
        setGeneratedKey(data.key);
        setKeyLabel("");
      }
    } catch {
      // skip
    } finally {
      setGenerating(false);
    }
  }

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <span>Loading…</span>
      </div>
    );
  }

  const explorerBase =
    state?.chainId === 8453
      ? "https://basescan.org"
      : "https://sepolia.basescan.org";

  return (
    <main className={styles.main}>
      <p className={styles.subtitle}>
        Capacity-routed LLM gateway · Built on{" "}
        <a href="https://backproto.io" target="_blank" rel="noopener noreferrer">
          Backproto
        </a>
      </p>

      {state?.seed && (
        <div className={styles.seedBanner}>
          ◈ Simulated data · Connect providers for live metrics
        </div>
      )}

      <FlowDiagram />

      {/* Key generation */}
      <section className={styles.keySection}>
        <form className={styles.keyForm} onSubmit={handleGenerateKey}>
          <input
            type="text"
            className={styles.keyInput}
            placeholder="Label (optional)"
            value={keyLabel}
            onChange={(e) => setKeyLabel(e.target.value)}
            maxLength={64}
          />
          <button
            type="submit"
            className={styles.keyButton}
            disabled={generating}
          >
            {generating ? "…" : "Get API Key"}
          </button>
        </form>
        {generatedKey && (
          <>
            <div className={styles.keyResult}>{generatedKey}</div>
            <p className={styles.keyWarning}>
              ⚠ Copy this key now — it will not be shown again.
            </p>
          </>
        )}
      </section>

      {/* Stats */}
      {state && (
        <div className={styles.stats}>
          <div className={styles.stat}>
            <div className={styles.statLabel}>Providers</div>
            <div className={styles.statValue}>{state.providers.length}</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statLabel}>Total Requests</div>
            <div className={styles.statValue}>{state.keys.totalRequests}</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statLabel}>API Keys</div>
            <div className={styles.statValue}>{state.keys.total}</div>
          </div>
        </div>
      )}

      {/* Provider cards */}
      {state && (
        <div className={styles.providers}>
          {state.sinks.map((sink) => (
            <div key={sink.name} className={styles.providerCard}>
              <div className={styles.providerName}>
                <span
                  className={styles.providerDot}
                  style={{
                    background: sink.configured ? "var(--green)" : "var(--text-dim)",
                  }}
                />
                {sink.name}
              </div>
              {sink.configured && (
                <dl className={styles.providerMeta}>
                  <dt>Units</dt>
                  <dd>{sink.units ?? "—"}</dd>
                  <dt>Completions</dt>
                  <dd>{sink.completions ?? "—"}</dd>
                  <dt>Price</dt>
                  <dd>{sink.price ?? "—"}</dd>
                </dl>
              )}
              {!sink.configured && (
                <div style={{ fontSize: "0.72rem", color: "var(--text-dim)" }}>
                  Not configured
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Quick start */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Quick start</h3>
        <pre className={styles.compact}>{`curl ${typeof window !== "undefined" ? window.location.origin : "https://pura.xyz"}/api/gateway/chat \\
  -H "Authorization: Bearer YOUR_KEY" \\
  -d '{"messages":[{"role":"user","content":"Hello!"}],"stream":true}'

# Or bring your own provider key:
curl ${typeof window !== "undefined" ? window.location.origin : "https://pura.xyz"}/api/gateway/chat \\
  -H "Authorization: Bearer YOUR_KEY" \\
  -H "X-Provider-Key: sk-your-openai-key" \\
  -d '{"messages":[{"role":"user","content":"Hello!"}],"model":"gpt-4o"}'`}</pre>
      </section>

      {/* FAQ */}
      <section className={styles.faq}>
        <h3 className={styles.faqTitle}>Common questions</h3>

        <div className={styles.faqItem}>
          <h4 className={styles.faqQ}>How does this work?</h4>
          <p className={styles.faqA}>
            You send requests to Mandalay using the standard OpenAI chat format.
            Mandalay checks real-time capacity weights from an on-chain registry
            and routes to the provider with the most headroom. If one goes down,
            traffic shifts automatically.
          </p>
        </div>

        <div className={styles.faqItem}>
          <h4 className={styles.faqQ}>Are my API keys secure?</h4>
          <p className={styles.faqA}>
            Your Mandalay API key is SHA-256 hashed before storage — we never
            store it in plaintext. If you bring your own provider key via the{" "}
            <code>X-Provider-Key</code> header, it is used only for the single
            outbound request to the provider, then discarded. It is never stored,
            never logged, and never included in error responses.
          </p>
        </div>

        <div className={styles.faqItem}>
          <h4 className={styles.faqQ}>Can I use my own provider key?</h4>
          <p className={styles.faqA}>
            Yes. Pass your OpenAI or Anthropic key via the{" "}
            <code>X-Provider-Key</code> header and set the <code>model</code>{" "}
            parameter to route to the right provider. Your key is used
            pass-through for that single request — Mandalay never stores it. If
            you don&apos;t send a provider key, Mandalay uses its own managed
            keys.
          </p>
        </div>

        <div className={styles.faqItem}>
          <h4 className={styles.faqQ}>What&apos;s the catch?</h4>
          <p className={styles.faqA}>
            First 100 requests are free, no signup required. After that, link an
            Ethereum wallet and open a payment stream — pennies per request on
            Base. You can stop anytime.
          </p>
        </div>

        <div className={styles.faqItem}>
          <h4 className={styles.faqQ}>Can I self-host this?</h4>
          <p className={styles.faqA}>
            Yes — Mandalay is fully open source. Fork it, deploy it, run your own
            gateway. See the{" "}
            <a
              href="https://github.com/backproto/backproto/tree/main/gateway"
              target="_blank"
              rel="noopener noreferrer"
            >
              operator guide
            </a>.
          </p>
        </div>
      </section>
    </main>
  );
}
