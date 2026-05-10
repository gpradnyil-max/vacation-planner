import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  ensureSchema,
  getTrip,
  listAttractions,
  listExpenses,
  listStays,
  upsertTrip,
} from "@/lib/bigquery";
import { defaultTrip, DEFAULT_TRIP_ID } from "@/lib/defaults";
import { buildSummary } from "@/lib/time";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const updateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(120),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  numDays: z.number().int().min(1).max(30),
  numTravellers: z.number().int().min(1).max(50),
});

export async function GET(req: NextRequest) {
  try {
    await ensureSchema();
    const tripId = req.nextUrl.searchParams.get("id") ?? DEFAULT_TRIP_ID;
    let trip = await getTrip(tripId);
    if (!trip && tripId === DEFAULT_TRIP_ID) {
      trip = defaultTrip();
      await upsertTrip(trip);
    }
    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }
    const [attractions, stays, expenses] = await Promise.all([
      listAttractions(trip.id),
      listStays(trip.id),
      listExpenses(trip.id),
    ]);
    return NextResponse.json(buildSummary(trip, attractions, stays, expenses));
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = updateSchema.parse(body);
    const existing = (await getTrip(parsed.id)) ?? defaultTrip();
    const updated = {
      ...existing,
      id: parsed.id,
      name: parsed.name,
      startDate: parsed.startDate,
      numDays: parsed.numDays,
      numTravellers: parsed.numTravellers,
      currency: "GBP" as const,
      createdAt: existing.createdAt || new Date().toISOString(),
    };
    await upsertTrip(updated);
    return NextResponse.json(updated);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
