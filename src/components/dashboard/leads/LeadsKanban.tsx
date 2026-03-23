"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Users2, Phone, Building2, ChevronRight,
  Loader2, Star, TrendingUp, ArrowUpRight
} from "lucide-react";
import { toast } from "sonner";
import { updateLeadStage, assignLead } from "@/lib/db/actions/lead.actions";
import { LEAD_STAGES, LEAD_STAGE_LABELS } from "@/lib/utils/constants";
import type { ILead, LeadStage } from "@/types";

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface LeadsKanbanProps {
  boardData: Record<LeadStage, ILead[]>;
  stats?: {
    total: number; active: number; converted: number;
    lost: number; conversionRate: number;
  } | null;
  agents: { id: string; name: string; email: string; role: string }[];
}

// ─── STAGE CONFIG ─────────────────────────────────────────────────────────────

const STAGE_CONFIG: Record<LeadStage, { color: string; dot: string; border: string }> = {
  new:                   { color: "text-blue-400",    dot: "bg-blue-400",    border: "border-blue-500/20" },
  contacted:             { color: "text-yellow-400",  dot: "bg-yellow-400",  border: "border-yellow-500/20" },
  qualified:             { color: "text-purple-400",  dot: "bg-purple-400",  border: "border-purple-500/20" },
  site_visit_scheduled:  { color: "text-orange-400",  dot: "bg-orange-400",  border: "border-orange-500/20" },
  negotiation:           { color: "text-pink-400",    dot: "bg-pink-400",    border: "border-pink-500/20" },
  converted:             { color: "text-emerald-400", dot: "bg-emerald-400", border: "border-emerald-500/20" },
  lost:                  { color: "text-red-400",     dot: "bg-red-400/60",  border: "border-red-500/20" },
};

const VISIBLE_STAGES: LeadStage[] = [
  "new", "contacted", "qualified",
  "site_visit_scheduled", "negotiation",
];

// ─── LEAD CARD ────────────────────────────────────────────────────────────────

