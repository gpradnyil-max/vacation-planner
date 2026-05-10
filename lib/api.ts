import type { Attraction, Expense, Stay, TripSummary } from "./types";

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export async function fetchSummary(): Promise<TripSummary> {
  return json<TripSummary>(await fetch("/api/trip", { cache: "no-store" }));
}

export async function updateTrip(payload: {
  id: string;
  name: string;
  startDate: string;
  numDays: number;
  numTravellers: number;
}) {
  return json(
    await fetch("/api/trip", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
  );
}

export async function createAttraction(
  payload: Omit<Attraction, "id" | "createdAt">,
): Promise<Attraction> {
  return json<Attraction>(
    await fetch("/api/attractions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
  );
}

export async function deleteAttractionApi(id: string, tripId: string) {
  return json(
    await fetch(
      `/api/attractions?id=${encodeURIComponent(id)}&tripId=${encodeURIComponent(tripId)}`,
      { method: "DELETE" },
    ),
  );
}

export async function toggleAttractionBooked(a: Attraction): Promise<Attraction> {
  const payload = { ...a, booked: !a.booked };
  return json<Attraction>(
    await fetch("/api/attractions", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
  );
}

export async function createStay(
  payload: Omit<Stay, "id" | "createdAt">,
): Promise<Stay> {
  return json<Stay>(
    await fetch("/api/stays", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
  );
}

export async function deleteStayApi(id: string, tripId: string) {
  return json(
    await fetch(
      `/api/stays?id=${encodeURIComponent(id)}&tripId=${encodeURIComponent(tripId)}`,
      { method: "DELETE" },
    ),
  );
}

export async function createExpense(
  payload: Omit<Expense, "id" | "createdAt">,
): Promise<Expense> {
  return json<Expense>(
    await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
  );
}

export async function deleteExpenseApi(id: string, tripId: string) {
  return json(
    await fetch(
      `/api/expenses?id=${encodeURIComponent(id)}&tripId=${encodeURIComponent(tripId)}`,
      { method: "DELETE" },
    ),
  );
}
