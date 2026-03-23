"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { connectDB } from "@/lib/db/connection";
import Enquiry from "@/lib/db/models/Enquiry";
import Lead from "@/lib/db/models/Lead";
import Property from "@/lib/db/models/Property";
import { requireAuth, withRole } from "@/lib/auth/utils";
import {
  EnquiryValidator,
  EnquiryStatusUpdateValidator,
  type EnquiryInput,
} from "@/lib/utils/validators";
import type { ApiResponse, IEnquiry, ILead } from "@/types";

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function serialize<T>(doc: any): T {
  return JSON.parse(JSON.stringify(doc)) as T;
}

// ─── SUBMIT ENQUIRY (public — no auth required) ───────────────────────────────

/**
 * Called from public property pages and contact forms.
 * Validates input, captures IP for dedup, writes to enquiries collection.
 * Never fails silently — always returns a structured response.
 */
export async function submitEnquiry(
  rawData: EnquiryInput
): Promise<ApiResponse<{ enquiryId: string }>> {
  try {
    await connectDB();

    const data = EnquiryValidator.parse(rawData);

    // Capture request metadata for spam detection and dedup
    const headersList = await headers();
    const ipAddress =
      headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      headersList.get("x-real-ip") ||
      "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";

    // Basic duplicate guard — same phone + same property in last 24h
    if (data.propertyId) {
      const recentDuplicate = await Enquiry.findOne({
        phone: data.phone,
        propertyId: data.propertyId,
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      });

      if (recentDuplicate) {
        // Silently succeed — don't tell spammers they've been blocked,
        // but also don't create a duplicate record
        return {
          success: true,
          data: { enquiryId: recentDuplicate._id.toString() },
          message: "Your enquiry has already been received. We'll be in touch shortly.",
        };
      }
    }

    const enquiry = await Enquiry.create({
      ...data,
      status: "new",
      ipAddress,
      userAgent,
    });

    // Increment enquiry count on the property (fire and forget)
    if (data.propertyId) {
      Property.findByIdAndUpdate(data.propertyId, {
        $inc: { enquiryCount: 1 },
      }).catch(console.error);
    }

    return {
      success: true,
      data: { enquiryId: enquiry._id.toString() },
      message: "Thank you! We'll reach out within 2–4 hours.",
    };
  } catch (error) {
    console.error("[submitEnquiry]", error);
    if (error instanceof Error && error.name === "ZodError") {
      return { success: false, error: "Please fill in all required fields correctly" };
    }
    return {
      success: false,
      error: "Something went wrong. Please try calling us directly.",
    };
  }
}

// ─── GET ENQUIRIES (admin inbox) ──────────────────────────────────────────────

