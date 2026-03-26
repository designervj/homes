import { notFound } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { withRole } from "@/lib/auth/utils";
import { getAdminCompanies } from "@/lib/db/actions/company.actions";
import { getCaseStudyById } from "@/lib/db/actions/case-study.actions";
import { getAdminProperties } from "@/lib/db/actions/property.actions";
import { CaseStudyForm } from "@/components/dashboard/case-studies/CaseStudyForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Edit Case Study" };

export default async function EditCaseStudyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await withRole(["super_admin", "admin", "company_manager"]);
  const { id } = await params;
  const session = await auth();

  const [caseStudyRes, companiesRes, propertiesRes] = await Promise.all([
    getCaseStudyById(id),
    getAdminCompanies(),
    getAdminProperties({ status: "active", limit: 50 }),
  ]);

  if (!caseStudyRes.success || !caseStudyRes.data) notFound();

  return (
    <CaseStudyForm
      caseStudy={caseStudyRes.data}
      companies={companiesRes.data ?? []}
      properties={propertiesRes.data ?? []}
      canPublish={["super_admin", "admin"].includes(session!.user.role)}
    />
  );
}
