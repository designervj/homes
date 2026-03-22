import mongoose, { Schema, model, models, Document } from "mongoose";
import type { IEnquiry } from "@/types";
import { ENQUIRY_STATUSES, ENQUIRY_INTERESTS, LEAD_SOURCES } from "@/lib/utils/constants";

export type EnquiryDocument = IEnquiry & Document;

const EnquirySchema = new Schema<EnquiryDocument>(
  {
    // ── Contact Info ──────────────────────────────────────────────────────────
    name: { type: String, required: true, trim: true },
    phone: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: (v: string) => /^[+]?[\d\s\-()]{7,15}$/.test(v),
        message: "Invalid phone number",
      },
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    message: { type: String, trim: true, maxlength: 2000 },

    // ── Property Reference ────────────────────────────────────────────────────
    // Optional — general contact forms won't have a property reference
    propertyId: { type: Schema.Types.ObjectId, ref: "Property" },
    propertyName: { type: String, trim: true },
    propertySlug: { type: String, trim: true },

    // ── Interests & Budget ────────────────────────────────────────────────────
    interestedIn: [{ type: String, enum: ENQUIRY_INTERESTS }],
    budgetRange: { type: String, trim: true },
    source: { type: String, enum: LEAD_SOURCES, default: "website" },

    // ── Status ────────────────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ENQUIRY_STATUSES,
      default: "new",
    },

    // ── Meta ─────────────────────────────────────────────────────────────────
    ipAddress: { type: String, trim: true },
    userAgent: { type: String, trim: true },

    // ── Agent Actions ─────────────────────────────────────────────────────────
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
    convertedLeadId: { type: Schema.Types.ObjectId, ref: "Lead" },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── INDEXES ──────────────────────────────────────────────────────────────────

// Inbox query — newest unreviewed first
EnquirySchema.index({ status: 1, createdAt: -1 });

// Per-property enquiry count
EnquirySchema.index({ propertyId: 1, status: 1 });

// Phone lookup
EnquirySchema.index({ phone: 1 });

// ─── EXPORT ───────────────────────────────────────────────────────────────────

const Enquiry =
  (models.Enquiry as mongoose.Model<EnquiryDocument>) ||
  model<EnquiryDocument>("Enquiry", EnquirySchema);

export default Enquiry;
