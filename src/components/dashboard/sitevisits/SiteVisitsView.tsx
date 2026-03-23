"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarCheck, Phone, Building2, User,
  CheckCircle, XCircle, Clock, Loader2, Calendar
} from "lucide-react";
import { toast } from "sonner";
import { updateSiteVisitStatus } from "@/lib/db/actions/sitevisit.actions";
import type { ISiteVisit } from "@/types";

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface SiteVisitsViewProps {
  visits: ISiteVisit[];
  upcoming: ISiteVisit[];
  stats?: {
    total: number; scheduled: number; completed: number;
    noShow: number; thisWeek: number; conversionRate: number;
  } | null;
  pagination?: { page: number; limit: number; total: number; totalPages: number };
  currentStatus: string;
}

// ─── STATUS CONFIG ────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  scheduled: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  no_show: "bg-red-500/10 text-red-400 border-red-500/20",
  rescheduled: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  cancelled: "bg-white/5 text-[#5A7080] border-white/10",
};

const OUTCOME_STYLES: Record<string, string> = {
  positive: "text-emerald-400",
  converted: "text-[#C9A96E]",
  neutral: "text-[#8A9BAE]",
  negative: "text-red-400",
  pending: "text-[#3A5060]",
};

// ─── VISIT CARD ───────────────────────────────────────────────────────────────

