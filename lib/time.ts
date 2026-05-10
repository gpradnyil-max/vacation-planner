import { addDays, format, parseISO } from "date-fns";
import {
  AWAKE_MINUTES_PER_DAY,
  type Attraction,
  type DayPlan,
  type Expense,
  type Stay,
  type Trip,
  type TripSummary,
} from "./types";

export function dateForDay(trip: Pick<Trip, "startDate">, dayNumber: number): string {
  return format(addDays(parseISO(trip.startDate), dayNumber - 1), "yyyy-MM-dd");
}

export function buildSummary(
  trip: Trip,
  attractions: Attraction[],
  stays: Stay[],
  expenses: Expense[],
): TripSummary {
  const days: DayPlan[] = [];

  for (let dayNumber = 1; dayNumber <= trip.numDays; dayNumber++) {
    const date = dateForDay(trip, dayNumber);
    const dayAttractions = attractions
      .filter((a) => a.dayNumber === dayNumber)
      .sort((a, b) => (a.startTime ?? "").localeCompare(b.startTime ?? ""));
    const dayStays = stays.filter(
      (s) => s.checkInDate <= date && s.checkOutDate > date,
    );
    const dayExpenses = expenses.filter((e) => e.dayNumber === dayNumber);

    const plannedMinutes = dayAttractions.reduce(
      (sum, a) => sum + a.durationMinutes + a.travelMinutes,
      0,
    );
    const overrunMinutes = Math.max(plannedMinutes - AWAKE_MINUTES_PER_DAY, 0);
    const totalSpentGbp = dayExpenses.reduce((s, e) => s + e.amountGbp, 0);

    days.push({
      dayNumber,
      date,
      attractions: dayAttractions,
      stays: dayStays,
      expenses: dayExpenses,
      plannedMinutes,
      availableMinutes: AWAKE_MINUTES_PER_DAY,
      overrunMinutes,
      totalSpentGbp,
    });
  }

  const attractionsBudget = attractions.reduce((s, a) => s + a.costGbp, 0);
  const staysBudget = stays.reduce((s, st) => s + st.costGbp, 0);
  const spentSoFar = expenses.reduce((s, e) => s + e.amountGbp, 0);
  const grandTotal = attractionsBudget + staysBudget + spentSoFar;
  const perPerson = trip.numTravellers > 0 ? grandTotal / trip.numTravellers : grandTotal;

  const overrunDays = days.filter((d) => d.overrunMinutes > 0).map((d) => d.dayNumber);
  const underusedDays = days
    .filter((d) => d.plannedMinutes < AWAKE_MINUTES_PER_DAY * 0.25 && d.attractions.length === 0)
    .map((d) => d.dayNumber);

  let overallStatus: TripSummary["prediction"]["overallStatus"] = "on-track";
  let message = "Looks like a comfortable schedule. You'll have time to breathe.";

  if (overrunDays.length > 0) {
    overallStatus = "overrun";
    const total = days
      .filter((d) => d.overrunMinutes > 0)
      .reduce((s, d) => s + d.overrunMinutes, 0);
    const hours = Math.floor(total / 60);
    const mins = total % 60;
    message = `${overrunDays.length} day${
      overrunDays.length > 1 ? "s" : ""
    } over by ${hours}h ${mins}m total — drop or move attractions to fit.`;
  } else if (
    days.some((d) => d.plannedMinutes > AWAKE_MINUTES_PER_DAY * 0.85)
  ) {
    overallStatus = "tight";
    message = "Several days are packed close to the limit — leave buffer for delays.";
  }

  return {
    trip,
    days,
    totals: {
      attractionsBudget,
      staysBudget,
      spentSoFar,
      grandTotal,
      perPerson,
    },
    prediction: {
      overallStatus,
      overrunDays,
      underusedDays,
      message,
    },
  };
}

export function formatMinutes(mins: number): string {
  if (mins <= 0) return "0m";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function formatGbp(amount: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 2,
  }).format(amount);
}

export function dayLabel(date: string): string {
  return format(parseISO(date), "EEE, d MMM");
}
