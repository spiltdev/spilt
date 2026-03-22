import { NextRequest, NextResponse } from "next/server";
import { upgradeTenant, getTenantByPubkey } from "@/lib/deploy/tenants";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { pubkey, plan, streamId } = body;

  if (!pubkey || !plan) {
    return NextResponse.json({ error: "Missing pubkey or plan" }, { status: 400 });
  }

  if (!["free", "pro", "operator"].includes(plan)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const tenant = getTenantByPubkey(pubkey);
  if (!tenant) {
    return NextResponse.json({ error: "No relay found" }, { status: 404 });
  }

  // For paid plans, require a Superfluid stream ID
  if (plan !== "free" && !streamId) {
    return NextResponse.json(
      { error: "Paid plans require a Superfluid stream" },
      { status: 400 },
    );
  }

  const updated = upgradeTenant(pubkey, plan, streamId);
  if (!updated) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  return NextResponse.json({
    plan: updated.plan,
    superfluidStreamId: updated.superfluidStreamId,
  });
}
