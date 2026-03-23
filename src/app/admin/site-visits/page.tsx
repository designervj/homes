import { getSiteVisits, getSiteVisitStats, getUpcomingVisits } from "@/lib/db/actions/sitevisit.actions";
import { SiteVisitsView } from "@/components/dashboard/sitevisits/SiteVisitsView";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Site Visits" };

export default async function SiteVisitsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const status = params.status || "scheduled";
  const page = Number(params.page) || 1;

  const [visitsRes, statsRes, upcomingRes] = await Promise.all([
    getSiteVisits({ status: status === "all" ? undefined : status, page, limit: 20 }),
    getSiteVisitStats(),
    getUpcomingVisits(3),
  ]);

  return (
    <SiteVisitsView
      visits={visitsRes.data ?? []}
      pagination={visitsRes.pagination}
      stats={statsRes.data}
      upcoming={upcomingRes.data ?? []}
      currentStatus={status}
    />
  );
}