function VisitCard({ visit, onAction }: { visit: ISiteVisit; onAction: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [updating, setUpdating] = useState<string | null>(null);

  const handle = (status: string, outcome?: string) => {
    setUpdating(status);
    startTransition(async () => {
      const res = await updateSiteVisitStatus({ visitId: visit._id!, status, outcome });
      if (res.success) { toast.success(res.message ?? "Updated"); onAction(); }
      else toast.error(res.error);
      setUpdating(null);
    });
  };

  const scheduledDate = new Date(visit.scheduledAt);
  const isUpcoming = scheduledDate > new Date();
  const statusStyle = STATUS_STYLES[visit.status] ?? STATUS_STYLES.cancelled;

  return (
    <div className={`bg-[#12202E] border rounded-xl p-5 transition-all ${visit.status === "scheduled" ? "border-blue-500/15" : "border-white/[0.06]"}`}>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-start gap-3">
          {/* Date block */}
          <div className="w-12 h-12 rounded-xl bg-[#C9A96E]/10 border border-[#C9A96E]/20 flex flex-col items-center justify-center flex-shrink-0">
            <span className="text-[9px] text-[#C9A96E] font-medium leading-none">
              {scheduledDate.toLocaleDateString("en-IN", { month: "short" }).toUpperCase()}
            </span>
            <span className="text-lg font-serif font-semibold text-[#C9A96E] leading-tight">
              {scheduledDate.getDate()}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-white">{visit.clientName}</p>
            <a href={`tel:${visit.clientPhone}`} className="flex items-center gap-1 text-xs text-[#5A7080] hover:text-[#C9A96E] transition-colors mt-0.5">
              <Phone className="w-3 h-3" /> {visit.clientPhone}
            </a>
            <p className="flex items-center gap-1 text-xs text-[#3A5060] mt-0.5">
              <Clock className="w-3 h-3" />
              {scheduledDate.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
              {!isUpcoming && " · " + scheduledDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
            </p>
          </div>
        </div>

        <span className={`text-[11px] font-medium px-2 py-1 rounded-full border capitalize flex-shrink-0 ${statusStyle}`}>
          {visit.status.replace(/_/g, " ")}
        </span>
      </div>

      {/* Property + Agent */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {visit.propertyName && (
          <div className="flex items-center gap-1.5 text-xs text-[#5A7080]">
            <Building2 className="w-3 h-3 flex-shrink-0 text-[#C9A96E]" />
            <span className="truncate">{visit.propertyName}</span>
          </div>
        )}
        {visit.assignedAgentName && (
          <div className="flex items-center gap-1.5 text-xs text-[#5A7080]">
            <User className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{visit.assignedAgentName}</span>
          </div>
        )}
      </div>

      {/* Outcome */}
      {visit.outcome && visit.outcome !== "pending" && (
        <p className={`text-xs font-medium mb-3 capitalize ${OUTCOME_STYLES[visit.outcome]}`}>
          Outcome: {visit.outcome}
        </p>
      )}

      {/* Agent notes */}
      {visit.agentNotes && (
        <p className="text-xs text-[#5A7080] bg-white/[0.02] px-3 py-2 rounded-lg border border-white/[0.04] mb-3 line-clamp-2">
          {visit.agentNotes}
        </p>
      )}

      {/* Actions for scheduled visits */}
      {visit.status === "scheduled" && (
        <div className="flex items-center gap-2 pt-3 border-t border-white/[0.04]">
          <button
            onClick={() => handle("completed", "positive")}
            disabled={isPending}
            className="flex items-center gap-1.5 text-xs font-medium bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-lg transition-colors"
          >
            {updating === "completed" && isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
            Completed
          </button>
          <button
            onClick={() => handle("no_show")}
            disabled={isPending}
            className="flex items-center gap-1.5 text-xs text-red-400/70 hover:text-red-400 border border-red-500/20 hover:border-red-500/40 px-3 py-1.5 rounded-lg transition-colors"
          >
            {updating === "no_show" && isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
            No Show
          </button>
          <button
            onClick={() => handle("cancelled")}
            disabled={isPending}
            className="text-xs text-[#3A5060] hover:text-[#5A7080] px-2 py-1.5 transition-colors ml-auto"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

const STATUS_TABS = [
  { key: "scheduled", label: "Scheduled" },
  { key: "completed", label: "Completed" },
  { key: "no_show", label: "No Show" },
  { key: "all", label: "All" },
];

export function SiteVisitsView({ visits, upcoming, stats, pagination, currentStatus }: SiteVisitsViewProps) {
  const router = useRouter();
  const refresh = () => router.refresh();

  const setStatus = (s: string) => router.push(`/admin/site-visits?status=${s}`);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-medium text-white">Site Visits</h1>
          <p className="text-sm text-[#5A7080] mt-1">Track and manage scheduled property walkthroughs.</p>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {[
            { label: "Scheduled", value: stats.scheduled, color: "text-blue-400" },
            { label: "Completed", value: stats.completed, color: "text-emerald-400" },
            { label: "No Show", value: stats.noShow, color: "text-red-400" },
            { label: "This Week", value: stats.thisWeek, color: "text-[#C9A96E]" },
            { label: "Total", value: stats.total, color: "text-white" },
            { label: "Conv. Rate", value: `${stats.conversionRate}%`, color: "text-purple-400" },
          ].map((s) => (
            <div key={s.label} className="bg-[#12202E] border border-white/[0.06] rounded-xl p-3">
              <p className="text-[10px] text-[#3A5060] uppercase tracking-wide mb-1">{s.label}</p>
              <p className={`text-lg font-serif font-medium ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Upcoming quick view */}
      {upcoming.length > 0 && currentStatus === "scheduled" && (
        <div className="bg-[#C9A96E]/5 border border-[#C9A96E]/15 rounded-xl p-4">
          <p className="text-xs text-[#C9A96E] uppercase tracking-wide mb-3 flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5" /> Next Up
          </p>
          <div className="flex gap-3 flex-wrap">
            {upcoming.map((v) => (
              <div key={v._id} className="bg-[#0B1521] border border-white/[0.06] rounded-lg px-3 py-2">
                <p className="text-xs font-medium text-white">{v.clientName}</p>
                <p className="text-[10px] text-[#5A7080]">
                  {new Date(v.scheduledAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  {" at "}
                  {new Date(v.scheduledAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/[0.06]">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatus(tab.key)}
            className={`px-4 py-2.5 text-sm border-b-2 transition-all -mb-px ${currentStatus === tab.key ? "text-[#C9A96E] border-[#C9A96E] font-medium" : "text-[#3A5060] border-transparent hover:text-[#8A9BAE]"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Visits list */}
      {visits.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <CalendarCheck className="w-10 h-10 text-[#2A3E52] mb-4" />
          <p className="text-[#5A7080] font-medium">No site visits here</p>
          <p className="text-sm text-[#3A5060] mt-1">
            {currentStatus === "scheduled" ? "No upcoming visits scheduled." : "No visits match this filter."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visits.map((visit) => (
            <VisitCard key={visit._id} visit={visit} onAction={refresh} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-between items-center pt-4 border-t border-white/[0.06]">
          <p className="text-xs text-[#3A5060]">Page {pagination.page} of {pagination.totalPages}</p>
          <div className="flex gap-2">
            <button disabled={pagination.page <= 1} onClick={() => router.push(`/admin/site-visits?status=${currentStatus}&page=${pagination.page - 1}`)} className="px-3 py-1.5 text-xs text-[#5A7080] border border-white/[0.06] rounded-lg disabled:opacity-40 hover:border-white/20 transition-colors">Previous</button>
            <button disabled={pagination.page >= pagination.totalPages} onClick={() => router.push(`/admin/site-visits?status=${currentStatus}&page=${pagination.page + 1}`)} className="px-3 py-1.5 text-xs text-[#5A7080] border border-white/[0.06] rounded-lg disabled:opacity-40 hover:border-white/20 transition-colors">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
