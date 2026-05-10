"use client";

import { Compass, Sparkles, Users } from "lucide-react";
import { addDays, format, parseISO } from "date-fns";
import type { Trip } from "@/lib/types";
import { formatGbp } from "@/lib/time";

type Props = {
  trip: Trip;
  grandTotal: number;
  perPerson: number;
};

export default function TripHeader({ trip, grandTotal, perPerson }: Props) {
  const start = parseISO(trip.startDate);
  const end = addDays(start, trip.numDays - 1);

  return (
    <header className="relative overflow-hidden rounded-3xl border border-white/10 p-6 sm:p-10 mb-6 sm:mb-8">
      <div className="absolute inset-0 bg-gradient-aurora opacity-90" />
      <div className="absolute -top-32 -right-20 h-72 w-72 rounded-full bg-sunset-500/30 blur-3xl" />
      <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-ocean-500/30 blur-3xl" />

      <div className="relative flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-white/70 text-xs uppercase tracking-[0.18em]">
            <Compass size={14} />
            7-day vacation planner
          </div>
          <h1 className="mt-3 font-display text-3xl sm:text-5xl font-bold tracking-tight text-balance">
            {trip.name}
          </h1>
          <p className="mt-2 text-white/75 text-sm sm:text-base">
            {format(start, "EEEE, d MMM yyyy")} →{" "}
            {format(end, "EEEE, d MMM yyyy")}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="pill bg-white/10 border border-white/15 text-white/80">
              <Sparkles size={12} />
              {trip.numDays} days
            </span>
            <span className="pill bg-white/10 border border-white/15 text-white/80">
              <Users size={12} />
              {trip.numTravellers} traveller{trip.numTravellers === 1 ? "" : "s"}
            </span>
          </div>
        </div>

        <div className="rounded-2xl bg-black/30 border border-white/10 p-4 sm:p-5 backdrop-blur min-w-[220px]">
          <div className="text-[11px] uppercase tracking-wider text-white/55">
            Trip total
          </div>
          <div className="font-display text-3xl font-semibold mt-0.5">
            {formatGbp(grandTotal)}
          </div>
          <div className="text-xs text-white/65 mt-1">
            {formatGbp(perPerson)} per person
          </div>
        </div>
      </div>
    </header>
  );
}
