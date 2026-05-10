"use client";

import {
  Banknote,
  Building2,
  CalendarRange,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  createAttraction,
  createExpense,
  createStay,
  deleteAttractionApi,
  deleteExpenseApi,
  deleteStayApi,
  fetchSummary,
  toggleAttractionBooked,
} from "@/lib/api";
import { formatGbp, formatMinutes } from "@/lib/time";
import type { Attraction, Expense, Stay, TripSummary } from "@/lib/types";
import AddAttractionModal from "./AddAttractionModal";
import AddExpenseModal from "./AddExpenseModal";
import AddStayModal from "./AddStayModal";
import DayPlanner from "./DayPlanner";
import ExpenseTracker from "./ExpenseTracker";
import StatCard from "./StatCard";
import StaysPanel from "./StaysPanel";
import TimelapseView from "./TimelapseView";
import TripHeader from "./TripHeader";
import TripPredictor from "./TripPredictor";

export default function Dashboard() {
  const [summary, setSummary] = useState<TripSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState(1);
  const [showAttraction, setShowAttraction] = useState(false);
  const [showStay, setShowStay] = useState(false);
  const [showExpense, setShowExpense] = useState(false);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      const data = await fetchSummary();
      setSummary(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function onAddAttraction(payload: Omit<Attraction, "id" | "createdAt">) {
    await createAttraction(payload);
    await refresh();
  }

  async function onDeleteAttraction(a: Attraction) {
    await deleteAttractionApi(a.id, a.tripId);
    await refresh();
  }

  async function onToggleBooked(a: Attraction) {
    await toggleAttractionBooked(a);
    await refresh();
  }

  async function onAddStay(payload: Omit<Stay, "id" | "createdAt">) {
    await createStay(payload);
    await refresh();
  }

  async function onDeleteStay(s: Stay) {
    await deleteStayApi(s.id, s.tripId);
    await refresh();
  }

  async function onAddExpense(payload: Omit<Expense, "id" | "createdAt">) {
    await createExpense(payload);
    await refresh();
  }

  async function onDeleteExpense(e: Expense) {
    await deleteExpenseApi(e.id, e.tripId);
    await refresh();
  }

  if (loading && !summary) return <LoadingScreen />;
  if (error && !summary) return <ErrorScreen message={error} onRetry={refresh} />;
  if (!summary) return null;

  const day = summary.days.find((d) => d.dayNumber === selectedDay) ?? summary.days[0];
  const totalPlannedMinutes = summary.days.reduce(
    (s, d) => s + d.plannedMinutes,
    0,
  );
  const totalAttractionCount = summary.days.reduce(
    (s, d) => s + d.attractions.length,
    0,
  );

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <TripHeader
        trip={summary.trip}
        grandTotal={summary.totals.grandTotal}
        perPerson={summary.totals.perPerson}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Planned time"
          value={formatMinutes(totalPlannedMinutes)}
          hint={`${totalAttractionCount} attraction${totalAttractionCount === 1 ? "" : "s"}`}
          icon={CalendarRange}
          tone="ocean"
        />
        <StatCard
          label="Spent so far"
          value={formatGbp(summary.totals.spentSoFar)}
          hint={`Trip total ${formatGbp(summary.totals.grandTotal)}`}
          icon={Banknote}
          tone="sunset"
        />
        <StatCard
          label="Attractions budget"
          value={formatGbp(summary.totals.attractionsBudget)}
          hint="Planned tickets & tours"
          icon={Sparkles}
          tone="violet"
        />
        <StatCard
          label="Stays budget"
          value={formatGbp(summary.totals.staysBudget)}
          hint={`${summary.days.reduce((s, d) => Math.max(s, d.stays.length), 0) > 0 ? "Across the week" : "No stays yet"}`}
          icon={Building2}
          tone="mint"
        />
      </div>

      <div className="mb-6">
        <TripPredictor summary={summary} />
      </div>

      <div className="mb-6">
        <TimelapseView
          summary={summary}
          selectedDay={selectedDay}
          onSelect={setSelectedDay}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DayPlanner
            day={day}
            onAddAttraction={() => setShowAttraction(true)}
            onDeleteAttraction={onDeleteAttraction}
            onToggleBooked={onToggleBooked}
          />
        </div>
        <aside className="space-y-6">
          <StaysPanel
            stays={summary.days
              .flatMap((d) => d.stays)
              .filter((s, i, arr) => arr.findIndex((x) => x.id === s.id) === i)}
            onAdd={() => setShowStay(true)}
            onDelete={onDeleteStay}
          />
          <ExpenseTracker
            trip={summary.trip}
            expenses={summary.days.flatMap((d) => d.expenses)}
            totalSpent={summary.totals.spentSoFar}
            grandTotal={summary.totals.grandTotal}
            perPerson={summary.totals.perPerson}
            onAdd={() => setShowExpense(true)}
            onDelete={onDeleteExpense}
          />
        </aside>
      </div>

      <footer className="mt-10 text-center">
        <button onClick={refresh} className="btn-ghost text-xs">
          <RefreshCw size={12} />
          Refresh from BigQuery
        </button>
      </footer>

      <AddAttractionModal
        open={showAttraction}
        onClose={() => setShowAttraction(false)}
        trip={summary.trip}
        defaultDay={selectedDay}
        onCreate={onAddAttraction}
      />
      <AddStayModal
        open={showStay}
        onClose={() => setShowStay(false)}
        trip={summary.trip}
        onCreate={onAddStay}
      />
      <AddExpenseModal
        open={showExpense}
        onClose={() => setShowExpense(false)}
        trip={summary.trip}
        defaultDay={selectedDay}
        onCreate={onAddExpense}
      />
    </main>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-ocean-300" size={28} />
      <div className="text-white/60 text-sm">Loading your trip from BigQuery…</div>
    </div>
  );
}

function ErrorScreen({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6">
      <div className="glass max-w-lg p-6 text-center">
        <h2 className="font-display text-lg font-semibold mb-2">
          Couldn&apos;t reach BigQuery
        </h2>
        <p className="text-sm text-white/65 mb-4">{message}</p>
        <p className="text-xs text-white/50 mb-4">
          Make sure <code>GCP_PROJECT_ID</code> is set and credentials are
          available (run <code>gcloud auth application-default login</code> for
          local dev, or set <code>GOOGLE_APPLICATION_CREDENTIALS</code>).
        </p>
        <button onClick={onRetry} className="btn-primary">
          <RefreshCw size={14} />
          Retry
        </button>
      </div>
    </div>
  );
}
