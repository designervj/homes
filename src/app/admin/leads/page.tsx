import { getLeadsKanban, getLeadStats } from "@/lib/db/actions/lead.actions";
import { LeadsKanban } from "@/components/dashboard/leads/LeadsKanban";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Leads Pipeline" };

export default async function LeadsPage() {
  const [kanbanRes, statsRes] = await Promise.all([
    getLeadsKanban(),
    getLeadStats(),
  ]);

  return (
    <LeadsKanban
      boardData={kanbanRes.data ?? {
        new: [], contacted: [], qualified: [],
        site_visit_scheduled: [], negotiation: [], converted: [], lost: [],
      }}
      stats={statsRes.data}
    />
  );
}
