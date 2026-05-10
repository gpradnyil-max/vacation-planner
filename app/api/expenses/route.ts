import { NextRequest, NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
import { z } from "zod";
import {
  deleteExpense,
  insertExpense,
  listExpenses,
} from "@/lib/bigquery";
import { DEFAULT_TRIP_ID } from "@/lib/defaults";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  tripId: z.string().min(1).default(DEFAULT_TRIP_ID),
  dayNumber: z.number().int().min(1).max(30).nullable().optional(),
  category: z.enum(["food", "transport", "tickets", "shopping", "other"]),
  description: z.string().min(1).max(200),
  amountGbp: z.number().min(0).max(1_000_000),
  paidBy: z.string().max(80).nullable().optional(),
});

export async function GET(req: NextRequest) {
  const tripId = req.nextUrl.searchParams.get("tripId") ?? DEFAULT_TRIP_ID;
  return NextResponse.json(await listExpenses(tripId));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.parse(body);
    const e = {
      id: uuid(),
      tripId: parsed.tripId,
      dayNumber: parsed.dayNumber ?? null,
      category: parsed.category,
      description: parsed.description,
      amountGbp: parsed.amountGbp,
      paidBy: parsed.paidBy ?? null,
      createdAt: new Date().toISOString(),
    };
    await insertExpense(e);
    return NextResponse.json(e, { status: 201 });
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
  await deleteExpense(tripId, id);
  return NextResponse.json({ ok: true });
}
