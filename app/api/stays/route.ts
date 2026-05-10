import { NextRequest, NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
import { z } from "zod";
import { deleteStay, insertStay, listStays } from "@/lib/bigquery";
import { DEFAULT_TRIP_ID } from "@/lib/defaults";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  tripId: z.string().min(1).default(DEFAULT_TRIP_ID),
  name: z.string().min(1).max(160),
  checkInDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkOutDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  costGbp: z.number().min(0).max(1_000_000).default(0),
  address: z.string().max(300).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
});

export async function GET(req: NextRequest) {
  const tripId = req.nextUrl.searchParams.get("tripId") ?? DEFAULT_TRIP_ID;
  return NextResponse.json(await listStays(tripId));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.parse(body);
    if (parsed.checkOutDate <= parsed.checkInDate) {
      return NextResponse.json(
        { error: "Check-out must be after check-in" },
        { status: 400 },
      );
    }
    const s = {
      id: uuid(),
      tripId: parsed.tripId,
      name: parsed.name,
      checkInDate: parsed.checkInDate,
      checkOutDate: parsed.checkOutDate,
      costGbp: parsed.costGbp,
      address: parsed.address ?? null,
      notes: parsed.notes ?? null,
      createdAt: new Date().toISOString(),
    };
    await insertStay(s);
    return NextResponse.json(s, { status: 201 });
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
  await deleteStay(tripId, id);
  return NextResponse.json({ ok: true });
}
