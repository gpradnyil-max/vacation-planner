import { cn } from "@/lib/cn";
import type { LucideIcon } from "lucide-react";

type Props = {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  tone?: "ocean" | "sunset" | "violet" | "mint";
};

const TONES: Record<NonNullable<Props["tone"]>, { glow: string; iconColor: string }> = {
  ocean: {
    glow: "from-ocean-400/40 to-ocean-700/10",
    iconColor: "text-ocean-200",
  },
  sunset: {
    glow: "from-sunset-400/40 to-sunset-600/10",
    iconColor: "text-sunset-400",
  },
  violet: {
    glow: "from-fuchsia-400/40 to-violet-700/10",
    iconColor: "text-fuchsia-200",
  },
  mint: {
    glow: "from-emerald-400/40 to-teal-700/10",
    iconColor: "text-emerald-200",
  },
};

export default function StatCard({ label, value, hint, icon: Icon, tone = "ocean" }: Props) {
  const t = TONES[tone];
  return (
    <div className="glass glass-hover p-5 relative overflow-hidden">
      <div
        className={cn(
          "absolute -top-6 -right-6 h-24 w-24 rounded-full blur-2xl bg-gradient-to-br",
          t.glow,
        )}
      />
      <div className="relative flex items-start justify-between">
        <div className="space-y-1.5">
          <div className="label">{label}</div>
          <div className="font-display text-2xl font-semibold tracking-tight">
            {value}
          </div>
          {hint && <div className="text-xs text-white/55">{hint}</div>}
        </div>
        <div className="rounded-xl bg-white/10 p-2.5 border border-white/10">
          <Icon size={18} className={cn(t.iconColor)} />
        </div>
      </div>
    </div>
  );
}
