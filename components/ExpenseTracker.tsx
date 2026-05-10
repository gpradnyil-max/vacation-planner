"use client";

import { Plus, Receipt, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatGbp } from "@/lib/time";
import type { Expense, Trip } from "@/lib/types";

const CATEGORY_STYLES: Record<Expense["category"], string> = {
  food: "bg-amber-400/15 text-amber-200 border-amber-300/30",
  transport: "bg-ocean-400/15 text-ocean-200 border-ocean-300/30",
  tickets: "bg-sunset-500/15 text-sunset-400 border-sunset-400/30",
  shopping: "bg-fuchsia-400/15 text-fuchsia-200 border-fuchsia-300/30",
  other: "bg-white/10 text-white/70 border-white/15",
};

const CATEGORY_LABELS: Record<Expense["category"], string> = {
  food: "Food",
  transport: "Transport",
  tickets: "Tickets",
  shopping: "Shopping",
  other: "Other",
};

type Props = {
  trip: Trip;
  expenses: Expense[];
  totalSpent: number;
  grandTotal: number;
  perPerson: number;
  onAdd: () => void;
  onDelete: (e: Expense) => void;
};

export default function ExpenseTracker({
  trip,
  expenses,
  totalSpent,
  grandTotal,
  perPerson,
  onAdd,
  onDelete,
}: Props) {
  const byCategory = expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] ?? 0) + e.amountGbp;
    return acc;
  }, {});
  const categories = (Object.keys(byCategory) as Expense["category"][]).sort(
    (a, b) => byCategory[b] - byCategory[a],
  );

  return (
    <section className="glass p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Receipt size={16} className="text-sunset-400" />
          <h2 className="font-display text-base font-semibold">Expenses</h2>
        </div>
        <button onClick={onAdd} className="btn-ghost px-2 py-1 text-xs">
          <Plus size={14} />
          Log
        </button>
      </div>

      <div className="rounded-xl bg-gradient-to-br from-sunset-500/15 via-fuchsia-500/10 to-transparent border border-white/10 p-4 mb-4">
        <div className="label">Spent so far</div>
        <div className="font-display text-2xl font-semibold tracking-tight">
          {formatGbp(totalSpent)}
        </div>
        <div className="mt-3 text-xs text-white/60 grid grid-cols-2 gap-3">
          <div>
            <div className="text-white/45">Total trip cost</div>
            <div className="font-medium text-white/85">{formatGbp(grandTotal)}</div>
          </div>
          <div>
            <div className="text-white/45">
              Per person ({trip.numTravellers})
            </div>
            <div className="font-medium text-white/85">{formatGbp(perPerson)}</div>
          </div>
        </div>
      </div>

      {categories.length > 0 && (
        <div className="mb-4">
          <div className="label mb-2">By category</div>
          <div className="space-y-1.5">
            {categories.map((c) => {
              const pct = totalSpent > 0 ? (byCategory[c] / totalSpent) * 100 : 0;
              return (
                <div key={c}>
                  <div className="flex justify-between text-[11px] text-white/65 mb-0.5">
                    <span>{CATEGORY_LABELS[c]}</span>
                    <span>{formatGbp(byCategory[c])}</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        c === "food" && "bg-amber-400",
                        c === "transport" && "bg-ocean-400",
                        c === "tickets" && "bg-sunset-500",
                        c === "shopping" && "bg-fuchsia-400",
                        c === "other" && "bg-white/40",
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="label mb-2">Recent</div>
      {expenses.length === 0 ? (
        <p className="text-sm text-white/50">
          Nothing logged yet. Tap <strong>Log</strong> to track shared spending.
        </p>
      ) : (
        <ul className="space-y-2 max-h-72 overflow-y-auto scrollbar-soft pr-1">
          {expenses.slice(0, 30).map((e) => (
            <li
              key={e.id}
              className="rounded-xl bg-white/[0.04] border border-white/10 p-3 group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{e.description}</div>
                  <div className="flex items-center gap-1.5 mt-1 text-[11px] text-white/55 flex-wrap">
                    <span
                      className={cn("pill border", CATEGORY_STYLES[e.category])}
                    >
                      {CATEGORY_LABELS[e.category]}
                    </span>
                    {e.dayNumber && <span>Day {e.dayNumber}</span>}
                    {e.paidBy && <span>· {e.paidBy}</span>}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="font-display text-sm font-semibold">
                    {formatGbp(e.amountGbp)}
                  </span>
                  <button
                    onClick={() => onDelete(e)}
                    className="opacity-0 group-hover:opacity-100 transition text-white/40 hover:text-rose-300 p-1"
                    aria-label="Delete expense"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
