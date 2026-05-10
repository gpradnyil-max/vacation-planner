"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export default function Modal({ open, onClose, title, subtitle, children }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative w-full max-w-lg glass p-6 sm:p-8 max-h-[90vh] overflow-y-auto scrollbar-soft">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10"
        >
          <X size={18} />
        </button>
        <div className="mb-5">
          <h3 className="font-display text-xl font-semibold tracking-tight">{title}</h3>
          {subtitle && <p className="text-sm text-white/60 mt-1">{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}
