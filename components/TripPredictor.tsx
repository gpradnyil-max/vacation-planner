import { AlertTriangle, CheckCircle2, Clock3 } from "lucide-react";
import type { TripSummary } from "@/lib/types";
import { cn } from "@/lib/cn";

const styles = {
  "on-track": {
    icon: CheckCircle2,
    label: "On track",
    bg: "from-emerald-400/30 via-emerald-500/15 to-transparent",
    border: "border-emerald-300/30",
    text: "text-emerald-200",
  },
  tight: {
    icon: Clock3,
    label: "Cutting it close",
    bg: "from-amber-400/30 via-amber-500/15 to-transparent",
    border: "border-amber-300/30",
    text: "text-amber-100",
  },
  overrun: {
    icon: AlertTriangle,
    label: "Overrun",
    bg: "from-rose-500/30 via-rose-500/15 to-transparent",
    border: "border-rose-300/30",
    text: "text-rose-100",
  },
};

export default function TripPredictor({ summary }: { summary: TripSummary }) {
  const s = styles[summary.prediction.overallStatus];
  const Icon = s.icon;
  return (
    <div
      className={cn(
        "glass relative overflow-hidden border",
        s.border,
        "p-5 sm:p-6",
      )}
    >
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br pointer-events-none",
          s.bg,
        )}
      />
      <div className="relative flex items-start gap-4">
        <div className="rounded-xl bg-white/10 p-3 border border-white/10">
          <Icon className={s.text} size={22} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-display text-lg font-semibold">
              {s.label}
            </h3>
            {summary.prediction.overrunDays.length > 0 && (
              <span className="pill bg-rose-500/20 text-rose-100 border border-rose-300/30">
                Days {summary.prediction.overrunDays.join(", ")} won&apos;t fit
              </span>
            )}
            {summary.prediction.underusedDays.length > 0 && (
              <span className="pill bg-white/10 text-white/70 border border-white/10">
                Empty: Day {summary.prediction.underusedDays.join(", ")}
              </span>
            )}
          </div>
          <p className="text-sm text-white/75 mt-1.5">
            {summary.prediction.message}
          </p>
        </div>
      </div>
    </div>
  );
}