function LeadCard({ lead, agents, onAction }: {
  lead: ILead;
  agents: LeadsKanbanProps["agents"];
  onAction: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [showMove, setShowMove] = useState(false);

  const currentStageIndex = LEAD_STAGES.indexOf(lead.stage);
  const nextStage = LEAD_STAGES[currentStageIndex + 1] as LeadStage | undefined;
  const config = STAGE_CONFIG[lead.stage];

  const moveToNext = () => {
    if (!nextStage) return;
    startTransition(async () => {
      const res = await updateLeadStage({ leadId: lead._id!, stage: nextStage });
      if (res.success) {
        toast.success(res.message ?? "Stage updated");
        onAction();
      } else toast.error(res.error);
    });
  };

  const moveTo = (stage: LeadStage) => {
    startTransition(async () => {
      const res = await updateLeadStage({ leadId: lead._id!, stage });
      if (res.success) {
        toast.success(res.message ?? "Stage updated");
        setShowMove(false);
        onAction();
      } else toast.error(res.error);
    });
  };

  // Days since created
  const days = lead.createdAt
    ? Math.floor((Date.now() - new Date(lead.createdAt).getTime()) / 86400000)
    : 0;

  return (
    <div className={`bg-[#0B1521] border rounded-xl p-4 hover:border-white/10 transition-all group relative ${config.border}`}>
      {/* Lead name + score */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-sm font-medium text-white">{lead.name}</p>
          <a href={`tel:${lead.phone}`} className="flex items-center gap-1 text-xs text-[#5A7080] hover:text-[#C9A96E] transition-colors mt-0.5">
            <Phone className="w-3 h-3" /> {lead.phone}
          </a>
        </div>
        {lead.score !== undefined && lead.score > 0 && (
          <div className="flex items-center gap-0.5 text-[11px] text-[#C9A96E]">
            <Star className="w-3 h-3 fill-[#C9A96E]" />
            {lead.score}
          </div>
        )}
      </div>

      {/* Property */}
      {lead.propertyName && (
        <div className="flex items-center gap-1.5 text-[11px] text-[#3A5060] mb-3">
          <Building2 className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{lead.propertyName}</span>
        </div>
      )}

      {/* Interests */}
      {lead.interestedIn && lead.interestedIn.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {lead.interestedIn.map((i) => (
            <span key={i} className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/[0.04] text-[#5A7080] capitalize">
              {i.replace(/_/g, " ")}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
        <div className="flex items-center gap-2">
          {/* Agent avatar */}
          {lead.assignedAgentName ? (
            <div className="w-5 h-5 rounded-full bg-[#C9A96E]/20 flex items-center justify-center">
              <span className="text-[9px] font-semibold text-[#C9A96E]">
                {lead.assignedAgentName.charAt(0)}
              </span>
            </div>
          ) : (
            <div className="w-5 h-5 rounded-full bg-white/[0.04] flex items-center justify-center">
              <Users2 className="w-2.5 h-2.5 text-[#3A5060]" />
            </div>
          )}
          <span className="text-[10px] text-[#3A5060]">{days}d</span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Move menu */}
          <div className="relative">
            <button
              onClick={() => setShowMove((v) => !v)}
              className="text-[10px] text-[#3A5060] hover:text-[#8A9BAE] px-1.5 py-1 rounded transition-colors"
            >
              Move
            </button>
            {showMove && (
              <div className="absolute right-0 bottom-7 bg-[#12202E] border border-white/[0.08] rounded-xl p-1.5 z-20 w-44 shadow-xl">
                {LEAD_STAGES.filter((s) => s !== lead.stage && s !== "lost").map((s) => (
                  <button
                    key={s}
                    onClick={() => moveTo(s)}
                    disabled={isPending}
                    className="w-full text-left text-xs text-[#8A9BAE] hover:text-white hover:bg-white/[0.04] px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${STAGE_CONFIG[s].dot}`} />
                    {LEAD_STAGE_LABELS[s]}
                  </button>
                ))}
                <div className="border-t border-white/[0.06] mt-1 pt-1">
                  <button
                    onClick={() => moveTo("lost")}
                    disabled={isPending}
                    className="w-full text-left text-xs text-red-400/70 hover:text-red-400 hover:bg-red-500/10 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400/60" />
                    Mark Lost
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Next stage shortcut */}
          {nextStage && nextStage !== "converted" && nextStage !== "lost" && (
            <button
              onClick={moveToNext}
              disabled={isPending}
              className="flex items-center gap-0.5 text-[10px] text-[#C9A96E] hover:text-[#E2C99A] font-medium transition-colors"
            >
              {isPending ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <ChevronRight className="w-3 h-3" />}
            </button>
          )}

          {/* Detail link */}
          <a
            href={`/admin/leads/${lead._id}`}
            className="text-[10px] text-[#3A5060] hover:text-[#C9A96E] transition-colors"
          >
            <ArrowUpRight className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── KANBAN COLUMN ────────────────────────────────────────────────────────────

function KanbanColumn({ stage, leads, agents, onAction }: {
  stage: LeadStage;
  leads: ILead[];
  agents: LeadsKanbanProps["agents"];
  onAction: () => void;
}) {
  const config = STAGE_CONFIG[stage];
  return (
    <div className="flex flex-col min-w-[240px] w-[240px] flex-shrink-0">
      {/* Column header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${config.dot}`} />
          <span className={`text-xs font-medium ${config.color}`}>
            {LEAD_STAGE_LABELS[stage]}
          </span>
        </div>
        <span className="text-xs text-[#3A5060] bg-white/[0.04] px-2 py-0.5 rounded-full">
          {leads.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-2.5 flex-1">
        {leads.length === 0 ? (
          <div className="border border-dashed border-white/[0.06] rounded-xl p-4 text-center">
            <p className="text-xs text-[#2A3E52]">No leads</p>
          </div>
        ) : (
          leads.map((lead) => (
            <LeadCard key={lead._id} lead={lead} agents={agents} onAction={onAction} />
          ))
        )}
      </div>
    </div>
  );
}

// ─── MAIN KANBAN BOARD ────────────────────────────────────────────────────────

export function LeadsKanban({ boardData, stats, agents }: LeadsKanbanProps) {
  const router = useRouter();
  const refresh = () => router.refresh();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-medium text-white">Leads Pipeline</h1>
          <p className="text-sm text-[#5A7080] mt-1">
            Track leads through your conversion pipeline.
          </p>
        </div>
        <a
          href="/admin/leads/new"
          className="flex items-center gap-2 px-4 py-2 bg-[#C9A96E] hover:bg-[#E2C99A] text-[#0B1521] text-sm font-medium rounded-lg transition-colors"
        >
          <Users2 className="w-4 h-4" /> Add Lead
        </a>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: "Total", value: stats.total, color: "text-white" },
            { label: "Active", value: stats.active, color: "text-[#C9A96E]" },
            { label: "Converted", value: stats.converted, color: "text-emerald-400" },
            { label: "Lost", value: stats.lost, color: "text-red-400" },
            { label: "Conv. Rate", value: `${stats.conversionRate}%`, color: "text-purple-400" },
          ].map((s) => (
            <div key={s.label} className="bg-[#12202E] border border-white/[0.06] rounded-xl p-3">
              <p className="text-[10px] text-[#3A5060] uppercase tracking-wide mb-1">{s.label}</p>
              <p className={`text-xl font-serif font-medium ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Converted + Lost summary */}
      <div className="flex gap-3">
        <div className="flex-1 flex items-center gap-3 bg-[#12202E] border border-white/[0.06] rounded-xl px-4 py-3">
          <TrendingUp className="w-4 h-4 text-[#C9A96E]" />
          <div className="flex gap-4 flex-wrap">
            {["converted", "lost"].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${STAGE_CONFIG[s as LeadStage].dot}`} />
                <span className="text-xs text-[#5A7080] capitalize">{LEAD_STAGE_LABELS[s]}</span>
                <span className="text-xs font-medium text-white">{boardData[s as LeadStage]?.length ?? 0}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Kanban board */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4" style={{ minWidth: `${VISIBLE_STAGES.length * 256}px` }}>
          {VISIBLE_STAGES.map((stage) => (
            <KanbanColumn
              key={stage}
              stage={stage}
              leads={boardData[stage] ?? []}
              agents={agents}
              onAction={refresh}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
