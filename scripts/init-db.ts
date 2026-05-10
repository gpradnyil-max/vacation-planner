import { ensureSchema, getTrip, upsertTrip } from "../lib/bigquery";
import { defaultTrip, DEFAULT_TRIP_ID } from "../lib/defaults";

async function main() {
  console.log("Ensuring BigQuery dataset/tables exist...");
  await ensureSchema();

  const existing = await getTrip(DEFAULT_TRIP_ID);
  const next = defaultTrip();
  // Preserve original createdAt so re-runs don't churn the timestamp.
  if (existing) next.createdAt = existing.createdAt;

  if (!existing) {
    console.log(`Seeding default trip "${DEFAULT_TRIP_ID}"...`);
  } else {
    console.log(
      `Updating default trip "${DEFAULT_TRIP_ID}" → ${next.startDate}, ` +
        `${next.numDays} days, ${next.numTravellers} travellers.`,
    );
  }
  await upsertTrip(next);
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
