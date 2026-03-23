import { getProperties } from "@/lib/db/actions/property.actions";
import { PropertyCard } from "@/components/public/properties/PropertyCard";
import { ProjectsFilter } from "@/components/public/properties/ProjectsFilter";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Projects — Browse RERA Verified Properties",
  description:
    "Browse all RERA-verified residential plots, apartments, and villas in Lucknow. Filter by type, location, and budget.",
};

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{
    type?: string; search?: string; minPrice?: string;
    maxPrice?: string; possession?: string; page?: string;
  }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;

  const res = await getProperties({
    status: "active",
    propertyType: params.type as never,
    search: params.search,
    minPrice: params.minPrice ? Number(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
    possessionStatus: params.possession as never,
    page,
    limit: 12,
    sortBy: "isFeatured",
    sortOrder: "desc",
  });

  const properties = res.data ?? [];
  const pagination = res.pagination;

  return (
    <div className="bg-background min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-7 h-px bg-primary" />
            <span className="text-xs text-primary uppercase tracking-widest font-medium">All Projects</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-medium text-white mb-3">
            Find Your Property
          </h1>
          <p className="text-[#5A7080]">
            {pagination?.total ?? properties.length} properties across Lucknow&apos;s prime corridors.
          </p>
        </div>

        {/* Filters */}
        <ProjectsFilter currentFilters={params} />

        {/* Grid */}
        {properties.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-card border border-border flex items-center justify-center mb-5">
              <span className="text-2xl">🏠</span>
            </div>
            <p className="text-white font-medium text-lg mb-2">No properties found</p>
            <p className="text-[#5A7080] text-sm">Try adjusting your filters or&nbsp;
              <a href="/projects" className="text-primary hover:underline">clear all filters</a>.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {properties.map((property) => (
                <PropertyCard key={property._id} property={property} />
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-14">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                  <a
                    key={p}
                    href={`/projects?page=${p}${params.type ? `&type=${params.type}` : ""}${params.search ? `&search=${params.search}` : ""}`}
                    className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-medium transition-colors ${
                      p === pagination.page
                        ? "bg-primary text-foreground"
                        : "bg-card text-[#5A7080] hover:text-white border border-border"
                    }`}
                  >
                    {p}
                  </a>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
