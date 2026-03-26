import type { Metadata } from "next";
import { AddLeadForm } from "@/components/dashboard/leads/AddLeadForm";
import { getProperties } from "@/lib/db/actions/property.actions";
import { withRole } from "@/lib/auth/utils";

export const metadata: Metadata = { title: "Add Lead" };

export default async function NewLeadPage() {
  await withRole(["super_admin", "admin", "agent"]);

  const propertiesRes = await getProperties({
    status: "active",
    limit: 100,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const propertyOptions = (propertiesRes.data ?? []).map((property) => ({
    id: property._id!,
    name: property.projectName ?? property.title,
    slug: property.slug,
  }));

  return (
    <div className="py-2">
      <AddLeadForm properties={propertyOptions} />
    </div>
  );
}
