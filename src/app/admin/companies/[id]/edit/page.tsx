import { notFound } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { withRole } from "@/lib/auth/utils";
import { getAgents } from "@/lib/db/actions/lead.actions";
import { getCompanyById } from "@/lib/db/actions/company.actions";
import { CompanyForm } from "@/components/dashboard/companies/CompanyForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Edit Company" };

export default async function EditCompanyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await withRole(["super_admin", "admin", "company_manager"]);
  const { id } = await params;
  const [session, companyRes, managersRes] = await Promise.all([
    auth(),
    getCompanyById(id),
    getAgents(),
  ]);

  if (!companyRes.success || !companyRes.data) notFound();

  return (
    <CompanyForm
      company={companyRes.data}
      managers={(managersRes.data ?? []).filter(
        (agent) => agent.role === "company_manager"
      )}
      canManageAssignments={session!.user.role !== "company_manager"}
    />
  );
}
