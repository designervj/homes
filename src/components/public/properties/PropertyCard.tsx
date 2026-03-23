import Link from "next/link";
import Image from "next/image";
import { MapPin, Maximize2, Star } from "lucide-react";
import { ReraBadge } from "./ReraBadge";
import { formatINR } from "@/lib/utils/constants";
import { cn } from "@/lib/utils";
import type { IProperty } from "@/types";

interface PropertyCardProps {
  property: IProperty;
  featured?: boolean;
  className?: string;
}

const TYPE_COLORS: Record<string, string> = {
  Plot:      "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Apartment: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Villa:     "bg-purple-500/10 text-purple-400 border-purple-500/20",
  default:   "bg-white/5 text-[#8A9BAE] border-white/10",
};

export function PropertyCard({ property, featured = false, className }: PropertyCardProps) {
  const coverImage = property.mediaAssets?.find((m) => m.isCover && m.type === "image");
  const price = property.financials?.listedPrice;
  const pricePerSqft = property.financials?.pricePerSqft;
  const type = property.specifications?.propertyType;
  const typeStyle = TYPE_COLORS[type ?? ""] ?? TYPE_COLORS.default;

  const primaryArea =
    property.sizeLayout?.plotArea ??
    property.sizeLayout?.builtUpArea ??
    property.sizeLayout?.carpetArea;

  const areaUnit = property.sizeLayout?.areaUnit ?? "sqft";

  return (
    <Link
      href={`/projects/${property.slug}`}
      className={cn(
        "group block bg-[#12202E] border border-white/[0.06] rounded-2xl overflow-hidden",
        "hover:border-[#C9A96E]/30 hover:-translate-y-1 transition-all duration-300",
        className
      )}
    >
      {/* Image */}
      <div className={cn("relative overflow-hidden bg-[#1A2E42]", featured ? "h-64" : "h-52")}>
        {coverImage?.url ? (
          <Image
            src={coverImage.url}
            alt={property.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          /* Placeholder pattern */
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage: "repeating-linear-gradient(45deg, #C9A96E 0, #C9A96E 1px, transparent 0, transparent 50%)",
              backgroundSize: "20px 20px",
            }}
          />
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1521]/90 via-[#0B1521]/20 to-transparent" />

        {/* Top badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {property.legalInfo?.reraRegistered && (
            <ReraBadge reraId={property.legalInfo.reraId} size="sm" />
          )}
          <span className={cn("text-[10px] px-2 py-0.5 rounded-full border font-medium", typeStyle)}>
            {type}
          </span>
          {property.isFeatured && (
            <span className="flex items-center gap-0.5 text-[10px] px-2 py-0.5 rounded-full bg-[#C9A96E]/20 text-[#C9A96E] border border-[#C9A96E]/30 font-medium">
              <Star className="w-2.5 h-2.5 fill-[#C9A96E]" /> Featured
            </span>
          )}
        </div>

        {/* Price tag */}
        {price && (
          <div className="absolute bottom-3 right-3 bg-[#0B1521]/90 backdrop-blur-sm border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-right">
            <p className="text-[9px] text-[#5A7080] leading-none mb-0.5">Starting From</p>
            <p className="text-sm font-semibold text-[#E2C99A] leading-none">{formatINR(price)}</p>
            {pricePerSqft && (
              <p className="text-[9px] text-[#3A5060] mt-0.5">₹{pricePerSqft.toLocaleString("en-IN")}/sqft</p>
            )}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-5">
        <p className="text-xs text-[#5A7080] mb-1">{property.developerName}</p>
        <h3 className={cn(
          "font-serif font-medium text-white mb-2 group-hover:text-[#E2C99A] transition-colors line-clamp-2",
          featured ? "text-xl" : "text-lg"
        )}>
          {property.projectName ?? property.title}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-xs text-[#5A7080] mb-4">
          <MapPin className="w-3 h-3 text-[#C9A96E] flex-shrink-0" />
          <span className="truncate">{property.location?.locality}, {property.location?.city}</span>
        </div>

        {/* Specs row */}
        <div className="flex items-center gap-4 pt-4 border-t border-white/[0.06]">
          {property.specifications?.possessionStatus && (
            <div className="flex flex-col gap-0.5">
              <p className="text-[10px] text-[#3A5060] uppercase tracking-wide">Possession</p>
              <p className="text-xs font-medium text-[#8A9BAE]">{property.specifications.possessionStatus}</p>
            </div>
          )}
          {primaryArea && (
            <div className="flex flex-col gap-0.5">
              <p className="text-[10px] text-[#3A5060] uppercase tracking-wide">Area</p>
              <p className="text-xs font-medium text-[#8A9BAE] flex items-center gap-1">
                <Maximize2 className="w-3 h-3" />
                {primaryArea.toLocaleString("en-IN")} {areaUnit}
              </p>
            </div>
          )}
          {property.specifications?.bhkConfig && (
            <div className="flex flex-col gap-0.5">
              <p className="text-[10px] text-[#3A5060] uppercase tracking-wide">Config</p>
              <p className="text-xs font-medium text-[#8A9BAE]">{property.specifications.bhkConfig}</p>
            </div>
          )}
          {property.specifications?.transactionType && (
            <div className="ml-auto">
              <span className="text-[10px] text-[#3A5060] bg-white/[0.03] px-2 py-1 rounded-md">
                {property.specifications.transactionType}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
