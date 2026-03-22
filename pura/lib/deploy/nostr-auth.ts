import { verifyEvent, type Event as NostrEvent } from "nostr-tools";

export interface NostrSession {
  pubkey: string;
  createdAt: number;
}

const CHALLENGE_KIND = 22242;
const CHALLENGE_EXPIRY_SEC = 300;

/**
 * Verify a NIP-42-style AUTH event signed by the user.
 * The event must be kind 22242 with a "challenge" tag matching the expected value.
 */
export function verifyAuthEvent(
  event: NostrEvent,
  expectedChallenge: string,
): NostrSession | null {
  if (event.kind !== CHALLENGE_KIND) return null;

  const challengeTag = event.tags.find(
    (t) => t[0] === "challenge" && t[1] === expectedChallenge,
  );
  if (!challengeTag) return null;

  const age = Math.floor(Date.now() / 1000) - event.created_at;
  if (age > CHALLENGE_EXPIRY_SEC || age < -60) return null;

  const valid = verifyEvent(event);
  if (!valid) return null;

  return { pubkey: event.pubkey, createdAt: event.created_at };
}

/**
 * Generate a random challenge string for NIP-42 auth.
 */
export function generateChallenge(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
