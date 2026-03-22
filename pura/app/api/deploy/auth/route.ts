import { NextRequest, NextResponse } from "next/server";
import { generateChallenge, verifyAuthEvent } from "@/lib/deploy/nostr-auth";

// In-memory challenge store (would be Redis in production)
const challenges = new Map<string, { challenge: string; expiresAt: number }>();

export async function GET() {
  const challenge = generateChallenge();
  const id = crypto.randomUUID();
  challenges.set(id, {
    challenge,
    expiresAt: Date.now() + 5 * 60 * 1000,
  });
  return NextResponse.json({ id, challenge });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { challengeId, event } = body;

  if (!challengeId || !event) {
    return NextResponse.json({ error: "Missing challengeId or event" }, { status: 400 });
  }

  const stored = challenges.get(challengeId);
  if (!stored || stored.expiresAt < Date.now()) {
    challenges.delete(challengeId);
    return NextResponse.json({ error: "Challenge expired or not found" }, { status: 400 });
  }

  challenges.delete(challengeId);

  const session = verifyAuthEvent(event, stored.challenge);
  if (!session) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  return NextResponse.json({ pubkey: session.pubkey });
}
