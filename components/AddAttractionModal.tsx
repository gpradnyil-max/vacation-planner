"use client";

import { useState } from "react";
import Modal from "./Modal";
import type { Attraction, Trip } from "@/lib/types";

type Props = {
  open: boolean;
  onClose: () => void;
  trip: Trip;
  defaultDay: number;
  onCreate: (a: Omit<Attraction, "id" | "createdAt">) => Promise<void>;
};

export default function AddAttractionModal({
  open,
  onClose,
  trip,
  defaultDay,
  onCreate,
}: Props) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [day, setDay] = useState(defaultDay);
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState(120);
  const [travel, setTravel] = useState(15);
  const [cost, setCost] = useState(0);
  const [notes, setNotes] = useState("");
  const [booked, setBooked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setName("");
    setLocation("");
    setStartTime("");
    setDuration(120);
    setTravel(15);
    setCost(0);
    setNotes("");
    setBooked(false);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Give this attraction a name");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onCreate({
        tripId: trip.id,
        dayNumber: day,
        name: name.trim(),
        location: location.trim() || null,
        startTime: startTime || null,
        durationMinutes: duration,
        travelMinutes: travel,
        costGbp: cost,
        booked,
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
      title="Add an attraction"
      subtitle="What are you doing, and how long does it take?"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Name</label>
          <input
            className="input mt-1.5"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Tower of London tour"
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Day</label>
            <select
              className="input mt-1.5"
              value={day}
              onChange={(e) => setDay(Number(e.target.value))}
            >
              {Array.from({ length: trip.numDays }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>
                  Day {d}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Start time</label>
            <input
              type="time"
              className="input mt-1.5"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="label">Location</label>
          <input
            className="input mt-1.5"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Address or area"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="label">Duration (min)</label>
            <input
              type="number"
              min={0}
              max={1440}
              className="input mt-1.5"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value) || 0)}
            />
          </div>
          <div>
            <label className="label">Travel (min)</label>
            <input
              type="number"
              min={0}
              max={720}
              className="input mt-1.5"
              value={travel}
              onChange={(e) => setTravel(Number(e.target.value) || 0)}
            />
          </div>
          <div>
            <label className="label">Cost (£)</label>
            <input
              type="number"
              min={0}
              step="0.01"
              className="input mt-1.5"
              value={cost}
              onChange={(e) => setCost(Number(e.target.value) || 0)}
            />
          </div>
        </div>

        <div>
          <label className="label">Notes</label>
          <textarea
            className="input mt-1.5 min-h-[72px] resize-y"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Booking ref, tips, anything to remember"
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-white/75 cursor-pointer">
          <input
            type="checkbox"
            checked={booked}
            onChange={(e) => setBooked(e.target.checked)}
            className="h-4 w-4 rounded accent-emerald-400"
          />
          Already booked
        </label>

        {error && (
          <p className="text-xs text-rose-200 bg-rose-500/10 border border-rose-300/30 rounded-lg p-2.5">
            {error}
          </p>
        )}

        <div className="flex gap-3 justify-end pt-1">
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
            {submitting ? "Saving..." : "Add to plan"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
