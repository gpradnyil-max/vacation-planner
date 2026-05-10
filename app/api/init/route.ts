import { NextResponse } from "next/server";
import { ensureSchema, getTrip, upsertTrip } from "@/lib/bigquery";
import { defaultTrip, DEFAULT_TRIP_ID } from "@/lib/defaults";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await ensureSchema();
    const existing = await getTrip(DEFAULT_TRIP_ID);
    if (!existing) {
      await upsertTrip(defaultTrip());
    }
    return NextResponse.json({ ok: true, tripId: DEFAULT_TRIP_ID });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function GET() {
  return POST();
}
