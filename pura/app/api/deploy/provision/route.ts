import { NextRequest, NextResponse } from "next/server";
import {
  validateSubdomain,
  createTenant,
  getTenantByPubkey,
} from "@/lib/deploy/tenants";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { pubkey, subdomain } = body;

  if (!pubkey || !subdomain) {
    return NextResponse.json(
      { error: "Missing pubkey or subdomain" },
      { status: 400 },
    );
  }

  // Check if user already has a relay
  const existing = getTenantByPubkey(pubkey);
  if (existing) {
    return NextResponse.json(
      { error: "You already have a relay", relay_url: `wss://${existing.subdomain}.pura.xyz` },
      { status: 409 },
    );
  }

  const validation = validateSubdomain(subdomain);
  if (!validation.valid) {
    return NextResponse.json(
      { error: validation.reason },
      { status: 400 },
    );
  }

  const tenant = createTenant(pubkey, subdomain);

  return NextResponse.json({
    relay_url: `wss://${tenant.subdomain}.pura.xyz`,
    subdomain: tenant.subdomain,
    plan: tenant.plan,
    nip11: {
      name: tenant.relayName,
      description: tenant.relayDescription,
      pubkey: tenant.pubkey,
      supported_nips: [1, 11, 42],
      software: "strfry",
      version: "1.0.0",
    },
  });
}
