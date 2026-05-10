import { BigQuery } from "@google-cloud/bigquery";
import type {
  Attraction,
  Expense,
  ExpenseCategory,
  Stay,
  Trip,
} from "./types";

const PROJECT_ID = process.env.GCP_PROJECT_ID;
const DATASET = process.env.BQ_DATASET ?? "vacation_planner";
const LOCATION = process.env.BQ_LOCATION ?? "EU";

let _bq: BigQuery | null = null;

export function bq(): BigQuery {
  if (!PROJECT_ID) {
    throw new Error(
      "GCP_PROJECT_ID is not set. Configure it in .env.local or Cloud Run env.",
    );
  }
  if (!_bq) {
    _bq = new BigQuery({ projectId: PROJECT_ID, location: LOCATION });
  }
  return _bq;
}

export const tableNames = {
  trips: "trips",
  attractions: "attractions",
  stays: "stays",
  expenses: "expenses",
} as const;

export function fqTable(name: keyof typeof tableNames): string {
  return `\`${PROJECT_ID}.${DATASET}.${tableNames[name]}\``;
}

const SCHEMAS = {
  trips: [
    { name: "id", type: "STRING", mode: "REQUIRED" },
    { name: "name", type: "STRING", mode: "REQUIRED" },
    { name: "start_date", type: "DATE", mode: "REQUIRED" },
    { name: "num_days", type: "INT64", mode: "REQUIRED" },
    { name: "num_travellers", type: "INT64", mode: "REQUIRED" },
    { name: "currency", type: "STRING", mode: "REQUIRED" },
    { name: "created_at", type: "TIMESTAMP", mode: "REQUIRED" },
  ],
  attractions: [
    { name: "id", type: "STRING", mode: "REQUIRED" },
    { name: "trip_id", type: "STRING", mode: "REQUIRED" },
    { name: "day_number", type: "INT64", mode: "REQUIRED" },
    { name: "name", type: "STRING", mode: "REQUIRED" },
    { name: "location", type: "STRING", mode: "NULLABLE" },
    { name: "start_time", type: "STRING", mode: "NULLABLE" },
    { name: "duration_minutes", type: "INT64", mode: "REQUIRED" },
    { name: "travel_minutes", type: "INT64", mode: "REQUIRED" },
    { name: "cost_gbp", type: "FLOAT64", mode: "REQUIRED" },
    { name: "booked", type: "BOOL", mode: "REQUIRED" },
    { name: "notes", type: "STRING", mode: "NULLABLE" },
    { name: "created_at", type: "TIMESTAMP", mode: "REQUIRED" },
  ],
  stays: [
    { name: "id", type: "STRING", mode: "REQUIRED" },
    { name: "trip_id", type: "STRING", mode: "REQUIRED" },
    { name: "name", type: "STRING", mode: "REQUIRED" },
    { name: "check_in_date", type: "DATE", mode: "REQUIRED" },
    { name: "check_out_date", type: "DATE", mode: "REQUIRED" },
    { name: "cost_gbp", type: "FLOAT64", mode: "REQUIRED" },
    { name: "address", type: "STRING", mode: "NULLABLE" },
    { name: "notes", type: "STRING", mode: "NULLABLE" },
    { name: "created_at", type: "TIMESTAMP", mode: "REQUIRED" },
  ],
  expenses: [
    { name: "id", type: "STRING", mode: "REQUIRED" },
    { name: "trip_id", type: "STRING", mode: "REQUIRED" },
    { name: "day_number", type: "INT64", mode: "NULLABLE" },
    { name: "category", type: "STRING", mode: "REQUIRED" },
    { name: "description", type: "STRING", mode: "REQUIRED" },
    { name: "amount_gbp", type: "FLOAT64", mode: "REQUIRED" },
    { name: "paid_by", type: "STRING", mode: "NULLABLE" },
    { name: "created_at", type: "TIMESTAMP", mode: "REQUIRED" },
  ],
} as const;

export async function ensureSchema(): Promise<void> {
  const client = bq();
  const dataset = client.dataset(DATASET);
  const [exists] = await dataset.exists();
  if (!exists) {
    await dataset.create({ location: LOCATION });
  }
  for (const tbl of Object.keys(SCHEMAS) as Array<keyof typeof SCHEMAS>) {
    const table = dataset.table(tableNames[tbl]);
    const [tExists] = await table.exists();
    if (!tExists) {
      await table.create({
        schema: { fields: SCHEMAS[tbl] as never },
        location: LOCATION,
      });
    }
  }
}

