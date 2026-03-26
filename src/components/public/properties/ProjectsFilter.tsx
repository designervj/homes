"use client";

import { useRouter } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";

const TYPES = ["Plot", "Apartment", "Villa", "Independent House"];
const POSSESSION = ["Ready to Move", "Under Construction"];
const BUDGETS = [
  { label: "Under ₹50L", min: "0", max: "5000000" },
  { label: "₹50L–₹1Cr",  min: "5000000", max: "10000000" },
  { label: "₹1Cr–₹2Cr",  min: "10000000", max: "20000000" },
  { label: "₹2Cr+",       min: "20000000", max: "999999999" },
];

export function ProjectsFilter({ currentFilters }: {
  currentFilters: Record<string, string | undefined>;
}) {
  const router = useRouter();
  const hasFilters = Object.values(currentFilters).some(
    (v) => v && v !== "" && v !== "1"
  );

  const update = (key: string, value: string | null) => {
    const params = new URLSearchParams();
    Object.entries(currentFilters).forEach(([k, v]) => {
      if (v && k !== key && k !== "page") params.set(k, v);
    });
    if (value) params.set(key, value);
    router.push(`/projects?${params.toString()}`);
  };

  const currentBudget =
    currentFilters.minPrice && currentFilters.maxPrice
      ? `${currentFilters.minPrice}-${currentFilters.maxPrice}`
      : "";

  const pillBase = "px-3.5 py-1.5 rounded-xl border text-sm transition-all cursor-pointer";
  const active   = "bg-primary text-foreground border-transparent font-medium";
  const inactive = "bg-card text-muted-foreground border-border hover:text-foreground hover:border-primary/20";

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mr-2">
          <SlidersHorizontal className="w-3.5 h-3.5" /> Filter:
        </div>

        {/* Type filter */}
        {TYPES.map((t) => (
          <button
            key={t}
            onClick={() => update("type", currentFilters.type === t ? null : t)}
            className={cn(pillBase, currentFilters.type === t ? active : inactive)}
          >
            {t}
          </button>
        ))}

        <div className="h-5 w-px bg-border" />

        {/* Possession filter */}
        {POSSESSION.map((p) => (
          <button
            key={p}
            onClick={() => update("possession", currentFilters.possession === p ? null : p)}
            className={cn(pillBase, currentFilters.possession === p ? active : inactive)}
          >
            {p}
          </button>
        ))}

        <div className="h-5 w-px bg-border" />

        {/* Budget */}
        {BUDGETS.map((b) => {
          const val = `${b.min}-${b.max}`;
          const isSel = currentBudget === val;
          return (
            <button
              key={val}
              onClick={() => {
                if (isSel) {
                  const p = new URLSearchParams();
                  Object.entries(currentFilters).forEach(([k, v]) => {
                    if (v && k !== "minPrice" && k !== "maxPrice" && k !== "page") p.set(k, v);
                  });
                  router.push(`/projects?${p.toString()}`);
                } else {
                  const p = new URLSearchParams();
                  Object.entries(currentFilters).forEach(([k, v]) => {
                    if (v && k !== "minPrice" && k !== "maxPrice" && k !== "page") p.set(k, v);
                  });
                  p.set("minPrice", b.min);
                  p.set("maxPrice", b.max);
                  router.push(`/projects?${p.toString()}`);
                }
              }}
              className={cn(pillBase, isSel ? active : inactive)}
            >
              {b.label}
            </button>
          );
        })}

        {/* Clear all */}
        {hasFilters && (
          <button
            onClick={() => router.push("/projects")}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 rounded-xl transition-all ml-auto"
          >
            <X className="w-3 h-3" /> Clear
          </button>
        )}
      </div>
    </div>
  );
}
