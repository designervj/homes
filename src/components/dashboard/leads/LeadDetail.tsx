"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Phone, Mail, Building2, Users2,
  Star, Clock, ChevronDown, Loader2, PlusCircle,
} from "lucide-react";
import { toast } from "sonner";
import { updateLeadStage, assignLead, addLeadActivity } from "@/lib/db/actions/lead.actions";
import { LEAD_STAGES, LEAD_STAGE_LABELS } from "@/lib/utils/constants";
import type { ILead, LeadStage } from "@/types";

const STAGE_COLORS: Record<string, string> = {
  new: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  contacted: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  qualified: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  site_visit_scheduled: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  negotiation: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  converted: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  lost: "bg-red-500/10 text-red-400 border-red-500/20",
};

function formatDate(d: Date | string) {
  return new Date(d).toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export function LeadDetail({
  lead: initialLead,
  agents,
}: {
  lead: ILead;
  agents: { id: string; name: string; email: string; role: string }[];
}) {
  const router = useRouter();
  const [lead, setLead] = useState(initialLead);
  const [isPending, startTransition] = useTransition();
  const [noteText, setNoteText] = useState("");
  const [showStageMenu, setShowStageMenu] = useState(false);
  const [showAssignMenu, setShowAssignMenu] = useState(false);

  const refresh = () => router.refresh();

  const handleStageChange = (stage: LeadStage) => {
    setShowStageMenu(false);
    startTransition(async () => {
      const res = await updateLeadStage({ leadId: lead._id!, stage });
      if (res.success && res.data) { setLead(res.data); toast.success(res.message ?? "Stage updated"); }
      else toast.error(res.error);
    });
  };

  const handleAssign = (agentId: string, agentName: string) => {
    setShowAssignMenu(false);
    startTransition(async () => {
      const res = await assignLead({ leadId: lead._id!, agentId, agentName });
      if (res.success && res.data) { setLead(res.data); toast.success(res.message ?? "Assigned"); }
      else toast.error(res.error);
    });
  };

  const handleAddNote = () => {
    if (!noteText.trim()) return;
    startTransition(async () => {
      const res = await addLeadActivity({ leadId: lead._id!, action: "Note added", note: noteText.trim() });
      if (res.success && res.data) { setLead(res.data); setNoteText(""); toast.success("Note added"); }
      else toast.error(res.error);
    });
  };

  const stageColor = STAGE_COLORS[lead.stage] ?? "bg-white/10 text-white border-white/20";

  return (
    <div className="max-w-5xl space-y-6">
      {/* Back + header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <button onClick={() => router.back()} className="mt-1 text-[#3A5060] hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="font-serif text-2xl font-medium text-white">{lead.name}</h1>
            <div className="flex items-center gap-3 mt-1">
              <a href={`tel:${lead.phone}`} className="flex items-center gap-1 text-sm text-[#5A7080] hover:text-[#C9A96E] transition-colors">
                <Phone className="w-3.5 h-3.5" /> {lead.phone}
              </a>
              {lead.email && (
                <a href={`mailto:${lead.email}`} className="flex items-center gap-1 text-sm text-[#5A7080] hover:text-[#C9A96E] transition-colors">
                  <Mail className="w-3.5 h-3.5" /> {lead.email}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Stage selector */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setShowStageMenu((v) => !v)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${stageColor}`}
          >
            {LEAD_STAGE_LABELS[lead.stage]}
            {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          {showStageMenu && (
            <div className="absolute right-0 top-9 bg-[#12202E] border border-white/[0.08] rounded-xl p-1.5 z-20 w-48 shadow-xl">
              {LEAD_STAGES.map((s) => (
                <button
                  key={s}
                  onClick={() => handleStageChange(s)}
                  disabled={s === lead.stage}
                  className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${s === lead.stage ? "text-[#3A5060] cursor-default" : "text-[#8A9BAE] hover:text-white hover:bg-white/[0.04]"}`}
                >
                  {LEAD_STAGE_LABELS[s]}
                  {s === lead.stage && <span className="ml-auto text-[10px] text-[#3A5060]">current</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Left — info cards */}
        <div className="space-y-4">

          {/* Property */}
          {lead.propertyName && (
            <div className="bg-[#12202E] border border-white/[0.06] rounded-xl p-4">
              <p className="text-xs text-[#3A5060] uppercase tracking-wide mb-3">Property</p>
              <div className="flex items-start gap-2">
                <Building2 className="w-4 h-4 text-[#C9A96E] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-white">{lead.propertyName}</p>
                  {lead.propertySlug && (
                    <a href={`/projects/${lead.propertySlug}`} target="_blank" className="text-xs text-[#C9A96E] hover:underline">
                      View listing
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Lead meta */}
          <div className="bg-[#12202E] border border-white/[0.06] rounded-xl p-4 space-y-3">
            <p className="text-xs text-[#3A5060] uppercase tracking-wide">Details</p>
            {[
              { label: "Source", value: lead.source?.replace(/_/g, " ") },
              { label: "Score", value: lead.score ? `${lead.score}/100` : "Not scored" },
              { label: "Interested In", value: lead.interestedIn?.join(", ").replace(/_/g, " ") || "—" },
              { label: "Budget", value: lead.budget?.min || lead.budget?.max ? `₹${((lead.budget.min ?? 0) / 100000).toFixed(0)}L – ₹${((lead.budget.max ?? 0) / 100000).toFixed(0)}L` : "—" },
              { label: "Created", value: formatDate(lead.createdAt!) },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-start gap-2">
                <span className="text-xs text-[#3A5060] flex-shrink-0">{label}</span>
                <span className="text-xs text-[#8A9BAE] text-right capitalize">{value}</span>
              </div>
            ))}
          </div>

          {/* Agent assignment */}
          <div className="bg-[#12202E] border border-white/[0.06] rounded-xl p-4">
            <p className="text-xs text-[#3A5060] uppercase tracking-wide mb-3">Assigned Agent</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#C9A96E]/20 flex items-center justify-center">
                  <span className="text-xs font-semibold text-[#C9A96E]">
                    {lead.assignedAgentName?.charAt(0) ?? "?"}
                  </span>
                </div>
                <span className="text-sm text-white">{lead.assignedAgentName ?? "Unassigned"}</span>
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowAssignMenu((v) => !v)}
                  className="text-xs text-[#C9A96E] hover:text-[#E2C99A] border border-[#C9A96E]/20 px-2.5 py-1 rounded-lg transition-colors"
                >
                  {lead.assignedAgentName ? "Reassign" : "Assign"}
                </button>
                {showAssignMenu && (
                  <div className="absolute right-0 top-8 bg-[#12202E] border border-white/[0.08] rounded-xl p-1.5 z-20 w-44 shadow-xl">
                    {agents.map((a) => (
                      <button
                        key={a.id}
                        onClick={() => handleAssign(a.id, a.name)}
                        className="w-full text-left text-sm text-[#8A9BAE] hover:text-white hover:bg-white/[0.04] px-3 py-2 rounded-lg transition-colors"
                      >
                        {a.name}
                        <span className="block text-[10px] text-[#3A5060] capitalize">{a.role}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right — activity log */}
        <div className="lg:col-span-2 bg-[#12202E] border border-white/[0.06] rounded-xl p-5">
          <p className="text-sm font-medium text-white mb-5 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#C9A96E]" />
            Activity Log
            <span className="ml-auto text-xs text-[#3A5060]">{lead.activityLog?.length ?? 0} entries</span>
          </p>

          {/* Add note */}
          <div className="flex gap-2 mb-5">
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Add a note or update…"
              rows={2}
              className="flex-1 bg-white/[0.04] border border-white/[0.08] focus:border-[#C9A96E]/40 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-[#3A5060] outline-none resize-none transition-colors"
            />
            <button
              onClick={handleAddNote}
              disabled={isPending || !noteText.trim()}
              className="self-end px-3 py-2.5 bg-[#C9A96E] hover:bg-[#E2C99A] text-[#0B1521] rounded-lg text-sm font-medium disabled:opacity-40 transition-colors flex items-center gap-1.5"
            >
              {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <PlusCircle className="w-3.5 h-3.5" />}
              Add
            </button>
          </div>

          {/* Timeline */}
          <div className="space-y-1">
            {[...(lead.activityLog ?? [])].reverse().map((entry, i) => (
              <div key={i} className="flex gap-3 pb-4 relative">
                {/* Timeline line */}
                {i < (lead.activityLog?.length ?? 0) - 1 && (
                  <div className="absolute left-[7px] top-5 bottom-0 w-px bg-white/[0.04]" />
                )}
                {/* Dot */}
                <div className="w-3.5 h-3.5 rounded-full bg-[#C9A96E]/20 border border-[#C9A96E]/40 flex-shrink-0 mt-0.5 z-10" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white">{entry.action}</p>
                  {entry.note && (
                    <p className="text-xs text-[#5A7080] mt-0.5 bg-white/[0.02] px-2 py-1 rounded-lg">
                      {entry.note}
                    </p>
                  )}
                  <p className="text-[10px] text-[#2A3E52] mt-1">
                    {entry.performedAt ? formatDate(entry.performedAt) : ""}
                  </p>
                </div>
              </div>
            ))}
            {(!lead.activityLog || lead.activityLog.length === 0) && (
              <p className="text-sm text-[#3A5060] text-center py-8">No activity recorded yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
