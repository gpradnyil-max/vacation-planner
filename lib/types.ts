export type Trip = {
  id: string;
  name: string;
  startDate: string; // ISO yyyy-mm-dd
  numDays: number;
  numTravellers: number;
  currency: "GBP";
  createdAt: string;
};

export type Attraction = {
  id: string;
  tripId: string;
  dayNumber: number; // 1..numDays
  name: string;
  location: string | null;
  startTime: string | null; // HH:mm — local time
  durationMinutes: number;
  travelMinutes: number;
  costGbp: number;
  booked: boolean;
  notes: string | null;
  createdAt: string;
};

export type Stay = {
  id: string;
  tripId: string;
  name: string;
  checkInDate: string; // yyyy-mm-dd
  checkOutDate: string; // yyyy-mm-dd
  costGbp: number;
  address: string | null;
  notes: string | null;
  createdAt: string;
};

export type ExpenseCategory =
  | "food"
  | "transport"
  | "tickets"
  | "shopping"
  | "other";

export type Expense = {
  id: string;
  tripId: string;
  dayNumber: number | null; // null if general
  category: ExpenseCategory;
  description: string;
  amountGbp: number;
  paidBy: string | null;
  createdAt: string;
};

export type DayPlan = {
  dayNumber: number;
  date: string; // yyyy-mm-dd
  attractions: Attraction[];
  stays: Stay[];
  expenses: Expense[];
  plannedMinutes: number; // sum of attraction durations + travel
  availableMinutes: number; // configurable awake hours per day
  overrunMinutes: number; // > 0 means the plan won't fit
  totalSpentGbp: number;
};

export type TripSummary = {
  trip: Trip;
  days: DayPlan[];
  totals: {
    attractionsBudget: number;
    staysBudget: number;
    spentSoFar: number;
    grandTotal: number;
    perPerson: number;
  };
  prediction: {
    overallStatus: "on-track" | "tight" | "overrun";
    overrunDays: number[];
    underusedDays: number[];
    message: string;
  };
};

export const AWAKE_MINUTES_PER_DAY = 14 * 60; // 8am — 10pm by default