type BqDate = string | { value: string };

function toIsoDate(v: BqDate | null | undefined): string {
  if (!v) return "";
  return typeof v === "string" ? v : v.value;
}

function toIsoTimestamp(v: BqDate | null | undefined): string {
  if (!v) return "";
  return typeof v === "string" ? v : v.value;
}

export async function getTrip(tripId: string): Promise<Trip | null> {
  const [rows] = await bq().query({
    query: `SELECT * FROM ${fqTable("trips")} WHERE id = @id LIMIT 1`,
    params: { id: tripId },
  });
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    id: r.id,
    name: r.name,
    startDate: toIsoDate(r.start_date),
    numDays: Number(r.num_days),
    numTravellers: Number(r.num_travellers),
    currency: r.currency as "GBP",
    createdAt: toIsoTimestamp(r.created_at),
  };
}

export async function upsertTrip(trip: Trip): Promise<void> {
  await bq().query({
    query: `
      MERGE ${fqTable("trips")} T
      USING (
        SELECT
          @id AS id,
          @name AS name,
          DATE(@start_date) AS start_date,
          @num_days AS num_days,
          @num_travellers AS num_travellers,
          @currency AS currency,
          TIMESTAMP(@created_at) AS created_at
      ) S
      ON T.id = S.id
      WHEN MATCHED THEN UPDATE SET
        name = S.name,
        start_date = S.start_date,
        num_days = S.num_days,
        num_travellers = S.num_travellers,
        currency = S.currency
      WHEN NOT MATCHED THEN INSERT (id, name, start_date, num_days, num_travellers, currency, created_at)
        VALUES (S.id, S.name, S.start_date, S.num_days, S.num_travellers, S.currency, S.created_at)
    `,
    params: {
      id: trip.id,
      name: trip.name,
      start_date: trip.startDate,
      num_days: trip.numDays,
      num_travellers: trip.numTravellers,
      currency: trip.currency,
      created_at: trip.createdAt,
    },
  });
}

export async function listAttractions(tripId: string): Promise<Attraction[]> {
  const [rows] = await bq().query({
    query: `SELECT * FROM ${fqTable("attractions")} WHERE trip_id = @tid ORDER BY day_number, start_time`,
    params: { tid: tripId },
  });
  return rows.map((r) => ({
    id: r.id,
    tripId: r.trip_id,
    dayNumber: Number(r.day_number),
    name: r.name,
    location: r.location,
    startTime: r.start_time,
    durationMinutes: Number(r.duration_minutes),
    travelMinutes: Number(r.travel_minutes),
    costGbp: Number(r.cost_gbp),
    booked: Boolean(r.booked),
    notes: r.notes,
    createdAt: toIsoTimestamp(r.created_at),
  }));
}

export async function insertAttraction(a: Attraction): Promise<void> {
  await bq().query({
    query: `
      INSERT INTO ${fqTable("attractions")}
        (id, trip_id, day_number, name, location, start_time,
         duration_minutes, travel_minutes, cost_gbp, booked, notes, created_at)
      VALUES (@id, @trip_id, @day_number, @name, @location, @start_time,
              @duration_minutes, @travel_minutes, @cost_gbp, @booked, @notes,
              TIMESTAMP(@created_at))
    `,
    params: {
      id: a.id,
      trip_id: a.tripId,
      day_number: a.dayNumber,
      name: a.name,
      location: a.location,
      start_time: a.startTime,
      duration_minutes: a.durationMinutes,
      travel_minutes: a.travelMinutes,
      cost_gbp: a.costGbp,
      booked: a.booked,
      notes: a.notes,
      created_at: a.createdAt,
    },
    types: {
      location: "STRING",
      start_time: "STRING",
      notes: "STRING",
    },
  });
}

