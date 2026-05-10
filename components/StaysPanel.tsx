"use client";

import { Bed, MapPin, Plus, Trash2 } from "lucide-react";
import { format, parseISO, differenceInCalendarDays } from "date-fns";
import { formatGbp } from "@/lib/time";
import type { Stay } from "@/lib/types";

type Props = {
  stays: Stay[];
  onAdd: () => void;
  onDelete: (s: Stay) => void;
};

export default function StaysPanel({ stays, onAdd, onDelete }: Props) {
  return (
    <section className="glass p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bed size={16} className="text-violet-200" />
          <h2 className="font-display text-base font-semibold">Stays</h2>
        </div>
        <button onClick={onAdd} className="btn-ghost px-2 py-1 text-xs">
          <Plus size={14} />
          Add
        </button>
      </div>

      {stays.length === 0 ? (
        <p className="text-sm text-white/50">
          No stays yet. Add hotels, rentals, or transfers between cities.
        </p>
      ) : (
        <ul className="space-y-2.5">
          {stays.map((s) => {
            const nights = differenceInCalendarDays(
              parseISO(s.checkOutDate),
              parseISO(s.checkInDate),
            );
            return (
              <li
                key={s.id}
                className="rounded-xl bg-white/[0.04] border border-white/10 p-3 group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-medium text-sm truncate">{s.name}</div>
                    <div className="text-[11px] text-white/55 mt-0.5">
                      {format(parseISO(s.checkInDate), "d MMM")} →{" "}
                      {format(parseISO(s.checkOutDate), "d MMM")} ·{" "}
                      <span className="text-white/70">
                        {nights} night{nights === 1 ? "" : "s"}
                      </span>
                    </div>
                    {s.address && (
                      <div className="flex items-center gap-1 text-[11px] text-white/45 mt-0.5">
                        <MapPin size={10} />
                        <span className="truncate">{s.address}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="pill bg-violet-400/15 text-violet-100 border border-violet-300/20">
                      {formatGbp(s.costGbp)}
                    </span>
                    <button
                      onClick={() => onDelete(s)}
                      className="opacity-0 group-hover:opacity-100 transition text-white/40 hover:text-rose-300 p-1"
                      aria-label="Delete stay"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
