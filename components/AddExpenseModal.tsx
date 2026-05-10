"use client";

import { useState } from "react";
import Modal from "./Modal";
import type { Expense, ExpenseCategory, Trip } from "@/lib/types";

const CATEGORIES: { value: ExpenseCategory; label: string }[] = [
  { value: "food", label: "Food" },
  { value: "transport", label: "Transport" },
  { value: "tickets", label: "Tickets" },
  { value: "shopping", label: "Shopping" },
  { value: "other", label: "Other" },
];

type Props = {
  open: boolean;
  onClose: () => void;
  trip: Trip;
  defaultDay: number;
  onCreate: (e: Omit<Expense, "id" | "createdAt">) => Promise<void>;
};

export default function AddExpenseModal({
  open,
  onClose,
  trip,
  defaultDay,
  onCreate,
}: Props) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState(0);
  const [category, setCategory] = useState<ExpenseCategory>("food");
  const [day, setDay] = useState<number | "">(defaultDay);
  const [paidBy, setPaidBy] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setDescription("");
    setAmount(0);
    setCategory("food");
    setDay(defaultDay);
    setPaidBy("");
    setError(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) {
      setError("Describe the expense");
      return;
    }
    if (amount <= 0) {
      setError("Amount must be more than zero");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onCreate({
        tripId: trip.id,
        dayNumber: day === "" ? null : day,
        category,
        description: description.trim(),
        amountGbp: amount,
        paidBy: paidBy.trim() || null,
      });
      reset();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title="Log an expense"
      subtitle="Shared spend for the trip in GBP."
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Description</label>
          <input
            className="input mt-1.5"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Dinner at Dishoom"
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Amount (£)</label>
            <input
              type="number"
              min={0}
              step="0.01"
              className="input mt-1.5"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value) || 0)}
            />
          </div>
          <div>
            <label className="label">Category</label>
            <select
              className="input mt-1.5"
              value={category}
              onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Day</label>
            <select
              className="input mt-1.5"
              value={day === "" ? "" : day}
              onChange={(e) =>
                setDay(e.target.value === "" ? "" : Number(e.target.value))
              }
            >
              <option value="">Whole trip</option>
              {Array.from({ length: trip.numDays }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>
                  Day {d}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Paid by</label>
            <input
              className="input mt-1.5"
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value)}
              placeholder="Optional"
            />
          </div>
        </div>

        {error && (
          <p className="text-xs text-rose-200 bg-rose-500/10 border border-rose-300/30 rounded-lg p-2.5">
            {error}
          </p>
        )}

        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={() => {
              reset();
              onClose();
            }}
            className="btn-ghost"
          >
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? "Saving..." : "Log expense"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