export async function getEnquiries(filters: {
  status?: string;
  propertyId?: string;
  page?: number;
  limit?: number;
} = {}): Promise<ApiResponse<IEnquiry[]>> {
  try {
    await requireAuth();
    await connectDB();

    const { status, propertyId, page = 1, limit = 20 } = filters;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = {};

    if (status && status !== "all") query.status = status;
    if (propertyId) query.propertyId = propertyId;

    const skip = (page - 1) * limit;

    const [enquiries, total] = await Promise.all([
      Enquiry.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Enquiry.countDocuments(query),
    ]);

    return {
      success: true,
      data: enquiries.map((e) => serialize<IEnquiry>(e)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("[getEnquiries]", error);
    return { success: false, error: "Failed to fetch enquiries" };
  }
}

// ─── GET ENQUIRY COUNT BY STATUS (dashboard stats) ───────────────────────────

export async function getEnquiryStats(): Promise<
  ApiResponse<{ new: number; reviewed: number; converted: number; total: number }>
> {
  try {
    await requireAuth();
    await connectDB();

    const counts = await Enquiry.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const map: Record<string, number> = {};
    counts.forEach(({ _id, count }: { _id: string; count: number }) => {
      map[_id] = count;
    });

    return {
      success: true,
      data: {
        new: map.new ?? 0,
        reviewed: map.reviewed ?? 0,
        converted: map.converted ?? 0,
        total: Object.values(map).reduce((a, b) => a + b, 0),
      },
    };
  } catch (error) {
    console.error("[getEnquiryStats]", error);
    return { success: false, error: "Failed to fetch enquiry stats" };
  }
}

// ─── MARK ENQUIRY AS REVIEWED ─────────────────────────────────────────────────

export async function markEnquiryReviewed(
  id: string
): Promise<ApiResponse<IEnquiry>> {
  try {
    const user = await requireAuth();
    await connectDB();

    const validated = EnquiryStatusUpdateValidator.parse({
      id,
      status: "reviewed",
    });

    const enquiry = await Enquiry.findByIdAndUpdate(
      validated.id,
      {
        status: "reviewed",
        reviewedBy: user.id,
        reviewedAt: new Date(),
      },
      { new: true }
    ).lean();

    if (!enquiry) return { success: false, error: "Enquiry not found" };

    revalidatePath("/admin/enquiries");

    return {
      success: true,
      data: serialize<IEnquiry>(enquiry),
      message: "Enquiry marked as reviewed",
    };
  } catch (error) {
    console.error("[markEnquiryReviewed]", error);
    return { success: false, error: "Failed to update enquiry" };
  }
}

// ─── MARK ENQUIRY AS SPAM ─────────────────────────────────────────────────────

export async function markEnquirySpam(id: string): Promise<ApiResponse<null>> {
  try {
    await withRole(["super_admin", "admin"]);
    await connectDB();

    await Enquiry.findByIdAndUpdate(id, { status: "spam" });

    revalidatePath("/admin/enquiries");

    return { success: true, data: null, message: "Marked as spam" };
  } catch (error) {
    console.error("[markEnquirySpam]", error);
    return { success: false, error: "Failed to update enquiry" };
  }
}

// ─── CONVERT ENQUIRY TO LEAD ──────────────────────────────────────────────────

/**
 * The core pipeline entry point.
 * Agent clicks "Convert to Lead" in the inbox.
 * Creates a Lead document, links it back to the enquiry,
 * and updates the enquiry status to "converted".
 */
export async function convertEnquiryToLead(
  enquiryId: string
): Promise<ApiResponse<ILead>> {
  try {
    const user = await requireAuth();
    await connectDB();

    const enquiry = await Enquiry.findById(enquiryId);
    if (!enquiry) return { success: false, error: "Enquiry not found" };

    if (enquiry.status === "converted") {
      return {
        success: false,
        error: "This enquiry has already been converted to a lead",
      };
    }

    // Create the lead
    const lead = await Lead.create({
      name: enquiry.name,
      phone: enquiry.phone,
      email: enquiry.email,
      stage: "new",
      source: enquiry.source || "website",
      propertyId: enquiry.propertyId,
      propertyName: enquiry.propertyName,
      propertySlug: enquiry.propertySlug,
      requirements: enquiry.budgetRange 
        ? `${enquiry.interestedIn.join(", ")} (Budget: ${enquiry.budgetRange})`
        : enquiry.interestedIn.join(", "),
      convertedFromEnquiryId: enquiry._id,
      activityLog: [
        {
          action: "Lead created from enquiry",
          note: `Converted from enquiry by ${user.name}. Original message: ${enquiry.message || "No message"}${enquiry.budgetRange ? `. Budget: ${enquiry.budgetRange}` : ""}`,
          performedBy: user.id,
          performedAt: new Date(),
          stage: "new",
        },
      ],
    });

    // Update the enquiry
    await Enquiry.findByIdAndUpdate(enquiryId, {
      status: "converted",
      convertedLeadId: lead._id,
      reviewedBy: user.id,
      reviewedAt: new Date(),
    });

    revalidatePath("/admin/enquiries");
    revalidatePath("/admin/leads");

    return {
      success: true,
      data: serialize<ILead>(lead.toObject()),
      message: `Lead created for ${lead.name}`,
    };
  } catch (error) {
    console.error("[convertEnquiryToLead]", error);
    return { success: false, error: "Failed to convert enquiry to lead" };
  }
}
