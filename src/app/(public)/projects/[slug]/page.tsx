import { notFound } from "next/navigation";
import Image from "next/image";
import { getPropertyBySlug, getAllPropertySlugs } from "@/lib/db/actions/property.actions";
import { ReraBadge, LdaBadge } from "@/components/public/properties/ReraBadge";
import { EnquiryForm } from "@/components/public/forms/EnquiryForm";
import { PropertyGallery } from "@/components/public/properties/PropertyGallery";
import {
  MapPin, Maximize2, BedDouble, Bath, Car,
  CheckCircle, ChevronRight, BadgeCheck, Phone,
} from "lucide-react";
import { formatINR } from "@/lib/utils/constants";
import type { Metadata } from "next";

// ─── STATIC PARAMS ────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  const slugs = await getAllPropertySlugs();
  return slugs.map((slug) => ({ slug }));
}

// ─── METADATA ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const res = await getPropertyBySlug(slug);
  if (!res.success || !res.data) return { title: "Property Not Found" };

  const p = res.data;
  return {
    title: `${p.projectName ?? p.title} — ${p.location?.locality}, ${p.location?.city}`,
    description: p.description?.slice(0, 160),
    openGraph: {
      title: p.projectName ?? p.title,
      description: p.description?.slice(0, 160),
      images: p.mediaAssets?.find((m) => m.isCover)?.url
        ? [{ url: p.mediaAssets.find((m) => m.isCover)!.url }]
        : [],
    },
  };
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const res = await getPropertyBySlug(slug);

  if (!res.success || !res.data) notFound();

  const p = res.data;
  const price = p.financials?.listedPrice;
  const images = p.mediaAssets?.filter((m) => m.type === "image") ?? [];
  const floorplans = p.mediaAssets?.filter((m) => m.type === "floorplan") ?? [];
  const brochure = p.mediaAssets?.find((m) => m.type === "brochure");

  // Group nearby places by category
  const nearbyByCategory: Record<string, typeof p.nearbyPlaces> = {};
  p.nearbyPlaces?.forEach((place) => {
    if (!nearbyByCategory[place.category]) nearbyByCategory[place.category] = [];
    nearbyByCategory[place.category].push(place);
  });

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: p.projectName ?? p.title,
    description: p.description,
    address: {
      "@type": "PostalAddress",
      streetAddress: p.location?.address,
      addressLocality: p.location?.locality,
      addressRegion: p.location?.state,
      postalCode: p.location?.pincode,
      addressCountry: "IN",
    },
    offers: price ? {
      "@type": "Offer",
      price,
      priceCurrency: "INR",
    } : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="bg-background min-h-screen pt-16">

        {/* ── HERO BAR ──────────────────────────────────────────────────────── */}
        <div className="border-b border-border bg-background/95 sticky top-16 z-30 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <a href="/" className="hover:text-primary transition-colors">Home</a>
                <ChevronRight className="w-3 h-3" />
                <a href="/projects" className="hover:text-primary transition-colors">Projects</a>
                <ChevronRight className="w-3 h-3" />
                <span className="text-muted-foreground">{p.projectName ?? p.title}</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {p.legalInfo?.reraRegistered && (
                  <ReraBadge reraId={p.legalInfo.reraId} size="sm" showId />
                )}
                <span className="text-xs text-[#5A7080] bg-accent px-2 py-0.5 rounded-md">
                  {p.specifications?.propertyType}
                </span>
                <span className="text-xs text-[#5A7080] bg-accent px-2 py-0.5 rounded-md capitalize">
                  {p.specifications?.possessionStatus}
                </span>
              </div>
            </div>
            {price && (
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Starting From</p>
                <p className="font-serif text-2xl font-semibold text-primary">{formatINR(price)}</p>
                {p.financials?.pricePerSqft && (
                  <p className="text-xs text-[#5A7080]">₹{p.financials.pricePerSqft.toLocaleString("en-IN")}/sqft</p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* ── LEFT / MAIN ──────────────────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-10">

              {/* Gallery */}
              {images.length > 0 && <PropertyGallery images={images} projectName={p.projectName ?? p.title} />}

              {/* Title + overview */}
              <div>
                <h1 className="font-serif text-3xl sm:text-4xl font-medium text-white mb-2">
                  {p.projectName ?? p.title}
                </h1>
                <div className="flex items-center gap-1.5 text-sm text-[#5A7080] mb-6">
                  <MapPin className="w-4 h-4 text-primary" />
                  {p.location?.address}, {p.location?.city} – {p.location?.pincode}
                </div>
                <p className="text-muted-foreground leading-relaxed text-[15px]">{p.description}</p>
              </div>

              {/* Key specs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  {
                    icon: Maximize2,
                    label: "Plot / Built-up Area",
                    value: p.sizeLayout?.plotArea
                      ? `${p.sizeLayout.plotArea.toLocaleString("en-IN")} ${p.sizeLayout.areaUnit}`
                      : p.sizeLayout?.builtUpArea
                      ? `${p.sizeLayout.builtUpArea.toLocaleString("en-IN")} ${p.sizeLayout.areaUnit}`
                      : null,
                  },
                  {
                    icon: BedDouble,
                    label: "Bedrooms",
                    value: p.sizeLayout?.bedrooms ? `${p.sizeLayout.bedrooms} BHK` : p.specifications?.bhkConfig ?? null,
                  },
                  {
                    icon: Bath,
                    label: "Bathrooms",
                    value: p.sizeLayout?.bathrooms ? `${p.sizeLayout.bathrooms} Baths` : null,
                  },
                  {
                    icon: Car,
                    label: "Parking",
                    value: p.sizeLayout?.parkingAvailable
                      ? `${p.sizeLayout.parkingSlots ?? 1} ${p.sizeLayout.parkingType ?? "Parking"}`
                      : "No Parking",
                  },
                ]
                  .filter((s) => s.value)
                  .map((spec) => {
                    const Icon = spec.icon;
                    return (
                      <div key={spec.label} className="bg-card border border-border rounded-xl p-4">
                        <Icon className="w-4 h-4 text-primary mb-2" />
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">{spec.label}</p>
                        <p className="text-sm font-medium text-white">{spec.value}</p>
                      </div>
                    );
                  })}
              </div>

              {/* Full specifications table */}
              <div>
                <h2 className="font-serif text-2xl font-medium text-white mb-5">Specifications</h2>
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                  <table className="w-full">
                    <tbody>
                      {[
                        ["Developer", p.developerName],
                        ["Project Area", p.sizeLayout?.plotDimensions],
                        ["Property Type", p.specifications?.propertyType],
                        ["Transaction", p.specifications?.transactionType],
                        ["Configuration", p.specifications?.bhkConfig],
                        ["Furnishing", p.specifications?.furnishingStatus],
                        ["Possession", p.specifications?.possessionStatus],
                        ["Property Age", p.specifications?.propertyAge],
                        ["Facing Direction", p.specifications?.facingDirection],
                        ["Floor", p.specifications?.floorNumber],
                        ["Total Floors", p.specifications?.totalFloors],
                        ["Ownership", p.legalInfo?.ownershipType],
                        ["Zoning", p.legalInfo?.zoningType],
                        ["Title Clearance", p.legalInfo?.titleClearance],
                        ["OC Status", p.legalInfo?.occupancyCertificate],
                        ["GST Applicable", p.financials?.gstApplicable ? "Yes (Under Construction)" : "No (Ready to Move)"],
                        ["Approved Banks", p.financials?.approvedBanks?.join(", ")],
                        ["Stamp Duty (Approx)", p.financials?.stampDutyPercent ? `${p.financials.stampDutyPercent}%` : "As per state (~7%)"],
                      ]
                        .filter(([, v]) => v)
                        .map(([label, value], i, arr) => (
                          <tr key={label} className={i < arr.length - 1 ? "border-b border-white/[0.04]" : ""}>
                            <td className="px-5 py-3.5 text-sm text-[#5A7080] w-[45%]">{label}</td>
                            <td className={`px-5 py-3.5 text-sm font-medium ${label === "RERA ID" ? "text-emerald-400" : "text-white"}`}>
                              {value}
                            </td>
                          </tr>
                        ))}
                      {p.legalInfo?.reraId && (
                        <tr>
                          <td className="px-5 py-3.5 text-sm text-[#5A7080]">RERA Registration</td>
                          <td className="px-5 py-3.5">
                            <span className="flex items-center gap-1.5 text-sm text-emerald-400 font-medium">
                              <BadgeCheck className="w-4 h-4" /> {p.legalInfo.reraId}
                            </span>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Amenities */}
              {p.features?.amenities && p.features.amenities.length > 0 && (
                <div>
                  <h2 className="font-serif text-2xl font-medium text-white mb-5">Amenities</h2>
                  <div className="flex flex-wrap gap-2.5">
                    {p.features.amenities.map((amenity) => (
                      <div
                        key={amenity}
                        className="flex items-center gap-2 text-sm text-primary bg-primary/8 border border-primary/20 px-3.5 py-2 rounded-xl"
                      >
                        <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        {amenity}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Floor plans */}
              {floorplans.length > 0 && (
                <div>
                  <h2 className="font-serif text-2xl font-medium text-white mb-5">Floor Plans</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {floorplans.map((fp, i) => (
                      <div key={i} className="relative aspect-[4/3] bg-card border border-border rounded-xl overflow-hidden">
                        <Image
                          src={fp.url}
                          alt={fp.caption ?? `Floor plan ${i + 1}`}
                          fill
                          className="object-contain p-4"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Nearby places */}
              {Object.keys(nearbyByCategory).length > 0 && (
                <div>
                  <h2 className="font-serif text-2xl font-medium text-white mb-5">Nearby Places</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.entries(nearbyByCategory).map(([category, places]) => (
                      <div key={category} className="bg-card border border-border rounded-xl p-5">
                        <p className="text-xs text-primary uppercase tracking-widest font-medium mb-3">{category}</p>
                        <ul className="space-y-2">
                          {places.map((place, i) => (
                            <li key={i} className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">{place.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {place.distanceMinutes ? `${place.distanceMinutes} mins` : place.distanceKm ? `${place.distanceKm} km` : ""}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Map placeholder */}
              {p.location?.coordinates && (
                <div>
                  <h2 className="font-serif text-2xl font-medium text-white mb-5">Location</h2>
                  <div className="bg-card border border-border rounded-xl p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{p.location.address}</p>
                      <p className="text-xs text-[#5A7080] mt-0.5">{p.location.city}, {p.location.state} – {p.location.pincode}</p>
                    </div>
                    {p.location.googleMapsUrl && (
                      <a
                        href={p.location.googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-auto text-xs text-primary hover:text-primary-light border border-primary/20 px-3 py-1.5 rounded-lg transition-colors flex-shrink-0"
                      >
                        Open in Maps
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ── SIDEBAR ───────────────────────────────────────────────────── */}
            <div className="space-y-5">

              {/* Enquiry form card */}
              <div className="bg-card border border-border rounded-2xl p-6 sticky top-36">
                <h3 className="font-serif text-lg font-medium text-white mb-5">
                  Enquire About This Property
                </h3>
                <EnquiryForm
                  propertyId={p._id}
                  propertyName={p.projectName ?? p.title}
                  propertySlug={p.slug}
                  variant="sidebar"
                />

                {/* Direct call CTA */}
                <div className="mt-5 pt-5 border-t border-border">
                  <a
                    href="tel:+918874625303"
                    className="flex items-center justify-center gap-2.5 w-full py-3 border border-border hover:border-primary/30 text-muted-foreground hover:text-primary rounded-xl text-sm font-medium transition-all"
                  >
                    <Phone className="w-4 h-4" /> +91 88746 25303
                  </a>
                </div>
              </div>

              {/* Brochure download */}
              {brochure && (
                <a
                  href={brochure.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-primary/10 hover:bg-primary/15 text-primary border border-primary/20 rounded-2xl text-sm font-medium transition-all"
                >
                  Download Brochure
                </a>
              )}

              {/* Compliance card */}
              <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
                <p className="text-xs text-muted-foreground uppercase tracking-widest">Compliance</p>
                {p.legalInfo?.reraRegistered && p.legalInfo.reraId && (
                  <div className="flex items-center gap-2">
                    <ReraBadge reraId={p.legalInfo.reraId} size="sm" showId />
                  </div>
                )}
                {p.financials?.approvedBanks && p.financials.approvedBanks.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1.5">Bank Approved</p>
                    <div className="flex flex-wrap gap-1.5">
                      {p.financials.approvedBanks.slice(0, 4).map((bank) => (
                        <span key={bank} className="text-[11px] px-2 py-0.5 rounded-md bg-accent text-[#5A7080]">
                          {bank}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {p.features?.isGatedCommunity && (
                  <div className="flex items-center gap-2 text-xs text-[#5A7080]">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Gated Community
                  </div>
                )}
                {p.features?.isVastuCompliant && (
                  <div className="flex items-center gap-2 text-xs text-[#5A7080]">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Vastu Compliant
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
