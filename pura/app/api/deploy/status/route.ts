import { NextRequest, NextResponse } from "next/server";
import { getTenantByPubkey } from "@/lib/deploy/tenants";

export async function GET(req: NextRequest) {
  const pubkey = req.nextUrl.searchParams.get("pubkey");
  if (!pubkey) {
    return NextResponse.json({ error: "Missing pubkey" }, { status: 400 });
  }

  const tenant = getTenantByPubkey(pubkey);
  if (!tenant) {
    return NextResponse.json({ error: "No relay found" }, { status: 404 });
  }

  return NextResponse.json({
    subdomain: tenant.subdomain,
    relay_url: `wss://${tenant.subdomain}.pura.xyz`,
    plan: tenant.plan,
    relayName: tenant.relayName,
    relayDescription: tenant.relayDescription,
    allowedPubkeys: tenant.allowedPubkeys,
    storageUsedBytes: tenant.storageUsedBytes,
    eventCount: tenant.eventCount,
    customDomain: tenant.customDomain ?? null,
    superfluidStreamId: tenant.superfluidStreamId ?? null,
    createdAt: tenant.createdAt,
  });
}
