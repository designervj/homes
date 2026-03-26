import { auth } from "@/lib/auth/config";
import { getAdminCompanies } from "@/lib/db/actions/company.actions";
import { CompanyTable } from "@/components/dashboard/companies/CompanyTable";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Companies" };

export default async function CompaniesPage() {
  const session = await auth();
  const companiesRes = await getAdminCompanies();

  return (
    <CompanyTable
      companies={companiesRes.data ?? []}
      role={session!.user.role}
    />
  );
}
