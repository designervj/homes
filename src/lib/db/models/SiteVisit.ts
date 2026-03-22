import mongoose, { Schema, model, models, Document } from "mongoose";
import type { ISiteVisit } from "@/types";
import {
  SITE_VISIT_STATUSES,
  SITE_VISIT_OUTCOMES,
} from "@/lib/utils/constants";

export type SiteVisitDocument = ISiteVisit & Document;

const SiteVisitSchema = new Schema<SiteVisitDocument>(
  {
    // ── References ────────────────────────────────────────────────────────────
    leadId: {
      type: Schema.Types.ObjectId,
      ref: "Lead",
      required: true,
    },
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    propertyName: { type: String, trim: true },
    propertySlug: { type: String, trim: true },
    assignedAgentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedAgentName: { type: String, trim: true },

    // ── Scheduling ────────────────────────────────────────────────────────────
    scheduledAt: { type: Date, required: true },
    status: {
      type: String,
      enum: SITE_VISIT_STATUSES,
      default: "scheduled",
    },
    outcome: {
      type: String,
      enum: SITE_VISIT_OUTCOMES,
      default: "pending",
    },

    // ── Client Info (denormalised for quick access) ────────────────────────
    clientName: { type: String, required: true, trim: true },
    clientPhone: { type: String, required: true, trim: true },
    clientEmail: { type: String, trim: true, lowercase: true },

    // ── Notes ─────────────────────────────────────────────────────────────────
    notes: { type: String, trim: true, maxlength: 1000 },
    agentNotes: { type: String, trim: true, maxlength: 2000 },

    // ── Completion ────────────────────────────────────────────────────────────
    completedAt: { type: Date },
    rescheduledTo: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── INDEXES ──────────────────────────────────────────────────────────────────

// Calendar view — agent's upcoming visits
SiteVisitSchema.index({
  assignedAgentId: 1,
  scheduledAt: 1,
  status: 1,
});

// Per-property visit history
SiteVisitSchema.index({ propertyId: 1, scheduledAt: -1 });

// Per-lead visit history
SiteVisitSchema.index({ leadId: 1, scheduledAt: -1 });

// Upcoming visits dashboard widget
SiteVisitSchema.index({ scheduledAt: 1, status: 1 });

// ─── MIDDLEWARE ───────────────────────────────────────────────────────────────

// Auto-set completedAt when status changes to completed
SiteVisitSchema.pre("save", function (next) {
  if (
    this.isModified("status") &&
    this.status === "completed" &&
    !this.completedAt
  ) {
    this.completedAt = new Date();
  }
  next();
});

// ─── EXPORT ───────────────────────────────────────────────────────────────────

const SiteVisit =
  (models.SiteVisit as mongoose.Model<SiteVisitDocument>) ||
  model<SiteVisitDocument>("SiteVisit", SiteVisitSchema);

export default SiteVisit;
