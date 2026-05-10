"use client";

import {
  CalendarDays,
  Check,
  Clock,
  MapPin,
  Plus,
  Ticket,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { dayLabel, formatGbp, formatMinutes } from "@/lib/time";
import type { Attraction, DayPlan } from "@/lib/types";

type Props = {
  day: DayPlan;
  onAddAttraction: () => void;
  onDeleteAttraction: (a: Attraction) => void;
  onToggleBooked: (a: Attraction) => void;
};

export default function DayPlanner({
  day,
  onAddAttraction,
  onDeleteAttraction,
  onToggleBooked,
}: Props) {
  const fillPct = Math.min((day.plannedMinutes / day.availableMinutes) * 100, 100);
  const overrun = day.overrunMinutes > 0;

  return (
    <div className="glass p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-3 justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 text-white/55 text-xs uppercase tracking-wider">
            <CalendarDays size={14} />
            Day {day.dayNumber}
          </div>
          <h2 className="font-display text-2xl font-semibold tracking-tight mt-1">
            {dayLabel(day.date)}
          </h2>
        </div>
        <button onClick={onAddAttraction} className="btn-primary">
          <Plus size={16} />
          Add attraction
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <Mini label="Planned" value={formatMinutes(day.plannedMinutes)} />
        <Mini
          label="Available"
          value={formatMinutes(day.availableMinutes)}
          hint="14h awake/day"
        />
        <Mini
          label={overrun ? "Overrun" : "Headroom"}
          value={
            overrun
              ? `+${formatMinutes(day.overrunMinutes)}`
              : formatMinutes(Math.max(day.availableMinutes - day.plannedMinutes, 0))
          }
          tone={overrun ? "danger" : "ok"}
        />
        <Mini label="Day spend" value={formatGbp(day.totalSpentGbp)} />
      </div>

      <div className="h-2 rounded-full bg-white/10 overflow-hidden mb-6">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            overrun
              ? "bg-gradient-to-r from-rose-500 to-rose-300"
              : fillPct > 85
                ? "bg-gradient-to-r from-amber-500 to-amber-300"
                : "bg-gradient-to-r from-ocean-500 to-ocean-300",
          )}
          style={{ width: `${Math.max(fillPct, 2)}%` }}
        />
      </div>

      {day.stays.length > 0 && (
        <div className="mb-5">
          <div className="label mb-2">Staying tonight</div>
          <div className="flex flex-wrap gap-2">
            {day.stays.map((s) => (
              <span
                key={s.id}
                className="pill bg-violet-400/15 text-violet-100 border border-violet-300/20"
              >
                <MapPin size={12} />
                {s.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {day.attractions.length === 0 ? (
        <EmptyState onAdd={onAddAttraction} />
      ) : (
        <ol className="relative space-y-3 pl-5 before:content-[''] before:absolute before:left-1.5 before:top-1 before:bottom-1 before:w-px before:bg-gradient-to-b before:from-ocean-400/60 before:to-transparent">
          {day.attractions.map((a) => (
            <li key={a.id} className="relative">
              <span
                className={cn(
                  "absolute -left-5 top-3 h-3 w-3 rounded-full border-2",
                  a.booked
                    ? "bg-emerald-400 border-emerald-200"
                    : "bg-white/20 border-white/40",
                )}
              />
              <AttractionRow
                attraction={a}
                onDelete={() => onDeleteAttraction(a)}
                onToggle={() => onToggleBooked(a)}
              />
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function Mini({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "ok" | "danger";
}) {
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-3">
      <div className="label">{label}</div>
      <div
        className={cn(
          "font-display text-base font-semibold mt-1",
          tone === "danger" && "text-rose-200",
          tone === "ok" && "text-emerald-200",
        )}
      >
        {value}
      </div>
      {hint && <div className="text-[11px] text-white/40 mt-0.5">{hint}</div>}
    </div>
  );
}

function AttractionRow({
  attraction: a,
  onDelete,
  onToggle,
}: {
  attraction: Attraction;
  onDelete: () => void;
  onToggle: () => void;
}) {
  return (
    <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3.5 hover:bg-white/[0.07] transition group">
      <div className="flex items-start gap-3">
        <button
          onClick={onToggle}
          className={cn(
            "mt-0.5 h-5 w-5 rounded-md border flex-shrink-0 flex items-center justify-center transition",
            a.booked
              ? "bg-emerald-400/90 border-emerald-300 text-emerald-950"
              : "border-white/30 text-transparent hover:border-white/60",
          )}
          aria-label={a.booked ? "Mark not booked" : "Mark booked"}
          title={a.booked ? "Booked" : "Not booked"}
        >
          <Check size={12} strokeWidth={3} />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-medium text-white truncate">{a.name}</h4>
            {a.startTime && (
              <span className="pill bg-ocean-400/15 text-ocean-100 border border-ocean-300/30">
                <Clock size={11} />
                {a.startTime}
              </span>
            )}
            <span className="pill bg-white/10 text-white/70 border border-white/10">
              {formatMinutes(a.durationMinutes)}
              {a.travelMinutes > 0 && ` (+${formatMinutes(a.travelMinutes)} travel)`}
            </span>
            {a.costGbp > 0 && (
              <span className="pill bg-sunset-500/15 text-sunset-400 border border-sunset-400/30">
                <Ticket size={11} />
                {formatGbp(a.costGbp)}
              </span>
            )}
          </div>
          {(a.location || a.notes) && (
            <div className="mt-1.5 text-xs text-white/55 space-y-0.5">
              {a.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin size={11} />
                  {a.location}
                </div>
              )}
              {a.notes && <p className="leading-snug">{a.notes}</p>}
            </div>
          )}
        </div>

        <button
          onClick={onDelete}
          aria-label="Delete attraction"
          className="opacity-0 group-hover:opacity-100 transition text-white/40 hover:text-rose-300 p-1 rounded-md hover:bg-white/5"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center">
      <p className="text-white/60 text-sm">Nothing planned yet — a free day, or a blank slate?</p>
      <button onClick={onAdd} className="btn-secondary mt-4">
        <Plus size={15} />
        Add your first stop
      </button>
    </div>
  );
}
