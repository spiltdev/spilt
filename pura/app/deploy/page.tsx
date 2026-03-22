"use client";

import { useState, useCallback, useEffect } from "react";
import styles from "../page.module.css";
import deployStyles from "./deploy.module.css";

type AuthState =
  | { status: "unauthenticated" }
  | { status: "authenticating" }
  | { status: "authenticated"; pubkey: string };

interface RelayStatus {
  subdomain: string;
  relay_url: string;
  plan: string;
  relayName: string;
  relayDescription: string;
  storageUsedBytes: number;
  eventCount: number;
  customDomain: string | null;
  superfluidStreamId: string | null;
  createdAt: number;
}

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    features: [
      "1 relay on pura.xyz subdomain",
      "100 MB storage",
      "10 allowed pubkeys",
      "50 events/min rate limit",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$9/mo stream",
    features: [
      "5 GB storage",
      "Unlimited pubkeys",
      "Custom domain support",
      "On-chain relay registration",
      "Payment pool revenue sharing",
    ],
  },
  {
    id: "operator",
    name: "Operator",
    price: "$29/mo stream",
    features: [
      "50 GB storage",
      "Everything in Pro",
      "Multiple relay configs",
      "Advanced analytics",
      "Priority support",
    ],
  },
];

export default function DeployPage() {
  const [auth, setAuth] = useState<AuthState>({ status: "unauthenticated" });
  const [relay, setRelay] = useState<RelayStatus | null>(null);
  const [subdomain, setSubdomain] = useState("");
  const [error, setError] = useState("");
  const [provisioning, setProvisioning] = useState(false);

  const signIn = useCallback(async () => {
    setAuth({ status: "authenticating" });
    setError("");

    try {
      const nostr = (window as unknown as { nostr?: { getPublicKey(): Promise<string>; signEvent(e: unknown): Promise<unknown> } }).nostr;
      if (!nostr) {
        setError("No Nostr extension found. Install nos2x, Alby, or another NIP-07 extension.");
        setAuth({ status: "unauthenticated" });
        return;
      }

      // Get challenge
      const challengeRes = await fetch("/api/deploy/auth");
      const { id: challengeId, challenge } = await challengeRes.json();

      // Get public key
      const pubkey = await nostr.getPublicKey();

      // Sign challenge event
      const event = await nostr.signEvent({
        kind: 22242,
        created_at: Math.floor(Date.now() / 1000),
        tags: [["challenge", challenge]],
        content: "",
        pubkey,
      });

      // Verify
      const verifyRes = await fetch("/api/deploy/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeId, event }),
      });

      if (!verifyRes.ok) {
        const data = await verifyRes.json();
        setError(data.error || "Auth failed");
        setAuth({ status: "unauthenticated" });
        return;
      }

      const { pubkey: verifiedPubkey } = await verifyRes.json();
      setAuth({ status: "authenticated", pubkey: verifiedPubkey });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Auth failed");
      setAuth({ status: "unauthenticated" });
    }
  }, []);

  // Fetch relay status after auth
  useEffect(() => {
    if (auth.status !== "authenticated") return;
    fetch(`/api/deploy/status?pubkey=${auth.pubkey}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setRelay(data);
      })
      .catch(() => {});
  }, [auth]);

  const provision = useCallback(async () => {
    if (auth.status !== "authenticated") return;
    setProvisioning(true);
    setError("");

    try {
      const res = await fetch("/api/deploy/provision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pubkey: auth.pubkey, subdomain }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Provisioning failed");
        return;
      }
      // Refresh status
      const statusRes = await fetch(`/api/deploy/status?pubkey=${auth.pubkey}`);
      if (statusRes.ok) setRelay(await statusRes.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Provisioning failed");
    } finally {
      setProvisioning(false);
    }
  }, [auth, subdomain]);

  // Pre-auth: marketing page
  if (auth.status !== "authenticated") {
    return (
      <main className={styles.main}>
        <h1 className={styles.title}>Deploy your Nostr relay</h1>
        <p className={styles.subtitle}>
          Your personal relay in 60 seconds. No email, no password. Sign in with Nostr.
        </p>

        <div className={deployStyles.plans}>
          {PLANS.map((plan) => (
            <div key={plan.id} className={deployStyles.planCard}>
              <h3 className={deployStyles.planName}>{plan.name}</h3>
              <div className={deployStyles.planPrice}>{plan.price}</div>
              <ul className={deployStyles.planFeatures}>
                {plan.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className={deployStyles.authSection}>
          <button
            className={styles.button}
            onClick={signIn}
            disabled={auth.status === "authenticating"}
          >
            {auth.status === "authenticating"
              ? "Signing in..."
              : "Sign in with Nostr"}
          </button>
          {error && <p className={deployStyles.error}>{error}</p>}
        </div>
      </main>
    );
  }

  // Post-auth: dashboard or provisioning
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Your relay</h1>
      <p className={styles.subtitle}>
        Signed in as {auth.pubkey.slice(0, 8)}...{auth.pubkey.slice(-4)}
      </p>

      {relay ? (
        <div className={deployStyles.dashboard}>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <div className={styles.statLabel}>Status</div>
              <div className={styles.statValue}>Online</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statLabel}>Events</div>
              <div className={styles.statValue}>{relay.eventCount.toLocaleString()}</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statLabel}>Storage</div>
              <div className={styles.statValue}>
                {(relay.storageUsedBytes / 1024 / 1024).toFixed(1)} MB
              </div>
            </div>
          </div>

          <div className={deployStyles.infoGrid}>
            <div className={deployStyles.infoRow}>
              <span className={deployStyles.infoLabel}>URL</span>
              <code className={deployStyles.infoValue}>{relay.relay_url}</code>
            </div>
            <div className={deployStyles.infoRow}>
              <span className={deployStyles.infoLabel}>Plan</span>
              <span className={deployStyles.infoValue}>{relay.plan}</span>
            </div>
            <div className={deployStyles.infoRow}>
              <span className={deployStyles.infoLabel}>Name</span>
              <span className={deployStyles.infoValue}>{relay.relayName}</span>
            </div>
            {relay.customDomain && (
              <div className={deployStyles.infoRow}>
                <span className={deployStyles.infoLabel}>Domain</span>
                <span className={deployStyles.infoValue}>{relay.customDomain}</span>
              </div>
            )}
            <div className={deployStyles.infoRow}>
              <span className={deployStyles.infoLabel}>Created</span>
              <span className={deployStyles.infoValue}>
                {new Date(relay.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className={deployStyles.provisionSection}>
          <h2 className={styles.sectionTitle}>Choose your subdomain</h2>
          <div className={styles.routeInputs}>
            <input
              type="text"
              className={styles.input}
              placeholder="yourname"
              value={subdomain}
              onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
            />
            <span className={deployStyles.domainSuffix}>.pura.xyz</span>
            <button
              className={styles.button}
              onClick={provision}
              disabled={provisioning || subdomain.length < 3}
            >
              {provisioning ? "Creating..." : "Create relay"}
            </button>
          </div>
          {error && <p className={deployStyles.error}>{error}</p>}
        </div>
      )}
    </main>
  );
}
