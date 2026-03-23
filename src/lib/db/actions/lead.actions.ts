"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db/connection";
import Lead from "@/lib/db/models/Lead";
import User from "@/lib/db/models/User";
import { requireAuth } from "@/lib/auth/utils";
import {
  LeadValidator,
  LeadStageUpdateValidator,
  LeadAssignValidator,
  ActivityLogValidator,
  type LeadInput,
  type LeadStageUpdateInput,
} from "@/lib/utils/validators";
import type { ApiResponse, ILead, LeadStage } from "@/types";
import { LEAD_STAGE_LABELS } from "@/lib/utils/constants";

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function serialize<T>(doc: any): T {
  return JSON.parse(JSON.stringify(doc)) as T;
}

// ─── GET LEADS (admin) ────────────────────────────────────────────────────────

export async function getLeads(filters: {
  stage?: LeadStage | "all";
  assignedTo?: string;
  propertyId?: string;
  source?: string;
  search?: string;
  page?: number;
  limit?: number;
} = {}): Promise<ApiResponse<ILead[]>> {
  try {
    await requireAuth();
    await connectDB();

    const { stage, assignedTo, propertyId, source, search, page = 1, limit = 50 } = filters;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = {};

    if (stage && stage !== "all") query.stage = stage;
    if (assignedTo) query.assignedTo = assignedTo;
    if (propertyId) query.propertyId = propertyId;
    if (source) query.source = source;

    if (search?.trim()) {
      const rx = new RegExp(search.trim(), "i");
      query.$or = [{ name: rx }, { phone: rx }, { email: rx }];
    }

    const skip = (page - 1) * limit;

    const [leads, total] = await Promise.all([
      Lead.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Lead.countDocuments(query),
    ]);

    return {
      success: true,
      data: leads.map((l) => serialize<ILead>(l)),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  } catch (error) {
    console.error("[getLeads]", error);
    return { success: false, error: "Failed to fetch leads" };
  }
}

// ─── GET LEADS GROUPED BY STAGE (Kanban board) ───────────────────────────────

/**
 * Returns leads bucketed by pipeline stage for the Kanban board.
 * Each stage returns the most recent 20 leads to keep payload manageable.
 */
export async function getLeadsKanban(filters: {
  assignedTo?: string;
} = {}): Promise<ApiResponse<Record<LeadStage, ILead[]>>> {
  try {
    await requireAuth();
    await connectDB();

    const { assignedTo } = filters;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const baseQuery: Record<string, any> = {};
    if (assignedTo) baseQuery.assignedTo = assignedTo;

    const leads = await Lead.find(baseQuery)
      .sort({ createdAt: -1 })
      .limit(500) // cap for performance
      .lean();

    // Group by stage
    const grouped: Record<string, ILead[]> = {
      new: [],
      contacted: [],
      qualified: [],
      site_visit_scheduled: [],
      negotiation: [],
      converted: [],
      lost: [],
    };

    leads.forEach((lead) => {
      const stage = lead.stage as string;
      if (grouped[stage]) {
        grouped[stage].push(serialize<ILead>(lead));
      }
    });

    return {
      success: true,
      data: grouped as Record<LeadStage, ILead[]>,
    };
  } catch (error) {
    console.error("[getLeadsKanban]", error);
    return { success: false, error: "Failed to fetch Kanban data" };
  }
}

// ─── GET SINGLE LEAD ─────────────────────────────────────────────────────────

export async function getLeadById(id: string): Promise<ApiResponse<ILead>> {
  try {
    await requireAuth();
    await connectDB();

    const lead = await Lead.findById(id).lean();
    if (!lead) return { success: false, error: "Lead not found" };

    return { success: true, data: serialize<ILead>(lead) };
  } catch (error) {
    console.error("[getLeadById]", error);
    return { success: false, error: "Failed to fetch lead" };
  }
}

// ─── CREATE LEAD (manual — agent creates directly) ───────────────────────────

export async function createLead(rawData: LeadInput): Promise<ApiResponse<ILead>> {
  try {
    const user = await requireAuth();
    await connectDB();

    const data = LeadValidator.parse(rawData);

    const lead = await Lead.create({
      ...data,
      activityLog: [
        {
          action: "Lead created manually",
          note: `Created by ${user.name}`,
          performedBy: user.id,
          performedAt: new Date(),
          stage: "new",
        },
      ],
    });

    revalidatePath("/admin/leads");

    return {
      success: true,
      data: serialize<ILead>(lead.toObject()),
      message: `Lead created for ${lead.name}`,
    };
  } catch (error) {
    console.error("[createLead]", error);
    return { success: false, error: "Failed to create lead" };
  }
}

// ─── UPDATE LEAD STAGE (drag-drop Kanban / manual) ───────────────────────────

export async function updateLeadStage(
  rawData: LeadStageUpdateInput
): Promise<ApiResponse<ILead>> {
  try {
    const user = await requireAuth();
    await connectDB();

    const { leadId, stage, note } = LeadStageUpdateValidator.parse(rawData);

    const lead = await Lead.findById(leadId);
    if (!lead) return { success: false, error: "Lead not found" };

    const previousStage = lead.stage;

    // Push to activity log
    lead.activityLog.push({
      action: `Stage changed: ${LEAD_STAGE_LABELS[previousStage]} → ${LEAD_STAGE_LABELS[stage]}`,
      note: note || undefined,
      performedBy: user.id as unknown as string,
      performedAt: new Date(),
      stage,
    });

    lead.stage = stage;
    await lead.save(); // triggers pre-save middleware (sets closedAt)

    revalidatePath("/admin/leads");
    revalidatePath(`/admin/leads/${leadId}`);

    return {
      success: true,
      data: serialize<ILead>(lead.toObject()),
      message: `Lead moved to "${LEAD_STAGE_LABELS[stage]}"`,
    };
  } catch (error) {
    console.error("[updateLeadStage]", error);
    return { success: false, error: "Failed to update lead stage" };
  }
}

// ─── ASSIGN LEAD TO AGENT ─────────────────────────────────────────────────────

export async function assignLead(rawData: {
  leadId: string;
  agentId: string;
  agentName: string;
}): Promise<ApiResponse<ILead>> {
  try {
    const user = await requireAuth();
    await connectDB();

    const { leadId, agentId, agentName } = LeadAssignValidator.parse(rawData);

    // Verify agent exists and is active
    const agent = await User.findOne({ _id: agentId, isActive: true });
    if (!agent) return { success: false, error: "Agent not found or inactive" };

    const lead = await Lead.findById(leadId);
    if (!lead) return { success: false, error: "Lead not found" };

    const previousAgent = lead.assignedAgentName || "Unassigned";

    lead.assignedTo = agentId as unknown as string;
    lead.assignedAgentName = agentName;
    lead.activityLog.push({
      action: `Lead assigned to ${agentName}`,
      note: `Previously: ${previousAgent}. Assigned by ${user.name}`,
      performedBy: user.id as unknown as string,
      performedAt: new Date(),
      stage: lead.stage,
    });

    await lead.save();

    revalidatePath("/admin/leads");
    revalidatePath(`/admin/leads/${leadId}`);

    return {
      success: true,
      data: serialize<ILead>(lead.toObject()),
      message: `Lead assigned to ${agentName}`,
    };
  } catch (error) {
    console.error("[assignLead]", error);
    return { success: false, error: "Failed to assign lead" };
  }
}

// ─── ADD ACTIVITY LOG ENTRY ───────────────────────────────────────────────────

export async function addLeadActivity(rawData: {
  leadId: string;
  action: string;
  note?: string;
}): Promise<ApiResponse<ILead>> {
  try {
    const user = await requireAuth();
    await connectDB();

    const { leadId, action, note } = ActivityLogValidator.parse(rawData);

    const lead = await Lead.findById(leadId);
    if (!lead) return { success: false, error: "Lead not found" };

    lead.activityLog.push({
      action,
      note: note || undefined,
      performedBy: user.id as unknown as string,
      performedAt: new Date(),
      stage: lead.stage,
    });

    await lead.save();

    revalidatePath(`/admin/leads/${leadId}`);

    return {
      success: true,
      data: serialize<ILead>(lead.toObject()),
      message: "Activity logged",
    };
  } catch (error) {
    console.error("[addLeadActivity]", error);
    return { success: false, error: "Failed to log activity" };
  }
}

// ─── UPDATE LEAD SCORE ────────────────────────────────────────────────────────

export async function updateLeadScore(
  leadId: string,
  score: number
): Promise<ApiResponse<ILead>> {
  try {
    const user = await requireAuth();
    await connectDB();

    if (score < 0 || score > 100) {
      return { success: false, error: "Score must be between 0 and 100" };
    }

    const lead = await Lead.findById(leadId);
    if (!lead) return { success: false, error: "Lead not found" };

    const previousScore = lead.score || 0;
    lead.score = score;
    lead.activityLog.push({
      action: `Lead score updated: ${previousScore} → ${score}`,
      performedBy: user.id as unknown as string,
      performedAt: new Date(),
      stage: lead.stage,
    });

    await lead.save();

    revalidatePath(`/admin/leads/${leadId}`);
    revalidatePath("/admin/leads");

    return {
      success: true,
      data: serialize<ILead>(lead.toObject()),
      message: `Lead score updated to ${score}`,
    };
  } catch (error) {
    console.error("[updateLeadScore]", error);
    return { success: false, error: "Failed to update lead score" };
  }
}

// ─── MARK LEAD LOST ───────────────────────────────────────────────────────────

export async function markLeadLost(
  leadId: string,
  reason: string
): Promise<ApiResponse<ILead>> {
  try {
    const user = await requireAuth();
    await connectDB();

    const lead = await Lead.findById(leadId);
    if (!lead) return { success: false, error: "Lead not found" };

    lead.stage = "lost";
    lead.lostReason = reason;
    lead.activityLog.push({
      action: "Lead marked as lost",
      note: `Reason: ${reason}`,
      performedBy: user.id as unknown as string,
      performedAt: new Date(),
      stage: "lost",
    });

    await lead.save(); // pre-save sets closedAt

    revalidatePath("/admin/leads");
    revalidatePath(`/admin/leads/${leadId}`);

    return {
      success: true,
      data: serialize<ILead>(lead.toObject()),
      message: "Lead marked as lost",
    };
  } catch (error) {
    console.error("[markLeadLost]", error);
    return { success: false, error: "Failed to update lead" };
  }
}

// ─── GET LEAD STATS (dashboard) ───────────────────────────────────────────────

export async function getLeadStats(): Promise<
  ApiResponse<{
    total: number;
    active: number;
    converted: number;
    lost: number;
    conversionRate: number;
    byStage: Record<string, number>;
    bySource: Record<string, number>;
  }>
> {
  try {
    await requireAuth();
    await connectDB();

    const [stageCounts, sourceCounts] = await Promise.all([
      Lead.aggregate([{ $group: { _id: "$stage", count: { $sum: 1 } } }]),
      Lead.aggregate([{ $group: { _id: "$source", count: { $sum: 1 } } }]),
    ]);

    const byStage: Record<string, number> = {};
    stageCounts.forEach(({ _id, count }: { _id: string; count: number }) => {
      byStage[_id] = count;
    });

    const bySource: Record<string, number> = {};
    sourceCounts.forEach(({ _id, count }: { _id: string; count: number }) => {
      bySource[_id] = count;
    });

    const total = Object.values(byStage).reduce((a, b) => a + b, 0);
    const converted = byStage.converted ?? 0;
    const lost = byStage.lost ?? 0;
    const active = total - converted - lost;
    const conversionRate = total > 0 ? Math.round((converted / total) * 100) : 0;

    return {
      success: true,
      data: { total, active, converted, lost, conversionRate, byStage, bySource },
    };
  } catch (error) {
    console.error("[getLeadStats]", error);
    return { success: false, error: "Failed to fetch lead stats" };
  }
}

// ─── GET AGENTS LIST (for assignment dropdown) ────────────────────────────────

export async function getAgents(): Promise<
  ApiResponse<{ id: string; name: string; email: string; role: string }[]>
> {
  try {
    await requireAuth();
    await connectDB();

    const agents = await User.find({ isActive: true })
      .select("name email role")
      .lean();

    return {
      success: true,
      data: agents.map((a) => ({
        id: (a._id as { toString(): string }).toString(),
        name: a.name as string,
        email: a.email as string,
        role: a.role as string,
      })),
    };
  } catch (error) {
    console.error("[getAgents]", error);
    return { success: false, error: "Failed to fetch agents" };
  }
}
