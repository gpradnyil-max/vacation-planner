import { NextRequest, NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
import { z } from "zod";
import {
  deleteAttraction,
  insertAttraction,
  listAttractions,
  updateAttraction,
} from "@/lib/bigquery";
import { DEFAULT_TRIP_ID } from "@/lib/defaults";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const baseSchema = z.object({
  tripId: z.string().min(1).default(DEFAULT_TRIP_ID),
  dayNumber: z.number().int().min(1).max(30),
  name: z.string().min(1).max(160),
  location: z.string().max(200).nullable().optional(),
  startTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/)
    .nullable()
    .optional(),
  durationMinutes: z.number().int().min(0).max(24 * 60),
  travelMinutes: z.number().int().min(0).max(12 * 60).default(0),
  costGbp: z.number().min(0).max(1_000_000).default(0),
  booked: z.boolean().default(false),
  notes: z.string().max(2000).nullable().optional(),
});

const updateSchema = baseSchema.extend({ id: z.string().min(1) });

export async function GET(req: NextRequest) {
  const tripId = req.nextUrl.searchParams.get("tripId") ?? DEFAULT_TRIP_ID;
  const list = await listAttractions(tripId);
  return NextResponse.json(list);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = baseSchema.parse(body);
    const a = {
      id: uuid(),
      tripId: parsed.tripId,
      dayNumber: parsed.dayNumber,
      name: parsed.name,
      location: parsed.location ?? null,
      startTime: parsed.startTime ?? null,
      durationMinutes: parsed.durationMinutes,
      travelMinutes: parsed.travelMinutes,
      costGbp: parsed.costGbp,
      booked: parsed.booked,
      notes: parsed.notes ?? null,
      createdAt: new Date().toISOString(),
    };
    await insertAttraction(a);
    return NextResponse.json(a, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = updateSchema.parse(body);
    const a = {
      id: parsed.id,
      tripId: parsed.tripId,
      dayNumber: parsed.dayNumber,
      name: parsed.name,
      location: parsed.location ?? null,
      startTime: parsed.startTime ?? null,
      durationMinutes: parsed.durationMinutes,
      travelMinutes: parsed.travelMinutes,
      costGbp: parsed.costGbp,
      booked: parsed.booked,
      notes: parsed.notes ?? null,
      createdAt: new Date().toISOString(),
    };
    await updateAttraction(a);
    return NextResponse.json(a);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  const tripId = req.nextUrl.searchParams.get("tripId") ?? DEFAULT_TRIP_ID;
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }
  await deleteAttraction(tripId, id);
  return NextResponse.json({ ok: true });
}
