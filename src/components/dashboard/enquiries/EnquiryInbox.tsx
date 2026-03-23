"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  MessageSquare, Phone, Mail, Building2, CheckCircle,
  AlertTriangle, ArrowUpRight, Loader2, Clock, Filter
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  markEnquiryReviewed,
  markEnquirySpam,
  convertEnquiryToLead,
} from "@/lib/db/actions/enquiry.actions";
import type { IEnquiry } from "@/types";

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface EnquiryInboxProps {
  enquiries: IEnquiry[];
  stats?: { new: number; reviewed: number; converted: number; total: number } | null;
  currentStatus: string;
  pagination?: { page: number; limit: number; total: number; totalPages: number };
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const STATUS_TABS = [
  { key: "new", label: "New", color: "text-blue-400" },
  { key: "reviewed", label: "Reviewed", color: "text-yellow-400" },
  { key: "converted", label: "Converted", color: "text-emerald-400" },
  { key: "all", label: "All", color: "text-muted-foreground" },
];

function timeAgo(date: Date | string): string {
  const d = new Date(date);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ─── ENQUIRY CARD ─────────────────────────────────────────────────────────────

function EnquiryCard({ enquiry, onAction }: {
  enquiry: IEnquiry;
  onAction: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const handleReview = () => {
    setLoadingAction("review");
    startTransition(async () => {
      const res = await markEnquiryReviewed(enquiry._id!);
      if (res.success) { toast.success("Marked as reviewed"); onAction(); }
      else toast.error(res.error);
      setLoadingAction(null);
    });
  };

  const handleConvert = () => {
    setLoadingAction("convert");
    startTransition(async () => {
      const res = await convertEnquiryToLead(enquiry._id!);
      if (res.success) { toast.success(res.message ?? "Converted to lead!"); onAction(); }
      else toast.error(res.error);
      setLoadingAction(null);
    });
  };

  const handleSpam = () => {
    setLoadingAction("spam");
    startTransition(async () => {
      const res = await markEnquirySpam(enquiry._id!);
      if (res.success) { toast.success("Marked as spam"); onAction(); }
      else toast.error(res.error);
      setLoadingAction(null);
    });
  };

  const isNew = enquiry.status === "new";
  const isConverted = enquiry.status === "converted";

  return (
    <div className={`bg-card border rounded-xl p-5 transition-all ${isNew ? "border-blue-500/20" : "border-border"}`}>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-semibold text-primary">
              {enquiry.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-white">{enquiry.name}</p>
            <div className="flex items-center gap-3 mt-0.5">
              <a href={`tel:${enquiry.phone}`} className="flex items-center gap-1 text-xs text-[#5A7080] hover:text-primary transition-colors">
                <Phone className="w-3 h-3" /> {enquiry.phone}
              </a>
              {enquiry.email && (
                <a href={`mailto:${enquiry.email}`} className="flex items-center gap-1 text-xs text-[#5A7080] hover:text-primary transition-colors">
                  <Mail className="w-3 h-3" /> {enquiry.email}
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {isNew && <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />}
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {timeAgo(enquiry.createdAt!)}
          </span>
        </div>
      </div>

      {/* Property reference */}
      {enquiry.propertyName && (
        <div className="flex items-center gap-2 mb-3 p-2.5 bg-accent/40 rounded-lg border border-white/[0.04]">
          <Building2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />
          <span className="text-xs text-muted-foreground">{enquiry.propertyName}</span>
        </div>
      )}

      {/* Interests */}
      {enquiry.interestedIn && enquiry.interestedIn.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {enquiry.interestedIn.map((interest) => (
            <span key={interest} className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 capitalize">
              {interest.replace(/_/g, " ")}
            </span>
          ))}
          {enquiry.budgetRange && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
              {enquiry.budgetRange}
            </span>
          )}
        </div>
      )}

      {/* Message */}
      {enquiry.message && (
        <p className="text-xs text-[#5A7080] bg-accent/40 rounded-lg px-3 py-2.5 border border-white/[0.04] mb-3 line-clamp-2">
          &quot;{enquiry.message}&quot;
        </p>
      )}

      {/* Source badge */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground capitalize bg-white/[0.03] px-2 py-1 rounded-md">
          via {enquiry.source?.replace(/_/g, " ") ?? "website"}
        </span>

        {/* Actions */}
        {!isConverted ? (
          <div className="flex items-center gap-2">
            {isNew && (
              <button
                onClick={handleSpam}
                disabled={isPending}
                className="text-xs text-muted-foreground hover:text-red-400 transition-colors px-2 py-1"
              >
                Spam
              </button>
            )}
            {isNew && (
              <button
                onClick={handleReview}
                disabled={isPending}
                className="text-xs text-[#5A7080] hover:text-white border border-border hover:border-border px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5"
              >
                {loadingAction === "review" && isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                Review
              </button>
            )}
            <button
              onClick={handleConvert}
              disabled={isPending}
              className="text-xs font-medium bg-primary hover:bg-primary-light text-foreground px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5"
            >
              {loadingAction === "convert" && isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <ArrowUpRight className="w-3 h-3" />}
              Convert to Lead
            </button>
          </div>
        ) : (
          <span className="flex items-center gap-1.5 text-xs text-emerald-400">
            <CheckCircle className="w-3.5 h-3.5" /> Converted
          </span>
        )}
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export function EnquiryInbox({ enquiries, stats, currentStatus, pagination }: EnquiryInboxProps) {
  const router = useRouter();

  const refresh = () => router.refresh();

  const setStatus = (s: string) => {
    const params = new URLSearchParams();
    params.set("status", s);
    router.push(`/admin/enquiries?${params.toString()}`);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-medium text-white">Enquiry Inbox</h1>
          <p className="text-sm text-[#5A7080] mt-1">
            Review public form submissions and convert them to leads.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#5A7080] bg-card border border-border px-3 py-2 rounded-lg">
          <Filter className="w-3.5 h-3.5" />
          {pagination?.total ?? 0} total
        </div>
      </div>

      {/* Stats row */}
      {stats && (
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "New", value: stats.new, color: "text-blue-400", bg: "bg-blue-500/10" },
            { label: "Reviewed", value: stats.reviewed, color: "text-yellow-400", bg: "bg-yellow-500/10" },
            { label: "Converted", value: stats.converted, color: "text-emerald-400", bg: "bg-emerald-500/10" },
            { label: "Total", value: stats.total, color: "text-primary", bg: "bg-primary/10" },
          ].map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-4">
              <p className="text-xs text-[#5A7080] mb-1">{s.label}</p>
              <p className={`text-2xl font-serif font-medium ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Status tabs */}
      <div className="flex gap-1 border-b border-border">
        {STATUS_TABS.map((tab) => {
          const isActive = currentStatus === tab.key;
          const count = tab.key === "new" ? stats?.new : tab.key === "reviewed" ? stats?.reviewed : tab.key === "converted" ? stats?.converted : stats?.total;
          return (
            <button
              key={tab.key}
              onClick={() => setStatus(tab.key)}
              className={`px-4 py-2.5 text-sm border-b-2 transition-all -mb-px ${isActive ? `${tab.color} border-current font-medium` : "text-muted-foreground border-transparent hover:text-muted-foreground"}`}
            >
              {tab.label}
              {count !== undefined && (
                <span className={`ml-1.5 text-xs ${isActive ? "" : "text-muted-foreground"}`}>({count})</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Enquiry list */}
      {enquiries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <MessageSquare className="w-10 h-10 text-[#2A3E52] mb-4" />
          <p className="text-[#5A7080] font-medium">No enquiries here</p>
          <p className="text-sm text-muted-foreground mt-1">
            {currentStatus === "new" ? "All caught up! New enquiries will appear here." : "No enquiries match this filter."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {enquiries.map((enquiry) => (
            <EnquiryCard key={enquiry._id} enquiry={enquiry} onAction={refresh} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => router.push(`/admin/enquiries?status=${currentStatus}&page=${pagination.page - 1}`)}
              className="px-3 py-1.5 text-xs text-[#5A7080] border border-border rounded-lg disabled:opacity-40 hover:border-border transition-colors"
            >
              Previous
            </button>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => router.push(`/admin/enquiries?status=${currentStatus}&page=${pagination.page + 1}`)}
              className="px-3 py-1.5 text-xs text-[#5A7080] border border-border rounded-lg disabled:opacity-40 hover:border-border transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
