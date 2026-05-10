"use client";

import { addDays, format, parseISO } from "date-fns";
import { useState } from "react";
import Modal from "./Modal";
import type { Stay, Trip } from "@/lib/types";

type Props = {
  open: boolean;
  onClose: () => void;
  trip: Trip;
  onCreate: (s: Omit<Stay, "id" | "createdAt">) => Promise<void>;
};

export default function AddStayModal({ open, onClose, trip, onCreate }: Props) {
  const tripStart = trip.startDate;
  const tripEnd = format(addDays(parseISO(trip.startDate), trip.numDays), "yyyy-MM-dd");

  const [name, setName] = useState("");
  const [checkIn, setCheckIn] = useState(tripStart);
  const [checkOut, setCheckOut] = useState(
    format(addDays(parseISO(tripStart), 1), "yyyy-MM-dd"),
  );
  const [cost, setCost] = useState(0);
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setName("");
    setCheckIn(tripStart);
    setCheckOut(format(addDays(parseISO(tripStart), 1), "yyyy-MM-dd"));
    setCost(0);
    setAddress("");
    setNotes("");
    setError(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Add a name (e.g. Hotel name, Airbnb)");
      return;
    }
    if (checkOut <= checkIn) {
      setError("Check-out must be after check-in");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onCreate({
        tripId: trip.id,
        name: name.trim(),
        checkInDate: checkIn,
        checkOutDate: checkOut,
        costGbp: cost,
        address: address.trim() || null,
        notes: notes.trim() || null,
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
      title="Add a stay"
      subtitle="Hotels, rentals, family — anywhere you'll spend a night."
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Name</label>
          <input
            className="input mt-1.5"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. The Hoxton, Shoreditch"
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Check-in</label>
            <input
              type="date"
              className="input mt-1.5"
              min={tripStart}
              max={tripEnd}
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Check-out</label>
            <input
              type="date"
              className="input mt-1.5"
              min={tripStart}
              max={tripEnd}
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Total cost (£)</label>
            <input
              type="number"
              min={0}
              step="0.01"
              className="input mt-1.5"
              value={cost}
              onChange={(e) => setCost(Number(e.target.value) || 0)}
            />
          </div>
          <div>
            <label className="label">Address</label>
            <input
              className="input mt-1.5"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Optional"
            />
          </div>
        </div>

        <div>
          <label className="label">Notes</label>
          <textarea
            className="input mt-1.5 min-h-[60px] resize-y"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Booking reference, room number, etc."
          />
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
            {submitting ? "Saving..." : "Add stay"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