export async function updateAttraction(a: Attraction): Promise<void> {
  await bq().query({
    query: `
      UPDATE ${fqTable("attractions")}
      SET day_number = @day_number,
          name = @name,
          location = @location,
          start_time = @start_time,
          duration_minutes = @duration_minutes,
          travel_minutes = @travel_minutes,
          cost_gbp = @cost_gbp,
          booked = @booked,
          notes = @notes
      WHERE id = @id AND trip_id = @trip_id
    `,
    params: {
      id: a.id,
      trip_id: a.tripId,
      day_number: a.dayNumber,
      name: a.name,
      location: a.location,
      start_time: a.startTime,
      duration_minutes: a.durationMinutes,
      travel_minutes: a.travelMinutes,
      cost_gbp: a.costGbp,
      booked: a.booked,
      notes: a.notes,
    },
    types: {
      location: "STRING",
      start_time: "STRING",
      notes: "STRING",
    },
  });
}

export async function deleteAttraction(tripId: string, id: string): Promise<void> {
  await bq().query({
    query: `DELETE FROM ${fqTable("attractions")} WHERE id = @id AND trip_id = @tid`,
    params: { id, tid: tripId },
  });
}

export async function listStays(tripId: string): Promise<Stay[]> {
  const [rows] = await bq().query({
    query: `SELECT * FROM ${fqTable("stays")} WHERE trip_id = @tid ORDER BY check_in_date`,
    params: { tid: tripId },
  });
  return rows.map((r) => ({
    id: r.id,
    tripId: r.trip_id,
    name: r.name,
    checkInDate: toIsoDate(r.check_in_date),
    checkOutDate: toIsoDate(r.check_out_date),
    costGbp: Number(r.cost_gbp),
    address: r.address,
    notes: r.notes,
    createdAt: toIsoTimestamp(r.created_at),
  }));
}

export async function insertStay(s: Stay): Promise<void> {
  await bq().query({
    query: `
      INSERT INTO ${fqTable("stays")}
        (id, trip_id, name, check_in_date, check_out_date, cost_gbp, address, notes, created_at)
      VALUES (@id, @trip_id, @name, DATE(@check_in_date), DATE(@check_out_date),
              @cost_gbp, @address, @notes, TIMESTAMP(@created_at))
    `,
    params: {
      id: s.id,
      trip_id: s.tripId,
      name: s.name,
      check_in_date: s.checkInDate,
      check_out_date: s.checkOutDate,
      cost_gbp: s.costGbp,
      address: s.address,
      notes: s.notes,
      created_at: s.createdAt,
    },
    types: { address: "STRING", notes: "STRING" },
  });
}

export async function deleteStay(tripId: string, id: string): Promise<void> {
  await bq().query({
    query: `DELETE FROM ${fqTable("stays")} WHERE id = @id AND trip_id = @tid`,
    params: { id, tid: tripId },
  });
}

export async function listExpenses(tripId: string): Promise<Expense[]> {
  const [rows] = await bq().query({
    query: `SELECT * FROM ${fqTable("expenses")} WHERE trip_id = @tid ORDER BY created_at DESC`,
    params: { tid: tripId },
  });
  return rows.map((r) => ({
    id: r.id,
    tripId: r.trip_id,
    dayNumber: r.day_number === null || r.day_number === undefined ? null : Number(r.day_number),
    category: r.category as ExpenseCategory,
    description: r.description,
    amountGbp: Number(r.amount_gbp),
    paidBy: r.paid_by,
    createdAt: toIsoTimestamp(r.created_at),
  }));
}

export async function insertExpense(e: Expense): Promise<void> {
  await bq().query({
    query: `
      INSERT INTO ${fqTable("expenses")}
        (id, trip_id, day_number, category, description, amount_gbp, paid_by, created_at)
      VALUES (@id, @trip_id, @day_number, @category, @description, @amount_gbp, @paid_by,
              TIMESTAMP(@created_at))
    `,
    params: {
      id: e.id,
      trip_id: e.tripId,
      day_number: e.dayNumber,
      category: e.category,
      description: e.description,
      amount_gbp: e.amountGbp,
      paid_by: e.paidBy,
      created_at: e.createdAt,
    },
    types: { day_number: "INT64", paid_by: "STRING" },
  });
}

export async function deleteExpense(tripId: string, id: string): Promise<void> {
  await bq().query({
    query: `DELETE FROM ${fqTable("expenses")} WHERE id = @id AND trip_id = @tid`,
    params: { id, tid: tripId },
  });
}
