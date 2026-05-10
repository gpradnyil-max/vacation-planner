"use client";

import { Bed } from "lucide-react";
import { cn } from "@/lib/cn";
import { dayLabel, formatGbp, formatMinutes } from "@/lib/time";
import type { TripSummary } from "@/lib/types";

type Props = {
  summary: TripSummary;
  selectedDay: number;
  onSelect: (day: number) => void;
};

export default function TimelapseView({ summary, selectedDay, onSelect }: Props) {
  return (
    <div className="glass p-5">
      <div className="flex items-end justify-between gap-2 mb-4">
        <div>
          <h2 className="font-display text-lg font-semibold tracking-tight">
            Trip timelapse
          </h2>
          <p className="text-xs text-white/55 mt-0.5">
            How packed each day is — pick one to plan it.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-[11px] text-white/55">
          <Legend swatch="bg-emerald-400/70" label="Comfy" />
          <Legend swatch="bg-amber-400/70" label="Tight" />
          <Legend swatch="bg-rose-500/80" label="Overrun" />
        </div>
      </div>

      <ol className="space-y-2">
        {summary.days.map((d) => {
          const fillPct = Math.min(
            (d.plannedMinutes / d.availableMinutes) * 100,
            100,
          );
          const overrun = d.overrunMinutes > 0;
          const tight = !overrun && fillPct > 85;
          const empty = d.attractions.length === 0 && !overrun;
          const active = d.dayNumber === selectedDay;
          const stayName = d.stays[0]?.name;
          const firstAttraction = d.attractions[0]?.name;
          const headroom = Math.max(d.availableMinutes - d.plannedMinutes, 0);

          return (
            <li key={d.dayNumber}>
              <button
                onClick={() => onSelect(d.dayNumber)}
                className={cn(
                  "group w-full text-left rounded-2xl border p-3 sm:p-4 transition",
                  active
                    ? "border-white/40 bg-white/[0.08] shadow-glow"
                    : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]",
                )}
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <DayBadge dayNumber={d.dayNumber} active={active} />

                  <div className="hidden sm:block min-w-[7rem]">
                    <div className="font-display text-sm font-semibold truncate">
                      {dayLabel(d.date)}
                    </div>
                    <div className="text-[11px] text-white/55 mt-0.5">
                      {d.attractions.length} stop
                      {d.attractions.length === 1 ? "" : "s"} ·{" "}
                      {formatMinutes(d.plannedMinutes)}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="sm:hidden mb-1.5 flex items-center justify-between gap-2">
                      <span className="font-display text-sm font-semibold truncate">
                        {dayLabel(d.date)}
                      </span>
                      <span className="text-[11px] text-white/55 shrink-0">
                        {d.attractions.length} stop
                        {d.attractions.length === 1 ? "" : "s"} ·{" "}
                        {formatMinutes(d.plannedMinutes)}
                      </span>
                    </div>
                    <ProgressBar
                      fillPct={fillPct}
                      overrun={overrun}
                      tight={tight}
                      empty={empty}
                    />
                    <div className="mt-1.5 flex items-center justify-between gap-2 text-[11px] text-white/55">
                      <span className="truncate">
                        {empty
                          ? "Nothing planned"
                          : firstAttraction
                            ? `Starts: ${firstAttraction}`
                            : ""}
                      </span>
                      <span className="shrink-0">
                        {overrun
                          ? `+${formatMinutes(d.overrunMinutes)} over`
                          : `${formatMinutes(headroom)} free`}
                      </span>
                    </div>
                  </div>

                  <div className="hidden md:flex flex-col items-end gap-1 min-w-[6.5rem]">
                    {stayName && (
                      <span className="pill bg-violet-400/15 text-violet-100 border border-violet-300/20 max-w-[10rem]">
                        <Bed size={10} />
                        <span className="truncate">{stayName}</span>
                      </span>
                    )}
                    <span className="text-[11px] text-white/45">
                      {formatGbp(d.totalSpentGbp)} spent
                    </span>
                  </div>

                  <StatusDot
                    overrun={overrun}
                    tight={tight}
                    empty={empty}
                  />
                </div>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function DayBadge({
  dayNumber,
  active,
}: {
  dayNumber: number;
  active: boolean;
}) {
  return (
    <div
      className={cn(
        "shrink-0 h-12 w-12 rounded-xl border flex flex-col items-center justify-center font-display transition",
        active
          ? "bg-gradient-sunset border-white/30 text-white shadow-glow-warm"
          : "bg-white/5 border-white/10 text-white/80 group-hover:bg-white/10",
      )}
    >
      <span className="text-[9px] uppercase tracking-wider opacity-80">Day</span>
      <span className="text-base font-semibold leading-none -mt-0.5">
        {dayNumber}
      </span>
    </div>
  );
}

function ProgressBar({
  fillPct,
  overrun,
  tight,
  empty,
}: {
  fillPct: number;
  overrun: boolean;
  tight: boolean;
  empty: boolean;
}) {
  return (
    <div className="relative h-2.5 rounded-full bg-white/[0.06] overflow-hidden">
      <div
        className={cn(
          "absolute inset-y-0 left-0 rounded-full transition-all",
          overrun
            ? "bg-gradient-to-r from-rose-500 to-rose-300"
            : tight
              ? "bg-gradient-to-r from-amber-500 to-amber-300"
              : empty
                ? "bg-white/15"
                : "bg-gradient-to-r from-ocean-500 to-ocean-300",
        )}
        style={{ width: `${Math.max(fillPct, empty ? 4 : 6)}%` }}
      />
      {overrun && (
        <div className="absolute inset-y-0 right-0 w-1 bg-rose-400 animate-pulse" />
      )}
    </div>
  );
}

function StatusDot({
  overrun,
  tight,
  empty,
}: {
  overrun: boolean;
  tight: boolean;
  empty: boolean;
}) {
  return (
    <span
      className={cn(
        "shrink-0 h-2 w-2 rounded-full",
        overrun
          ? "bg-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.6)]"
          : tight
            ? "bg-amber-300"
            : empty
              ? "bg-white/30"
              : "bg-emerald-300",
      )}
    />
  );
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={cn("h-2 w-2 rounded-full", swatch)} />
      <span>{label}</span>
    </div>
  );
}
