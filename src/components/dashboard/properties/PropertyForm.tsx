"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  ArrowLeft, Save, Loader2, Plus, X, ChevronDown, ChevronUp,
} from "lucide-react";
import { createProperty, updateProperty } from "@/lib/db/actions/property.actions";
import { PropertyValidator, type PropertyInput } from "@/lib/utils/validators";
import {
  PROPERTY_CATEGORIES, PROPERTY_TYPES, TRANSACTION_TYPES, BHK_CONFIGS,
  FURNISHING_STATUS, PROPERTY_AGE, POSSESSION_STATUS, FACING_DIRECTIONS,
  PARKING_TYPES, WATER_SUPPLY_OPTIONS, POWER_BACKUP_OPTIONS,
  OWNERSHIP_TYPES, ZONING_TYPES, AREA_UNITS, AMENITIES_LIST,
} from "@/lib/utils/constants";
import { cn } from "@/lib/utils";
import type { IProperty } from "@/types";

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface PropertyFormProps {
  property?: IProperty; // if provided = edit mode
}

// ─── SECTION WRAPPER ─────────────────────────────────────────────────────────

function FormSection({
  title, number, open, onToggle, children,
}: {
  title: string; number: string; open: boolean;
  onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div className="bg-[#12202E] border border-white/[0.06] rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="w-6 h-6 rounded-full bg-[#C9A96E]/15 border border-[#C9A96E]/30 flex items-center justify-center text-[11px] font-medium text-[#C9A96E]">
            {number}
          </span>
          <span className="text-sm font-medium text-white">{title}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-[#3A5060]" /> : <ChevronDown className="w-4 h-4 text-[#3A5060]" />}
      </button>
      {open && <div className="px-6 pb-6 pt-2 border-t border-white/[0.04]">{children}</div>}
    </div>
  );
}

// ─── FIELD HELPERS ────────────────────────────────────────────────────────────

const inputCls = "w-full bg-white/[0.04] border border-white/[0.10] rounded-lg px-3.5 py-2.5 text-sm text-white placeholder:text-[#3A5060] outline-none focus:border-[#C9A96E]/50 transition-all";
const labelCls = "block text-xs text-[#5A7080] mb-1.5 uppercase tracking-wide";
const gridCls  = "grid grid-cols-1 sm:grid-cols-2 gap-4";
const grid3cls  = "grid grid-cols-1 sm:grid-cols-3 gap-4";

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export function PropertyForm({ property }: PropertyFormProps) {
  const router = useRouter();
  const isEdit = !!property;
  const [isPending, startTransition] = useTransition();
  const [openSection, setOpenSection] = useState<string>("identity");

  // Amenities multi-select state
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
    property?.features?.amenities ?? []
  );

  // Nearby places state
  const [nearbyPlaces, setNearbyPlaces] = useState(
    property?.nearbyPlaces ?? []
  );

  const { register, handleSubmit, formState: { errors }, watch, setValue } =
    useForm<PropertyInput>({
      resolver: zodResolver(PropertyValidator),
      defaultValues: isEdit
        ? {
            title: property.title,
            description: property.description,
            developerName: property.developerName,
            projectName: property.projectName,
            tagline: property.tagline,
            status: property.status,
            isFeatured: property.isFeatured,
            location: property.location,
            specifications: property.specifications as never,
            sizeLayout: property.sizeLayout as never,
            financials: property.financials as never,
            features: { ...property.features, amenities: property.features?.amenities ?? [] } as never,
            legalInfo: property.legalInfo as never,
            brokeragePolicy: property.brokeragePolicy as never,
          }
        : {
            status: "active",
            isFeatured: false,
            specifications: { category: "Residential", transactionType: "Sale", possessionStatus: "Ready to Move" },
            financials: { gstApplicable: false, homeLoanAvailable: true, priceType: "total" },
            features: { isGatedCommunity: false, amenities: [] },
            legalInfo: { ownershipType: "Freehold", zoningType: "Residential", reraRegistered: false },
            brokeragePolicy: { listedBy: "Agent", isNegotiable: true, documentationSupport: true, shortlistingSupport: true },
            sizeLayout: { parkingAvailable: false, areaUnit: "sqft" },
          },
    });

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const addNearbyPlace = () => {
    setNearbyPlaces((prev) => [
      ...prev,
      { name: "", category: "Key Landmarks", distanceMinutes: undefined },
    ]);
  };

  const removeNearbyPlace = (index: number) => {
    setNearbyPlaces((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = (data: PropertyInput) => {
    startTransition(async () => {
      const payload = {
        ...data,
        features: { ...data.features, amenities: selectedAmenities },
        nearbyPlaces: nearbyPlaces.filter((p) => p.name.trim()),
      };

      const res = isEdit
        ? await updateProperty(property._id!, payload)
        : await createProperty(payload);

      if (res.success) {
        toast.success(res.message ?? (isEdit ? "Property updated" : "Property created"));
        router.push("/admin/properties");
        router.refresh();
      } else {
        toast.error(res.error ?? "Something went wrong");
      }
    });
  };

  const toggle = (key: string) => setOpenSection((prev) => (prev === key ? "" : key));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-[#3A5060] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="font-serif text-2xl font-medium text-white">
              {isEdit ? "Edit Property" : "Add New Property"}
            </h1>
            <p className="text-sm text-[#5A7080] mt-0.5">
              {isEdit ? `Editing: ${property.projectName ?? property.title}` : "Fill in the property details below."}
            </p>
          </div>
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#C9A96E] hover:bg-[#E2C99A] text-[#0B1521] text-sm font-semibold rounded-lg transition-colors disabled:opacity-60"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isEdit ? "Save Changes" : "Create Property"}
        </button>
      </div>

      {/* ── SECTION 1: Identity ──────────────────────────────────────────────── */}
      <FormSection title="Property Identity" number="1" open={openSection === "identity"} onToggle={() => toggle("identity")}>
        <div className="space-y-4 mt-4">
          <div className={gridCls}>
            <div className="sm:col-span-2">
              <label className={labelCls}>Project / Listing Title *</label>
              <input {...register("title")} placeholder="e.g. Okas Enclave – Premium Residential Plots" className={inputCls} />
              {errors.title && <p className="text-xs text-red-400 mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <label className={labelCls}>Developer Name *</label>
              <input {...register("developerName")} placeholder="e.g. Pardos Developers" className={inputCls} />
              {errors.developerName && <p className="text-xs text-red-400 mt-1">{errors.developerName.message}</p>}
            </div>
            <div>
              <label className={labelCls}>Project Name</label>
              <input {...register("projectName")} placeholder="Short project name" className={inputCls} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Tagline</label>
              <input {...register("tagline")} placeholder="e.g. Nature meets modern living in Sushant Golf City" className={inputCls} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Description *</label>
              <textarea
                {...register("description")}
                rows={4}
                placeholder="Detailed description of the property, location highlights, and investment rationale…"
                className={cn(inputCls, "resize-none")}
              />
              {errors.description && <p className="text-xs text-red-400 mt-1">{errors.description.message}</p>}
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <select {...register("status")} className={inputCls} style={{ background: "#1A2640" }}>
                {["active", "blocked", "sold", "archived"].map((s) => (
                  <option key={s} value={s} style={{ background: "#12202E" }}>{s}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3 pt-6">
              <input type="checkbox" {...register("isFeatured")} id="featured" className="w-4 h-4 accent-[#C9A96E]" />
              <label htmlFor="featured" className="text-sm text-[#8A9BAE] cursor-pointer">Mark as Featured (shows on homepage)</label>
            </div>
          </div>
        </div>
      </FormSection>

      {/* ── SECTION 2: Location ─────────────────────────────────────────────── */}
      <FormSection title="Location & Address" number="2" open={openSection === "location"} onToggle={() => toggle("location")}>
        <div className="space-y-4 mt-4">
          <div className={gridCls}>
            <div className="sm:col-span-2">
              <label className={labelCls}>Full Address *</label>
              <input {...register("location.address")} placeholder="e.g. Sushant Golf City, Sultanpur Road" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Locality / Area *</label>
              <input {...register("location.locality")} placeholder="e.g. Sushant Golf City" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>City *</label>
              <input {...register("location.city")} placeholder="Lucknow" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>State *</label>
              <input {...register("location.state")} placeholder="Uttar Pradesh" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Pincode</label>
              <input {...register("location.pincode")} placeholder="226030" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Longitude (decimal)</label>
              <input
                {...register("location.coordinates.0", { valueAsNumber: true })}
                type="number"
                step="any"
                placeholder="80.9462"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Latitude (decimal)</label>
              <input
                {...register("location.coordinates.1", { valueAsNumber: true })}
                type="number"
                step="any"
                placeholder="26.8467"
                className={inputCls}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Google Maps URL</label>
              <input {...register("location.googleMapsUrl")} placeholder="https://maps.google.com/..." className={inputCls} />
            </div>
          </div>
        </div>
      </FormSection>

      {/* ── SECTION 3: Specifications ────────────────────────────────────────── */}
      <FormSection title="Property Specifications" number="3" open={openSection === "specs"} onToggle={() => toggle("specs")}>
        <div className="space-y-4 mt-4">
          <div className={grid3cls}>
            {[
              { label: "Category *", field: "specifications.category", options: PROPERTY_CATEGORIES },
              { label: "Property Type *", field: "specifications.propertyType", options: PROPERTY_TYPES },
              { label: "Transaction Type *", field: "specifications.transactionType", options: TRANSACTION_TYPES },
              { label: "BHK Config", field: "specifications.bhkConfig", options: BHK_CONFIGS },
              { label: "Furnishing", field: "specifications.furnishingStatus", options: FURNISHING_STATUS },
              { label: "Property Age", field: "specifications.propertyAge", options: PROPERTY_AGE },
              { label: "Possession Status *", field: "specifications.possessionStatus", options: POSSESSION_STATUS },
              { label: "Facing Direction", field: "specifications.facingDirection", options: FACING_DIRECTIONS },
            ].map(({ label, field, options }) => (
              <div key={field}>
                <label className={labelCls}>{label}</label>
                <select {...register(field as never)} className={inputCls} style={{ background: "#1A2640" }}>
                  <option value="" style={{ background: "#12202E" }}>Select…</option>
                  {options.map((o) => (
                    <option key={o} value={o} style={{ background: "#12202E" }}>{o}</option>
                  ))}
                </select>
              </div>
            ))}
            <div>
              <label className={labelCls}>Floor Number</label>
              <input {...register("specifications.floorNumber")} placeholder="e.g. Ground / 5th" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Total Floors</label>
              <input {...register("specifications.totalFloors")} placeholder="e.g. 10-20" className={inputCls} />
            </div>
            <div className="flex items-center gap-2 pt-5">
              <input type="checkbox" {...register("specifications.isCornerUnit")} className="w-4 h-4 accent-[#C9A96E]" />
              <label className="text-sm text-[#8A9BAE]">Corner Unit / Plot</label>
            </div>
          </div>
        </div>
      </FormSection>

      {/* ── SECTION 4: Size & Layout ─────────────────────────────────────────── */}
      <FormSection title="Size & Layout" number="4" open={openSection === "size"} onToggle={() => toggle("size")}>
        <div className="space-y-4 mt-4">
          <div className={grid3cls}>
            <div>
              <label className={labelCls}>Area Unit</label>
              <select {...register("sizeLayout.areaUnit")} className={inputCls} style={{ background: "#1A2640" }}>
                {AREA_UNITS.map((u) => (
                  <option key={u} value={u} style={{ background: "#12202E" }}>{u}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Built-up Area</label>
              <input {...register("sizeLayout.builtUpArea", { valueAsNumber: true })} type="number" placeholder="1200" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Carpet Area</label>
              <input {...register("sizeLayout.carpetArea", { valueAsNumber: true })} type="number" placeholder="980" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Super Built-up Area</label>
              <input {...register("sizeLayout.superBuiltUpArea", { valueAsNumber: true })} type="number" placeholder="1450" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Plot Area</label>
              <input {...register("sizeLayout.plotArea", { valueAsNumber: true })} type="number" placeholder="200" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Plot Dimensions</label>
              <input {...register("sizeLayout.plotDimensions")} placeholder="30×40 ft" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Bedrooms</label>
              <input {...register("sizeLayout.bedrooms", { valueAsNumber: true })} type="number" placeholder="3" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Bathrooms</label>
              <input {...register("sizeLayout.bathrooms", { valueAsNumber: true })} type="number" placeholder="3" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Balconies</label>
              <input {...register("sizeLayout.balconies", { valueAsNumber: true })} type="number" placeholder="2" className={inputCls} />
            </div>
          </div>
          <div className={gridCls}>
            <div className="flex items-center gap-3 pt-1">
              <input type="checkbox" {...register("sizeLayout.parkingAvailable")} className="w-4 h-4 accent-[#C9A96E]" />
              <label className="text-sm text-[#8A9BAE]">Parking Available</label>
            </div>
            <div>
              <label className={labelCls}>Parking Type</label>
              <select {...register("sizeLayout.parkingType")} className={inputCls} style={{ background: "#1A2640" }}>
                <option value="" style={{ background: "#12202E" }}>Select…</option>
                {PARKING_TYPES.map((t) => (
                  <option key={t} value={t} style={{ background: "#12202E" }}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>No. of Parking Slots</label>
              <input {...register("sizeLayout.parkingSlots", { valueAsNumber: true })} type="number" placeholder="1" className={inputCls} />
            </div>
          </div>
        </div>
      </FormSection>

      {/* ── SECTION 5: Pricing ───────────────────────────────────────────────── */}
      <FormSection title="Pricing & Financials" number="5" open={openSection === "pricing"} onToggle={() => toggle("pricing")}>
        <div className="space-y-4 mt-4">
          <div className={grid3cls}>
            <div>
              <label className={labelCls}>Listed Price (INR) *</label>
              <input {...register("financials.listedPrice", { valueAsNumber: true })} type="number" placeholder="5625000" className={inputCls} />
              {errors.financials?.listedPrice && <p className="text-xs text-red-400 mt-1">{errors.financials.listedPrice.message}</p>}
            </div>
            <div>
              <label className={labelCls}>Price Type</label>
              <select {...register("financials.priceType")} className={inputCls} style={{ background: "#1A2640" }}>
                {["total", "per_sqft", "monthly_rent"].map((t) => (
                  <option key={t} value={t} style={{ background: "#12202E" }}>{t.replace(/_/g, " ")}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Price per Sqft</label>
              <input {...register("financials.pricePerSqft", { valueAsNumber: true })} type="number" placeholder="5000" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Maintenance Charges (₹/mo)</label>
              <input {...register("financials.maintenanceCharges", { valueAsNumber: true })} type="number" placeholder="2500" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Stamp Duty %</label>
              <input {...register("financials.stampDutyPercent", { valueAsNumber: true })} type="number" placeholder="7" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Registration Charges %</label>
              <input {...register("financials.registrationChargesPercent", { valueAsNumber: true })} type="number" placeholder="1" className={inputCls} />
            </div>
          </div>
          <div className={gridCls}>
            <div>
              <label className={labelCls}>Approved Banks (comma-separated)</label>
              <input
                placeholder="SBI, HDFC Bank, ICICI Bank"
                className={inputCls}
                defaultValue={property?.financials?.approvedBanks?.join(", ")}
                onChange={(e) => {
                  const banks = e.target.value.split(",").map((b) => b.trim()).filter(Boolean);
                  setValue("financials.approvedBanks", banks);
                }}
              />
            </div>
            <div className="flex flex-col gap-3 pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" {...register("financials.gstApplicable")} className="w-4 h-4 accent-[#C9A96E]" />
                <span className="text-sm text-[#8A9BAE]">GST Applicable (Under Construction)</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" {...register("financials.homeLoanAvailable")} className="w-4 h-4 accent-[#C9A96E]" />
                <span className="text-sm text-[#8A9BAE]">Home Loan Available</span>
              </label>
            </div>
          </div>
        </div>
      </FormSection>

      {/* ── SECTION 6: Amenities ─────────────────────────────────────────────── */}
      <FormSection title="Features & Amenities" number="6" open={openSection === "amenities"} onToggle={() => toggle("amenities")}>
        <div className="space-y-5 mt-4">
          <div className={gridCls}>
            <div>
              <label className={labelCls}>Water Supply</label>
              <select {...register("features.waterSupply")} className={inputCls} style={{ background: "#1A2640" }}>
                <option value="" style={{ background: "#12202E" }}>Select…</option>
                {WATER_SUPPLY_OPTIONS.map((o) => (
                  <option key={o} value={o} style={{ background: "#12202E" }}>{o}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Power Backup</label>
              <select {...register("features.powerBackup")} className={inputCls} style={{ background: "#1A2640" }}>
                <option value="" style={{ background: "#12202E" }}>Select…</option>
                {POWER_BACKUP_OPTIONS.map((o) => (
                  <option key={o} value={o} style={{ background: "#12202E" }}>{o}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {["isGatedCommunity", "isVastuCompliant", "isPetFriendly", "isGreenBuilding", "hasSmartHome", "isWheelchairAccessible"].map((field) => (
              <label key={field} className="flex items-center gap-2 cursor-pointer bg-white/[0.03] border border-white/[0.06] px-3 py-2 rounded-xl hover:border-white/[0.12] transition-colors">
                <input type="checkbox" {...register(`features.${field}` as never)} className="w-3.5 h-3.5 accent-[#C9A96E]" />
                <span className="text-xs text-[#8A9BAE] capitalize">{field.replace(/is|has/g, "").replace(/([A-Z])/g, " $1").trim()}</span>
              </label>
            ))}
          </div>
          <div>
            <label className={labelCls}>Amenities</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {AMENITIES_LIST.map((amenity) => (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => toggleAmenity(amenity)}
                  className={cn(
                    "text-xs px-3 py-1.5 rounded-xl border transition-all",
                    selectedAmenities.includes(amenity)
                      ? "bg-[#C9A96E]/15 border-[#C9A96E]/40 text-[#C9A96E]"
                      : "bg-white/[0.03] border-white/[0.06] text-[#5A7080] hover:border-white/[0.12]"
                  )}
                >
                  {amenity}
                </button>
              ))}
            </div>
            <p className="text-xs text-[#3A5060] mt-2">{selectedAmenities.length} selected</p>
          </div>
        </div>
      </FormSection>

      {/* ── SECTION 7: Legal ─────────────────────────────────────────────────── */}
      <FormSection title="Legal & Compliance" number="7" open={openSection === "legal"} onToggle={() => toggle("legal")}>
        <div className="space-y-4 mt-4">
          <div className={grid3cls}>
            <div>
              <label className={labelCls}>Ownership Type</label>
              <select {...register("legalInfo.ownershipType")} className={inputCls} style={{ background: "#1A2640" }}>
                {OWNERSHIP_TYPES.map((o) => (
                  <option key={o} value={o} style={{ background: "#12202E" }}>{o}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Zoning Type</label>
              <select {...register("legalInfo.zoningType")} className={inputCls} style={{ background: "#1A2640" }}>
                {ZONING_TYPES.map((o) => (
                  <option key={o} value={o} style={{ background: "#12202E" }}>{o}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Title Clearance</label>
              <select {...register("legalInfo.titleClearance")} className={inputCls} style={{ background: "#1A2640" }}>
                {["Clear", "Under Litigation", "NA"].map((o) => (
                  <option key={o} value={o} style={{ background: "#12202E" }}>{o}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2.5 pt-5">
              <input type="checkbox" {...register("legalInfo.reraRegistered")} className="w-4 h-4 accent-[#C9A96E]" />
              <label className="text-sm text-[#8A9BAE]">RERA Registered</label>
            </div>
            <div>
              <label className={labelCls}>RERA ID</label>
              <input {...register("legalInfo.reraId")} placeholder="UPRERAPRJ123456" className={inputCls} />
              {errors.legalInfo?.reraId && <p className="text-xs text-red-400 mt-1">{errors.legalInfo.reraId.message}</p>}
            </div>
            <div>
              <label className={labelCls}>Occupancy Certificate</label>
              <select {...register("legalInfo.occupancyCertificate")} className={inputCls} style={{ background: "#1A2640" }}>
                <option value="" style={{ background: "#12202E" }}>Select…</option>
                {["Available", "Applied", "Not Available"].map((o) => (
                  <option key={o} value={o} style={{ background: "#12202E" }}>{o}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </FormSection>

      {/* ── SECTION 8: Nearby Places ─────────────────────────────────────────── */}
      <FormSection title="Nearby Places" number="8" open={openSection === "nearby"} onToggle={() => toggle("nearby")}>
        <div className="space-y-3 mt-4">
          {nearbyPlaces.map((place, index) => (
            <div key={index} className="grid grid-cols-12 gap-3 items-start">
              <input
                value={place.name}
                onChange={(e) => {
                  const updated = [...nearbyPlaces];
                  updated[index] = { ...updated[index], name: e.target.value };
                  setNearbyPlaces(updated);
                }}
                placeholder="Place name"
                className={cn(inputCls, "col-span-4")}
              />
              <select
                value={place.category}
                onChange={(e) => {
                  const updated = [...nearbyPlaces];
                  updated[index] = { ...updated[index], category: e.target.value };
                  setNearbyPlaces(updated);
                }}
                className={cn(inputCls, "col-span-4")}
                style={{ background: "#1A2640" }}
              >
                {["Schools & Colleges","Hospitals","Malls & Multiplex","Key Landmarks","IT Parks","Metro Stations"].map((c) => (
                  <option key={c} value={c} style={{ background: "#12202E" }}>{c}</option>
                ))}
              </select>
              <input
                type="number"
                value={place.distanceMinutes ?? ""}
                onChange={(e) => {
                  const updated = [...nearbyPlaces];
                  updated[index] = { ...updated[index], distanceMinutes: Number(e.target.value) || undefined };
                  setNearbyPlaces(updated);
                }}
                placeholder="Mins"
                className={cn(inputCls, "col-span-3")}
              />
              <button
                type="button"
                onClick={() => removeNearbyPlace(index)}
                className="col-span-1 flex items-center justify-center w-10 h-10 text-[#3A5060] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addNearbyPlace}
            className="flex items-center gap-2 text-sm text-[#C9A96E] hover:text-[#E2C99A] border border-[#C9A96E]/20 hover:border-[#C9A96E]/40 px-4 py-2 rounded-xl transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Add Place
          </button>
        </div>
      </FormSection>

      {/* Bottom save */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-2.5 text-sm text-[#5A7080] border border-white/[0.06] rounded-lg hover:border-white/[0.12] transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#C9A96E] hover:bg-[#E2C99A] text-[#0B1521] text-sm font-semibold rounded-lg transition-colors disabled:opacity-60"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isEdit ? "Save Changes" : "Create Property"}
        </button>
      </div>
    </form>
  );
}
