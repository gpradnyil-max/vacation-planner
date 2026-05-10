import type { Trip } from "./types";

export const DEFAULT_TRIP_ID = process.env.DEFAULT_TRIP_ID ?? "my-vacation";

export function defaultTrip(): Trip {
  return {
    id: DEFAULT_TRIP_ID,
    name: process.env.DEFAULT_TRIP_NAME ?? "Our 7-day vacation",
    startDate: process.env.DEFAULT_TRIP_START_DATE ?? "2026-06-05",
    numDays: 7,
    numTravellers: Number(process.env.DEFAULT_TRIP_TRAVELLERS ?? "2"),
    currency: "GBP",
    createdAt: new Date().toISOString(),
  };
}
